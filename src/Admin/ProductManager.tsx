import React, { useCallback, useEffect, useState, useRef } from "react";
import { Alert, Badge, Button, Spinner, Form, Modal, InputGroup, Row, Col } from "react-bootstrap";
import {
  ArrowClockwise,
  PlusLg,
  PencilSquare,
  Trash3,
  BoxSeam,
  Tags,
  XCircleFill,
  Download,
  Upload
} from "react-bootstrap-icons";
import { ColumnDef, TableComponent } from "./Component/TableComponent.tsx";
import * as XLSX from "xlsx";

interface MetaData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ProductTypeInput {
  id?: string;
  type: string;
  price: number | string;
}

interface ProductFormState {
  name: string;
  categoryId: string;
  description: string;
  discountPercentage: number;
  images: File[]; 
  types: ProductTypeInput[];
}

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<MetaData>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals Management State
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState<"ADD" | "EDIT">("ADD");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [formIsSubmitting, setFormIsSubmitting] = useState(false);

  // State Kontrol Gambar (Lokal & Server)
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); 
  const [existingImages, setExistingImages] = useState<string[]>([]); 
  const [hasVariants, setHasVariants] = useState<boolean>(false);

  const [formValues, setFormValues] = useState<ProductFormState>({
    name: "",
    categoryId: "",
    description: "",
    discountPercentage: 0,
    images: [],
    types: [{ type: "Standard", price: "" }]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const BASE_URL = "http://103.30.194.75:3005";

  const getCleanToken = () => {
    const token = localStorage.getItem('token');
    return token ? token.replace(/\s/g, '').replace(/['"]+/g, '') : '';
  };

  // SINKRONISASI MUTLAK: Mendukung parsing string tunggal, JSON array, dan membersihkan sisa double stringify
  const parseProductImages = (imageField: string): string[] => {
    if (!imageField) return [];
    
    // Bersihkan spasi dan sisa tanda kutip ganda tambahan dari database
    let target = imageField.trim();
    if (target.startsWith('"') && target.endsWith('"') && !target.startsWith('["')) {
      target = target.substring(1, target.length - 1);
    }

    try {
      if (target.startsWith("[")) {
        return JSON.parse(target);
      }
      return [target];
    } catch (e) {
      return [target];
    }
  };

  const initData = useCallback(async (page = 1, limit = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const prodRes = await fetch(`${BASE_URL}/api/products?page=${page}&limit=${limit}`);
      if (!prodRes.ok) throw new Error("Gagal mengambil data produk dari database");
      const prodData = await prodRes.json();
      
      setProducts(prodData.data || []);
      setMetadata(prodData.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });

      const catRes = await fetch(`${BASE_URL}/api/categories?page=1&limit=100`);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi database");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { 
    initData(); 
  }, [initData]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [imagePreviews]);

  // ==========================================
  // FEATURE: DOWNLOAD IMPORT TEMPLATE EXCEL
  // ==========================================
  const handleDownloadTemplate = () => {
    const templateHeader = [
      {
        "Nama Produk": "Contoh Sepatu Nike Air Max",
        "Kategori": categories[0]?.label || "Sepatu", 
        "Deskripsi": "Detail penjelasan mengenai produk contoh yang dijual.",
        "Diskon (%)": 10,
        "Daftar Varian & Harga": "M:150000 | L:160000 | XL:175000",
        "URL Gambar": "-"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateHeader);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Import");

    worksheet["!cols"] = [
      { wch: 25 }, { wch: 15 }, { wch: 40 }, { wch: 12 }, { wch: 35 }, { wch: 15 }
    ];

    XLSX.writeFile(workbook, `Template_Import_Produk_DakenShop.xlsx`);
  };

  // ==========================================
  // FEATURE: EXPORT EXCEL
  // ==========================================
  const handleExportExcel = () => {
    if (products.length === 0) {
      alert("Tidak ada data produk untuk diexport.");
      return;
    }

    const dataToExport = products.map((prod) => {
      const varianString = prod.types && prod.types.length > 0
        ? prod.types.map((t: any) => `${t.type}: Rp${Number(t.price).toLocaleString('id-ID')}`).join(" | ")
        : "-";

      const imgs = parseProductImages(prod.imgUrl);
      const firstImg = imgs[0] || "";
      const isExternalUrl = firstImg && (firstImg.startsWith("http://") || firstImg.startsWith("https://"));
      const finalImageUrl = isExternalUrl ? firstImg : (firstImg ? `${BASE_URL}${firstImg}` : "-");

      return {
        "ID Produk": prod.id,
        "Nama Produk": prod.name,
        "Kategori": prod.category?.label || "Uncategorized",
        "Deskripsi": prod.description || "-",
        "Diskon (%)": prod.discountPercentage !== undefined ? prod.discountPercentage : 0,
        "Daftar Varian & Harga": varianString,
        "URL Gambar Utama": finalImageUrl
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Produk");

    worksheet["!cols"] = [{ wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 35 }, { wch: 12 }, { wch: 40 }, { wch: 45 }];
    XLSX.writeFile(workbook, `Product_Stock_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ==========================================
  // FEATURE: IMPORT EXCEL
  // ==========================================
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        setIsLoading(true);
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const xlsxData: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (xlsxData.length === 0) throw new Error("File excel kosong.");

        let successCount = 0;
        let failCount = 0;

        for (const row of xlsxData) {
          try {
            const namaProduk = row["Nama Produk"];
            const namaKategori = row["Kategori"];
            const deskripsi = row["Deskripsi"] || "-";
            const diskon = row["Diskon (%)"] || 0;
            const daftarVarianText = row["Daftar Varian & Harga"];
            const urlGambarExcel = row["URL Gambar"]; 

            const matchedCategory = categories.find(c => c.label.toLowerCase() === String(namaKategori).toLowerCase());
            const categoryId = matchedCategory ? matchedCategory.id : (categories[0]?.id || "");

            let finalTypes = [{ type: "Standard", price: 0 }];
            if (daftarVarianText && daftarVarianText !== "-") {
              finalTypes = String(daftarVarianText).split("|").map(item => {
                const parts = item.split(":");
                return {
                  type: parts[0]?.trim() || "Standard",
                  price: Number(parts[1]?.replace(/[^0-9]/g, "")) || 0
                };
              });
            }

            const formData = new FormData();
            formData.append("name", namaProduk || "Produk Tanpa Nama");
            formData.append("categoryId", categoryId);
            formData.append("description", deskripsi);
            formData.append("discountPercentage", String(diskon));
            formData.append("types", JSON.stringify(finalTypes));
            
            if (urlGambarExcel && urlGambarExcel !== "-") {
              formData.append("imgUrl", JSON.stringify([urlGambarExcel])); 
            }

            const response = await fetch(`${BASE_URL}/api/products`, {
              method: "POST",
              headers: { "Authorization": `Bearer ${getCleanToken()}` },
              body: formData
            });

            if (response.ok) successCount++;
            else failCount++;

          } catch (singleErr) {
            failCount++;
          }
        }

        alert(`Proses Import Selesai!\nSukses: ${successCount} produk\nGagal: ${failCount} produk`);
        initData(1, metadata.limit);
      } catch (err: any) {
        alert("Gagal membaca file excel: " + err.message);
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = ""; 
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleOpenAddModal = () => {
    setModalType("ADD");
    setHasVariants(false);
    setImagePreviews([]);
    setExistingImages([]);
    setFormValues({ 
      name: "", 
      categoryId: "", 
      description: "", 
      discountPercentage: 0,    
      images: [], 
      types: [{ type: "Standard", price: "" }] 
    });
    setSelectedProduct(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (prod: any) => {
    setModalType("EDIT");
    setSelectedProduct(prod);

    const hasCustomVariants = prod.types && prod.types.length > 1;
    setHasVariants(hasCustomVariants);

    // SINKRONISASI: Diubah dari prod.image menjadi prod.imgUrl
    if (prod.imgUrl) {
      setExistingImages(parseProductImages(prod.imgUrl));
    } else {
      setExistingImages([]);
    }
    
    setImagePreviews([]); 

    setFormValues({
      name: prod.name,
      categoryId: prod.categoryId || "",
      description: prod.description || "", 
      discountPercentage: prod.discountPercentage !== undefined ? prod.discountPercentage : 0, 
      images: [],
      types: prod.types && prod.types.length > 0 
        ? prod.types.map((t: any) => ({ id: t.id, type: t.type, price: t.price }))
        : [{ type: "Standard", price: "" }]
    });
    setShowFormModal(true);
  };

  const handleAddTypeField = () => {
    setFormValues({ ...formValues, types: [...formValues.types, { type: "", price: "" }] });
  };

  const handleRemoveTypeField = (index: number) => {
    const updated = [...formValues.types];
    updated.splice(index, 1);
    setFormValues({ ...formValues, types: updated });
  };

  const handleTypeChange = (index: number, field: keyof ProductTypeInput, value: any) => {
    const updated = [...formValues.types];
    if (!updated[index]) updated[index] = { type: "Standard", price: "" };
    updated[index] = { ...updated[index], [field]: value };
    setFormValues({ ...formValues, types: updated });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const incomingFiles = Array.from(e.target.files);
      const totalCount = existingImages.length + formValues.images.length + incomingFiles.length;
      
      if (totalCount > 6) {
        alert("Maksimal total gambar untuk satu produk adalah 6 gambar.");
        return;
      }

      const combinedFiles = [...formValues.images, ...incomingFiles];
      setFormValues({ ...formValues, images: combinedFiles });

      const newPreviews = combinedFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews(newPreviews);
    }
  };

  const handleRemoveSelectedImage = (index: number) => {
    const updatedImages = [...formValues.images];
    updatedImages.splice(index, 1);

    if (imagePreviews[index] && imagePreviews[index].startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);

    setFormValues({ ...formValues, images: updatedImages });
    setImagePreviews(updatedPreviews);
  };

  const handleRemoveExistingImage = (index: number) => {
    const updatedExisting = [...existingImages];
    updatedExisting.splice(index, 1);
    setExistingImages(updatedExisting);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (existingImages.length === 0 && formValues.images.length === 0) {
      alert("Wajib memiliki minimal 1 foto produk.");
      return;
    }

    setFormIsSubmitting(true);
    try {
      const url = modalType === "ADD" ? `${BASE_URL}/api/products` : `${BASE_URL}/api/products/${selectedProduct?.id}`;
      const method = modalType === "ADD" ? "POST" : "PUT";

      const formData = new FormData();
      formData.append("name", formValues.name);
      formData.append("categoryId", formValues.categoryId);
      formData.append("description", formValues.description.trim() || "-"); 
      formData.append("discountPercentage", String(formValues.discountPercentage));

      const baseTypes = hasVariants ? formValues.types : [{ ...formValues.types[0], type: "Standard" }];
      const finalTypes = baseTypes.map(t => ({
        ...(t.id ? { id: t.id } : {}), 
        type: t.type || "Standard",   
        price: Number(t.price) || 0   
      }));
      formData.append("types", JSON.stringify(finalTypes));
      formData.append("existingImages", JSON.stringify(existingImages));

      // SINKRONISASI FLUID: Pengiriman data biner mutlak menggunakan perulangan for
      if (formValues.images && formValues.images.length > 0) {
        for (let i = 0; i < formValues.images.length; i++) {
          formData.append("images", formValues.images[i]);
        }
      }

      const response = await fetch(url, {
        method,
        headers: { "Authorization": `Bearer ${getCleanToken()}` },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error (${response.status}): ${errorText.substring(0, 150)}`);
      }

      await response.json();
      setShowFormModal(false);
      initData(metadata.page, metadata.limit); 
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedProduct) return;
    setFormIsSubmitting(true);
    try {
      const response = await fetch(`${BASE_URL}/api/products/${selectedProduct.id}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${getCleanToken()}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Gagal menghapus produk");
      setShowDeleteModal(false);
      initData(1, metadata.limit); 
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormIsSubmitting(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      key: "index",
      label: "No",
      width: "50px",
      align: "center",
      render: (_: any, index?: number) => ((metadata.page - 1) * metadata.limit) + (index ?? 0) + 1
    },
    {
      key: "imgUrl",
      label: "Gambar",
      align: "center",
      width: "80px",
      render: (prod: any) => {
        // SINKRONISASI: Diubah dari prod.image menjadi prod.imgUrl
        const imgs = parseProductImages(prod.imgUrl);
        const displayImg = imgs[0] || ""; 
        const isExternalUrl = displayImg && (displayImg.startsWith("http://") || displayImg.startsWith("https://"));
        const finalSrc = isExternalUrl ? displayImg : `${BASE_URL}${displayImg}`;

        return (
          <div className="bg-light rounded overflow-hidden border shadow-sm mx-auto visual-img-wrapper position-relative">
            {displayImg ? (
              <>
                <img src={finalSrc} alt={prod.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {imgs.length > 1 && (
                  <Badge bg="dark" className="position-absolute bottom-0 end-0 m-1 p-1 opacity-75" style={{ fontSize: "9px" }}>
                    +{imgs.length - 1}
                  </Badge>
                )}
              </>
            ) : (
              <div className="d-flex h-100 align-items-center justify-content-center text-secondary"><BoxSeam size={20} /></div>
            )}
          </div>
        );
      }
    },
    {
      key: "name",
      label: "Nama Produk",
      sortable: true,
      render: (prod: any) => (
        <div className="responsive-text-block">
          <div className="fw-bold text-dark product-title-text">{prod.name}</div>
          <div className="text-muted d-none d-sm-block" style={{ fontSize: "10px", fontFamily: "monospace" }}>{prod.id}</div>
        </div>
      )
    },
    {
      key: "category",
      label: "Kategori",
      render: (prod: any) => (
        <Badge bg="light" className="text-primary border px-3 py-2 rounded-pill fw-semibold label-category-badge">
          <Tags size={12} className="me-1" /> {prod.category?.label || "Uncategorized"}
        </Badge>
      )
    },
    {
      key: "types",
      label: "Harga Terkait Varian",
      render: (prod: any) => (
        <div className="d-flex flex-column gap-1 custom-price-stack">
          {prod.types && prod.types.length > 0 ? (
            prod.types.map((t: any, i: number) => (
              <div key={i} className="small d-flex align-items-center gap-1 row-price-item">
                <span className="text-muted font-monospace bg-light px-1 border rounded" style={{ fontSize: "11px" }}>{t.type}:</span>
                <span className="fw-bold text-success">Rp {Number(t.price).toLocaleString("id-ID")}</span>
              </div>
            ))
          ) : (
            <span className="text-muted small">- Tidak ada harga -</span>
          )}
        </div>
      )
    },
    {
      key: "action",
      label: "Aksi",
      width: "120px",
      align: "end",
      render: (prod: any) => (
        <div className="d-flex gap-2 justify-content-end action-container">
          <Button variant="white" size="sm" className="border shadow-sm hover-primary" onClick={() => handleOpenEditModal(prod)}>
            <PencilSquare size={14} className="text-primary" />
          </Button>
          <Button variant="white" size="sm" className="border shadow-sm hover-danger" onClick={() => { setSelectedProduct(prod); setShowDeleteModal(true); }}>
            <Trash3 size={14} className="text-danger" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="fade-in p-2 container-fluent">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold m-0" style={{ letterSpacing: "-1px", color: "#0F172A" }}>Product Stock Management</h4>
        </div>
        <div className="d-flex flex-wrap gap-2 panel-action-top">
          <input type="file" ref={fileInputRef} onChange={handleImportExcel} accept=".xlsx, .xls" style={{ display: "none" }} />
          <Button variant="white" onClick={handleDownloadTemplate} className="d-flex align-items-center gap-2 border fw-semibold style-btn hover-primary shadow-sm text-primary border-primary-subtle">
            <Download size={14} /> Download Template
          </Button>
          <Button variant="white" onClick={() => fileInputRef.current?.click()} className="d-flex align-items-center gap-2 border fw-semibold style-btn hover-primary shadow-sm text-secondary" disabled={isLoading}>
            <Upload size={14} /> Import Excel
          </Button>
          <Button variant="white" onClick={handleExportExcel} className="d-flex align-items-center gap-2 border fw-semibold style-btn hover-primary shadow-sm text-secondary" disabled={isLoading || products.length === 0}>
            <Download size={14} /> Export Excel
          </Button>
          <Button variant="light" onClick={() => initData(metadata.page, metadata.limit)} className="d-flex align-items-center gap-2 border fw-semibold style-btn text-dark" disabled={isLoading}>
            <ArrowClockwise className={isLoading ? "spin" : ""} /> Refresh
          </Button>
          <Button onClick={handleOpenAddModal} className="d-flex align-items-center gap-2 px-3 shadow-sm btn-primary-custom fw-semibold style-btn">
            <PlusLg /> Tambah Produk Baru
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm">⚠️ {error}</Alert>}

      <div className="custom-table-container">
        {isLoading && products.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "400px" }}>
            <Spinner animation="border" variant="primary" />
            <div className="mt-3 text-muted fw-medium">Loading Product Database...</div>
          </div>
        ) : (
          <TableComponent data={products} columns={columns} metadata={metadata} height="calc(100vh - 300px)" loading={isLoading} onPageChange={(p) => initData(p, metadata.limit)} onLimitChange={(l) => initData(1, l)} />
        )}
      </div>

      {/* MODAL FORM */}
      <Modal show={showFormModal} onHide={() => !formIsSubmitting && setShowFormModal(false)} centered backdrop="static" size="lg">
        <Modal.Header closeButton={!formIsSubmitting}>
          <Modal.Title className="fw-bold h5">{modalType === "ADD" ? "Tambah Produk Baru" : "Update & Edit Produk"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body className="custom-modal-body-scroll">
            <Row>
              <Col lg={6} md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-secondary">Nama Produk</Form.Label>
                  <Form.Control type="text" required value={formValues.name} onChange={(e) => setFormValues({ ...formValues, name: e.target.value })} placeholder="Ex: Sepatu Air Jordan" />
                </Form.Group>
              </Col>
              <Col lg={6} md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-secondary">Kategori</Form.Label>
                  <Form.Select required value={formValues.categoryId} onChange={(e) => setFormValues({ ...formValues, categoryId: e.target.value })}>
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col lg={8} md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-secondary">Deskripsi Produk</Form.Label>
                  <Form.Control as="textarea" rows={2} value={formValues.description} onChange={(e) => setFormValues({ ...formValues, description: e.target.value })} placeholder="Detail... " />
                </Form.Group>
              </Col>
              <Col lg={4} md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-secondary">Diskon Persentase</Form.Label>
                  <InputGroup>
                    <Form.Control type="number" min={0} max={100} value={formValues.discountPercentage} onChange={(e) => setFormValues({ ...formValues, discountPercentage: Number(e.target.value) || 0 })} />
                    <InputGroup.Text>%</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-semibold text-secondary">Unggah Banyak Foto Produk (Maks. Total 6 Foto)</Form.Label>
              <Form.Control type="file" accept="image/*" multiple onChange={handleFileChange} />
              <Form.Text className="text-muted d-block mt-1">Gunakan tombol Ctrl / Shift + Klik untuk memilih banyak gambar sekaligus.</Form.Text>

              {(existingImages.length > 0 || imagePreviews.length > 0) && (
                <div className="d-flex flex-wrap gap-3 mt-3 p-3 bg-light rounded border img-preview-box">
                  {existingImages.map((img, idx) => {
                    if (!img) return null;
                    const isExt = img.startsWith("http://") || img.startsWith("https://");
                    const finalUrl = isExt ? img : `${BASE_URL}${img}`;
                    return (
                      <div key={`existing-${idx}`} className="position-relative border rounded shadow-sm overflow-hidden image-preview-item card-img-container">
                        <img src={finalUrl} alt="Server" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <span className="position-absolute bottom-0 start-0 bg-dark text-white font-monospace px-1 small opacity-75" style={{ fontSize: "9px" }}>Server</span>
                        <button type="button" className="position-absolute bg-transparent border-0 p-0 text-danger end-0 top-0 m-1 style-remove-img" onClick={() => handleRemoveExistingImage(idx)}>
                          <XCircleFill size={18} className="bg-white rounded-circle shadow-sm" />
                        </button>
                      </div>
                    );
                  })}

                  {imagePreviews.map((url, idx) => (
                    <div key={`new-${idx}`} className="position-relative border rounded shadow-sm overflow-hidden image-preview-item card-img-container animated-pulse">
                      <img src={url} alt="Local" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <span className="position-absolute bottom-0 start-0 bg-primary text-white font-monospace px-1 small opacity-75" style={{ fontSize: "9px" }}>Baru</span>
                      <button type="button" className="position-absolute bg-transparent border-0 p-0 text-danger end-0 top-0 m-1 style-remove-img" onClick={() => handleRemoveSelectedImage(idx)}>
                        <XCircleFill size={18} className="bg-white rounded-circle shadow-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3 bg-light p-3 rounded border">
              <Form.Check type="switch" id="variant-switch" label="Produk memiliki multi-variasi (ProductType)" className="fw-semibold text-dark small cursor-pointer" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} />
            </Form.Group>

            {hasVariants ? (
              <div className="border-top pt-3 variant-management-layer">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="small fw-bold text-dark">📋 Daftar Sub-Tipe & Harga Variasi</span>
                  <Button variant="outline-primary" size="sm" className="fw-semibold rounded-pill" onClick={handleAddTypeField}>+ Tipe Baru</Button>
                </div>
                {formValues.types.map((type: any, index) => (
                  <Row key={index} className="align-items-center mb-2 bg-white p-2 rounded mx-0 border g-2 responsive-type-row">
                    <Col xs={12} sm={5}>
                      <Form.Control size="sm" type="text" required placeholder="Nama Tipe" value={type.type || ""} onChange={(e) => handleTypeChange(index, "type", e.target.value)} />
                    </Col>
                    <Col xs={10} sm={5}>
                      <InputGroup size="sm"><InputGroup.Text>Rp</InputGroup.Text><Form.Control type="number" required placeholder="Harga" value={type.price} onChange={(e) => handleTypeChange(index, "price", e.target.value)} /></InputGroup>
                    </Col>
                    <Col xs={2} sm={2} className="text-end">
                      <Button variant="link" className="text-danger p-0" disabled={formValues.types.length === 1} onClick={() => handleRemoveTypeField(index)}><Trash3 size={16} /></Button>
                    </Col>
                  </Row>
                ))}
              </div>
            ) : (
              <div className="border-top pt-3 single-price-layer">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-secondary">Harga Utama (Standard)</Form.Label>
                  <InputGroup><InputGroup.Text>Rp</InputGroup.Text><Form.Control type="number" required value={formValues.types[0]?.price || ""} onChange={(e) => handleTypeChange(0, "price", e.target.value)} /></InputGroup>
                </Form.Group>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="secondary" className="px-3" onClick={() => setShowFormModal(false)} disabled={formIsSubmitting}>Batal</Button>
            <Button type="submit" disabled={formIsSubmitting} className="btn-primary-custom px-4 shadow-sm">
              {formIsSubmitting ? <Spinner animation="border" size="sm" /> : "Simpan & Sinkronkan"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => !formIsSubmitting && setShowDeleteModal(false)} centered size="sm">
        <Modal.Body className="text-center p-4">
          <div className="text-danger mb-3" style={{ fontSize: "40px" }}>🚨</div>
          <h6 className="fw-bold">Hapus Produk?</h6>
          <div className="d-flex gap-2 mt-4">
            <Button variant="light" className="border w-50" onClick={() => setShowDeleteModal(false)} disabled={formIsSubmitting}>Batal</Button>
            <Button variant="danger" className="w-50" onClick={handleDeleteSubmit} disabled={formIsSubmitting}>Eksekusi</Button>
          </div>
        </Modal.Body>
      </Modal>

      <style>{`
        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .btn-primary-custom { background-color: #2563EB !important; border: none !important; color: #fff; transition: background 0.2s; }
        .btn-primary-custom:hover { background-color: #1D4ED8 !important; }
        .hover-primary:hover { background-color: #EFF6FF !important; }
        .hover-danger:hover { background-color: #FEF2F2 !important; }
        .style-btn { border-radius: 8px; }
        .fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .style-remove-img { transition: transform 0.2s; z-index: 10; }
        .style-remove-img:hover { transform: scale(1.2); }
        .visual-img-wrapper { width: 46px; height: 46px; }
        .image-preview-item { width: 90px; height: 90px; transition: all 0.2s ease-in-out; }
        .image-preview-item:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgb(0 0 0 / 0.15) !important; }
        .custom-table-container { background-color: #fff; border-radius: 16px; padding: 4px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); border: 1px solid #E2E8F0; }
        .custom-modal-body-scroll { max-height: calc(100vh - 210px); overflow-y: auto; padding: 1.5rem; }
        @media (max-width: 768px) {
          .panel-action-top { width: 100%; display: grid !important; grid-template-columns: 1fr 1fr; gap: 8px !important; }
          .panel-action-top button { width: 100%; justify-content: center; font-size: 13px; }
          .panel-action-top button:last-child { grid-column: span 2; }
          .custom-price-stack { gap: 4px !important; }
          .row-price-item { flex-direction: column; align-items: flex-start !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductManager;
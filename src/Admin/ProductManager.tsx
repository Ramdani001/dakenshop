import React, { useCallback, useEffect, useState, useRef } from "react";
import { Alert, Badge, Button, Spinner, Form, Modal, InputGroup, Row, Col } from "react-bootstrap";
import {
  ArrowClockwise,
  PlusLg,
  PencilSquare,
  Trash3,
  BoxSeam,
  Tags,
  CurrencyDollar,
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
  name: string;
  price: number | string;
}

interface ProductFormState {
  name: string;
  categoryId: string;
  description: string;
  discount: number;
  images: File[];
  types: ProductTypeInput[];
}

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<MetaData>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals State
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState<"ADD" | "EDIT">("ADD");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [formIsSubmitting, setFormIsSubmitting] = useState(false);

  // State Preview Gambar & Toggle Varian
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [hasVariants, setHasVariants] = useState<boolean>(false);

  const [formValues, setFormValues] = useState<ProductFormState>({
    name: "",
    categoryId: "",
    description: "",
    discount: 25,
    images: [],
    types: [{ name: "Standard", price: "" }]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const BASE_URL = "http://103.30.194.75:3005";

  const getCleanToken = () => {
    const token = localStorage.getItem('token');
    return token ? token.replace(/\s/g, '').replace(/['"]+/g, '') : '';
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
  // FEATURE: EXPORT EXCEL
  // ==========================================
  const handleExportExcel = () => {
    if (products.length === 0) {
      alert("Tidak ada data produk untuk diexport.");
      return;
    }

    const dataToExport = products.map((prod) => {
      // Perbaikan: mengambil dari prod.types sesuai include Prisma backend
      const varianString = prod.types && prod.types.length > 0
        ? prod.types.map((t: any) => `${t.name || t.type}: Rp${Number(t.price).toLocaleString('id-ID')}`).join(" | ")
        : "-";

      const isExternalUrl = prod.imgUrl && (prod.imgUrl.startsWith("http://") || prod.imgUrl.startsWith("https://"));
      const finalImageUrl = isExternalUrl ? prod.imgUrl : (prod.imgUrl ? `${BASE_URL}${prod.imgUrl}` : "-");

      return {
        "ID Produk": prod.id,
        "Nama Produk": prod.name,
        "Kategori": prod.category?.label || "Uncategorized",
        "Deskripsi": prod.description || "-",
        "Diskon (%)": prod.discountPercentage !== undefined ? prod.discountPercentage : 25,
        "Daftar Varian & Harga": varianString,
        "URL Gambar": finalImageUrl
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

        if (xlsxData.length === 0) {
          throw new Error("File excel kosong atau format salah.");
        }

        let successCount = 0;
        let failCount = 0;

        for (const row of xlsxData) {
          try {
            const namaProduk = row["Nama Produk"];
            const namaKategori = row["Kategori"];
            const deskripsi = row["Deskripsi"] || "-";
            const diskon = row["Diskon (%)"] || 25;
            const daftarVarianText = row["Daftar Varian & Harga"];
            const urlGambarExcel = row["URL Gambar"]; 

            const matchedCategory = categories.find(c => c.label.toLowerCase() === String(namaKategori).toLowerCase());
            const categoryId = matchedCategory ? matchedCategory.id : (categories[0]?.id || "");

            let finalTypes = [{ type: "Standard", price: 0 }];
            if (daftarVarianText && daftarVarianText !== "-") {
              finalTypes = String(daftarVarianText).split("|").map(item => {
                const parts = item.split(":");
                const typeName = parts[0]?.trim() || "Standard";
                const priceClean = parts[1] ? parts[1].replace(/[^0-9]/g, "") : "0";
                return {
                  type: typeName,
                  price: Number(priceClean) || 0
                };
              });
            }

            const formData = new FormData();
            formData.append("name", namaProduk || "Produk Tanpa Nama");
            formData.append("categoryId", categoryId);
            formData.append("description", deskripsi);
            formData.append("discountPercentage", String(diskon));
            formData.append("types", JSON.stringify(finalTypes));
            
            // Perbaikan: Jika row memiliki URL gambar eksternal, kirim sebagai string field 'imgUrl'
            if (urlGambarExcel && urlGambarExcel !== "-") {
              formData.append("imgUrl", urlGambarExcel); 
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
    setFormValues({ 
      name: "", 
      categoryId: "", 
      description: "", 
      discount: 25,    
      images: [], 
      types: [{ name: "Standard", price: "" }] 
    });
    setSelectedProduct(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (prod: any) => {
    setModalType("EDIT");
    setSelectedProduct(prod);

    const hasCustomVariants = prod.types && prod.types.length > 1;
    setHasVariants(hasCustomVariants);

    if (prod.imgUrl) {
      const isExternal = prod.imgUrl.startsWith("http://") || prod.imgUrl.startsWith("https://");
      setImagePreviews([isExternal ? prod.imgUrl : `${BASE_URL}${prod.imgUrl}`]);
    } else {
      setImagePreviews([]);
    }

    setFormValues({
      name: prod.name,
      categoryId: prod.categoryId,
      description: prod.description || "", 
      discount: prod.discountPercentage !== undefined ? prod.discountPercentage : 25, 
      images: [],
      types: prod.types && prod.types.length > 0 
        ? prod.types.map((t: any) => ({ id: t.id, name: t.name || t.type, price: t.price }))
        : [{ name: "Standard", price: "" }]
    });
    setShowFormModal(true);
  };

  const handleAddTypeField = () => {
    setFormValues({ ...formValues, types: [...formValues.types, { name: "", price: "" }] });
  };

  const handleRemoveTypeField = (index: number) => {
    const updated = [...formValues.types];
    updated.splice(index, 1);
    setFormValues({ ...formValues, types: updated });
  };

  const handleTypeChange = (index: number, field: keyof ProductTypeInput, value: any) => {
    const updated = [...formValues.types];
    if (!updated[index]) {
      updated[index] = { name: "Standard", price: "" };
    }
    updated[index] = { ...updated[index], [field]: value };
    setFormValues({ ...formValues, types: updated });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length > 4) {
        alert("Maksimal gambar yang boleh diunggah adalah 4 gambar.");
        e.target.value = ""; 
        setFormValues({ ...formValues, images: [] });
        setImagePreviews([]);
        return;
      }
      setFormValues({ ...formValues, images: filesArray });

      const previews = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleRemoveSelectedImage = (index: number) => {
    const updatedImages = [...formValues.images];
    updatedImages.splice(index, 1);

    const updatedPreviews = [...imagePreviews];
    if (updatedPreviews[index].startsWith("blob:")) {
      URL.revokeObjectURL(updatedPreviews[index]);
    }
    updatedPreviews.splice(index, 1);

    setFormValues({ ...formValues, images: updatedImages });
    setImagePreviews(updatedPreviews);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modalType === "ADD" && formValues.images.length === 0) {
      alert("Minimal harus mengunggah 1 gambar.");
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
      formData.append("discountPercentage", String(formValues.discount));

      const baseTypes = hasVariants 
        ? formValues.types 
        : [{ ...formValues.types[0], name: "Standard" }];

      const finalTypes = baseTypes.map(t => ({
        ...(t.id ? { id: t.id } : {}), 
        type: t.name || "Standard",   
        price: Number(t.price) || 0   
      }));
      
      formData.append("types", JSON.stringify(finalTypes));

      if (formValues.images.length > 0) {
        formData.append("image", formValues.images[0]); 
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
      console.error(err);
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
      if (!response.ok) {
        const errTxt = await response.text();
        throw new Error(errTxt || "Gagal menghapus produk");
      }
      setShowDeleteModal(false);
      initData(1, metadata.limit); 
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormIsSubmitting(false);
    }
  };

  // =========================================================
  // KONFIGURASI KOLOM TABEL UTAMA (PERBAIKAN FIELD DATA)
  // =========================================================
  const columns: ColumnDef<any>[] = [
    {
      key: "imgUrl",
      label: "Image",
      align: "center",
      render: (prod: any) => {
        const isExternalUrl = prod.imgUrl && (prod.imgUrl.startsWith("http://") || prod.imgUrl.startsWith("https://"));
        const finalSrc = isExternalUrl ? prod.imgUrl : `${BASE_URL}${prod.imgUrl}`;

        return (
          <div className="bg-light rounded overflow-hidden border shadow-sm mx-auto" style={{ width: "50px", height: "50px" }}>
            {prod.imgUrl ? (
              <img 
                src={finalSrc} 
                alt={prod.name} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/50x50?text=Error";
                }}
              />
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
        <div>
          <div className="fw-bold text-dark" style={{ fontSize: "14px" }}>{prod.name}</div>
          <div className="text-muted" style={{ fontSize: "10px", fontFamily: "monospace" }}>{prod.id}</div>
        </div>
      )
    },
    {
      key: "category",
      label: "Category Name",
      render: (prod: any) => (
        <Badge bg="light" className="text-primary border px-3 py-2 rounded-pill fw-semibold" style={{ fontSize: "12px" }}>
          <Tags size={12} className="me-1" /> {prod.category?.label || "Uncategorized"}
        </Badge>
      )
    },
    {
      key: "types", // PERBAIKAN: diubah dari productTypes ke types agar sesuai skema Prisma include backend
      label: "Price Options",
      render: (prod: any) => (
        <div className="d-flex flex-column gap-1">
          {prod.types && prod.types.length > 0 ? (
            prod.types.map((t: any, i: number) => (
              <div key={i} className="small d-flex align-items-center gap-2">
                <span className="text-muted font-monospace" style={{ fontSize: "11px" }}>{t.name || t.type}:</span>
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
      label: "Action",
      width: "120px",
      align: "end",
      render: (prod: any) => (
        <div className="d-flex gap-2 justify-content-end">
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
    <div className="fade-in p-2">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold m-0" style={{ letterSpacing: "-1px", color: "#0F172A" }}>Product Stock Management</h4>
        </div>
        
        <div className="d-flex flex-wrap gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportExcel} 
            accept=".xlsx, .xls" 
            style={{ display: "none" }} 
          />
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
            <PlusLg /> Add New Product
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="border-0 shadow-sm d-flex align-items-center gap-3">
          <div>⚠️ {error}</div>
        </Alert>
      )}

      <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "4px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", border: "1px solid #E2E8F0" }}>
        {isLoading && products.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "400px" }}>
            <Spinner animation="border" variant="primary" />
            <div className="mt-3 text-muted fw-medium">Loading Product Database...</div>
          </div>
        ) : (
          <TableComponent
            data={products}
            columns={columns}
            metadata={metadata}
            height="calc(100vh - 300px)"
            loading={isLoading}
            sortBy=""
            sortOrder="asc"
            filterValues={{}}
            onPageChange={(p) => initData(p, metadata.limit)}
            onLimitChange={(l) => initData(1, l)}
            onSortChange={(sortKey, order) => { console.log("Sort data:", sortKey, order); }}
            onFilterChange={(filters) => { console.log("Filter data:", filters); }}
          />
        )}
      </div>

      {/* MODAL FORM ADD / EDIT */}
      <Modal show={showFormModal} onHide={() => !formIsSubmitting && setShowFormModal(false)} centered backdrop="static" size="lg">
        <Modal.Header closeButton={!formIsSubmitting}>
            <Modal.Title className="fw-bold h5">{modalType === "ADD" ? "Tambah Produk" : "Edit Produk"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
            <Modal.Body style={{ maxHeight: "calc(100vh - 210px)", overflowY: "auto" }}>
            <Row>
                <Col md={6}>
                <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">Nama Produk</Form.Label>
                    <Form.Control type="text" required value={formValues.name} onChange={(e) => setFormValues({ ...formValues, name: e.target.value })} placeholder="Ex: Sepatu Air Jordan" />
                </Form.Group>
                </Col>
                <Col md={6}>
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
                <Col md={8}>
                <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">Deskripsi Produk</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={2} 
                      value={formValues.description} 
                      onChange={(e) => setFormValues({ ...formValues, description: e.target.value })} 
                      placeholder="Masukkan detail penjelasan tentang produk..." 
                    />
                </Form.Group>
                </Col>
                <Col md={4}>
                <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">Diskon</Form.Label>
                    <InputGroup>
                    <Form.Control 
                        type="number" 
                        value={formValues.discount} 
                        readOnly 
                        disabled
                        className="bg-light"
                    />
                    <InputGroup.Text>%</InputGroup.Text>
                    </InputGroup>
                </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-4">
                <Form.Label className="small fw-semibold text-secondary">Foto Produk (Minimal 1, Maksimal 4)</Form.Label>
                <Form.Control 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  required={modalType === "ADD" && formValues.images.length === 0} 
                  onChange={handleFileChange} 
                />
                <Form.Text className="text-muted">
                Pilih hingga 4 foto sekaligus (Ctrl / Shift + Klik).
                </Form.Text>

                {imagePreviews.length > 0 && (
                <div className="d-flex flex-wrap gap-3 mt-3 p-3 bg-light rounded border">
                    {imagePreviews.map((url, idx) => (
                    <div key={idx} className="position-relative border rounded shadow-sm overflow-hidden" style={{ width: "90px", height: "90px" }}>
                        <img src={url} alt={`Preview ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        {url.startsWith("blob:") && (
                        <button
                            type="button"
                            className="position-absolute bg-transparent border-0 p-0 text-danger end-0 top-0 m-1 style-remove-img"
                            onClick={() => handleRemoveSelectedImage(idx)}
                        >
                            <XCircleFill size={18} className="bg-white rounded-circle" />
                        </button>
                        )}
                    </div>
                    ))}
                </div>
                )}
            </Form.Group>

            <Form.Group className="mb-3 bg-light p-3 rounded border">
                <Form.Check 
                type="switch"
                id="variant-switch"
                label="Produk ini memiliki banyak varian (ukuran, warna, tipe, dll)"
                className="fw-semibold text-dark small"
                checked={hasVariants}
                onChange={(e) => setHasVariants(e.target.checked)}
                />
            </Form.Group>

            {hasVariants ? (
                <div className="border-top pt-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small fw-bold text-dark"><CurrencyDollar className="text-success" /> Harga Berdasarkan Tipe / Ukuran</span>
                    <Button variant="outline-primary" size="sm" className="fw-semibold" onClick={handleAddTypeField}>+ Tambah Tipe</Button>
                </div>

                {formValues.types.map((type: any, index) => (
                    <Row key={index} className="align-items-center mb-2 bg-light p-2 rounded mx-0 border">
                    <Col sm={5}>
                        <Form.Control 
                        size="sm" 
                        type="text" 
                        required 
                        placeholder="Nama Tipe (Ex: X, L, Biru)" 
                        value={type.name !== undefined ? type.name : (type.type || "")} 
                        onChange={(e) => handleTypeChange(index, "name", e.target.value)} 
                        />
                    </Col>
                    <Col sm={5}>
                        <InputGroup size="sm">
                        <InputGroup.Text>Rp</InputGroup.Text>
                        <Form.Control 
                            type="number" 
                            required 
                            placeholder="Harga" 
                            value={type.price} 
                            onChange={(e) => handleTypeChange(index, "price", e.target.value)} 
                        />
                        </InputGroup>
                    </Col>
                    <Col sm={2} className="text-end">
                        <Button variant="link" className="text-danger p-0" disabled={formValues.types.length === 1} onClick={() => handleRemoveTypeField(index)}><Trash3 size={16} /></Button>
                    </Col>
                    </Row>
                ))}
                </div>
            ) : (
                <div className="border-top pt-3">
                <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">Harga Utama</Form.Label>
                    <InputGroup>
                    <InputGroup.Text>Rp</InputGroup.Text>
                    <Form.Control 
                        type="number" 
                        required 
                        placeholder="Masukkan Harga Produk" 
                        value={formValues.types[0]?.price || ""} 
                        onChange={(e) => handleTypeChange(0, "price", e.target.value)} 
                    />
                    </InputGroup>
                </Form.Group>
                </div>
            )}
            </Modal.Body>
            <Modal.Footer className="bg-light">
            <Button variant="secondary" onClick={() => setShowFormModal(false)} disabled={formIsSubmitting}>Batal</Button>
            <Button type="submit" disabled={formIsSubmitting} className="btn-primary-custom px-4">
                {formIsSubmitting ? <Spinner animation="border" size="sm" /> : "Simpan Data"}
            </Button>
            </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL DELETE */}
      <Modal show={showDeleteModal} onHide={() => !formIsSubmitting && setShowDeleteModal(false)} centered size="sm">
        <Modal.Body className="text-center p-4">
          <div className="text-danger mb-3" style={{ fontSize: "40px" }}>🚨</div>
          <h6 className="fw-bold">Hapus Produk Ini?</h6>
          <p className="text-muted small">Tindakan ini menghapus varian harga di dalamnya secara permanen.</p>
          <div className="d-flex gap-2 mt-4">
            <Button variant="light" className="border w-50" onClick={() => setShowDeleteModal(false)} disabled={formIsSubmitting}>Batal</Button>
            <Button variant="danger" className="w-50" onClick={handleDeleteSubmit} disabled={formIsSubmitting}>Hapus</Button>
          </div>
        </Modal.Body>
      </Modal>

      <style>{`
        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .btn-primary-custom { background-color: #2563EB !important; border: none !important; color: #fff; }
        .btn-primary-custom:hover { background-color: #1D4ED8 !important; }
        .hover-primary:hover { background-color: #EFF6FF !important; }
        .hover-danger:hover { background-color: #FEF2F2 !important; }
        .style-btn { borderRadius: 8px; }
        .fade-in { animation: fadeIn 0.4s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .style-remove-img { transition: transform 0.2s; }
        .style-remove-img:hover { transform: scale(1.15); }
      `}</style>
    </div>
  );
};

export default ProductManager;
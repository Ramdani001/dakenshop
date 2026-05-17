import React, { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Spinner, Form, Modal, InputGroup, Row, Col } from "react-bootstrap";
import {
  ArrowClockwise,
  PlusLg,
  PencilSquare,
  Trash3,
  BoxSeam,
  Tags,
  CurrencyDollar,
  XCircleFill
} from "react-bootstrap-icons";
import { ColumnDef, TableComponent } from "./Component/TableComponent.tsx";

interface MetaData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ProductTypeInput {
  id?: string;
  name: string;
  price: number | string; // Menggunakan union type agar input manual lancar saat kosong
}

interface ProductFormState {
  name: string;
  categoryId: string;
  description: string; // Tambahan field description
  discount: number;    // Tambahan field discount
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
    description: "", // Default kosong
    discount: 25,    // Default statis 25
    images: [],
    types: [{ name: "Standard", price: "" }]
  });

  const BASE_URL = "http://210.79.190.222:3005";

  const getCleanToken = () => {
    const token = localStorage.getItem('token');
    return token ? token.replace(/\s/g, '').replace(/['"]+/g, '') : '';
  };

  // Fetch data produk & kategori
  const initData = useCallback(async (page = 1, limit = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const prodRes = await fetch(`${BASE_URL}/api/products?page=${page}&limit=${limit}`);
      if (!prodRes.ok) throw new Error("Gagal mengambil data produk");
      const prodData = await prodRes.json();
      setProducts(prodData.data || []);
      setMetadata(prodData.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });

      const catRes = await fetch(`${BASE_URL}/api/categories?page=1&limit=100`);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { initData(); }, [initData]);

  // Cleanup ObjectURL untuk mencegah memory leak
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [imagePreviews]);

  // Modal Triggers
  const handleOpenAddModal = () => {
    setModalType("ADD");
    setHasVariants(false);
    setImagePreviews([]);
    setFormValues({ 
      name: "", 
      categoryId: "", 
      description: "", // Reset field deskripsi
      discount: 25,    // Tetap 25 saat tambah data
      images: [], 
      types: [{ name: "Standard", price: "" }] 
    });
    setSelectedProduct(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (prod: any) => {
    setModalType("EDIT");
    setSelectedProduct(prod);

    const hasCustomVariants = prod.productTypes && prod.productTypes.length > 1;
    setHasVariants(hasCustomVariants);

    if (prod.imageUrl) {
      setImagePreviews([`${BASE_URL}${prod.imageUrl}`]);
    } else {
      setImagePreviews([]);
    }

    setFormValues({
      name: prod.name,
      categoryId: prod.categoryId,
      description: prod.description || "", // Ambil deskripsi lama jika tersedia
      discount: prod.discount !== undefined ? prod.discount : 25, // Ambil dari API atau default ke 25
      images: [],
      types: prod.productTypes && prod.productTypes.length > 0 
        ? prod.productTypes.map((t: any) => ({ id: t.id, name: t.name, price: t.price }))
        : [{ name: "Standard", price: "" }]
    });
    setShowFormModal(true);
  };

  // Dinamis Varian Handlers
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
    updated[index] = { ...updated[index], [field]: value };
    setFormValues({ ...formValues, types: updated });
  };

  // File Change & Preview Handler
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

  // Submit Handler
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
    
    // Memberikan fallback "-" jika deskripsi kosong agar tidak melanggar aturan REQUIRED di Prisma
    formData.append("description", formValues.description.trim() || "-"); 
    
    // PERBAIKAN: Mengubah nama field sesuai skema database: discountPercentage
    formData.append("discountPercentage", String(formValues.discount));

    // PERBAIKAN: Menyesuaikan properti 'name' menjadi 'type' agar cocok dengan model ProductType
    const baseTypes = hasVariants ? formValues.types : [formValues.types[0]];
    const finalTypes = baseTypes.map(t => ({
      id: t.id,                     // Sertakan ID jika dalam mode EDIT
      type: t.name || "Standard",   // Diubah ke 'type' sesuai skema backend
      price: Number(t.price) || 0   // Tetap diconvert ke number, backend nanti tinggal parseFloat()
    }));
    
    formData.append("types", JSON.stringify(finalTypes));

    // Mengambil gambar utama (index 0) untuk dicocokkan dengan upload.single("image") di backend
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

  const columns: ColumnDef<any>[] = [
    {
      key: "imageUrl",
      label: "Image",
      align: "center",
      render: (prod: any) => (
        <div className="bg-light rounded overflow-hidden border shadow-sm mx-auto" style={{ width: "50px", height: "50px" }}>
          {prod.imageUrl ? (
            <img src={`${BASE_URL}${prod.imageUrl}`} alt={prod.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div className="d-flex h-100 align-items-center justify-content-center text-secondary"><BoxSeam size={20} /></div>
          )}
        </div>
      )
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
      key: "productTypes",
      label: "Price Options",
      render: (prod: any) => (
        <div className="d-flex flex-column gap-1">
          {prod.productTypes?.map((t: any, i: number) => (
            <div key={i} className="small d-flex align-items-center gap-2">
              <span className="text-muted font-monospace" style={{ fontSize: "11px" }}>{t.name}:</span>
              <span className="fw-bold text-success">Rp {Number(t.price).toLocaleString("id-ID")}</span>
            </div>
          ))}
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
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold m-0" style={{ letterSpacing: "-1px", color: "#0F172A" }}>Product Stock Management</h4>
        </div>
        <div className="d-flex gap-2">
          <Button variant="light" onClick={() => initData(metadata.page, metadata.limit)} className="d-flex align-items-center gap-2 border fw-semibold style-btn">
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
            onSortChange={(sortKey, order) => {
              console.log("Sort data:", sortKey, order);
            }}
            onFilterChange={(filters) => {
              console.log("Filter data:", filters);
            }}
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

            {/* FIELD DESCRIPTION & DISCOUNT */}
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

                {/* CONTAINER PREVIEW GAMBAR (Otomatis memuat blob local baru ATAU url dari backend) */}
                {imagePreviews.length > 0 && (
                <div className="d-flex flex-wrap gap-3 mt-3 p-3 bg-light rounded border">
                    {imagePreviews.map((url, idx) => (
                    <div key={idx} className="position-relative border rounded shadow-sm overflow-hidden" style={{ width: "90px", height: "90px" }}>
                        <img src={url} alt={`Preview ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        
                        {/* Tombol hapus hanya muncul untuk gambar baru (blob) agar tidak merusak manifest state edit */}
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
                        {/* PERBAIKAN: Membaca 'type.name' dari state atau fallback 'type.type' dari database backend */}
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
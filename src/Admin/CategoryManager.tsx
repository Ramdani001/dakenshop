import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Spinner, Form, Modal } from "react-bootstrap";
import {
  ArrowClockwise,
  Folder2Open,
  PencilSquare,
  PlusLg,
  Trash3,
} from "react-bootstrap-icons";
import { ColumnDef, TableComponent } from "./Component/TableComponent.tsx";
import { Category } from "../Types/Category.ts";
import CONFIG from "../Config.ts";

interface MetaData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CategoryFormState {
  label: string;
  icon: File | null;
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [metadata, setMetadata] = useState<MetaData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- STATE UNTUK CRUD MODAL ---
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState<"ADD" | "EDIT">("ADD");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formIsSubmitting, setFormIsSubmitting] = useState(false);

  const [formValues, setFormValues] = useState<CategoryFormState>({
    label: "",
    icon: null,
  });

  // Helper mengambil Bearer Token
  const getCleanToken = () => {
    const token = localStorage.getItem('token');
    return token ? token.replace(/\s/g, '').replace(/['"]+/g, '') : '';
  };

  // Helper Format Tanggal & Waktu
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return (
      <div style={{ fontSize: "13px", color: "#475569" }}>
        <div className="fw-medium">
          {date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </div>
        <div className="text-muted" style={{ fontSize: "11px" }}>
          {date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          WIB
        </div>
      </div>
    );
  };

  // 1. READ: Ambil Data Kategori
  const fetchCategories = useCallback(async (page = 1, limit = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${CONFIG.BASE_URL}/api/categories?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Gagal mengambil data dari server");

      const result = await response.json();
      setCategories(result.data || []);
      setMetadata(result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // --- HANDLER MODAL TRIGGER ---
  const handleOpenAddModal = () => {
    setModalType("ADD");
    setFormValues({ label: "", icon: null });
    setSelectedCategory(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setModalType("EDIT");
    setSelectedCategory(cat);
    setFormValues({ label: cat.label, icon: null }); // Icon dikosongkan kecuali ingin ganti baru
    setShowFormModal(true);
  };

  const handleOpenDeleteModal = (cat: Category) => {
    setSelectedCategory(cat);
    setShowDeleteModal(true);
  };

  // 2. CREATE & UPDATE: Submit Handler (Menggunakan FormData karena ada upload icon)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormIsSubmitting(true);

    try {
      const url = modalType === "ADD" 
        ? `${CONFIG.BASE_URL}/api/categories` 
        : `${CONFIG.BASE_URL}/api/categories/${selectedCategory?.id}`;
        
      const method = modalType === "ADD" ? "POST" : "PUT";

      const formData = new FormData();
      formData.append("label", formValues.label);
      if (formValues.icon) {
        // DIUBAH: Menggunakan key "icon" agar sesuai dengan upload.single("icon") di backend
        formData.append("icon", formValues.icon); 
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          // DIUBAH: Menambahkan otentikasi token Bearer untuk ADMIN
          "Authorization": `Bearer ${getCleanToken()}`,
          // Jangan tambahkan Content-Type di sini jika menggunakan FormData
        },
        body: formData, 
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Terjadi kesalahan sistem.");

      setShowFormModal(false);
      fetchCategories(metadata.page, metadata.limit);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormIsSubmitting(false);
    }
  };

  // 3. DELETE: Action Handler
  const handleDeleteSubmit = async () => {
    if (!selectedCategory) return;
    setFormIsSubmitting(true);

    try {
      const response = await fetch(`${CONFIG.BASE_URL}/api/categories/${selectedCategory.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${getCleanToken()}`,
          "Content-Type": "application/json",
        },
      });

      // 1. Cek jika statusnya No Content (240 / 204), langsung sukseskan tanpa parse JSON
      if (response.status === 204 || response.status === 201) {
        setShowDeleteModal(false);
        fetchCategories(1, metadata.limit);
        return;
      }

      // 2. Ambil teks mentah dulu untuk menghindari crash parsing jika backend mengirim string kosong
      const responseText = await response.text();
      let result: any = {};
      if (responseText) {
        result = JSON.parse(responseText);
      }

      // 3. Jika status HTTP error (400, 404, 500, dll)
      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus kategori.");
      }

      // Sukses
      setShowDeleteModal(false);
      fetchCategories(1, metadata.limit);
    } catch (err: any) {
      console.error("Delete Error:", err);
      alert(err.message || "Terjadi kesalahan saat menghapus data");
    } finally {
      setFormIsSubmitting(false);
    }
  };

  // Struktur Kolom Tabel Sesuai Permintaan Anda
  const columns: ColumnDef<Category>[] = [
    {
      key: "label",
      label: "Label",
      sortable: true,
      render: (cat: Category) => (
        <div>
          <div className="fw-bold text-dark" style={{ fontSize: "14px" }}>
            {cat.label}
          </div>
          <div className="text-muted" style={{ fontSize: "10px", fontFamily: "monospace" }}>
            {cat.id}
          </div>
        </div>
      ),
    },
    {
      key: "iconUrl",
      label: "Icon",
      align: "center",
      render: (cat: Category) => (
        <div
          className="bg-light rounded d-flex align-items-center justify-content-center border shadow-sm mx-auto"
          style={{ width: "40px", height: "40px" }}
        >
          {cat.iconUrl ? (
            <img
              src={`${CONFIG.BASE_URL}${cat.iconUrl}`}
              alt={cat.label}
              style={{ width: "24px", height: "24px", objectFit: "contain" }}
              onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/40"; }}
            />
          ) : (
            <Folder2Open className="text-primary" size={20} />
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (cat: Category) => formatDateTime(cat.createdAt),
    },
    {
      key: "updatedAt",
      label: "Updated",
      sortable: true,
      render: (cat: Category) => formatDateTime(cat.updatedAt || cat.createdAt),
    },
    {
      key: "action",
      label: "Action",
      width: "120px",
      align: "end",
      render: (cat: Category) => (
        <div className="d-flex gap-2 justify-content-end">
          <Button
            variant="white"
            size="sm"
            className="border shadow-sm hover-primary"
            onClick={() => handleOpenEditModal(cat)}
          >
            <PencilSquare size={14} className="text-primary" />
          </Button>
          <Button
            variant="white"
            size="sm"
            className="border shadow-sm hover-danger"
            onClick={() => handleOpenDeleteModal(cat)}
          >
            <Trash3 size={14} className="text-danger" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold m-0" style={{ letterSpacing: "-1px", color: "#0F172A" }}>
            Category Management
          </h4>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="light"
            onClick={() => fetchCategories(metadata.page, metadata.limit)}
            className="d-flex align-items-center gap-2 border"
            style={{ borderRadius: "8px", fontWeight: 600 }}
          >
            <ArrowClockwise className={isLoading ? "spin" : ""} /> Refresh
          </Button>
          <Button
            onClick={handleOpenAddModal}
            className="d-flex align-items-center gap-2 px-3 shadow-sm"
            style={{
              backgroundColor: "#2563EB",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
            }}
          >
            <PlusLg /> Add Category
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="border-0 shadow-sm d-flex align-items-center gap-3">
          <div style={{ fontSize: "20px" }}>⚠️</div>
          <div>{error}</div>
        </Alert>
      )}

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          padding: "4px",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          border: "1px solid #E2E8F0",
        }}
      >
        {isLoading && categories.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "400px" }}>
            <Spinner animation="border" variant="primary" />
            <div className="mt-3 text-muted fw-medium">Loading...</div>
          </div>
        ) : (
          <TableComponent
            data={categories}
            columns={columns}
            metadata={metadata}
            height="calc(100vh - 300px)"
            onPageChange={(p) => fetchCategories(p, metadata.limit)}
            onLimitChange={(l) => fetchCategories(1, l)}
            onSortChange={(k, o) => console.log("Sort:", k, o)}
            onFilterChange={(k, v) => console.log("Filter:", k, v)}
          />
        )}
      </div>

      {/* =========================================================
          MODAL FORM: TAMBAH / EDIT KATEGORI
          ========================================================= */}
      <Modal show={showFormModal} onHide={() => !formIsSubmitting && setShowFormModal(false)} centered backdrop="static">
        <Modal.Header closeButton={!formIsSubmitting}>
          <Modal.Title className="fw-bold h5">
            {modalType === "ADD" ? "Tambah Kategori Baru" : "Edit Informasi Kategori"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">Nama Kategori (Label)</Form.Label>
              <Form.Control
                type="text"
                required
                value={formValues.label}
                onChange={(e) => setFormValues({ ...formValues, label: e.target.value })}
                placeholder="Masukkan nama kategori baru..."
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold text-secondary">Icon Gambar</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                required={modalType === "ADD"} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files && e.target.files[0]) {
                    setFormValues({ ...formValues, icon: e.target.files[0] });
                  }
                }}
              />
              {modalType === "EDIT" && selectedCategory?.iconUrl && (
                <Form.Text className="text-muted d-block mt-1">
                  * Kosongkan berkas jika tidak ingin mengubah icon saat ini.
                </Form.Text>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="secondary" onClick={() => setShowFormModal(false)} disabled={formIsSubmitting} className="fw-semibold">
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={formIsSubmitting} className="fw-semibold px-4">
              {formIsSubmitting ? <Spinner animation="border" size="sm" /> : modalType === "ADD" ? "Simpan Kategori" : "Simpan Perubahan"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* =========================================================
          MODAL KONFIRMASI: HAPUS KATEGORI
          ========================================================= */}
      <Modal show={showDeleteModal} onHide={() => !formIsSubmitting && setShowDeleteModal(false)} centered size="sm">
        <Modal.Body className="text-center p-4">
          <div className="text-danger mb-3" style={{ fontSize: "40px" }}>🚨</div>
          <h6 className="fw-bold text-dark">Hapus Kategori?</h6>
          <p className="text-muted small mb-4">
            Kategori <strong>{selectedCategory?.label}</strong> beserta seluruh relasinya akan dihapus secara permanen.
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <Button variant="light" className="border fw-semibold w-50" onClick={() => setShowDeleteModal(false)} disabled={formIsSubmitting}>
              Batal
            </Button>
            <Button variant="danger" className="fw-semibold w-50" onClick={handleDeleteSubmit} disabled={formIsSubmitting}>
              {formIsSubmitting ? <Spinner animation="border" size="sm" /> : "Ya, Hapus"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <style>{`
        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .hover-primary:hover { background-color: #EFF6FF !important; }
        .hover-danger:hover { background-color: #FEF2F2 !important; }
        .fade-in { animation: fadeIn 0.5s ease-in; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default CategoryManager;
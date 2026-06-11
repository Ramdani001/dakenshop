import React, { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Spinner, Form, InputGroup, Modal } from "react-bootstrap";
import {
  ArrowClockwise,
  PersonCircle,
  PencilSquare,
  PlusLg,
  Trash3,
  Search,
} from "react-bootstrap-icons";
import { ColumnDef, TableComponent } from "./Component/TableComponent.tsx";
import CONFIG from "../Config.ts";

// Interface Data User
interface UserProfile {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  address: string | null;
  role: "ADMIN" | "USER";
  image: string | null;
  createdAt: string;
}

interface MetaData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UserFormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: "ADMIN" | "USER";
  password?: string;
}
 
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchName, setSearchName] = useState<string>("");
  const [metadata, setMetadata] = useState<MetaData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- STATE UNTUK MODAL DIALOG ---
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState<"ADD" | "EDIT">("ADD");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [formIsSubmitting, setFormIsSubmitting] = useState(false);
  
  // State Input Form
  const [formValues, setFormValues] = useState<UserFormState>({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "USER",
    password: "",
  });

  // Helper mengambil Bearer Token
  const getCleanToken = () => {
    const token = localStorage.getItem('token');
    return token ? token.replace(/\s/g, '').replace(/['"]+/g, '') : '';
  };

  // 1. READ: Fetch Data Users
  const fetchUser = useCallback(async (page = 1, limit = 10, search = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${CONFIG.BASE_URL}/api/profile?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${getCleanToken()}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.status === 401) throw new Error("Sesi login berakhir. Silakan login kembali.");
      if (response.status === 403) throw new Error("Anda tidak memiliki akses (Forbidden).");
      if (!response.ok) throw new Error("Gagal mengambil data dari server");

      const result = await response.json();
      setUsers(result.data || []);
      setMetadata(result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUser(1, metadata.limit, searchName);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchName, fetchUser, metadata.limit]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleOpenAddModal = () => {
    setModalType("ADD");
    setFormValues({ name: "", email: "", phone: "", address: "", role: "USER", password: "" });
    setSelectedUser(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (user: UserProfile) => {
    setModalType("EDIT");
    setSelectedUser(user);
    setFormValues({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      role: user.role,
      password: "",
    });
    setShowFormModal(true);
  };

  const handleOpenDeleteModal = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // 2. CREATE & UPDATE: Submit Handler (POST & PUT)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormIsSubmitting(true);

    try {
      const url = modalType === "ADD" 
        ? `${CONFIG.BASE_URL}/api/profile`
        : `${CONFIG.BASE_URL}/api/profile/${selectedUser?.id}`;

      const method = modalType === "ADD" ? "POST" : "PUT";
      
      const payload: any = { ...formValues };
      if (modalType === "EDIT" && !payload.password) {
        delete payload.password;
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${getCleanToken()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Terjadi kesalahan sistem.");

      setShowFormModal(false);
      fetchUser(metadata.page, metadata.limit, searchName);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormIsSubmitting(false);
    }
  };

  // 3. DELETE: Action Handler (DELETE)
  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    setFormIsSubmitting(true);

    try {
      const response = await fetch(`${CONFIG.BASE_URL}/api/profile/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${getCleanToken()}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 204) {
        setShowDeleteModal(false);
        fetchUser(1, metadata.limit, searchName);
        return;
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal menghapus user.");

      setShowDeleteModal(false);
      fetchUser(1, metadata.limit, searchName);
    } catch (err: any) {
      console.error("Delete Error:", err);
      alert(err.message || "Terjadi kesalahan saat menghapus data");
    } finally {
      setFormIsSubmitting(false);
    }
  };

  // Susunan Kolom Tabel
  const columns: ColumnDef<UserProfile>[] = [
    {
      key: "image",
      label: "Image",
      align: "center",
      render: (user: UserProfile) => (
        <div 
          className="bg-light rounded-circle d-flex align-items-center justify-content-center overflow-hidden border shadow-sm mx-auto"
          style={{ width: "40px", height: "40px" }}
        >
          {user.image ? (
            <img
              src={CONFIG.BASE_URL + user.image}
              alt={user.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150"; }}
            />
          ) : (
            <PersonCircle className="text-secondary" size={24} />
          )}
        </div>
      ),
    },
    {
      key: "name",
      label: "Nama",
      sortable: true,
      render: (user: UserProfile) => (
        <div>
          <div className="fw-bold text-dark" style={{ fontSize: "14px" }}>{user.name}</div>
          <div className="text-muted" style={{ fontSize: "10px", fontFamily: "monospace" }}>{user.id}</div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "No Telepon",
      render: (user: UserProfile) => <span style={{ fontSize: "13px" }}>{user.phone || "-"}</span>,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (user: UserProfile) => <span style={{ fontSize: "13px", color: "#2563EB" }}>{user.email}</span>,
    },
    {
      key: "address",
      label: "Alamat",
      render: (user: UserProfile) => (
        <div className="text-truncate" style={{ fontSize: "13px", maxWidth: "160px" }}>{user.address || "-"}</div>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      align: "center",
      render: (user: UserProfile) => (
        <Badge bg={user.role === "ADMIN" ? "danger" : "success"} className="fw-bold px-3 py-2 rounded-pill" style={{ fontSize: "11px" }}>
          {user.role}
        </Badge>
      ),
    },
    {
      key: "action",
      label: "Action",
      width: "120px",
      align: "end",
      render: (user: UserProfile) => (
        <div className="d-flex gap-2 justify-content-end">
          <Button variant="white" size="sm" className="border shadow-sm hover-primary" onClick={() => handleOpenEditModal(user)}>
            <PencilSquare size={14} className="text-primary" />
          </Button>
          <Button variant="white" size="sm" className="border shadow-sm hover-danger" onClick={() => handleOpenDeleteModal(user)}>
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
          <h4 className="fw-bold m-0" style={{ letterSpacing: "-1px", color: "#0F172A" }}>User Management</h4>
        </div>
        
        <div className="d-flex flex-column flex-sm-row gap-2 align-items-sm-center">
          <Form onSubmit={handleSearchSubmit} className="mb-0">
            <InputGroup style={{ maxWidth: "300px" }}>
              <Form.Control
                type="text"
                placeholder="Cari nama user..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                style={{ borderRadius: "8px 0 0 8px", fontSize: "14px" }}
              />
              <Button type="submit" variant="dark" style={{ borderRadius: "0 8px 8px 0" }} disabled={isLoading}>
                {isLoading ? <Spinner animation="border" size="sm" /> : <Search size={14} />}
              </Button>
            </InputGroup>
          </Form>

          <div className="d-flex gap-2">
            <Button
              variant="light"
              onClick={() => { setSearchName(""); fetchUser(1, metadata.limit, ""); }}
              className="d-flex align-items-center gap-2 border"
              style={{ borderRadius: "8px", fontWeight: 600 }}
            >
              <ArrowClockwise className={isLoading ? "spin" : ""} /> Refresh
            </Button>
            <Button
              onClick={handleOpenAddModal}
              className="d-flex align-items-center gap-2 px-3 shadow-sm"
              style={{ backgroundColor: "#2563EB", border: "none", borderRadius: "8px", fontWeight: 600 }}
            >
              <PlusLg /> Add User
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="border-0 shadow-sm d-flex align-items-center gap-3">
          <div style={{ fontSize: "20px" }}>⚠️</div>
          <div>{error}</div>
        </Alert>
      )}

      <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "4px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", border: "1px solid #E2E8F0" }}>
        {isLoading && users.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "400px" }}>
            <Spinner animation="border" variant="primary" />
            <div className="mt-3 text-muted fw-medium">Loading User Data...</div>
          </div>
        ) : (
          <TableComponent
            data={users}
            columns={columns}
            metadata={metadata}
            height="calc(100vh - 300px)"
            onPageChange={(p) => fetchUser(p, metadata.limit, searchName)}
            onLimitChange={(l) => fetchUser(1, l, searchName)}
            onSortChange={(k, o) => console.log("Sort:", k, o)}
            onFilterChange={(k, v) => console.log("Filter:", k, v)}
          />
        )}
      </div>

      {/* MODAL DIALOG ADD/EDIT & DELETE TETAP SAMA SEPERTI KODE ANDA */}
      <Modal show={showFormModal} onHide={() => !formIsSubmitting && setShowFormModal(false)} centered backdrop="static">
        <Modal.Header closeButton={!formIsSubmitting}>
          <Modal.Title className="fw-bold h5">
            {modalType === "ADD" ? "Tambah Data User Baru" : "Edit Profil Pengguna"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">Nama Lengkap</Form.Label>
              <Form.Control
                type="text"
                required
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                placeholder="Masukkan nama lengkap..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">Alamat Email</Form.Label>
              <Form.Control
                type="email"
                required
                disabled={modalType === "EDIT"}
                value={formValues.email}
                onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                placeholder="nama@email.com"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">No Telepon</Form.Label>
              <Form.Control
                type="text"
                value={formValues.phone}
                onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                placeholder="Contoh: 08123456789"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">Kata Sandi (Password)</Form.Label>
              <Form.Control
                type="password"
                required={modalType === "ADD"}
                value={formValues.password}
                onChange={(e) => setFormValues({ ...formValues, password: e.target.value })}
                placeholder={modalType === "ADD" ? "Masukkan password..." : "Kosongkan jika tidak diubah"}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">Alamat Domisili</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formValues.address}
                onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
                placeholder="Masukkan alamat tinggal saat ini..."
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold text-secondary">Hak Akses Sistem (Role)</Form.Label>
              <Form.Select
                value={formValues.role}
                onChange={(e) => setFormValues({ ...formValues, role: e.target.value as "ADMIN" | "USER" })}
              >
                <option value="USER">USER (Pelanggan Biasa)</option>
                <option value="ADMIN">ADMIN (Pengelola Sistem)</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="secondary" onClick={() => setShowFormModal(false)} disabled={formIsSubmitting} className="fw-semibold">
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={formIsSubmitting} className="fw-semibold px-4">
              {formIsSubmitting ? <Spinner animation="border" size="sm" /> : modalType === "ADD" ? "Simpan User" : "Simpan Perubahan"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => !formIsSubmitting && setShowDeleteModal(false)} centered size="sm">
        <Modal.Body className="text-center p-4">
          <div className="text-danger mb-3" style={{ fontSize: "40px" }}>🚨</div>
          <h6 className="fw-bold text-dark">Hapus Pengguna Ini?</h6>
          <p className="text-muted small mb-4">
            Akun milik <strong>{selectedUser?.name}</strong> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
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

export default UserManagement;
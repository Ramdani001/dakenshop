import React, { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Spinner } from "react-bootstrap";
import {
  ArrowClockwise,
  Folder2Open,
  PencilSquare,
  PlusLg,
  Trash3,
} from "react-bootstrap-icons";
import { ColumnDef, TableComponent } from "./Component/TableComponent.tsx";
import { Category } from "../Types/Category.ts";

interface MetaData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
 
const UserManagement: React.FC = () => {
  const [User, setUser] = useState<Category[]>([]);
  const [metadata, setMetadata] = useState<MetaData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async (page = 1, limit = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://210.79.190.222:3005/api/User?page=${page}&limit=${limit}`,
      );

      if (!response.ok) throw new Error("Gagal mengambil data dari server");

      const result = await response.json();
      setUser(result.data);
      setMetadata(result.meta);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const columns: ColumnDef<Category>[] = [
    {
      key: "label",
      label: "Category",
      sortable: true,
      filterable: true,
      render: (cat: Category) => (
        <div className="d-flex align-items-center gap-3">
          <div
            className="bg-light rounded d-flex align-items-center justify-content-center"
            style={{
              width: "40px",
              height: "40px",
              border: "1px solid #F1F5F9",
            }}
          >
            {cat.iconUrl ? (
              <img
                src={"http://210.79.190.222:3005/" + cat.iconUrl}
                alt={cat.label}
                style={{ width: "24px", objectFit: "contain" }}
              />
            ) : (
              <Folder2Open className="text-primary" size={20} />
            )}
          </div>
          <div>
            <div className="fw-bold text-dark" style={{ fontSize: "14px" }}>
              {cat.label}
            </div>
            <div
              className="text-muted"
              style={{ fontSize: "10px", fontFamily: "monospace" }}
            >
              {cat.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "_count",
      label: "Product Used",
      sortable: true,
      align: "center",
      render: (cat: Category) => (
        <Badge
          bg="info"
          className="fw-bold px-3 py-2"
          style={{
            fontSize: "11px",
            backgroundColor: "#E0F2FE !important",
            color: "#0369A1",
            border: "1px solid #BAE6FD",
          }}
        >
          {cat._count.products} Product
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (cat: Category) => {
        const date = new Date(cat.createdAt);
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
      },
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
          >
            <PencilSquare size={14} className="text-primary" />
          </Button>
          <Button
            variant="white"
            size="sm"
            className="border shadow-sm hover-danger"
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
          <h4
            className="fw-bold m-0"
            style={{ letterSpacing: "-1px", color: "#0F172A" }}
          >
            Category
          </h4>
          <p className="text-muted small m-0">
            test
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="light"
            onClick={() => fetchUser(metadata.page, metadata.limit)}
            className="d-flex align-items-center gap-2 border"
            style={{ borderRadius: "8px", fontWeight: 600 }}
          >
            <ArrowClockwise className={isLoading ? "spin" : ""} /> Refresh
          </Button>
          <Button
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
        <Alert
          variant="danger"
          className="border-0 shadow-sm d-flex align-items-center gap-3"
        >
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
        {isLoading ? (
          <div
            className="d-flex flex-column align-items-center justify-content-center"
            style={{ height: "400px" }}
          >
            <Spinner animation="border" variant="primary" />
            <div className="mt-3 text-muted fw-medium">
              Loading...
            </div>
          </div>
        ) : (
          <TableComponent
            data={User}
            columns={columns}
            metadata={metadata}
            height="calc(100vh - 300px)"
            onPageChange={(p) => fetchUser(p, metadata.limit)}
            onLimitChange={(l) => fetchUser(1, l)}
            onSortChange={(k, o) => console.log("Sort:", k, o)}
            onFilterChange={(k, v) => console.log("Filter:", k, v)}
          />
        )}
      </div>

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

import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Spinner,
  Form,
  Modal,
  Table,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import {
  ArrowClockwise,
  PencilSquare,
  Trash3,
  Receipt,
  CartCheck,
  Telephone,
  Envelope,
  GeoAlt,
  Wallet2,
} from "react-bootstrap-icons";
import { ColumnDef, TableComponent } from "./Component/TableComponent.tsx";
import CONFIG from "../Config.ts";

interface MetaData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productType: string;
  price: number | string;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  totalAmount: number | string;
  // SINKRONISASI: Menggunakan enum OrderStatus terbaru dari database Anda
  status:
    | "PENDING_PAYMENT"
    | "WAITING_PROCESS"
    | "PROCESSED"
    | "CANCELED"
    | "COMPLETED";
  snapToken?: string | null;
  snapUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  orderItems?: OrderItem[];
}

const TransactionManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [metadata, setMetadata] = useState<MetaData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State Management
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formIsSubmitting, setFormIsSubmitting] = useState(false);

  // Form Value State
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [status, setStatus] = useState<Order["status"]>("PENDING_PAYMENT");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);

  const getCleanToken = () => {
    const token = localStorage.getItem("token");
    return token ? token.replace(/\s/g, "").replace(/['"]+/g, "") : "";
  };

  const initData = useCallback(async (page = 1, limit = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${CONFIG.BASE_URL}/api/orders?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${getCleanToken()}` },
        },
      );
      if (!response.ok)
        throw new Error("Gagal memuat basis data transaksi dari server");
      const resData = await response.json();

      setOrders(resData.data || []);
      setMetadata(
        resData.meta || { total: 0, page: 1, limit: 10, totalPages: 1 },
      );
    } catch (err: any) {
      setError(err.message || "Terjadi gangguan koneksi ke server API");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initData();
  }, [initData]);

  const handleOpenEditModal = (order: Order) => {
    setSelectedOrder(order);
    setCustomerName(order.customerName);
    setCustomerEmail(order.customerEmail);
    setCustomerPhone(order.customerPhone);
    setStatus(order.status);
    setAddress(order.address);
    setItems(order.orderItems || []);
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setFormIsSubmitting(true);
    try {
      const response = await fetch(
        `${CONFIG.BASE_URL}/api/orders/${selectedOrder.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCleanToken()}`,
          },
          body: JSON.stringify({
            customerName,
            customerEmail,
            customerPhone,
            status,
            address,
          }),
        },
      );

      if (!response.ok)
        throw new Error("Gagal memperbarui status transaksi di database");

      setShowFormModal(false);
      initData(metadata.page, metadata.limit);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedOrder) return;
    setFormIsSubmitting(true);
    try {
      const response = await fetch(
        `${CONFIG.BASE_URL}/api/orders/${selectedOrder.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getCleanToken()}` },
        },
      );
      if (!response.ok)
        throw new Error("Gagal menghapus berkas order dari server");

      setShowDeleteModal(false);
      initData(1, metadata.limit);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormIsSubmitting(false);
    }
  };

  // ==========================================
  // HELPER STYLING CUSTOM BADGE STATUS ENUM BARU
  // ==========================================
  const renderStatusBadge = (orderStatus: Order["status"]) => {
    const config = {
      PENDING_PAYMENT: { bg: "warning", text: "Pending Payment" },
      WAITING_PROCESS: { bg: "info", text: "Waiting Process" },
      PROCESSED: { bg: "primary", text: "Processed" },
      COMPLETED: { bg: "success", text: "Completed" },
      CANCELED: { bg: "danger", text: "Canceled" },
    };
    const active = config[orderStatus] || {
      bg: "secondary",
      text: orderStatus,
    };
    return (
      <Badge
        bg={active.bg}
        className="px-3 py-2 rounded-pill fw-semibold shadow-xs"
        style={{ fontSize: "11px" }}
      >
        {active.text}
      </Badge>
    );
  };

  const columns: ColumnDef<Order>[] = [
    {
      key: "index",
      label: "No Urut",
      width: "50px",
      align: "center",
      render: (_: any, index?: number) => {
        const pageOffset = (metadata.page - 1) * metadata.limit + 1;
        return (
          <span className="text-secondary small fw-medium">
            {(index ?? 0) + pageOffset}
          </span>
        );
      },
    },
    {
      key: "customerName",
      label: "Nama Customer",
      render: (order) => (
        <div className="responsive-text-block">
          <div className="fw-bold text-dark">{order.customerName}</div>
          <div
            className="text-muted d-none d-sm-block font-monospace"
            style={{ fontSize: "10px" }}
          >
            ID: {order.id.substring(0, 8)}...
          </div>
        </div>
      ),
    },
    {
      key: "customerEmail",
      label: "Email",
      render: (order) => (
        <span className="text-secondary font-monospace small">
          {order.customerEmail}
        </span>
      ),
    },
    {
      key: "customerPhone",
      label: "Phone",
      render: (order) => (
        <span className="text-dark small fw-medium">{order.customerPhone}</span>
      ),
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      render: (order) => (
        <span className="fw-bold text-primary font-monospace">
          Rp {Number(order.totalAmount).toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (order) => renderStatusBadge(order.status),
    },
    {
      key: "itemsGrid",
      label: "Price & Quantity",
      width: "240px",
      render: (order) => (
        <div className="d-flex flex-column gap-1 container-nested-items-badge">
          {order.orderItems && order.orderItems.length > 0 ? (
            order.orderItems.map((item, i) => (
              <div
                key={i}
                className="d-flex align-items-center justify-content-between p-1 bg-light border rounded text-nowrap row-nested-item"
                style={{ fontSize: "11px" }}
              >
                <span
                  className="text-truncate text-muted font-weight-medium me-2"
                  style={{ maxWidth: "110px" }}
                >
                  {item.productName}
                </span>
                <span className="fw-bold text-success font-monospace">
                  Rp{Number(item.price).toLocaleString("id-ID")}{" "}
                  <span className="text-dark fw-normal">
                    ({item.quantity}x)
                  </span>
                </span>
              </div>
            ))
          ) : (
            <span className="text-muted small">- Tanpa Item -</span>
          )}
        </div>
      ),
    },
    {
      key: "action",
      label: "Aksi",
      width: "110px",
      align: "end",
      render: (order) => (
        <div className="d-flex gap-2 justify-content-end action-container">
          <Button
            variant="white"
            size="sm"
            className="border shadow-sm hover-primary"
            onClick={() => handleOpenEditModal(order)}
          >
            <PencilSquare size={14} className="text-primary" />
          </Button>
          <Button
            variant="white"
            size="sm"
            className="border shadow-sm hover-danger"
            onClick={() => {
              setSelectedOrder(order);
              setShowDeleteModal(true);
            }}
          >
            <Trash3 size={14} className="text-danger" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="fade-in p-2 container-fluent">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4
            className="fw-bold m-0"
            style={{ letterSpacing: "-1px", color: "#0F172A" }}
          >
            Transaction Order Dashboard
          </h4>
        </div>
        <div>
          <Button
            variant="white"
            onClick={() => initData(metadata.page, metadata.limit)}
            className="d-flex align-items-center gap-2 border fw-semibold style-btn text-secondary shadow-sm px-3 py-2"
            disabled={isLoading}
          >
            <ArrowClockwise className={isLoading ? "spin" : ""} /> Refresh Data
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="border-0 shadow-sm">
          ⚠️ {error}
        </Alert>
      )}

      <div className="custom-table-container">
        {isLoading && orders.length === 0 ? (
          <div
            className="d-flex flex-column align-items-center justify-content-center"
            style={{ height: "400px" }}
          >
            <Spinner animation="border" variant="primary" />
            <div className="mt-3 text-muted fw-medium">
              Menghubungkan ke PostgreSQL Order Database...
            </div>
          </div>
        ) : (
          <TableComponent
            data={orders}
            columns={columns}
            metadata={metadata}
            height="calc(100vh - 280px)"
            loading={isLoading}
            sortBy=""
            sortOrder="asc"
            filterValues={{}}
            onPageChange={(p) => initData(p, metadata.limit)}
            onLimitChange={(l) => initData(1, l)}
          />
        )}
      </div>

      {/* MODAL DIALOG: DETAILED INVOICE & UPDATE */}
      <Modal
        show={showFormModal}
        onHide={() => !formIsSubmitting && setShowFormModal(false)}
        centered
        backdrop="static"
        size="lg"
      >
        <Modal.Header closeButton={!formIsSubmitting}>
          <Modal.Title className="fw-bold h5 d-flex align-items-center gap-2">
            <Receipt className="text-primary" /> Detail Rincian Transaksi
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body className="custom-modal-body-scroll bg-light-subtle">
            <Row className="g-3">
              {/* CONTACT COLUMN */}
              <Col lg={6} md={12}>
                <Card
                  className="border shadow-xs h-100 p-3 bg-white"
                  style={{ borderRadius: "10px" }}
                >
                  <div className="small fw-bold text-uppercase text-muted border-bottom pb-2 mb-3">
                    👤 Informasi Kontak Pembeli
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">
                      Customer Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">
                      <Envelope size={12} className="me-1" /> Customer Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">
                      <Telephone size={12} className="me-1" /> Phone
                    </Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </Form.Group>
                </Card>
              </Col>

              {/* LOGISTICS COLUMN */}
              <Col lg={6} md={12}>
                <Card
                  className="border shadow-xs h-100 p-3 bg-white"
                  style={{ borderRadius: "10px" }}
                >
                  <div className="small fw-bold text-uppercase text-muted border-bottom pb-2 mb-3">
                    ⚙️ Status Finansial & Logistik
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">
                      <Wallet2 size={12} className="me-1" /> Status Pembayaran
                    </Form.Label>
                    <Form.Select
                      required
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as Order["status"])
                      }
                    >
                      <option value="PENDING_PAYMENT">
                        PENDING_PAYMENT (Belum Bayar)
                      </option>
                      <option value="WAITING_PROCESS">
                        WAITING_PROCESS (Menunggu Proses)
                      </option>
                      <option value="PROCESSED">
                        PROCESSED (Sedang Diproses)
                      </option>
                      <option value="COMPLETED">COMPLETED (Selesai)</option>
                      <option value="CANCELED">CANCELED (Dibatalkan)</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">
                      <GeoAlt size={12} className="me-1" /> Address
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Alamat pengiriman..."
                    />
                  </Form.Group>
                </Card>
              </Col>
            </Row>

            {/* PRODUCT ITEM INVOICE LIST */}
            <div className="mt-4 pt-1 bg-white p-3 border rounded shadow-xs">
              <div className="small fw-bold text-uppercase text-muted d-flex align-items-center gap-2 mb-3">
                <CartCheck size={16} className="text-success" /> 🛒 Produk yang
                di-checkout
              </div>
              <div className="table-responsive">
                <Table
                  bordered
                  hover
                  striped
                  className="mb-0 small align-middle"
                >
                  <thead className="bg-light text-center">
                    <tr>
                      <th>Nama Produk</th>
                      <th>Product Type</th>
                      <th style={{ width: "140px" }}>Price per Product</th>
                      <th style={{ width: "90px" }}>Quantity</th>
                      <th style={{ width: "140px" }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const subTotal = Number(item.price) * item.quantity;
                      return (
                        <tr key={item.id || idx}>
                          <td className="fw-bold text-dark">
                            {item.productName}
                          </td>
                          <td className="text-center">
                            <Badge
                              bg="secondary"
                              className="font-monospace px-2 py-1"
                            >
                              {item.productType || "Standard"}
                            </Badge>
                          </td>
                          <td className="text-end font-monospace fw-medium">
                            Rp {Number(item.price).toLocaleString("id-ID")}
                          </td>
                          <td className="text-center font-weight-bold text-dark">
                            {item.quantity}x
                          </td>
                          <td className="text-end font-monospace fw-bold text-success">
                            Rp {subTotal.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-light-subtle">
                      <td
                        colSpan={4}
                        className="text-end fw-bold py-2"
                        style={{ fontSize: "13px" }}
                      >
                        Total Amount:
                      </td>
                      <td
                        className="text-end font-monospace fw-bold text-primary py-2"
                        style={{ fontSize: "14px" }}
                      >
                        Rp{" "}
                        {items
                          .reduce(
                            (acc, current) =>
                              acc + Number(current.price) * current.quantity,
                            0,
                          )
                          .toLocaleString("id-ID")}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>

            {selectedOrder?.snapToken && (
              <div
                className="mt-3 p-2 bg-dark rounded border d-flex align-items-center justify-content-between text-white"
                style={{ fontSize: "10px", fontFamily: "monospace" }}
              >
                <span>MIDTRANS SNAP TOKEN: {selectedOrder.snapToken}</span>
                {selectedOrder.snapUrl && (
                  <a
                    href={selectedOrder.snapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-info fw-bold text-decoration-none"
                  >
                    Pay Via Midtrans Sandbox ↗
                  </a>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button
              variant="secondary"
              className="px-3"
              onClick={() => setShowFormModal(false)}
              disabled={formIsSubmitting}
            >
              Tutup
            </Button>
            <Button
              type="submit"
              disabled={formIsSubmitting}
              className="btn-primary-custom px-4 shadow-sm"
            >
              {formIsSubmitting ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Simpan Perubahan & Sync"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* SYSTEM TERMINATOR */}
      <Modal
        show={showDeleteModal}
        onHide={() => !formIsSubmitting && setShowDeleteModal(false)}
        centered
        size="sm"
      >
        <Modal.Body className="text-center p-4">
          <div className="text-danger mb-3" style={{ fontSize: "40px" }}>
            🚨
          </div>
          <h6 className="fw-bold">Hapus Transaksi Permanen?</h6>
          <p className="text-muted small mb-0">
            Tindakan ini mutlak akan menghapus record transaksi beserta item
            rincian di dalamnya.
          </p>
          <div className="d-flex gap-2 mt-4">
            <Button
              variant="light"
              className="border w-50"
              onClick={() => setShowDeleteModal(false)}
              disabled={formIsSubmitting}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              className="w-50"
              onClick={handleDeleteSubmit}
              disabled={formIsSubmitting}
            >
              Eksekusi
            </Button>
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
        .custom-table-container { background-color: #fff; border-radius: 16px; padding: 4px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); border: 1px solid #E2E8F0; }
        .custom-modal-body-scroll { max-height: calc(100vh - 200px); overflow-y: auto; padding: 1.25rem; }
        .shadow-xs { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        
        @media (max-width: 768px) {
          .panel-action-top { width: 100%; display: grid !important; grid-template-columns: 1fr; gap: 8px !important; }
          .container-nested-items-badge { width: 100% !important; }
          .row-nested-item { flex-direction: column; align-items: flex-start !important; }
        }
      `}</style>
    </div>
  );
};

export default TransactionManager;

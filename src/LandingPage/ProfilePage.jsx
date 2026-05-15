import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Nav, Badge } from 'react-bootstrap';
import { Person, Bag, GeoAlt, BoxArrowRight, ShieldLock, Camera } from 'react-bootstrap-icons';

const ProfilePage = ({ navigateTo }) => {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <PersonalInfo />;
      case 'orders': return <OrderHistory />;
      case 'address': return <AddressList />;
      default: return <PersonalInfo />;
    }
  };

  return (
    <Container className="mt-5 pt-5 mb-5">
      <Row className="g-4">
        
        <Col lg={4} md={5}>
          <Card className="border-0 shadow-sm rounded-4 p-4 text-center">
            
            <div className="mb-4">
              <div className="position-relative d-inline-block">
                <div 
                  className="rounded-circle bg-light border d-flex align-items-center justify-content-center overflow-hidden mx-auto" 
                  style={{ width: '120px', height: '120px' }}
                >
                  <Person size={60} className="text-secondary" />
                </div>

                <Button 
                  variant="dark" 
                  size="sm" 
                  className="position-absolute bottom-0 end-0 rounded-circle border border-white p-2 d-flex align-items-center justify-content-center"
                  style={{ width: '35px', height: '35px' }}
                >
                  <Camera size={16} />
                </Button>
              </div>
              <h5 className="fw-bold mt-3 mb-1">John Doe</h5>
              <p className="text-muted small">john.doe@email.com</p>
            </div>

            <Nav className="profile-nav-container border-top pt-3">
              <Row className="g-2 w-100 m-0 text-start">
                <Col xs={6} md={12}>
                  <Nav.Link 
                    className={activeTab === 'profile' ? "active-menu" : "menu-item"} 
                    onClick={() => setActiveTab('profile')}
                  >
                    <Person size={20} /> <span>Profil Saya</span>
                  </Nav.Link>
                </Col>
                <Col xs={6} md={12}>
                  <Nav.Link 
                    className={activeTab === 'orders' ? "active-menu" : "menu-item"} 
                    onClick={() => setActiveTab('orders')}
                  >
                    <Bag size={18} /> <span>Pesanan Saya</span>
                  </Nav.Link>
                </Col>
                <Col xs={6} md={12}>
                  <Nav.Link 
                    className={activeTab === 'address' ? "active-menu" : "menu-item"} 
                    onClick={() => setActiveTab('address')}
                  >
                    <GeoAlt size={18} /> <span>Alamat Pengiriman</span>
                  </Nav.Link>
                </Col>
                <Col xs={12} md={12} className="mt-3">
                  <Nav.Link className="menu-item logout-item" onClick={() => navigateTo("/login")}>
                    <BoxArrowRight size={18} /> <span>Keluar</span>
                  </Nav.Link>
                </Col>
              </Row>
            </Nav>
          </Card>
        </Col>

        {/* AREA KONTEN (KANAN) */}
        <Col lg={8} md={7}>
          <Card className="border-0 shadow-sm rounded-4 p-4 p-md-5 h-100">
            {renderContent()}
          </Card>
        </Col>

      </Row>
    </Container>
  );
};

const PersonalInfo = () => (
  <>
    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
      <h4 className="fw-bold mb-0">Informasi Pribadi</h4>
      <ShieldLock size={22} className="text-muted" />
    </div>
    <Form>
      <Row className="g-4">
        <Col md={12}>
          <Form.Group>
            <Form.Label className="small fw-bold text-muted text-uppercase">Nama Lengkap</Form.Label>
            <Form.Control type="text" defaultValue="John Doe" className="profile-input" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-bold text-muted text-uppercase">Email</Form.Label>
            <Form.Control type="email" defaultValue="john.doe@email.com" className="profile-input" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-bold text-muted text-uppercase">Nomor Telepon</Form.Label>
            <Form.Control type="text" defaultValue="08123456789" className="profile-input" />
          </Form.Group>
        </Col>
        <Col md={12}>
          <Form.Group>
            <Form.Label className="small fw-bold text-muted text-uppercase">Alamat Lengkap</Form.Label>
            <Form.Control as="textarea" rows={3} defaultValue="Jl. Sudirman No. 123, Jakarta Selatan" className="profile-input" />
          </Form.Group>
        </Col>
      </Row>
      <div className="mt-4 d-flex gap-2">
        <Button variant="dark" className="px-4 py-2 fw-bold rounded-3">Simpan Perubahan</Button>
        <Button variant="outline-secondary" className="px-4 py-2 fw-bold rounded-3">Batal</Button>
      </div>
    </Form>
  </>
);

const OrderHistory = () => {
  const orders = [
    {
      id: "ORD-99281",
      date: "12 Mei 2026",
      status: "Selesai",
      statusColor: "success",
      items: [
        { name: "Kaos DakenShop Logo Red", price: "149.000", qty: 1, img: "images/bola_terapi/bola_terapi_1.png" }
      ],
      total: "149.000"
    },
    {
      id: "ORD-99105",
      date: "10 Mei 2026",
      status: "Dikirim",
      statusColor: "primary",
      items: [
        { name: "BOLA TERAPI", price: "149.000", qty: 2, img: "images/bola_terapi/bola_terapi_1.png" }
      ],
      total: "298.000"
    }
  ];

  return (
    <div>
      <h4 className="fw-bold mb-4 border-bottom pb-3">Riwayat Pesanan</h4>
      
      {orders.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => (
            <Card key={order.id} className="border rounded-4 shadow-sm overflow-hidden">
              <Card.Header className="bg-light border-bottom d-flex justify-content-between align-items-center py-3 px-4">
                <div>
                  <span className="small text-muted me-2">{order.date}</span>
                  <span className="fw-bold small text-uppercase text-primary">{order.id}</span>
                </div>
                <Badge bg={order.statusColor} className="rounded-pill px-3 py-2">
                  {order.status}
                </Badge>
              </Card.Header>
              
              <Card.Body className="p-4">
                {order.items.map((item, index) => (
                  <div key={index} className="d-flex align-items-center gap-3 mb-3 border-bottom pb-3 last-child-no-border">
                    <img 
                      src={item.img} 
                      alt={item.name} 
                      className="rounded-3 border"
                      style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-1">{item.name}</h6>
                      <p className="small text-muted mb-0">
                        {item.qty} Barang x Rp {item.price}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="small text-muted mb-0">Total Harga</p>
                      <p className="fw-bold text-dark mb-0">Rp {item.price}</p>
                    </div>
                  </div>
                ))}
                
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div className="text-end">
                    <span className="text-muted small me-2">Total Belanja:</span>
                    <span className="fw-bold fs-5 text-danger">Rp {order.total}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <Bag size={48} className="text-light mb-3" />
          <p className="text-muted">Belum ada riwayat pesanan.</p>
        </div>
      )}
    </div>
  );
};

const AddressList = () => {
  const addresses = [
    {
      id: 1,
      label: "Rumah Utama",
      isDefault: true,
      recipient: "John Doe",
      phone: "08123456789",
      fullAddress: "Jl. Sudirman No. 123, Kel. Senayan, Kec. Kebayoran Baru, Jakarta Selatan, DKI Jakarta, 12190"
    },
    {
      id: 2,
      label: "Kantor",
      isDefault: false,
      recipient: "John Doe (Anavallo)",
      phone: "08129876543",
      fullAddress: "Gedung Cyber 2, Lt. 15, Jl. HR Rasuna Said, Jakarta Selatan"
    }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h4 className="fw-bold mb-0">Alamat Pengiriman</h4>
        <Button variant="dark" size="sm" className="rounded-3 px-3 fw-bold">
          + Tambah Alamat
        </Button>
      </div>

      <div className="d-flex flex-column gap-3">
        {addresses.map((addr) => (
          <Card key={addr.id} className={`border rounded-4 shadow-sm ${addr.isDefault ? 'border-dark' : ''}`}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  <h6 className="fw-bold mb-0">{addr.label}</h6>
                  {addr.isDefault && (
                    <Badge bg="dark" className="rounded-pill px-2 py-1" style={{ fontSize: '10px' }}>
                      UTAMA
                    </Badge>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <Button variant="link" className="text-dark p-0 text-decoration-none small fw-bold">Ubah</Button>
                  <span className="text-muted">|</span>
                  <Button variant="link" className="text-danger p-0 text-decoration-none small fw-bold">Hapus</Button>
                </div>
              </div>

              <p className="fw-bold mb-1 small">{addr.recipient}</p>
              <p className="text-muted mb-2 small">{addr.phone}</p>
              <p className="text-secondary mb-0 small" style={{ lineHeight: '1.5' }}>
                {addr.fullAddress}
              </p>

              {!addr.isDefault && (
                <Button variant="outline-secondary" size="sm" className="mt-3 rounded-3 fw-bold px-3">
                  Jadikan Alamat Utama
                </Button>
              )}
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
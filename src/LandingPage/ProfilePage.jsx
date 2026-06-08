import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Nav, Spinner, Badge } from 'react-bootstrap';
import { Person, Bag, GeoAlt, BoxArrowRight, ShieldLock, Camera } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const alertShown = useRef(false);

  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false); // State untuk loading saat simpan

  const API_URL = 'http://103.30.194.75:3005/api';

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
      const token = localStorage.getItem('token');

      const cleanToken = token ? token.replace(/\s/g, '').replace(/['"]+/g, '') : '';

      if (!cleanToken) {
          handleUnauthorized();
          return;
      }

      try {
        const response = await fetch(`${API_URL}/profile/me`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${cleanToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Gagal mengambil data");
        }
        
        setUserData(result);
      } catch (err) {
        console.error("Fetch Error:", err);
        handleUnauthorized();
      } finally {
        setLoading(false);
      }
    };

  const handleUnauthorized = () => {
    if (!alertShown.current) {
      alertShown.current = true;
      localStorage.removeItem('token');
      Swal.fire({
        title: 'Sesi Berakhir',
        text: 'Sesi login telah berakhir, silakan login kembali.',
        icon: 'warning',
        showCloseButton: true,
        confirmButtonText: 'Login Kembali',
        confirmButtonColor: '#212529',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) navigate("/login");
      });
    }
  };

 const handleUpdateProfile = async (e) => {
  e.preventDefault();
  setUpdating(true);

  // 1. Ambil token dan bersihkan (untuk jaga-jaga karakter ilegal)
  const token = localStorage.getItem('token');
  const cleanToken = token ? token.replace(/\s/g, '').replace(/['"]+/g, '') : '';

  // 2. Pastikan userData.id tersedia (karena backend butuh /:id)
  if (!userData?.id) {
    Swal.fire('Error', 'ID User tidak ditemukan.', 'error');
    setUpdating(false);
    return;
  }

  const formData = new FormData(e.target);

  try {
    // 3. Tambahkan ID ke dalam URL Fetch
    const response = await fetch(`${API_URL}/profile/${userData.id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${cleanToken}` 
        // Jangan tambahkan Content-Type untuk FormData
      },
      body: formData
    });

    const result = await response.json();
    
    if (!response.ok) throw new Error(result.message || "Gagal memperbarui profil");

    // 4. Update state local agar tampilan langsung berubah
    setUserData(result);
    
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Profil Anda telah diperbarui.',
      timer: 1500,
      showConfirmButton: false
    });
  } catch (err) {
    console.error("Update Error:", err);
    Swal.fire('Gagal!', err.message, 'error');
  } finally {
    setUpdating(false);
  }
};

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    
    const cleanToken = token ? token.replace(/\s/g, '').replace(/['"]+/g, '') : '';

    const formData = new FormData();
    formData.append('image', file);

    setUpdating(true);
    try {
      const response = await fetch(`${API_URL}/profile/${userData.id}`, { 
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${cleanToken}` 
        },
        body: formData // Kirim file via FormData
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal upload");

      setUserData(result);
      Swal.fire({ icon: 'success', title: 'Foto Diperbarui!', timer: 1000, showConfirmButton: false });
    } catch (err) {
      console.error("Upload Error:", err);
      Swal.fire('Error', 'Gagal memperbarui foto.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar Akun?',
      text: "Anda akan diarahkan ke halaman login.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#212529',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Keluar!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        navigate("/login");
      }
    });
  };

  if (loading) return (
    <Container className="text-center mt-5 pt-5">
      <Spinner animation="border" variant="dark" />
      <p className="mt-2 text-muted fw-bold">Sinkronisasi Data Profil...</p>
    </Container>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <PersonalInfo user={userData} onUpdate={handleUpdateProfile} updating={updating} />;
      case 'orders': return <OrderHistory orders={userData?.orders || []} />;
      default: return <PersonalInfo user={userData} onUpdate={handleUpdateProfile} updating={updating} />;
    }
  };

  return (
    <Container className="mt-5 pt-5 mb-5">
      <Row className="g-4">
        {/* SIDEBAR */}
        <Col lg={4} md={5}>
          <Card className="border-0 shadow-sm rounded-4 p-4 text-center">
            <div className="mb-4">
              <div className="position-relative d-inline-block">
                <div 
                  className="rounded-circle bg-light border d-flex align-items-center justify-content-center overflow-hidden mx-auto shadow-sm" 
                  style={{ width: '120px', height: '120px' }}
                >
                  {userData?.image ? (
                    <img 
                      src={`http://210.79.190.222:3005${userData.image}`} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = "https://via.placeholder.com/120"; }} 
                    />
                  ) : <Person size={60} className="text-secondary" />}
                </div>
                
                {/* Input File Hidden */}
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handlePhotoChange} />
                <Button 
                  variant="dark" size="sm" 
                  className="position-absolute bottom-0 end-0 rounded-circle border border-white p-2 shadow"
                  onClick={() => fileInputRef.current.click()}
                  disabled={updating}
                >
                  <Camera size={16} />
                </Button>
              </div>
              <h5 className="fw-bold mt-3 mb-1 text-capitalize">{userData?.name || "User"}</h5>
              <p className="text-muted small mb-0">{userData?.email}</p>
              <Badge bg="secondary" className="mt-2 text-uppercase" style={{ fontSize: '10px' }}>{userData?.role || 'CUSTOMER'}</Badge>
            </div>

            <Nav className="flex-column border-top pt-3 gap-2">
               <Button variant={activeTab === 'profile' ? "dark" : "light"} className="text-start border-0 py-2 px-3 d-flex align-items-center gap-3 rounded-3" onClick={() => setActiveTab('profile')}>
                <Person size={20} /> Profil Saya
              </Button>
              <Button variant={activeTab === 'orders' ? "dark" : "light"} className="text-start border-0 py-2 px-3 d-flex align-items-center gap-3 rounded-3" onClick={() => setActiveTab('orders')}>
                <Bag size={18} /> Pesanan Saya
              </Button>
              <hr />
              <Button variant="outline-danger" className="text-start border-0 py-2 px-3 d-flex align-items-center gap-3 rounded-3" onClick={handleLogout}>
                <BoxArrowRight size={18} /> Keluar Akun
              </Button>
            </Nav>
          </Card>
        </Col>

        {/* AREA KONTEN */}
        <Col lg={8} md={7}>
          <Card className="border-0 shadow-sm rounded-4 p-4 p-md-5 h-100">
            {renderContent()}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

const PersonalInfo = ({ user, onUpdate, updating }) => (
  <>
    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
      <h4 className="fw-bold mb-0">Informasi Pribadi</h4>
      <ShieldLock size={22} className="text-muted" />
    </div>
    <Form onSubmit={onUpdate}>
      <Row className="g-4">
        <Col md={12}>
          <Form.Group>
            <Form.Label className="small fw-bold text-muted text-uppercase">Nama Lengkap</Form.Label>
            <Form.Control name="name" type="text" defaultValue={user?.name} className="bg-light border-0 py-2 px-3 shadow-none" required />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-bold text-muted text-uppercase">Email</Form.Label>
            <Form.Control type="email" value={user?.email || ""} className="bg-light border-0 py-2 px-3 shadow-none" readOnly />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-bold text-muted text-uppercase">Nomor Telepon</Form.Label>
            <Form.Control name="phone" type="text" defaultValue={user?.phone || ""} placeholder="Contoh: 0812..." className="bg-light border-0 py-2 px-3 shadow-none" />
          </Form.Group>
        </Col>
        <Col md={12}>
          <Form.Group>
            <Form.Label className="small fw-bold text-muted text-uppercase">Alamat Lengkap</Form.Label>
            <Form.Control name="address" as="textarea" rows={3} defaultValue={user?.address || ""} placeholder="Masukkan alamat lengkap pengiriman" className="bg-light border-0 py-2 px-3 shadow-none" />
          </Form.Group>
        </Col>
      </Row>
      <div className="mt-4">
        <Button type="submit" variant="dark" className="px-5 py-2 fw-bold rounded-3 shadow-sm" disabled={updating}>
          {updating ? <><Spinner size="sm" animation="border" className="me-2" /> Menyimpan...</> : 'Simpan Perubahan'}
        </Button>
      </div>
    </Form>
  </>
);
const OrderHistory = ({ orders = [] }) => {
  // Jika data pesanan kosong, tampilkan state kosong
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-5">
        <Bag size={48} className="text-secondary mb-3 opacity-25" />
        <h5 className="fw-bold">Belum Ada Pesanan</h5>
        <p className="text-muted">Ayo mulai belanja kebutuhan dapur Anda di DakenShop!</p>
        <Button variant="outline-dark" size="sm" className="mt-2 rounded-pill px-4">Belanja Sekarang</Button>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h4 className="fw-bold mb-0">Riwayat Pesanan</h4>
        <Badge bg="dark">{orders.length} Pesanan</Badge>
      </div>

      {orders.map((order, index) => (
        <Card key={index} className="border-0 shadow-sm rounded-4 mb-3 overflow-hidden transition-hover">
          <Card.Body className="p-0">
            <Row className="g-0 align-items-center">
              {/* FOTO PRODUK */}
              <Col xs={4} md={2}>
                <div style={{ height: '120px', width: '100%', backgroundColor: '#f8f9fa' }}>
                  <img 
                    src={order.productImg || 'https://via.placeholder.com/150'} 
                    alt={order.productName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </Col>

              {/* DETAIL PRODUK */}
              <Col xs={8} md={7} className="p-3">
                <div className="d-flex flex-column h-100">
                  <div className="mb-1">
                    <Badge 
                      bg={order.status === 'Selesai' ? 'success' : order.status === 'Diproses' ? 'warning' : 'info'} 
                      className="mb-2"
                      style={{ fontSize: '10px' }}
                    >
                      {order.status.toUpperCase()}
                    </Badge>
                    <h6 className="fw-bold mb-1 text-truncate">{order.productName}</h6>
                    <p className="text-muted small mb-1 text-truncate" style={{ maxWidth: '400px' }}>
                      {order.description}
                    </p>
                  </div>
                  <div className="mt-auto">
                    <span className="text-muted small">Jumlah: <strong>{order.quantity}x</strong></span>
                  </div>
                </div>
              </Col>

              {/* HARGA & AKSI */}
              <Col xs={12} md={3} className="p-3 bg-light border-start-md text-md-center d-flex flex-md-column justify-content-between align-items-center justify-content-md-center">
                <div className="mb-md-2">
                  <p className="text-muted small mb-0">Total Harga</p>
                  <h5 className="fw-bold text-primary mb-0">
                    Rp {order.price.toLocaleString('id-ID')}
                  </h5>
                </div>
                <Button variant="dark" size="sm" className="rounded-pill px-3 mt-md-2" style={{ fontSize: '12px' }}>
                  Detail
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default ProfilePage;
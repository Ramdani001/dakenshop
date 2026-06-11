import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Envelope, Lock, BoxSeam, CameraVideo, CheckCircle, Person, Telephone, GeoAlt, Camera } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import CONFIG from '../Config.ts';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    phone: '',
    address: '',
    image: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      if (file) {
        setFormData((prev) => ({ ...prev, image: file }));
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchTab = (loginStatus) => {
    setIsLogin(loginStatus);
    setFormData({ name: '', email: '', password: '', phone: '', address: '', image: null });
    setPreview(null);
    setError(null);
    setSuccess(null);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(null);

  const endpoint = isLogin ? `${CONFIG.BASE_URL}/api/auth/login` : `${CONFIG.BASE_URL}/api/auth/register`;

  try {
    let body;
    let headers = {};

    if (isLogin) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({ email: formData.email, password: formData.password });
    } else {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('password', formData.password);
      if (formData.phone) data.append('phone', formData.phone);
      if (formData.address) data.append('address', formData.address);
      if (formData.image) data.append('image', formData.image);
      body = data;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Terjadi kesalahan.');

    if (isLogin) {
      setSuccess('Login Berhasil!');
      
      if (data.token) localStorage.setItem('token', data.token);
      
      const rawRole = data.role || (data.user && data.user.role);
      const cleanRole = rawRole ? String(rawRole).trim().toUpperCase() : '';

      console.log("DEBUG LOGIN ROLE:", { original: rawRole, cleaned: cleanRole });

      // === PERBAIKAN: Hapus useEffect, langsung gunakan setTimeout biasa ===
      setTimeout(() => {
        if (cleanRole === 'ADMIN') {
          navigate('/dashboard'); 
        } else {
          navigate('/');
        }
      }, 1500);

    } else {
      setSuccess('Pendaftaran berhasil! Silakan masuk.');
      setTimeout(() => handleSwitchTab(true), 2000);
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-container d-flex align-items-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0f7ef 0%, #f9f0d1 100%)', padding: '20px 0' }}>
      <Container>
        <Card className="shadow-lg border-0 overflow-hidden mx-auto" style={{ borderRadius: '20px', maxWidth: isLogin ? '900px' : '1000px' }}>
          <Row className="g-0">
            {/* Banner Kiri */}
            <Col lg={isLogin ? 6 : 5} className="d-none d-lg-flex flex-column justify-content-center align-items-center p-5 bg-white text-center border-end">
              <h2 className="fw-bold mb-4 text-dark small-letter-spacing">JANGAN LUPA UNBOXING</h2>
              <BoxSeam size={80} color="#b58d53" className="mb-4" />
              <div className="d-flex align-items-center gap-3 mb-4 fw-bold">
                <span className="text-danger"><CameraVideo /> REC</span>
                <span className="text-muted">→</span>
                <span className="text-success"><CheckCircle /> CLAIM BERHASIL</span>
              </div>
              <h4 className="fw-bold mt-2">SELAMAT DATANG!</h4>
              <p className="text-muted small px-4">Lengkapi data diri Anda untuk mendapatkan pengalaman belanja terbaik di DakenShop.</p>
            </Col>

            {/* Form Kanan */}
            <Col lg={isLogin ? 6 : 7} className="p-4 p-md-5 bg-white">
              <div className="d-flex mb-4 rounded-3 overflow-hidden shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
                <Button className={`w-50 border-0 py-3 fw-bold ${isLogin ? 'bg-dark text-white' : 'bg-transparent text-muted'}`} onClick={() => handleSwitchTab(true)}>MASUK</Button>
                <Button className={`w-50 border-0 py-3 fw-bold ${!isLogin ? 'bg-warning text-white' : 'bg-transparent text-muted'}`} onClick={() => handleSwitchTab(false)} style={{ backgroundColor: !isLogin ? '#ffc107' : '' }}>DAFTAR</Button>
              </div>

              <h5 className="text-center mb-4 fw-bold">{isLogin ? 'MASUK KE DAKENSHOP' : 'BUAT AKUN BARU'}</h5>

              {error && <Alert variant="danger" className="py-2 small text-center shadow-sm">{error}</Alert>}
              {success && <Alert variant="success" className="py-2 small text-center shadow-sm">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  {/* FOTO PROFIL */}
                  {!isLogin && (
                    <Col xs={12} className="mb-4 text-center order-first">
                      <Form.Label className="small fw-bold text-uppercase d-block mb-2">Foto Profil</Form.Label>
                      <div 
                        className="rounded-circle bg-light border mx-auto d-flex align-items-center justify-content-center overflow-hidden position-relative shadow-sm"
                        style={{ width: '110px', height: '110px', cursor: 'pointer', borderStyle: 'dashed !important' }}
                        onClick={() => fileInputRef.current.click()}
                      >
                        {preview ? (
                          <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div className="text-muted">
                            <Camera size={30} />
                            <div style={{ fontSize: '9px' }} className="fw-bold mt-1">UPLOAD</div>
                          </div>
                        )}
                      </div>
                      <input type="file" name="image" hidden ref={fileInputRef} onChange={handleChange} accept="image/*" />
                      <small className="text-muted mt-2 d-block" style={{ fontSize: '11px' }}>Klik lingkaran untuk pilih foto</small>
                    </Col>
                  )}

                  {/* NAMA LENGKAP */}
                  {!isLogin && (
                    <Col md={12} className="mb-3">
                      <Form.Label className="small fw-bold">NAMA LENGKAP <span className="text-danger">*</span></Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0"><Person color="gray" /></span>
                        <Form.Control name="name" value={formData.name} onChange={handleChange} placeholder="Nama Lengkap" className="border-start-0 ps-0 shadow-none" required />
                      </div>
                    </Col>
                  )}

                  {/* EMAIL */}
                  <Col md={isLogin ? 12 : 6} className="mb-3">
                    <Form.Label className="small fw-bold">EMAIL <span className="text-danger">*</span></Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-end-0"><Envelope color="gray" /></span>
                      <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Anda" className="border-start-0 ps-0 shadow-none" required />
                    </div>
                  </Col>

                  {/* PASSWORD */}
                  <Col md={isLogin ? 12 : 6} className="mb-3">
                    <Form.Label className="small fw-bold">KATA SANDI <span className="text-danger">*</span></Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-end-0"><Lock color="gray" /></span>
                      <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Kata Sandi" className="border-start-0 ps-0 shadow-none" required />
                    </div>
                  </Col>

                  {/* FIELD OPSIONAL */}
                  {!isLogin && (
                    <>
                      <Col md={6} className="mb-3">
                        <Form.Label className="small fw-bold text-uppercase">Nomor Telepon</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-transparent border-end-0"><Telephone color="gray" /></span>
                          <Form.Control name="phone" value={formData.phone} onChange={handleChange} placeholder="08..." className="border-start-0 ps-0 shadow-none" />
                        </div>
                      </Col>

                      <Col md={6} className="mb-3">
                        <Form.Label className="small fw-bold text-uppercase">Alamat Lengkap</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-transparent border-end-0"><GeoAlt color="gray" /></span>
                          <Form.Control as="textarea" rows={1} name="address" value={formData.address} onChange={handleChange} placeholder="Alamat pengiriman" className="border-start-0 ps-0 shadow-none" style={{ minHeight: '40px' }} />
                        </div>
                      </Col>
                    </>
                  )}
                </Row>

                {isLogin && (
                  <div className="text-end mb-4">
                    <a href="#" className="text-decoration-none small fw-bold text-info">LUPA KATA SANDI?</a>
                  </div>
                )}

                <Button type="submit" disabled={loading} variant="primary" className="w-100 py-3 fw-bold mb-4 border-0 shadow" style={{ backgroundColor: '#3b82f6', borderRadius: '30px' }}>
                  {loading ? 'MEMPROSES...' : (isLogin ? 'MASUK KE DAKENSHOP' : 'DAFTAR SEKARANG')}
                </Button>

                <div className="text-center small">
                  {isLogin ? (
                    <span>BELUM PUNYA AKUN? <a href="#" onClick={() => handleSwitchTab(false)} className="text-info fw-bold text-decoration-none">DAFTAR SEKARANG</a></span>
                  ) : (
                    <span>SUDAH PUNYA AKUN? <a href="#" onClick={() => handleSwitchTab(true)} className="text-info fw-bold text-decoration-none">MASUK SEKARANG</a></span>
                  )}
                </div>
              </Form>
            </Col>
          </Row>
        </Card>
      </Container>
    </div>
  );
};

export default AuthPage;
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { Envelope, Lock, BoxSeam, CameraVideo, CheckCircle, Person } from 'react-bootstrap-icons';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container d-flex align-items-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0f7ef 0%, #f9f0d1 100%)' }}>
      <Container>
        <Card className="shadow-lg border-0 overflow-hidden" style={{ borderRadius: '20px' }}>
          <Row className="g-0">
            
            <Col lg={6} className="d-none d-lg-flex flex-column justify-content-center align-items-center p-5 bg-white text-center">
              <h2 className="fw-bold mb-4">JANGAN LUPA UNBOXING</h2>

              <div className="d-flex flex-column align-items-center gap-3 mb-4">
                <BoxSeam size={100} color="#b58d53" />
                <div className="d-flex align-items-center gap-3">
                  <div className="text-danger fw-bold"><CameraVideo /> REC</div>
                  <span className="text-muted">→</span>
                  <div className="text-success fw-bold"><CheckCircle /> CLAIM BERHASIL</div>
                </div>
              </div>

              <h4 className="fw-bold mt-4">SELAMAT DATANG KEMBALI!</h4>
              <p className="text-muted">Mulai pengalaman belanja kebutuhan dapur Anda dengan lebih aman dan nyaman.</p>
            </Col>

            <Col lg={6} className="p-4 p-md-5 bg-white">

              <div className="d-flex mb-4 rounded-3 overflow-hidden shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
                <Button 
                  className={`w-50 border-0 py-3 fw-bold ${isLogin ? 'bg-dark text-white' : 'bg-transparent text-muted'}`}
                  onClick={() => setIsLogin(true)}
                  style={{ borderRadius: '0' }}
                  href='/'
                >
                  MASUK
                </Button>
                <Button 
                  className={`w-50 border-0 py-3 fw-bold ${!isLogin ? 'bg-warning text-white' : 'bg-transparent text-muted'}`}
                  onClick={() => setIsLogin(false)}
                  style={{ borderRadius: '0', backgroundColor: isLogin ? '' : '#c4a47c' }}
                >
                  DAFTAR
                </Button>
              </div>

              <h5 className="text-center mb-4 fw-bold">{isLogin ? 'MASUK KE DAKENSHOP' : 'BUAT AKUN BARU'}</h5>

              <Form>

                {isLogin ? "" 
                : 
                <Form.Group className="mb-3 position-relative">
                    <Form.Label className="small fw-bold">NAMA LENGKAP</Form.Label>
                    <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                        <Person color="gray" size={20} />
                        </span>
                        <Form.Control 
                        type="text" 
                        placeholder="Masukkan Nama Lengkap" 
                        className="border-start-0 ps-0" 
                        style={{ boxShadow: 'none' }} 
                        />
                    </div>
                </Form.Group>
                }

                <Form.Group className="mb-3 position-relative">
                  <Form.Label className="small fw-bold">EMAIL</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0"><Envelope color="gray"/></span>
                    <Form.Control type="email" placeholder="Email Anda" className="border-start-0 ps-0" style={{ boxShadow: 'none' }} />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">KATA SANDI</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0"><Lock color="gray"/></span>
                    <Form.Control type="password" placeholder="Kata Sandi" className="border-start-0 ps-0" style={{ boxShadow: 'none' }} />
                  </div>
                </Form.Group>

                {isLogin && (
                  <div className="text-end mb-4">
                    <a href="#" className="text-decoration-none small fw-bold text-info">LUPA KATA SANDI?</a>
                  </div>
                )}

                <Button variant="primary" className="w-100 py-3 fw-bold mb-4 border-0" style={{ backgroundColor: '#3b82f6', borderRadius: '30px' }}>
                  {isLogin ? 'MASUK KE DAKENSHOP' : 'DAFTAR SEKARANG'}
                </Button>

                <div className="text-center position-relative mb-4">
                  <hr />
                  <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">OR</span>
                </div>

                <div className="text-center small">
                  {isLogin ? (
                    <span>BELUM PUNYA AKUN? <a href="#" onClick={() => setIsLogin(false)} className="text-info fw-bold text-decoration-none">DAFTAR SEKARANG</a></span>
                  ) : (
                    <span>SUDAH PUNYA AKUN? <a href="#" onClick={() => setIsLogin(true)} className="text-info fw-bold text-decoration-none">MASUK SEKARANG</a></span>
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
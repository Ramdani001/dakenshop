import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
// Import gambar lokal Anda

const HeroSection = () => {
  return (
    <section 
      className="py-5 d-flex align-items-center" 
      style={{ 
        minHeight: '50vh', 
        backgroundColor: '#f8f9fa',
        overflow: 'hidden' 
      }}
    >
      <Container>
        <Row className="align-items-center">
          <Col xs={12} md={6} className="text-center text-md-start mb-4 mb-md-0">
            <h1 className="fw-bold mb-3" style={{ color: '#0a1d37', fontSize: '2.8rem' }}>
              Selamat Datang di <span style={{ color: '#0d6efd' }}>DakenShop</span>
            </h1>
            <p className="lead text-muted mb-4">
              Inovasi Cerdas untuk Rumah Modern Anda. Temukan kemudahan memasak dan 
              mengelola rumah dengan teknologi terbaru.
            </p>
            <Button 
              variant="primary" 
              size="lg"
              className="rounded-pill px-5 fw-bold shadow-sm"
            >
              Temukan Koleksi
            </Button>
          </Col>

          <Col xs={12} md={6}>
            <div className="position-relative">
              <img 
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000&auto=format&fit=crop" 
                alt="Smart Appliances"
                className="img-fluid rounded-4 shadow-lg"
                style={{ border: '4px solid white' }}
                />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HeroSection;
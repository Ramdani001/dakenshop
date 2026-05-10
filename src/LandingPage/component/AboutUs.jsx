import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const AboutUs = () => {
  return (
    <section id="tentang-kami" className="py-5 bg-light">
      <Container>
        <Row className="align-items-center">
          <Col md={6} className="mb-4 mb-md-0">
            <img 
              src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000" 
              alt="Tentang Kami" 
              className="img-fluid rounded-4 shadow-sm"
            />
          </Col>
          <Col md={6} className="ps-md-5">
            <h2 className="fw-bold mb-4" style={{ color: '#0a1d37' }}>Tentang DakenShop</h2>
            <p className="text-muted mb-3">
              DakenShop hadir sebagai solusi modern untuk kebutuhan rumah tangga Anda. Kami percaya bahwa teknologi harus memudahkan hidup, bukan memperumitnya.
            </p>
            <p className="text-muted">
              Melalui kurasi produk cerdas seperti peralatan dapur futuristik dan aksesoris rumah tangga berkualitas, kami berkomitmen untuk menghadirkan kenyamanan maksimal bagi setiap keluarga.
            </p>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AboutUs;
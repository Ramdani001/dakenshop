import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';


const HeroSection = ({navigateTo}) => {
  const handleNavClick = (path) => {
      // Sekarang navigateTo sudah terdefinisi karena diambil dari props di atas
      if (navigateTo) {
        navigateTo(path);
      }
    };
  return (
    <section 
      className="d-flex align-items-center" 
      style={{ 
        minHeight: '60vh', // Sedikit lebih tinggi agar proporsional
        backgroundColor: '#ffffff', // Latar belakang putih bersih sesuai gambar
        overflow: 'hidden',
        paddingTop: '80px' // Memberi ruang karena Navbar fixed="top"
      }}
    >
      <Container id='home' fluid className="px-0"> {/* Fluid agar gambar bisa menempel ke kanan */}
        <Row className="align-items-center g-0">
          
          {/* Sisi Kiri: Teks (Dibuat lebih ke tengah container) */}
          <Col xs={12} md={6} className="text-center text-md-start px-5 py-5">
            <div className="ps-md-5"> {/* Padding tambahan agar teks tidak terlalu ke pinggir */}
              <h1 className="fw-bold mb-2" style={{ color: '#0a1d37', fontSize: '3.5rem' }}>
                Selamat Datang di
              </h1>
              <h1 className="fw-bold mb-4" style={{ color: '#0d6efd', fontSize: '3.5rem' }}>
                DakenShop
              </h1>
              <p className="lead text-muted mb-4" style={{ maxWidth: '500px', fontSize: '1.1rem' }}>
                Inovasi Cerdas untuk Rumah Modern Anda. Temukan kemudahan memasak dan 
                mengelola rumah dengan teknologi terbaru.
              </p>
              {/* Jika ingin ada tombol, jika tidak bisa dihapus sesuai gambar */}
              <Button 
                variant="primary" 
                size="lg"
                className="rounded-pill px-5 fw-bold shadow-sm"
                style={{ backgroundColor: '#0d6efd', border: 'none' }}
                onClick={() => handleNavClick("/produk")} 
              >
                Lihat Produk
              </Button>
            </div>
          </Col>

          {/* Sisi Kanan: Gambar (Menempel ke kanan layar) */}
          <Col xs={12} md={6} className="text-end">
            <img 
              src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000&auto=format&fit=crop" 
              alt="Smart Kitchen"
              className="img-fluid"
              style={{ 
                width: '100%', 
                height: '60vh', 
                objectFit: 'cover',
                borderBottomLeftRadius: '100px' // Efek lengkung halus di bagian bawah gambar jika diinginkan
              }}
            />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HeroSection;
import React, { useState } from 'react';
import { Row, Col, Carousel, Button } from 'react-bootstrap';

const ProductDetailView = ({ selectedProduct }) => {
  const [quantity, setQuantity] = useState(1);

  // Guard clause jika data produk belum ada
  if (!selectedProduct) {
    return (
      <div className="p-5 text-center text-muted">
        <p>Pilih produk untuk melihat detail</p>
      </div>
    );
  }

  return (
    <Row className="g-0 bg-white shadow-sm rounded-4 overflow-hidden border">
      {/* Kolom Kiri: Galeri Foto */}
      <Col md={6}>
        <Carousel 
          indicators={true} 
          interval={null} 
          variant="dark" 
          className="h-100"
        >
          {selectedProduct.images?.map((img, idx) => (
            <Carousel.Item key={idx}>
              <img 
                src={img} 
                className="d-block w-100" 
                style={{ aspectRatio: '1/1', objectFit: 'cover' }} 
                alt={`Slide ${idx}`} 
              />
            </Carousel.Item>
          ))}
        </Carousel>
      </Col>

      {/* Kolom Kanan: Detail & Aksi */}
      <Col md={6}>
        <div className="p-4 d-flex flex-column h-100 justify-content-center">
          <div className="mb-auto">
            <h4 className="fw-bold text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>
              {selectedProduct.name}
            </h4>
            
            <div className="mb-3">
              <span className="text-danger fw-bold fs-3 me-2">
                Rp {selectedProduct.price?.toLocaleString('id-ID')}
              </span>
              {selectedProduct.originalPrice && (
                <small className="text-muted text-decoration-line-through">
                  Rp {selectedProduct.originalPrice?.toLocaleString('id-ID')}
                </small>
              )}
            </div>

            <p className="text-muted small mb-4" style={{ lineHeight: '1.7' }}>
              Produk berkualitas tinggi dari <strong>DakenShop</strong>. 
              Didesain untuk kenyamanan dan gaya maksimal bagi penggunanya. 
              Material premium yang tahan lama.
            </p>
          </div>

          {/* Input Jumlah */}
          <div className="mb-4">
            <label className="fw-bold small d-block mb-2 text-muted">JUMLAH</label>
            <div className="d-flex align-items-center bg-light rounded-3 p-1 border" style={{ width: 'fit-content' }}>
              <Button 
                variant="white" 
                size="sm" 
                className="rounded-circle border shadow-sm px-2" 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="px-4 fw-bold">{quantity}</span>
              <Button 
                variant="white" 
                size="sm" 
                className="rounded-circle border shadow-sm px-2" 
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="d-grid gap-2">
            <Button variant="dark" className="py-3 fw-bold rounded-3 shadow-sm border-0 transition-all">
              TAMBAH KE KERANJANG
            </Button>

            <Button variant="outline-secondary" className="py-3 fw-bold rounded-3">
              BELI SEKARANG
            </Button>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default ProductDetailView;
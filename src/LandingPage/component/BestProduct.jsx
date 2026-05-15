import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const BestProduct = () => {
  const products = [
    { id: 1, title: "Alas Adonan", image: "images/best_alas.png", description: "Material ringan dengan daya tahan ekstra."},
    { id: 2, title: "Alas Kasur Bambu", image: "images/best_kasur.png", description: "Material ringan dengan daya tahan ekstra." },
    { id: 3, title: "Mesin Jahit", image: "images/best_mesin.png", description: "Desain futuristik dengan port charging." }
  ];

  return (
    <section className="py-5 bg-white">

      <style>
        {`
          .custom-card {
            transition: all 0.3s ease-in-out;
            cursor: pointer;
            border-radius: 15px !important;
          }

          .custom-card:hover {
            transform: translateY(-10px); /* Kartu naik ke atas */
            shadow: 0 1rem 3rem rgba(0,0,0,.175) !important; /* Bayangan lebih dalam */
            box-shadow: 0px 10px 25px rgba(0,0,0,0.1);
          }

          .img-container {
            overflow: hidden;
            border-radius: 10px;
          }

          .product-img {
            transition: transform 0.5s ease;
          }

          .custom-card:hover .product-img {
            transform: scale(1.1); /* Gambar sedikit membesar */
          }
        `}
      </style>

      <Container>
        <div className="text-center mb-5">
          <h2 className="fw-bold" style={{ color: '#0a1d37' }}>Produk Unggulan</h2>
        </div>

        <Row className="g-3 justify-content-center">
          {products.map((product) => (
            <Col 
              key={product.id} 
              xs={6}
              className="col-five"
            >
              <Card className="h-100 border-0 shadow-sm text-center custom-card p-2" style={{ borderRadius: '15px' }}>
                <Card.Body className="d-flex flex-column align-items-center p-2">
                  
                  <Card.Title className="fw-bold mb-2" style={{ fontSize: '0.9rem', minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product.title}
                  </Card.Title>

                  <div 
                    className="img-container mb-3 overflow-hidden" 
                    style={{ width: '100%', aspectRatio: '1/1', borderRadius: '10px' }}
                  >
                    <img 
                      src={product.image}
                      alt={product.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div className="mt-auto mb-3">
                    <span className="text-muted text-decoration-line-through small me-2">Rp 150.000</span>
                    <span className="fw-bold text-dark">Rp 100.000</span>
                  </div>

                  <button className="btn btn-outline-dark w-100 rounded-pill btn-sm fw-bold">
                    Add to Cart
                  </button>

                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default BestProduct;
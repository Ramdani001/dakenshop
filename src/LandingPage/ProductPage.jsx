import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Nav, Breadcrumb, Pagination, Offcanvas, Carousel, Modal } from 'react-bootstrap';
import { Funnel } from 'react-bootstrap-icons';

const ProductsPage = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState("Semua"); // State untuk kategori aktif
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const handleClose = () => setShowFilter(false);
  const handleShowFil = () => setShowFilter(true);
  
  const [selectedVariant, setSelectedVariant] = useState(null);

  const products = [
    { 
      id: 1, 
      name: "BOLA TERAPI", 
      price: "100.000",
      category: "Aksesoris",
      originalPrice: "150.000",
      variants: "1",
      images: ["images/bola_terapi/bola_terapi_1.png","images/bola_terapi/gambar 2.png","images/bola_terapi/bola_terapi_3.png","images/bola_terapi/bola_terapi_4.png"]
    },
    { 
      id: 2, 
      name: "Charcoal", 
      price: "149.000",
      category: "Aksesoris",
      originalPrice: "199.000",
      variants: ["1","2"],
      images: ["images/charcoal/charcoal_1.png","images/charcoal/charcoal_2.png","images/charcoal/charcoal_3.png","images/charcoal/charcoal_4.png"] 
    },
    { 
      id: 3, 
      name: "Tas Selempang Kanvas", 
      price: "80.000",
      category: "Aksesoris",
      originalPrice: "100.000",
      variants: ["1","2","3",""],
      images: ["images/pemeras_buah/pemeras_buah_1.png","images/pemeras_buah/pemeras_buah_2.png","images/pemeras_buah/pemeras_buah_3.png","images/pemeras_buah/pemeras_buah_4.png"] 
    },
    { 
      id: 4, 
      name: "Kaos DakenShop Logo White", 
      price: "149.000",
      category: "Pakaian Pria",
      originalPrice: "",
      variants: [""],
      images: ["images/alumunium/alumunium_1.png","images/alumunium/alumunium_2.png","images/alumunium/alumunium_3.png","images/alumunium/alumunium_4.png"]
    },
  ];

  const variants = [
    { id: 1, name: 'Biru', colorCode: '#00AEEF' },
    { id: 2, name: 'Kuning', colorCode: '#FFD700' },
    { id: 3, name: 'Pink', colorCode: '#FF69B4' },
  ];

  const filteredProducts = filter === "Semua" 
    ? products 
    : products.filter(p => p.category === filter);

  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowDetail(true);
  };

  const FilterContent = () => (
    <div className="filter-sidebar-content text-start">
      <div className="mb-4">
        <span className="filter-label fw-bold d-block mb-3 border-bottom pb-2 text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>Kategori</span>
        <Nav className="flex-column">
          {['Semua', 'Pakaian Pria', 'Aksesoris', 'Pakaian Rage Shop', 'Pakaian Rada'].map((item) => (
            <Nav.Link 
              key={item} 
              className={`filter-link ps-0 ${filter === item ? 'fw-bold text-danger' : 'text-dark'}`}
              style={{ fontSize: '0.95rem' }}
              onClick={() => {
                setFilter(item);
                handleClose();
              }}
            >
              {item}
            </Nav.Link>
          ))}
        </Nav>
      </div>
    </div>
  );

  return (
    <div className="products-page min-vh-100 d-flex flex-column">
      <Container className="mt-5 pt-4 flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Breadcrumb className="mb-0">
            <Breadcrumb.Item href="/">Beranda</Breadcrumb.Item>
            <Breadcrumb.Item active>All Produk</Breadcrumb.Item>
          </Breadcrumb>

          <Button 
            variant="outline-dark" 
            className="d-lg-none d-flex align-items-center gap-2" 
            onClick={handleShowFil}
          >
            <Funnel /> Filter
          </Button>
        </div>

        <Row className="g-4">
          <Col lg={3} className="d-none d-lg-block border-end pe-4">
            <FilterContent />
          </Col>

          <Col lg={9} xs={12}>
            <div className="mb-3">
              <h5 className="fw-bold mb-0">Menampilkan: {filter}</h5>
              <small className="text-muted">{filteredProducts.length} Produk ditemukan</small>
            </div>
            
            <Row className="g-3">
              {filteredProducts.map((product) => (
                <Col key={product.id} lg={4} md={6} xs={6} className="mb-4">
                  <Card className="product-card shadow-sm h-100 border-0 overflow-hidden" onClick={() => handleOpenDetail(product)}>
                    <div className="product-img-container" style={{ cursor: 'pointer' }}>
                      <Carousel interval={null} indicators={false} variant="dark">
                        {product.images?.map((imgSrc, index) => (
                          <Carousel.Item key={index}>
                            <img 
                              src={imgSrc} 
                              className="d-block w-100" 
                              style={{ aspectRatio: '1/1', objectFit: 'cover' }} 
                              alt={product.name} 
                            />
                          </Carousel.Item>
                        ))}
                      </Carousel>
                    </div>

                    <Card.Body className="p-2 p-md-3 text-center d-flex flex-column">
                      <Card.Title className="product-title mb-1 text-uppercase fw-bold" style={{ fontSize: '0.85rem' }}>
                        {product.name}
                      </Card.Title>
                      
                      <div className="product-price-wrapper mb-2">
                        {product.originalPrice && (
                          <span className="text-danger text-decoration-line-through me-2" style={{ fontSize: '0.75rem' }}>
                            Rp {product.originalPrice}
                          </span>
                        )}
                        <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                          Rp {product.price}
                        </span>
                      </div>

                      {/* --- LOGIKA MAPPING VARIAN --- */}
                      <div className="d-flex justify-content-center gap-1 mb-3" style={{ minHeight: '12px' }}>
                        {/* 1. Jika varian adalah Array (Contoh: Charcoal, Tas Selempang) */}
                        {Array.isArray(product.variants) ? (
                          product.variants.map((variantId) => {
                            const colorDetail = variants.find(v => v.id === parseInt(variantId));
                            return colorDetail ? (
                              <div
                                key={variantId}
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  backgroundColor: colorDetail.colorCode,
                                  borderRadius: '50%',
                                  border: '1px solid #ddd'
                                }}
                                title={colorDetail.name}
                              />
                            ) : null;
                          })
                        ) : (
                          /* 2. Jika varian adalah String Tunggal (Contoh: BOLA TERAPI) */
                          (() => {
                            const colorDetail = variants.find(v => v.id === parseInt(product.variants));
                            return colorDetail ? (
                              <div
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  backgroundColor: colorDetail.colorCode,
                                  borderRadius: '50%',
                                  border: '1px solid #ddd'
                                }}
                                title={colorDetail.name}
                              />
                            ) : null;
                          })()
                        )}
                      </div>

                      <Button variant="outline-dark" className="mt-auto btn-sm fw-bold py-2 rounded-3">
                        Add to Cart
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {filteredProducts.length > 0 && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination>
                  <Pagination.Prev disabled />
                  <Pagination.Item active>{1}</Pagination.Item>
                  <Pagination.Item>{2}</Pagination.Item>
                  <Pagination.Next />
                </Pagination>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* Filter Mobile */}
      <Offcanvas show={showFilter} onHide={handleClose} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="fw-bold">FILTER PRODUK</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <FilterContent />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Detail Produk Modal */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered className='product-detail-modal'>
        <Modal.Body className="p-0 overflow-hidden">
          <Button 
            variant="light" 
            onClick={() => setShowDetail(false)}
            className="position-absolute end-0 top-0 m-3 z-3 rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center"
            style={{ width: '35px', height: '35px' }}
          > ✕ </Button>
          
          {selectedProduct && (
            <Row className="g-0 bg-white rounded-4 overflow-hidden border">
             <Col md={6} className="d-flex flex-column justify-content-center border-end bg-light">
                <Carousel indicators={true} interval={null} variant="dark" className="w-100">
                  {selectedProduct.images?.map((img, idx) => (
                    <Carousel.Item key={idx}>
                      <div style={{ aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={img} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="variant" />
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>
              </Col>

              <Col md={6}>
                <div className="p-4 d-flex flex-column h-100">
                  <h4 className="fw-bold text-uppercase mb-2">{selectedProduct.name}</h4>
                  
                  <div className="mb-3">
                    <span className="text-danger fw-bold fs-3 me-2">Rp {selectedProduct.price}</span>
                    {selectedProduct.originalPrice && (
                      <small className="text-muted text-decoration-line-through">Rp {selectedProduct.originalPrice}</small>
                    )}
                  </div>

                  <p className="text-muted small mb-4" style={{ lineHeight: '1.6' }}>
                    Produk berkualitas tinggi dari DakenShop. Didesain untuk kenyamanan dan gaya maksimal bagi penggunanya. Material premium yang tahan lama.
                  </p>

                  <div className="mb-4 d-flex align-items-end gap-4">
                      {/* BAGIAN QUANTITY */}
                      <div>
                        <label className="fw-bold small d-block mb-2 text-muted text-uppercase">
                          Jumlah
                        </label>
                        <div className="d-flex align-items-center bg-light rounded-3 p-1 border" style={{ width: 'fit-content' }}>
                          <Button variant="white" size="sm" className="rounded-circle border shadow-sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}> - </Button>
                          <span className="px-3 fw-bold">{quantity}</span>
                          <Button variant="white" size="sm" className="rounded-circle border shadow-sm" onClick={() => setQuantity(quantity + 1)}> + </Button>
                        </div>
                      </div>

                      {/* BAGIAN VARIANT (Di Samping) */}
                      <div className="flex-grow-1">
                        <label className="fw-bold small d-block mb-2 text-muted text-uppercase">
                          Warna: <span className="text-dark">{selectedVariant?.name || "Pilih"}</span>
                        </label>
                        
                        <div className="d-flex gap-2">
                          {(Array.isArray(selectedProduct.variants) ? selectedProduct.variants : [selectedProduct.variants]).map((vId) => {
                            const colorDetail = variants.find(v => v.id === parseInt(vId));
                            if (!colorDetail) return null;

                            return (
                              <div
                                key={vId}
                                onClick={() => setSelectedVariant(colorDetail)}
                                style={{
                                  width: '35px',
                                  height: '35px',
                                  backgroundColor: colorDetail.colorCode,
                                  borderRadius: '50%',
                                  cursor: 'pointer',
                                  border: selectedVariant?.id === colorDetail.id ? '3px solid #000' : '2px solid #ddd',
                                  outline: selectedVariant?.id === colorDetail.id ? '2px solid #fff' : 'none',
                                  outlineOffset: '-5px',
                                  transition: '0.2s all'
                                }}
                                title={colorDetail.name}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>

                  <div className="mt-auto d-grid gap-2">
                    <Button 
                      variant="dark" 
                      className="w-100 py-3 fw-bold rounded-3 shadow"
                      disabled={!selectedVariant}
                    >
                      {selectedVariant ? 'TAMBAH KE KERANJANG' : 'PILIH WARNA DULU'}
                    </Button>

                    <Button variant="outline-secondary" className="w-100 py-3 fw-bold rounded-3 shadow">
                      BELI SEKARANG
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProductsPage;
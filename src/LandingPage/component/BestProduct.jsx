import React, { useState } from 'react';
import { Container, Row, Col, Card, Modal, Button, Alert } from 'react-bootstrap';
import { BoxSeam } from 'react-bootstrap-icons';

const BestProduct = () => {
  // --- STATE UNTUK MENGONTROL MODAL INTERAKTIF ---
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // --- STATE UNTUK LOADING & NOTIFIKASI BELANJA ---
  const [cartLoading, setCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState({ type: '', text: '' });

  // Dummy data produk (Menggunakan format ID UUID string agar aman)
  const products = [
    { 
      id: "6f8b1234-e89b-12d3-a456-426614174001", 
      name: "Alas Adonan", 
      title: "Alas Adonan",
      image: "images/best_alas.png", 
      description: "Material ringan dengan daya tahan ekstra untuk kebutuhan memasak kue Anda.",
      discountPercentage: 10,
      types: [
        { id: "11111111-2222-3333-4444-555555555555", type: "Ukuran S", price: 111111 },
        { id: "22222222-3333-4444-5555-666666666666", type: "Ukuran M", price: 150000 }
      ]
    },
    { 
      id: "6f8b1234-e89b-12d3-a456-426614174002", 
      name: "Alas Kasur Bambu", 
      title: "Alas Kasur Bambu",
      image: "images/best_kasur.png", 
      description: "Material ringan dengan daya tahan ekstra, sejuk digunakan untuk tidur harian.",
      discountPercentage: 15,
      types: [
        { id: "33333333-4444-5555-6666-777777777777", type: "Single Size", price: 150000 },
        { id: "44444444-5555-6666-7777-888888888888", type: "Queen Size", price: 250000 }
      ]
    },
    { 
      id: "6f8b1234-e89b-12d3-a456-426614174003", 
      name: "Mesin Jahit", 
      title: "Mesin Jahit",
      image: "images/best_mesin.png", 
      description: "Desain futuristik dengan port charging dan kayuhan mesin yang sangat halus.",
      discountPercentage: 20,
      types: [
        { id: "55555555-6666-7777-8888-999999999999", type: "Standard Port", price: 125000 },
        { id: "66666666-7777-8888-9999-000000000000", type: "Exclusive Port", price: 180000 }
      ]
    }
  ];

  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
    setShowDetail(true);
    setCartMessage({ type: '', text: '' }); // Reset alert pesan saat ganti produk
    if (product.types && product.types.length > 0) {
      setSelectedVariant(product.types[0]); // Default pilih varian pertama
    } else {
      setSelectedVariant(null);
    }
  };

  // ==========================================================
  // LOGIKA SIMPAN KERANJANG LANGSUNG KE LOCALSTORAGE
  // ==========================================================
  const handleAddToCart = () => {
    if (!selectedProduct || !selectedVariant) {
      setCartMessage({ type: 'warning', text: 'Silakan pilih varian terlebih dahulu.' });
      return;
    }

    setCartLoading(true);
    setCartMessage({ type: '', text: '' });

    try {
      // 1. Ambil data keranjang lama dari localStorage (jika sudah ada)
      const existingCartRaw = localStorage.getItem('cart_guest');
      let currentCart = existingCartRaw ? JSON.parse(existingCartRaw) : [];

      // 2. Cek apakah produk dengan VARIAN yang sama sudah ada di keranjang browser
      const existingItemIndex = currentCart.findIndex(
        (item) => item.variantId === selectedVariant.id
      );

      // Hitung harga setelah potongan diskon
      const finalPrice = Number(selectedVariant.price) * (1 - Number(selectedProduct.discountPercentage) / 100);

      if (existingItemIndex > -1) {
        // Jika varian tipe tersebut sudah ada, naikkan kuantitasnya (+1)
        currentCart[existingItemIndex].quantity += 1;
      } else {
        // Jika belum ada, buat objek data belanja baru
        currentCart.push({
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          variantId: selectedVariant.id,
          variantType: selectedVariant.type,
          image: selectedProduct.image,
          priceBeforeDiscount: Number(selectedVariant.price),
          discountPercentage: selectedProduct.discountPercentage,
          price: finalPrice,
          quantity: 1
        });
      }

      // 3. Simpan kembali array data terbaru ke localStorage browser dengan key 'cart_guest'
      localStorage.setItem('cart_guest', JSON.stringify(currentCart));

      // Menampilkan log sukses di console F12 browser untuk pembuktian data
      console.log("DATA KERANJANG TERBARU DI LOCALSTORAGE:", currentCart);

      // Tampilkan notifikasi sukses di dalam layar modal dialog
      setCartMessage({ 
        type: 'success', 
        text: `Berhasil! ${selectedProduct.name} (${selectedVariant.type}) dimasukkan ke keranjang.` 
      });

      // Tutup otomatis modal dalam 1.2 detik
      setTimeout(() => {
        setShowDetail(false);
      }, 1200);

    } catch (err) {
      setCartMessage({ type: 'danger', text: 'Gagal memproses data keranjang lokal.' });
    } finally {
      setCartLoading(false);
    }
  };

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
            transform: translateY(-10px);
            box-shadow: 0px 10px 25px rgba(0,0,0,0.1) !important;
          }

          .img-container {
            overflow: hidden;
            border-radius: 10px;
          }

          .product-img {
            transition: transform 0.5s ease;
          }

          .custom-card:hover .product-img {
            transform: scale(1.1);
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
              md={4}
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
                      className="product-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div className="mt-auto mb-3">
                    <span className="text-muted text-decoration-line-through small me-2">Rp 150.000</span>
                    <span className="fw-bold text-dark">Rp 100.000</span>
                  </div>

                  <button 
                    onClick={() => handleOpenDetail(product)}
                    className="btn btn-outline-dark w-100 rounded-pill btn-sm fw-bold"
                  >
                    Detail
                  </button>

                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* --- MODAL DETAIL PRODUK INTERAKTIF --- */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
        <Modal.Body className="p-0 position-relative">
          <Button 
            variant="light" 
            onClick={() => setShowDetail(false)} 
            className="position-absolute end-0 top-0 m-3 z-3 rounded-circle d-flex align-items-center justify-content-center" 
            style={{ width: '35px', height: '35px', border: '1px solid #ddd' }}
          >
            ✕
          </Button>
          {selectedProduct && (
            <Row className="g-0">
              <Col md={6} className="bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '350px' }}>
                {selectedProduct.image ? (
                  <img 
                    src={selectedProduct.image} 
                    className="w-100 h-100" 
                    style={{ aspectRatio: '1/1', objectFit: 'contain', padding: '20px' }} 
                    alt="detail" 
                  />
                ) : (
                  <div className="text-secondary py-5"><BoxSeam size={80} /></div>
                )}
              </Col>
              <Col md={6} className="p-4 d-flex flex-column justify-content-between">
                <div>
                  <h4 className="fw-bold text-dark mb-1 text-uppercase">{selectedProduct.name}</h4>
                  <p className="text-muted small mb-3" style={{ lineHeight: '1.5' }}>{selectedProduct.description || "Tidak ada deskripsi produk."}</p>
                  
                  {/* ALERT NOTIFIKASI BELANJA */}
                  {cartMessage.text && (
                    <Alert variant={cartMessage.type} className="py-2 small text-center mb-3">
                      {cartMessage.text}
                    </Alert>
                  )}

                  {/* BOX DINAMIS PERHITUNGAN HARGA POTONG DISKON */}
                  <div className="bg-light p-3 rounded-3 mb-4 border">
                    {selectedVariant ? (
                      <>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="text-muted text-decoration-line-through" style={{ fontSize: '1rem' }}>
                            Rp {Number(selectedVariant.price).toLocaleString("id-ID")}
                          </span>
                          <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.75rem' }}>
                            -{Number(selectedProduct.discountPercentage)}%
                          </span>
                        </div>
                        <h2 className="text-danger fw-extrabold m-0" style={{ fontWeight: '800' }}>
                          Rp {(Number(selectedVariant.price) * (1 - Number(selectedProduct.discountPercentage) / 100)).toLocaleString("id-ID")}
                        </h2>
                      </>
                    ) : (
                      <h3 className="text-muted m-0" style={{ fontSize: '1.1rem' }}>Pilih variasi produk di bawah</h3>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <span className="small d-block fw-bold text-secondary text-uppercase mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Pilihan Varian / Tipe:</span>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedProduct.types?.map((t, idx) => {
                        const isSelected = selectedVariant && selectedVariant.id === t.id;
                        return (
                          <button 
                            key={idx} 
                            type="button"
                            onClick={() => setSelectedVariant(t)}
                            className={`btn text-start p-2 px-3 border rounded-3 ${
                              isSelected 
                                ? 'border-primary bg-primary-subtle' 
                                : 'border-secondary-subtle bg-white text-dark'
                            }`}
                            style={{ 
                              minWidth: '130px', 
                              boxShadow: isSelected ? '0 0 0 2px rgba(13, 110, 253, 0.25)' : 'none',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div className={`fw-semibold ${isSelected ? 'text-primary' : 'text-secondary'}`} style={{ fontSize: '11px' }}>{t.type}</div>
                            <div className="fw-bold" style={{ fontSize: '13px', color: isSelected ? '#0d6efd' : '#198754' }}>
                              Rp {Number(t.price).toLocaleString("id-ID")}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* AREA UTAMA PANEL TOMBOL AKSI */}
                <div className="d-grid gap-2 mt-4">
                  <Button 
                    variant="outline-dark" 
                    size="lg" 
                    className="fw-bold py-2.5" 
                    style={{ borderRadius: '10px', fontSize: '0.95rem' }} 
                    onClick={handleAddToCart}
                    disabled={cartLoading} 
                  >
                    {cartLoading ? 'ADDING...' : 'ADD TO CART'}
                  </Button>
                  <Button variant="dark" size="lg" className="fw-bold py-2.5" style={{ borderRadius: '10px', fontSize: '0.95rem' }}>
                    BELI SEKARANG
                  </Button>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </section>
  );
};

export default BestProduct;
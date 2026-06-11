import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Breadcrumb, Offcanvas, Modal, Spinner, Form } from 'react-bootstrap';
import { Funnel, BoxSeam, CartPlusFill, Whatsapp, CreditCard } from 'react-bootstrap-icons';

const ProductsPage = () => {
  const API_URL = 'http://103.30.194.75:3005';
  const WHATSAPP_NUMBER = '6285624432695';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState("Semua"); 
  const [filterLabel, setFilterLabel] = useState("Semua"); 
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null); 
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [buyCustomerName, setBuyCustomerName] = useState("");
  const [buyCustomerPhone, setBuyCustomerPhone] = useState("");
  const [buyCustomerEmail, setBuyCustomerEmail] = useState(""); 
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [buyAddress, setBuyAddress] = useState("");
  const [buyPaymentMethod, setBuyPaymentMethod] = useState("Transfer Bank");
  const [buyShippingDuration, setBuyShippingDuration] = useState("Reguler (2-3 Hari)");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const handleClose = () => setShowFilter(false);
  const handleShowFil = () => setShowFilter(true);

  const getCleanToken = () => {
    const token = localStorage.getItem('token');
    return token ? token.replace(/\s/g, '').replace(/['"]+/g, '') : '';
  };

  const parseProductImages = (imageField) => {
    if (!imageField) return [];
    let target = imageField.trim();
    if (target.startsWith('"') && target.endsWith('"') && !target.startsWith('["')) {
      target = target.substring(1, target.length - 1);
    }
    try {
      if (target.startsWith("[")) return JSON.parse(target);
      return [target];
    } catch (e) {
      return [target];
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resProducts, resCategories] = await Promise.all([
        fetch(`${API_URL}/api/products?page=1&limit=100`),
        fetch(`${API_URL}/api/categories?page=1&limit=100`)
      ]);
      if (!resProducts.ok) throw new Error('Gagal mengambil data produk');
      if (!resCategories.ok) throw new Error('Gagal mengambil data kategori');

      const dataProducts = await resProducts.json();
      const dataCategories = await resCategories.json();

      setProducts(dataProducts.data || []);
      setCategories(dataCategories.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = filter === "Semua" 
    ? products 
    : products.filter(p => p.categoryId === filter);

  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
    if (product.types && product.types.length > 0) {
      setSelectedVariant(product.types[0]);
    } else {
      setSelectedVariant(null);
    }
    setShowDetail(true);
  };

 const handleAddToCart = async () => {
    if (!selectedProduct || !selectedVariant) {
      alert("Silakan pilih varian produk terlebih dahulu.");
      return;
    }

    const token = getCleanToken();
    if (!token) {
      alert("Silakan login akun terlebih dahulu untuk menggunakan fitur keranjang!");
      return;
    }

    setIsAddingToCart(true);

    try {
      const payload = {
        productId: selectedProduct.id,
        quantity: 1,
        // Jika backend Anda membutuhkan tipe varian, tambahkan baris di bawah ini:
        // productTypeId: selectedVariant.id 
      };

      console.log("Mengirim payload ke API:", payload); // DEBUG: Cek di F12 Console

      const response = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      // Ambil respon dalam bentuk teks dulu untuk antisipasi jika server tidak mengembalikan JSON
      const textResult = await response.text();
      let result;
      try {
        result = JSON.parse(textResult);
      } catch (e) {
        result = { message: textResult };
      }

      if (!response.ok) {
        throw new Error(result.message || result.error || "Gagal memasukkan produk ke dalam database keranjang.");
      }

      // Jika sukses, beri tahu komponen lain untuk update
      window.dispatchEvent(new Event("cartUpdated"));
      
      alert(`Sukses menambahkan "${selectedProduct.name}" ke keranjang!`);
      setShowDetail(false);

    } catch (err) {
      console.error("Detail Error API:", err); // DEBUG: Lihat di F12 Console
      alert(`Gagal sinkronisasi Cart: ${err.message}`);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleOpenBuyNowModal = () => {
    if (!selectedProduct || !selectedVariant) {
      alert("Silakan pilih varian produk terlebih dahulu.");
      return;
    }
    setBuyCustomerName("");
    setBuyCustomerPhone("");
    setBuyCustomerEmail("");
    setBuyQuantity(1);
    setBuyAddress("");
    setBuyPaymentMethod("Transfer Bank");
    setBuyShippingDuration("Reguler (2-3 Hari)");
    setShowBuyNowModal(true);
  };

  const handleCheckoutAndWhatsApp = async (e) => {
    e.preventDefault();
    
    if (!buyCustomerName.trim()) return alert("Nama lengkap wajib diisi!");
    if (!buyCustomerPhone.trim()) return alert("Nomor telepon wajib diisi!");
    if (!buyCustomerEmail.trim()) return alert("Email wajib diisi!");
    if (!buyAddress.trim()) return alert("Alamat pengiriman wajib diisi!");

    const token = getCleanToken();
    if (!token) {
      alert("Silakan login akun terlebih dahulu untuk melakukan transaksi pembelian!");
      return;
    }

    const originalPrice = Number(selectedVariant.price) || 0;
    const discountPercent = Number(selectedProduct.discountPercentage) || 0;
    const priceAfterDiscount = originalPrice * (1 - discountPercent / 100);
    const totalPayment = priceAfterDiscount * buyQuantity;

    setIsSubmittingOrder(true);
    let generatedOrderId = "";

    const itemPayload = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productType: selectedVariant.type,
      price: priceAfterDiscount,
      quantity: buyQuantity
    };

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          customerName: buyCustomerName.trim(),
          customerEmail: buyCustomerEmail.trim(),
          customerPhone: buyCustomerPhone.trim(),
          address: buyAddress.trim(),
          totalAmount: totalPayment,
          status: "PENDING_PAYMENT", 
          items: [itemPayload],        
          orderItems: [itemPayload]  
        })
      });

      const resultData = await response.json();

      if (!response.ok) {
        throw new Error(resultData.message || "Gagal mendaftarkan transaksi ke database server.");
      }

      if (resultData && resultData.data && resultData.data.id) {
        generatedOrderId = String(resultData.data.id);
      } else if (resultData && resultData.id) {
        generatedOrderId = String(resultData.id);
      }

    } catch (dbErr) {
      console.error("Gagal menanam transaksi ke database:", dbErr);
    } finally {
      setIsSubmittingOrder(false);
    }

    const messageText = 
`*ORDER INSTAN DAKENSHOP*
${generatedOrderId ? `• No. Invoice    : INV-${generatedOrderId.substring(0, 8).toUpperCase()}\n` : ""}--------------------------------------------
*Data Pelanggan:*
• Nama Customer : ${buyCustomerName.trim()}
• No. Telepon   : ${buyCustomerPhone.trim()}
• Email         : ${buyCustomerEmail.trim()}

*Data Produk:*
• ID Produk     : ${selectedProduct.id}
• Nama Produk   : ${selectedProduct.name}
• Varian Tipe   : ${selectedVariant.type}
• Harga Satuan  : Rp ${priceAfterDiscount.toLocaleString("id-ID")}

*Rincian Pembelian:*
• Jumlah (Qty)  : ${buyQuantity}x
• Pengiriman    : ${buyShippingDuration}
• Metode Bayar  : ${buyPaymentMethod}
• Total Bayar   : *Rp ${totalPayment.toLocaleString("id-ID")}*

*Alamat Tujuan Pengiriman:*
${buyAddress.trim()}
--------------------------------------------
_Sistem otomatis: Data pesanan ini telah disinkronkan ke database transaksi DakenShop._`;

    const encodedMessage = encodeURIComponent(messageText);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    window.open(waUrl, '_blank');
    
    setShowBuyNowModal(false);
    setShowDetail(false);
  };

  const FilterContent = () => (
    <div className="filter-sidebar-content text-start">
      <div className="mb-4">
        <span className="filter-label fw-bold d-block mb-3 border-bottom pb-2 text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>Kategori</span>
        <Nav className="flex-column">
          <Nav.Link 
            className={`filter-link ps-0 ${filter === "Semua" ? 'fw-bold text-danger' : 'text-dark'}`}
            style={{ fontSize: '0.95rem', cursor: 'pointer' }}
            onClick={() => {
              setFilter("Semua");
              setFilterLabel("Semua");
              handleClose();
            }}
          >
            Semua
          </Nav.Link>
          {categories.map((cat) => (
            <Nav.Link 
              key={cat.id} 
              className={`filter-link ps-0 ${filter === cat.id ? 'fw-bold text-danger' : 'text-dark'}`}
              style={{ fontSize: '0.95rem', cursor: 'pointer' }}
              onClick={() => {
                setFilter(cat.id);        
                setFilterLabel(cat.label); 
                handleClose();
              }}
            >
              {cat.label}
            </Nav.Link>
          ))}
        </Nav>
      </div>
    </div>
  );

  return (
    <div className="products-page min-vh-100 d-flex flex-column" style={{ paddingTop: '100px', backgroundColor: '#f8f9fa' }}>
      <Container className="flex-grow-1">
        
        <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-3 shadow-sm">
          <Breadcrumb className="mb-0">
            <Breadcrumb.Item href="/">Beranda</Breadcrumb.Item>
            <Breadcrumb.Item active>All Produk</Breadcrumb.Item>
          </Breadcrumb>
          <Button variant="outline-dark" className="d-lg-none d-flex align-items-center gap-2" onClick={handleShowFil}>
            <Funnel /> Filter
          </Button>
        </div>

        <Row className="g-4">
          <Col lg={3} className="d-none d-lg-block">
            <div className="bg-white p-4 rounded-3 shadow-sm sticky-top" style={{ top: '120px' }}>
              <FilterContent />
            </div>
          </Col>

          <Col lg={9} xs={12}>
            {error ? (
              <div className="alert alert-danger p-4 text-center rounded-3">
                <h5>Oops! Terjadi Kesalahan</h5>
                <p>{error}</p>
                <Button variant="danger" onClick={fetchData}>Coba Lagi</Button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h4 className="fw-bold mb-1">Kategori: {filterLabel}</h4>
                  <p className="text-muted">{filteredProducts.length} Produk ditemukan</p>
                </div>

                {filteredProducts.length > 0 ? (
                  <Row className="g-3">
                    {filteredProducts.map((product) => {
                      const basePrice = product.types && product.types.length > 0 ? Number(product.types[0].price) : 0;
                      const discountPercent = Number(product.discountPercentage) || 0;
                      const finalCatalogPrice = basePrice * (1 - discountPercent / 100);
                      const imageList = parseProductImages(product.imgUrl);
                      const displayThumbnail = imageList[0] || "";

                      return (
                        <Col key={product.id} lg={4} md={6} xs={6} className="mb-4">
                          <Card className="product-card shadow-sm h-100 border-0 overflow-hidden" onClick={() => handleOpenDetail(product)} style={{ cursor: 'pointer', transition: '0.3s' }}>
                            <div className="product-img-container position-relative">
                              {discountPercent > 0 && (
                                <span className="position-absolute badge bg-danger m-2 top-0 start-0 z-2 rounded-pill">
                                  -{discountPercent}%
                                </span>
                              )}
                              {displayThumbnail ? (
                                <img src={`${API_URL}${displayThumbnail}`} className="d-block w-100" style={{ aspectRatio: '1/1', objectFit: 'cover' }} alt={product.name} />
                              ) : (
                                <div className="d-flex align-items-center justify-content-center bg-light text-secondary" style={{ aspectRatio: '1/1' }}>
                                  <BoxSeam size={40} />
                                </div>
                              )}
                            </div>
                            <Card.Body className="p-3 text-center d-flex flex-column">
                              <Card.Title className="mb-1 text-uppercase fw-bold" style={{ fontSize: '0.85rem' }}>{product.name}</Card.Title>
                              <div className="mb-2 d-flex flex-column align-items-center">
                                {discountPercent > 0 && (
                                  <span className="text-muted text-decoration-line-through small">
                                    Rp {basePrice.toLocaleString("id-ID")}
                                  </span>
                                )}
                                <span className="fw-bold text-primary">
                                  Rp {finalCatalogPrice.toLocaleString("id-ID")}
                                </span>
                              </div>
                              <Button variant="dark" className="mt-auto btn-sm fw-bold rounded-pill">Detail Produk</Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                ) : (
                  <div className="text-center py-5 bg-white rounded-3 shadow-sm mt-2">
                    <BoxSeam size={60} className="text-muted mb-3" />
                    <h5 className="fw-bold">Produk Belum Tersedia</h5>
                    <p className="text-muted">Maaf, saat ini belum ada produk untuk kategori <strong>{filterLabel}</strong>.</p>
                    <Button variant="outline-primary" onClick={() => { setFilter("Semua"); setFilterLabel("Semua"); }}>Lihat Semua Produk</Button>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>

      <Offcanvas show={showFilter} onHide={handleClose} placement="start">
        <Offcanvas.Header closeButton><Offcanvas.Title className="fw-bold">FILTER</Offcanvas.Title></Offcanvas.Header>
        <Offcanvas.Body><FilterContent /></Offcanvas.Body>
      </Offcanvas>

      <Modal show={showDetail} onHide={() => !isAddingToCart && setShowDetail(false)} size="lg" centered>
        <Modal.Body className="p-0 position-relative">
          <Button variant="light" disabled={isAddingToCart} onClick={() => setShowDetail(false)} className="position-absolute end-0 top-0 m-3 z-3 rounded-circle" style={{ width: '35px', height: '35px', border: '1px solid #ddd' }}>✕</Button>
          {selectedProduct && (
            <Row className="g-0">
              <Col md={6} className="bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '350px' }}>
                {(() => {
                  const modalImages = parseProductImages(selectedProduct.imgUrl);
                  return modalImages[0] ? (
                    <img src={`${API_URL}${modalImages[0]}`} className="w-100 h-100" style={{ aspectRatio: '1/1', objectFit: 'contain', padding: '20px' }} alt="detail" />
                  ) : (
                    <div className="text-secondary py-5"><BoxSeam size={80} /></div>
                  );
                })()}
              </Col>
              <Col md={6} className="p-4 d-flex flex-column justify-content-between">
                <div>
                  <h4 className="fw-bold text-dark mb-1 text-uppercase">{selectedProduct.name}</h4>
                  <p className="text-muted small mb-3" style={{ lineHeight: '1.5' }}>{selectedProduct.description || "Tidak ada deskripsi produk."}</p>
                  
                  <div className="bg-light p-3 rounded-3 mb-4 border">
                    {selectedVariant ? (
                      <>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          {Number(selectedProduct.discountPercentage) > 0 && (
                            <span className="text-muted text-decoration-line-through" style={{ fontSize: '1rem' }}>
                              Rp {Number(selectedVariant.price).toLocaleString("id-ID")}
                            </span>
                          )}
                          {Number(selectedProduct.discountPercentage) > 0 && (
                            <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.75rem' }}>
                              -{Number(selectedProduct.discountPercentage)}%
                            </span>
                          )}
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
                              isSelected ? 'border-primary bg-primary-subtle' : 'border-secondary-subtle bg-white text-dark'
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

                <div className="d-grid gap-2 mt-4">
                  <Button variant="outline-dark" size="lg" className="fw-bold py-2.5 d-flex align-items-center justify-content-center gap-2" style={{ borderRadius: '10px', fontSize: '0.95rem' }} onClick={handleAddToCart} disabled={isAddingToCart}>
                    {isAddingToCart ? <Spinner animation="border" size="sm" /> : <><CartPlusFill size={18} /> ADD TO CART</>}
                  </Button>
                  <Button variant="danger" size="lg" className="fw-bold py-2.5" style={{ borderRadius: '10px', fontSize: '0.95rem' }} onClick={handleOpenBuyNowModal} disabled={isAddingToCart}>
                    BELI SEKARANG
                  </Button>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showBuyNowModal} onHide={() => !isSubmittingOrder && setShowBuyNowModal(false)} size="md" centered backdrop="static">
        <Modal.Header closeButton={!isSubmittingOrder} className="bg-light">
          <Modal.Title className="fw-bold h5 text-dark d-flex align-items-center gap-2">
            <CreditCard className="text-danger" /> Formulir Rincian Pembelian
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCheckoutAndWhatsApp}>
          <Modal.Body className="p-4" style={{ maxHeight: "calc(100vh - 210px)", overflowY: "auto" }}>
            {selectedProduct && selectedVariant && (
              <>
                <div className="bg-light p-3 rounded-3 border mb-3 small shadow-sm">
                  <div className="text-secondary font-monospace" style={{ fontSize: '11px' }}>PRODUCT ID: {selectedProduct.id}</div>
                  <div className="fw-bold text-dark text-uppercase mt-1" style={{ fontSize: '14px' }}>{selectedProduct.name} ({selectedVariant.type})</div>
                  <div className="fw-bold text-primary h6 m-0 mt-1">
                    Harga Satuan: Rp {(Number(selectedVariant.price) * (1 - Number(selectedProduct.discountPercentage) / 100)).toLocaleString("id-ID")}
                  </div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">Nama Lengkap Customer</Form.Label>
                  <Form.Control type="text" required value={buyCustomerName} onChange={(e) => setBuyCustomerName(e.target.value)} placeholder="Masukkan nama penerima..." />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">Alamat Email Customer</Form.Label>
                  <Form.Control type="email" required value={buyCustomerEmail} onChange={(e) => setBuyCustomerEmail(e.target.value)} placeholder="Contoh: pembeli@email.com" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">Nomor Telepon aktif</Form.Label>
                  <Form.Control type="tel" required value={buyCustomerPhone} onChange={(e) => setBuyCustomerPhone(e.target.value)} placeholder="Contoh: 08123456789" />
                </Form.Group>

                <Row>
                  <Col md={6} xs={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-secondary">Jumlah (Quantity)</Form.Label>
                      <Form.Control type="number" min={1} required value={buyQuantity} onChange={(e) => setBuyQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
                    </Form.Group>
                  </Col>
                  <Col md={6} xs={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-secondary">Durasi Pengiriman</Form.Label>
                      <Form.Select value={buyShippingDuration} onChange={(e) => setBuyShippingDuration(e.target.value)}>
                        <option value="Reguler (2-3 Hari)">Reguler (2-3 Hari Kerja)</option>
                        <option value="Ekspres (1 Hari)">Ekspres / Same-Day (1 Hari)</option>
                        <option value="Kargo (5-7 Hari)">Kargo / Ekonomi (5-7 Hari)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">Alamat Tujuan Pengiriman Lengkap</Form.Label>
                  <Form.Control as="textarea" rows={3} required value={buyAddress} onChange={(e) => setBuyAddress(e.target.value)} placeholder="Tulis alamat rumah lengkap..." />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="small fw-bold text-secondary">Metode Pembayaran</Form.Label>
                  <Form.Select value={buyPaymentMethod} onChange={(e) => setBuyPaymentMethod(e.target.value)}>
                    <option value="Transfer Bank">Transfer Bank Manual (BCA/Mandiri)</option>
                    <option value="E-Wallet">E-Wallet (Gopay/OVO/Dana)</option>
                    <option value="COD">COD (Bayar di Tempat)</option>
                  </Form.Select>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="secondary" onClick={() => setShowBuyNowModal(false)} disabled={isSubmittingOrder}>Batal</Button>
            <Button type="submit" variant="success" className="fw-bold px-4 d-flex align-items-center gap-2" disabled={isSubmittingOrder}>
              {isSubmittingOrder ? (
                <>
                  <Spinner animation="border" size="sm" /> Memproses Invoice...
                </>
              ) : (
                <>
                  <Whatsapp /> Simpan & Kirim ke WA
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
};

export default ProductsPage;
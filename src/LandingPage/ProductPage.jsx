import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Breadcrumb, Offcanvas, Carousel, Modal, Spinner } from 'react-bootstrap';
import { Funnel, BoxSeam } from 'react-bootstrap-icons';

const ProductsPage = () => {
  const API_URL = 'http://210.79.190.222:3005';

  // --- STATE UTAMA ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Menampung kategori dari database
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- STATE UI ---
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState("Semua"); // ID Kategori terpilih atau string "Semua"
  const [filterLabel, setFilterLabel] = useState("Semua"); // Nama teks kategori terpilih
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null); // Menyimpan objek varian yang aktif di-klik

  const handleClose = () => setShowFilter(false);
  const handleShowFil = () => setShowFilter(true);

  // --- FETCH DATA DARI API ---
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Ambil data produk dan kategori secara bersamaan
      const [resProducts, resCategories] = await Promise.all([
        fetch(`${API_URL}/api/products?page=1&limit=100`),
        fetch(`${API_URL}/api/categories?page=1&limit=100`)
      ]);

      if (!resProducts.ok) throw new Error('Gagal mengambil data produk');
      if (!resCategories.ok) throw new Error('Gagal mengambil data kategori');

      const dataProducts = await resProducts.json();
      const dataCategories = await resCategories.json();

      // Ambil array dari property .data bawaan API pagination kamu
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

  // --- LOGIKA FILTER BERDASARKAN CATEGORY_ID ---
  const filteredProducts = filter === "Semua" 
    ? products 
    : products.filter(p => p.categoryId === filter);

  // --- LOGIKA DETAIL MODAL & ADD TO CART ---
  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
    // Otomatis arahkan ke varian pertama produk sebagai pilihan default awal
    if (product.types && product.types.length > 0) {
      setSelectedVariant(product.types[0]);
    } else {
      setSelectedVariant(null);
    }
    setShowDetail(true);
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !selectedVariant) {
      alert("Silakan pilih varian produk terlebih dahulu.");
      return;
    }

    // 1. Dapatkan ID User login unik dari localStorage untuk memisahkan data keranjang
    let userId = "guest";
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        userId = parsedUser.id || parsedUser.uuid || "guest";
      }
    } catch (e) {
      console.error("Gagal membaca session data user:", e);
    }

    const cartKey = `cart_${userId}`;

    // 2. Hitung harga final setelah dipotong diskon database
    const originalPrice = Number(selectedVariant.price) || 0;
    const discountPercent = Number(selectedProduct.discountPercentage) || 0;
    const priceAfterDiscount = originalPrice * (1 - discountPercent / 100);

    // 3. Buat rancangan objek item keranjang
    const cartItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      imgUrl: selectedProduct.imgUrl,
      variantId: selectedVariant.id,
      variantType: selectedVariant.type,
      originalPrice: originalPrice,
      discountPercentage: discountPercent,
      priceAfterDiscount: priceAfterDiscount,
      quantity: 1
    };

    // 4. Ambil database keranjang lama di localStorage berdasarkan user key
    let currentCart = [];
    try {
      const existingCart = localStorage.getItem(cartKey);
      if (existingCart) currentCart = JSON.parse(existingCart);
    } catch (e) {
      currentCart = [];
    }

    // Cek duplikasi: Apakah produk + varian tipe yang sama sudah ada di keranjang?
    const existingItemIndex = currentCart.findIndex(
      (item) => item.productId === cartItem.productId && item.variantId === cartItem.variantId
    );

    if (existingItemIndex > -1) {
      // Jika kembar, cukup naikkan kuantitas pemesanan barangnya saja
      currentCart[existingItemIndex].quantity += 1;
    } else {
      // Jika kombinasi item baru, masukkan data baru ke dalam array list
      currentCart.push(cartItem);
    }

    // 5. Simpan kembali array data baru ke localStorage
    localStorage.setItem(cartKey, JSON.stringify(currentCart));
    alert(`Berhasil menambahkan "${selectedProduct.name} (${selectedVariant.type})" ke dalam keranjang belanja!`);
  };

  // --- SIDEBAR FILTER DINAMIS ---
  const FilterContent = () => (
    <div className="filter-sidebar-content text-start">
      <div className="mb-4">
        <span className="filter-label fw-bold d-block mb-3 border-bottom pb-2 text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>Kategori</span>
        <Nav className="flex-column">
          {/* Tombol Reset Semua */}
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

          {/* List Kategori dari DB */}
          {categories.map((cat) => (
            <Nav.Link 
              key={cat.id} 
              className={`filter-link ps-0 ${filter === cat.id ? 'fw-bold text-danger' : 'text-dark'}`}
              style={{ fontSize: '0.95rem', cursor: 'pointer' }}
              onClick={() => {
                setFilter(cat.id);        // Filter menggunakan categoryId (string UUID)
                setFilterLabel(cat.label); // Tampilkan nama asli kategori di judul halaman
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

  if (loading) {
    return (
      <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="grow" variant="primary" />
        <span className="mt-3 fw-bold text-muted">Menghubungkan ke DakenShop...</span>
      </Container>
    );
  }

  return (
    <div className="products-page min-vh-100 d-flex flex-column" style={{ paddingTop: '100px', backgroundColor: '#f8f9fa' }}>
      <Container className="flex-grow-1">
        
        {/* Top Navbar Info */}
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
          {/* Sidebar Filter Kategori (Desktop) */}
          <Col lg={3} className="d-none d-lg-block">
            <div className="bg-white p-4 rounded-3 shadow-sm sticky-top" style={{ top: '120px' }}>
              <FilterContent />
            </div>
          </Col>

          {/* Grid Konten Produk */}
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
                      // Ambil harga dasar awal produk dari varian pertama untuk katalog utama depan
                      const basePrice = product.types && product.types.length > 0 ? Number(product.types[0].price) : 0;
                      const discountPercent = Number(product.discountPercentage) || 0;
                      const finalCatalogPrice = basePrice * (1 - discountPercent / 100);

                      return (
                        <Col key={product.id} lg={4} md={6} xs={6} className="mb-4">
                          <Card className="product-card shadow-sm h-100 border-0 overflow-hidden" onClick={() => handleOpenDetail(product)} style={{ cursor: 'pointer', transition: '0.3s' }}>
                            <div className="product-img-container position-relative">
                              {discountPercent > 0 && (
                                <span className="position-absolute badge bg-danger m-2 top-0 start-0 z-2 rounded-pill">
                                  -{discountPercent}%
                                </span>
                              )}
                              {product.imgUrl ? (
                                <img src={`${API_URL}${product.imgUrl}`} className="d-block w-100" style={{ aspectRatio: '1/1', objectFit: 'cover' }} alt={product.name} />
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

      {/* --- OFFCANVAS FILTER (MOBILE) --- */}
      <Offcanvas show={showFilter} onHide={handleClose} placement="start">
        <Offcanvas.Header closeButton><Offcanvas.Title className="fw-bold">FILTER</Offcanvas.Title></Offcanvas.Header>
        <Offcanvas.Body><FilterContent /></Offcanvas.Body>
      </Offcanvas>

      {/* --- MODAL DETAIL PRODUK INTERAKTIF --- */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
        <Modal.Body className="p-0">
          <Button variant="light" onClick={() => setShowDetail(false)} className="position-absolute end-0 top-0 m-3 z-3 rounded-circle" style={{ width: '35px', height: '35px', border: '1px solid #ddd' }}>✕</Button>
          {selectedProduct && (
            <Row className="g-0">
              <Col md={6} className="bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '350px' }}>
                {selectedProduct.imgUrl ? (
                  <img src={`${API_URL}${selectedProduct.imgUrl}`} className="w-100 h-100" style={{ aspectRatio: '1/1', objectFit: 'contain', padding: '20px' }} alt="detail" />
                ) : (
                  <div className="text-secondary py-5"><BoxSeam size={80} /></div>
                )}
              </Col>
              <Col md={6} className="p-4 d-flex flex-column justify-content-between">
                <div>
                  <h4 className="fw-bold text-dark mb-1 text-uppercase">{selectedProduct.name}</h4>
                  <p className="text-muted small mb-3" style={{ lineHeight: '1.5' }}>{selectedProduct.description || "Tidak ada deskripsi produk."}</p>
                  
                  {/* BOX DINAMIS PERHITUNGAN HARGA POTONG DISKON */}
                  <div className="bg-light p-3 rounded-3 mb-4 border">
                    {selectedVariant ? (
                      <>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          {/* Harga Varian Asli Dicoret */}
                          <span className="text-muted text-decoration-line-through" style={{ fontSize: '1rem' }}>
                            Rp {Number(selectedVariant.price).toLocaleString("id-ID")}
                          </span>
                          {/* Persentase Diskon Statis/Dinamis dari DB */}
                          <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.75rem' }}>
                            -{Number(selectedProduct.discountPercentage)}%
                          </span>
                        </div>
                        {/* Hasil Harga Potong Diskon Akhir */}
                        <h2 className="text-danger fw-extrabold m-0" style={{ fontWeight: '800' }}>
                          Rp {(Number(selectedVariant.price) * (1 - Number(selectedProduct.discountPercentage) / 100)).toLocaleString("id-ID")}
                        </h2>
                      </>
                    ) : (
                      <h3 className="text-muted m-0" style={{ fontSize: '1.1rem' }}>Pilih variasi produk di bawah</h3>
                    )}
                  </div>
                  
                  {/* SELEKTOR OPSI PILIHAN VARIANT/TIPE */}
                  <div className="mb-4">
                    <span className="small d-block fw-bold text-secondary text-uppercase mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Pilihan Varian / Tipe:</span>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedProduct.types?.map((t, idx) => {
                        const isSelected = selectedVariant && selectedVariant.id === t.id;
                        return (
                          <button 
                            key={idx} 
                            type="button"
                            onClick={() => setSelectedVariant(t)} // Switch Harga Utama & Diskon Mengikuti Varian Ini
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
                  <Button variant="outline-dark" size="lg" className="fw-bold py-2.5" style={{ borderRadius: '10px', fontSize: '0.95rem' }} onClick={handleAddToCart}>
                    ADD TO CART
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
    </div>
  );
};

export default ProductsPage;
import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Image, Offcanvas, Button } from 'react-bootstrap';
import { Bag, Person, Trash3, BoxSeam, DashLg, PlusLg } from 'react-bootstrap-icons';
import { Link, useLocation } from "react-router-dom";

const CustomNavbar = () => {
  const API_URL = 'http://210.79.190.222:3005';
  const [showCart, setShowCart] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [cartItems, setCartItems] = useState([]); // Menampung item keranjang belanja
  
  const location = useLocation();
  const currentPath = location.pathname;

  const handleCloseCart = () => setShowCart(false);
  const handleShowCart = () => setShowCart(true);

  const isLoggedIn = localStorage.getItem('token');

  // --- 1. FUNGSIONAL UTAMA AMBIL DATA USER ID ---
  const getCartKey = () => {
    let userId = "guest";
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        userId = parsedUser.id || parsedUser.uuid || "guest";
      }
    } catch (e) {
      console.error(e);
    }
    return `cart_${userId}`;
  };

  // --- 2. FUNGSI MEMUAT ISI KERANJANG ---
  const loadCartData = () => {
    const cartKey = getCartKey();
    try {
      const existingCart = localStorage.getItem(cartKey);
      if (existingCart) {
        setCartItems(JSON.parse(existingCart));
      } else {
        setCartItems([]);
      }
    } catch (e) {
      setCartItems([]);
    }
  };

  useEffect(() => {
    loadCartData();

    const handleCartUpdate = () => loadCartData();
    window.addEventListener("storage", handleCartUpdate);
    window.addEventListener("cartUpdated", handleCartUpdate); 

    return () => {
      window.removeEventListener("storage", handleCartUpdate);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    if (showCart) loadCartData();
  }, [showCart]);

  // --- 3. FUNGSI UPDATE QUANTITY (TAMBAH / KURANG) ---
  const handleUpdateQuantity = (productId, variantId, amount) => {
    const cartKey = getCartKey();
    
    const updatedCart = cartItems.map((item) => {
      if (item.productId === productId && item.variantId === variantId) {
        const newQuantity = item.quantity + amount;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter((item) => item.quantity > 0); 

    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    setCartItems(updatedCart);

    window.dispatchEvent(new Event("cartUpdated"));
  };

  // --- 4. FUNGSI HAPUS ITEM BERDASARKAN COMBINASI ID PRODUK & VARIAN ---
  const handleRemoveItem = (productId, variantId) => {
    const cartKey = getCartKey();
    const updatedCart = cartItems.filter(
      (item) => !(item.productId === productId && item.variantId === variantId)
    );
    
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    setCartItems(updatedCart);

    window.dispatchEvent(new Event("cartUpdated"));
  };

  // --- 5. KALKULASI TOTAL NOTIFIKASI & ESTIMASI HARGA ---
  const totalItemsBadge = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const totalEstimasiHarga = cartItems.reduce(
    (acc, item) => acc + item.priceAfterDiscount * item.quantity, 
    0
  );

  return (
    <Navbar 
      expanded={expanded} 
      onToggle={setExpanded} 
      collapseOnSelect 
      bg="white" 
      expand="lg" 
      className="border-bottom shadow-sm" 
      fixed="top"
    >
      <Container>
        {/* LOGO */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <Image 
            src="/images/daken-shop-logo.png" 
            alt="Logo DakenShop"
            style={{ width: '45px', height: 'auto' }} 
            className="me-2"
          />
          <span className="fw-bold">Daken<span className="text-primary">Shop</span></span>
        </Navbar.Brand>

        <div className="d-flex align-items-center order-lg-last ms-auto">
          
          {isLoggedIn && (
            <div className="nav-icon-wrapper d-flex align-items-center me-2" style={{ gap: '15px' }}>
              <Nav.Link className="p-0 position-relative" onClick={handleShowCart}>
                <Bag size={22} color="black" />
                {totalItemsBadge > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                    {totalItemsBadge}
                  </span>
                )}
              </Nav.Link>

              <Nav.Link as={Link} to="/profile" className="p-0">
                <Person size={26} color={currentPath === "/profile" ? "#0d6efd" : "black"}/>
              </Nav.Link>
            </div>
          )}

          {!isLoggedIn && (
            <Button 
              as={Link} 
              to="/login" 
              variant="primary"
              className="rounded-pill px-4 fw-bold shadow-sm d-none d-lg-block ms-3"
              style={{ fontSize: '0.8rem' }}
            >
              MASUK
            </Button>
          )}

          <Navbar.Toggle aria-controls="basic-navbar-nav" className="ms-2 border-0 shadow-none" />
        </div>

        {/* MENU COLLAPSE */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto fw-bold text-center py-3 py-lg-0">
            <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)} className={currentPath === "/" ? "text-primary" : "text-black"}>
              BERANDA
            </Nav.Link>
            <Nav.Link as={Link} to="/produk" onClick={() => setExpanded(false)} className={currentPath === "/produk" ? "text-primary" : "text-black"}>
              PRODUK
            </Nav.Link>
            <Nav.Link as={Link} to="/#tentang" onClick={() => setExpanded(false)} className={currentPath === "/tentang" ? "text-primary" : "text-black"}>
              TENTANG KAMI
            </Nav.Link>
            <Nav.Link as={Link} to="#faq" onClick={() => setExpanded(false)} className={currentPath === "/faq" ? "text-primary" : "text-black"}>
              FAQ
            </Nav.Link>

            {!isLoggedIn && (
              <div className="d-lg-none mt-3 px-3">
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="primary" 
                  className="w-100 rounded-pill fw-bold py-2"
                  onClick={() => setExpanded(false)}
                >
                  MASUK
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>

      {/* OFFCANVAS KERANJANG BELANJA */}
      <Offcanvas show={showCart} onHide={handleCloseCart} placement="end">
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold">Keranjang Belanja</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column p-0">
          <div className="flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
            {cartItems.length > 0 ? (
              cartItems.map((item, idx) => (
                <div key={idx} className="d-flex align-items-start bg-white p-3 border rounded-3 mb-2 shadow-sm">
                  {/* Foto Produk */}
                  <div style={{ width: "65px", height: "65px" }} className="bg-light rounded overflow-hidden flex-shrink-0 border">
                    {item.imgUrl ? (
                      <img src={`${API_URL}${item.imgUrl}`} alt="item" className="w-100 h-100" style={{ objectFit: "cover" }} />
                    ) : (
                      <div className="d-flex h-100 align-items-center justify-content-center text-secondary"><BoxSeam size={24} /></div>
                    )}
                  </div>
                  
                  {/* Detail Info Produk */}
                  <div className="ms-3 flex-grow-1 text-start">
                    {/* Nama Produk */}
                    <div className="fw-bold text-dark text-truncate" style={{ fontSize: "14px", maxWidth: "160px" }}>
                      {item.productName}
                    </div>
                    <div className="text-muted font-monospace" style={{ fontSize: "11px" }}>Varian: {item.variantType}</div>
                    
                    {/* Tampilan Harga Asli Coret & Harga Potong Diskon */}
                    <div className="mt-1">
                      {item.discountPercentage > 0 && (
                        <div className="d-flex align-items-center gap-1">
                          <span className="text-muted text-decoration-line-through" style={{ fontSize: "11px" }}>
                            Rp {Number(item.originalPrice).toLocaleString("id-ID")}
                          </span>
                          <span className="badge bg-danger-subtle text-danger p-1 rounded" style={{ fontSize: "9px" }}>
                            -{item.discountPercentage}%
                          </span>
                        </div>
                      )}
                      <div className="fw-bold text-primary" style={{ fontSize: "14px" }}>
                        Rp {Number(item.priceAfterDiscount).toLocaleString("id-ID")}
                      </div>
                    </div>

                    {/* SELEKTOR KUANTITAS (QUANTITY) */}
                    <div className="d-flex align-items-center bg-light border rounded p-0.5 mt-2" style={{ width: 'fit-content' }}>
                      <Button 
                        variant="white" 
                        className="border-0 bg-transparent p-1 px-2 text-secondary d-flex align-items-center"
                        onClick={() => handleUpdateQuantity(item.productId, item.variantId, -1)}
                      >
                        <DashLg size={12} />
                      </Button>
                      <span className="fw-bold px-2 text-dark font-monospace" style={{ fontSize: '13px', minWidth: '25px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <Button 
                        variant="white" 
                        className="border-0 bg-transparent p-1 px-2 text-secondary d-flex align-items-center"
                        onClick={() => handleUpdateQuantity(item.productId, item.variantId, 1)}
                      >
                        <PlusLg size={12} />
                      </Button>
                    </div>
                  </div>

                  {/* TOMBOL DELETE TOTAL ITEM */}
                  <Button 
                    variant="link" 
                    className="text-danger p-1 ms-2"
                    onClick={() => handleRemoveItem(item.productId, item.variantId)}
                  >
                    <Trash3 size={15} />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-5 text-muted">
                <BoxSeam size={50} className="mb-3 text-secondary-subtle" />
                <h6 className="fw-bold m-0">Keranjang masih kosong</h6>
              </div>
            )}
          </div>
          
          {/* TAMPILAN ESTIMASI TOTAL & ACTION */}
          <div className="p-4 border-top bg-white shadow-lg">
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted fw-semibold">Total Estimasi:</span>
              <span className="h5 fw-bold text-primary mb-0">
                Rp {totalEstimasiHarga.toLocaleString("id-ID")}
              </span>
            </div>
            <Button variant="primary" disabled={cartItems.length === 0} className="w-100 py-3 rounded-pill fw-bold">PAYMENT</Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </Navbar>
  );
};

export default CustomNavbar;
import React, { useState, useEffect } from "react";
import {
  Navbar,
  Nav,
  Container,
  Image,
  Offcanvas,
  Button,
  Spinner,
} from "react-bootstrap";
import {
  Bag,
  Person,
  Trash3,
  BoxSeam,
  DashLg,
  PlusLg,
} from "react-bootstrap-icons";
import { Link, useLocation } from "react-router-dom";
import CONFIG from "../../Config.ts";

const CustomNavbar = () => {
  const [showCart, setShowCart] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false); // Indikator loading checkout

  const location = useLocation();
  const currentPath = location.pathname;

  const handleCloseCart = () => setShowCart(false);
  const handleShowCart = () => setShowCart(true);

  const isLoggedIn = localStorage.getItem("token");

  const getCleanToken = () => {
    const token = localStorage.getItem("token");
    return token ? token.replace(/\s/g, "").replace(/['"]+/g, "") : "";
  };

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
    return userId === "guest" ? "cart_guest" : `cart_${userId}`;
  };

  const loadCartData = async () => {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/api/cart?`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCleanToken()}`,
        },
      });

      if (!response.ok) throw new Error("Gagal mengambil data dari server");

      const result = await response.json();

      if (result?.data?.items) {
        setCartItems(result.data.items);
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

    const token = localStorage.getItem('token');

   const handleUpdateQuantity = async (cartItemId, amount) => {
   const itemToUpdate = cartItems.find((item) => cartItems[0].cartId === cartItemId);  

    console.log("Cart Items saat ini:", cartItems[0].cartId);
    console.log("Cart Item ID yang dicari:", cartItemId);
    
    if (!itemToUpdate) {
        console.error("Item tidak ditemukan di cart. ID yang dicari:", cartItems[0].cartId);
        return;
    }

  if (!itemToUpdate) {
    console.error("Item tidak ditemukan di cart");
    return;
  }

  const newQuantity = itemToUpdate.quantity + amount;
  if (newQuantity <= 0) return;

  try {
    const response = await fetch(`${CONFIG.BASE_URL}/api/cart/item/${cartItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify({ 
        quantity: newQuantity 
      }),
    });

    if (!response.ok) throw new Error('Gagal mengupdate quantity di server');

    const updatedCart = cartItems.map((item) => {
      if (item.id === cartItemId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    setCartItems(updatedCart);
    window.dispatchEvent(new Event("cartUpdated"));
    
  } catch (error) {
    console.error("Error:", error);
  }
};

  const handleRemoveItem = (productId, variantId) => {
    const cartKey = getCartKey();
    const updatedCart = cartItems.filter(
      (item) => !(item.productId === productId && item.variantId === variantId),
    );
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    
    setCartItems(updatedCart);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // --- INTEGRASI PEMBAYARAN MIDTRANS (PURE JAVASCRIPT / JSX) ---
  const handlePaymentCheckout = async () => {
    if (!isLoggedIn) {
      alert(
        "Silakan login terlebih dahulu untuk melakukan transaksi pembayaran.",
      );
      return;
    }

    setIsProcessing(true);
    try {
      const savedUser = localStorage.getItem("user");
      const userProfile = savedUser ? JSON.parse(savedUser) : null;

      const checkoutPayload = {
        customerName: userProfile?.name || "Customer",
        customerEmail: userProfile?.email || "email@customer.com",
        customerPhone: userProfile?.phone || "08123456789",
        address: userProfile?.address || "Alamat Pengiriman Terdaftar",
        cartItems: cartItems,
      };

      const response = await fetch(`${CONFIG.BASE_URL}/api/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCleanToken()}`,
        },
        body: JSON.stringify(checkoutPayload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Gagal memproses checkout order");
      }

      const resData = await response.json();
      const snapToken = resData.data?.snapToken;

      if (!snapToken) {
        throw new Error(
          "Gagal memperoleh payment gateway token dari Midtrans.",
        );
      }

      // Membuka Pop-up Snap Midtrans langsung di Browser pembeli
      window.snap.pay(snapToken, {
        onSuccess: function (result) {
          alert("Pembayaran Berhasil! Terima kasih.");
          localStorage.removeItem(getCartKey());
          setCartItems([]);
          window.dispatchEvent(new Event("cartUpdated"));
          setShowCart(false);
        },
        onPending: function (result) {
          alert("Menunggu Pembayaran Anda, Silakan selesaikan invoice!");
          localStorage.removeItem(getCartKey());
          setCartItems([]);
          window.dispatchEvent(new Event("cartUpdated"));
          setShowCart(false);
        },
        onError: function (result) {
          alert("Pembayaran Gagal atau Terjadi kesalahan sistem!");
          console.error(result);
        },
        onClose: function () {
          alert("Anda menutup pop-up sebelum menyelesaikan transaksi.");
        },
      });
    } catch (err) {
      alert(err.message || "Terjadi kendala koneksi server");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalItemsBadge = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );
  const totalEstimasiHarga = cartItems.reduce((acc, item) => {
    const discountPercentage = item?.product?.discountPercentage || 100;
    const discountPrice =
      (Number(discountPercentage) / 100) * Number(item?.productType?.price);

    const priceProduct = Number(item?.productType?.price) - discountPrice;

    return acc + priceProduct * item.quantity;
  }, 0);

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
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <Image
            src="/images/daken-shop-logo.png"
            alt="Logo DakenShop"
            style={{ width: "45px", height: "auto" }}
            className="me-2"
          />
          <span className="fw-bold">
            Daken<span className="text-primary">Shop</span>
          </span>
        </Navbar.Brand>

        <div className="d-flex align-items-center order-lg-last ms-auto">
          <div
            className="nav-icon-wrapper d-flex align-items-center me-2"
            style={{ gap: "15px" }}
          >
            <Nav.Link
              className="p-0 position-relative"
              onClick={handleShowCart}
            >
              <Bag size={22} color="black" />
              {totalItemsBadge > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: "10px" }}
                >
                  {totalItemsBadge}
                </span>
              )}
            </Nav.Link>

            {isLoggedIn ? (
              <Nav.Link as={Link} to="/profile" className="p-0">
                <Person
                  size={26}
                  color={currentPath === "/profile" ? "#0d6efd" : "black"}
                />
              </Nav.Link>
            ) : (
              <Button
                as={Link}
                to="/login"
                variant="primary"
                className="rounded-pill px-4 fw-bold shadow-sm ms-3"
                style={{ fontSize: "0.8rem" }}
              >
                MASUK
              </Button>
            )}
          </div>
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            className="ms-2 border-0 shadow-none"
          />
        </div>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto fw-bold text-center py-3 py-lg-0">
            <Nav.Link
              as={Link}
              to="/"
              onClick={() => setExpanded(false)}
              className={currentPath === "/" ? "text-primary" : "text-black"}
            >
              BERANDA
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/produk"
              onClick={() => setExpanded(false)}
              className={
                currentPath === "/produk" ? "text-primary" : "text-black"
              }
            >
              PRODUK
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/#tentang"
              onClick={() => setExpanded(false)}
              className={
                currentPath === "/tentang" ? "text-primary" : "text-black"
              }
            >
              TENTANG KAMI
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="#faq"
              onClick={() => setExpanded(false)}
              className={currentPath === "/faq" ? "text-primary" : "text-black"}
            >
              FAQ
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>

      <Offcanvas show={showCart} onHide={handleCloseCart} placement="end">
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold">
            Keranjang Belanja
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column p-0">
          <div className="flex-grow-1 p-3" style={{ overflowY: "auto" }}>
            {cartItems.length > 0 ? (
              cartItems.map((item, idx) => {
                const parseImage = JSON.parse(item?.product?.imgUrl);
                const productImageFirst = parseImage[0];

                const discountPercentage =
                  item?.product?.discountPercentage || 100;
                const discountPrice =
                  (Number(discountPercentage) / 100) *
                  Number(item?.productType?.price);

                const priceProduct =
                  (Number(item?.productType?.price) - discountPrice) *
                  Number(item.quantity);

                return (
                  <div
                    key={idx}
                    className="d-flex align-items-start bg-white p-3 border rounded-3 mb-2 shadow-sm"
                  >
                    <div
                      style={{ width: "65px", height: "65px" }}
                      className="bg-light rounded overflow-hidden flex-shrink-0 border"
                    >
                      {productImageFirst ? (
                        <img
                          src={
                            productImageFirst.startsWith("http")
                              ? productImageFirst
                              : `${CONFIG.BASE_URL}${productImageFirst}`
                          }
                          alt="item"
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className="d-flex h-100 align-items-center justify-content-center text-secondary">
                          <BoxSeam size={24} />
                        </div>
                      )}
                    </div>

                    <div className="ms-3 flex-grow-1 text-start">
                      <div
                        className="fw-bold text-dark text-truncate"
                        style={{ fontSize: "14px", maxWidth: "160px" }}
                      >
                        {item?.product?.name || "Not found"}
                      </div>
                      <div
                        className="text-muted font-monospace"
                        style={{ fontSize: "11px" }}
                      >
                        Varian: {item?.productType?.type || "-"}
                      </div>
                      <div className="mt-1">
                        <div
                          className="fw-bold text-primary"
                          style={{ fontSize: "14px" }}
                        >
                          Rp {Number(priceProduct || 0).toLocaleString("id-ID")}
                        </div>
                      </div>

                      <div
                        className="d-flex align-items-center bg-light border rounded p-0.5 mt-2"
                        style={{ width: "fit-content" }}
                      >
                        <Button
                          variant="white"
                          className="border-0 bg-transparent p-1 px-2 text-secondary d-flex align-items-center"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.cartId,
                              item.variantId,
                              -1,
                            )
                          }
                        >
                          <DashLg size={12} />
                        </Button>
                        <span
                          className="fw-bold px-2 text-dark font-monospace"
                          style={{
                            fontSize: "13px",
                            minWidth: "25px",
                            textAlign: "center",
                          }}
                        >
                          {item.quantity}
                        </span>
                        <Button
                          variant="white"
                          className="border-0 bg-transparent p-1 px-2 text-secondary d-flex align-items-center"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.cartId,
                              item.variantId,
                              1,
                            )
                          }
                        >
                          <PlusLg size={12} />
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="link"
                      className="text-danger p-1 ms-2"
                      onClick={() =>
                        handleRemoveItem(item.productId, item.variantId)
                      }
                    >
                      <Trash3 size={15} />
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-5 text-muted">
                <BoxSeam size={50} className="mb-3 text-secondary-subtle" />
                <h6 className="fw-bold m-0">Keranjang masih kosong</h6>
              </div>
            )}
          </div>

          <div className="p-4 border-top bg-white shadow-lg">
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted fw-semibold">Total Estimasi:</span>
              <span className="h5 fw-bold text-primary mb-0">
                Rp {totalEstimasiHarga.toLocaleString("id-ID")}
              </span>
            </div>
            <Button
              variant="primary"
              disabled={cartItems.length === 0 || isProcessing}
              className="w-100 py-3 rounded-pill fw-bold"
              onClick={handlePaymentCheckout}
            >
              {isProcessing ? (
                <Spinner animation="border" size="sm" className="me-2" />
              ) : null}
              BAYAR SEKARANG
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </Navbar>
  );
};

export default CustomNavbar;

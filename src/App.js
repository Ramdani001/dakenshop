import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Import Komponen
import AdminDashboard from "./Admin/AdminDashboard.tsx";
import LandingPage from "./LandingPage/main";
import AuthPage from "./Login/AuthPage.jsx";
import ProductsPage from "./LandingPage/ProductPage.jsx";
import CustomNavbar from "./LandingPage/component/Navbar.jsx";
import ProfilePage from "./LandingPage/ProfilePage.jsx";
import Footer from "./LandingPage/component/Footer.jsx";
import ShippingPage from "./LandingPage/ShippingPage.jsx";
import ContactPage from "./LandingPage/ContactPage.jsx";
import TermsConditionsPage from "./LandingPage/TermsConditionsPage.jsx";
import { useEffect, useState } from "react";

// Komponen Pembantu untuk mengatur tampilan Navbar & Footer
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const hideLayout = location.pathname === "/dashboard" || location.pathname === "/login";

  return (
    <div className="App d-flex flex-column min-vh-100">
      {/* Navbar hanya muncul jika bukan di halaman admin/login */}
      {!hideLayout && <CustomNavbar />}

      <main className="flex-grow-1">
        {children}
      </main>

      {/* Footer hanya muncul jika bukan di halaman admin/login */}
      {!hideLayout && <Footer />}
    </div>
  );
};

function App() {
  // Inisialisasi state berdasarkan data di localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Cek apakah ada token login saat aplikasi pertama kali dimuat
    const token = localStorage.getItem("userToken");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Fungsi untuk Login
  const login = (token) => {
    localStorage.setItem("userToken", token);
    setIsLoggedIn(true);
  };

  // Fungsi untuk Logout
  const logout = () => {
    localStorage.removeItem("userToken");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage onLogin={login} />} />
          
          {/* Halaman Statis & Produk */}
          <Route path="/produk" element={<ProductsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/shipping-policy" element={<ShippingPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
          <Route path="/terms-conditions" element={<TermsConditionsPage />} />
          
          {/* Halaman Auth & Admin */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/dashboard" element={<AdminDashboard />} />

          {/* Fallback 404 */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;
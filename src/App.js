import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import AdminDashboard from "./Admin/AdminDashboard.tsx";
import "./App.css";
import LandingPage from "./LandingPage/main";
import AuthPage from "./Login/AuthPage.jsx";
import ProductsPage from "./LandingPage/ProductPage.jsx";
import CustomNavbar from "./LandingPage/component/Navbar.jsx";
import { Container } from "react-bootstrap";
import ProfilePage from "./LandingPage/ProfilePage.jsx";

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  return (
    <div className="App d-flex flex-column min-vh-100"> {/* Tambahkan class Flexbox di sini */}
        {/* NAVBAR */}
        {currentPath !== "/admin" && currentPath !== "/login" && (
          <CustomNavbar 
            navigateTo={navigateTo} 
            currentPath={currentPath} 
          />
        )}

        {/* MAIN CONTENT - Bungkus dengan tag main + flex-grow-1 */}
        <main className="flex-grow-1">
          {(() => {
            if (currentPath === "/admin") {
              return <AdminDashboard />;
            } else if (currentPath === "/login") {
              return <AuthPage />;
            } else if (currentPath === "/produk") { 
              return <ProductsPage />;
            } else if (currentPath === "/profile") {
              return <ProfilePage navigateTo={navigateTo} />;
            } else {
              return (
                <LandingPage 
                  onAdminClick={() => navigateTo("/admin")} 
                  onProductsClick={() => navigateTo("/produk")}
                  navigateTo={navigateTo}
                />
              );
            }
          })()}
        </main>

        {/* FOOTER */}
        {currentPath !== "/admin" && currentPath !== "/login" && (
          <footer className="bg-dark text-white py-4 mt-auto">
            <Container className="text-center">
              <p className="mb-0">&copy; 2026 DakenShop | Powered by Anavallo.id</p>
            </Container>
          </footer>  
        )}
      </div>
  );
}

export default App;

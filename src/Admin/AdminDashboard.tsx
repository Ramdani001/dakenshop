import React, { CSSProperties, useEffect, useState } from "react";
import { Badge, Button, Offcanvas } from "react-bootstrap";
import {
  Bell,
  Box2Fill,
  BoxArrowRight,
  Grid3x3Gap,
  LightningChargeFill,
  List,
  People,
  Search,
  Speedometer2,
  Wallet2,
} from "react-bootstrap-icons";
import CategoryManager from "./CategoryManager.tsx";
import DashboardHome from "./DashboardHome.tsx";
import UserManagement from "./UserManagement.tsx";
import ProductManager from "./ProductManager.tsx";

type MenuType = "dashboard" | "user" | "categories" | "products" | "transaction";

interface NavItemProps {
  menu: MenuType;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

const AdminDashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MenuType>("dashboard");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // FUNGSI LOGOUT (Menghapus Sesi Token & Redirect)
  const handleSignOut = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
      localStorage.removeItem("token"); // Hapus token otentikasi
      // Jika Anda menyimpan data user lain di localStorage, bersihkan di sini:
      // localStorage.removeItem("user");
      
      // Mengarahkan paksa ke halaman login root (sesuaikan path jika menggunakan routing khusus)
      window.location.href = "/login"; 
    }
  };

  const styles: { [key: string]: CSSProperties } = {
    wrapper: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#F1F5F9",
      fontFamily: "'Inter', sans-serif",
    },
    sidebarDesktop: {
      width: "280px",
      backgroundColor: "#0F172A",
      position: "fixed",
      height: "100vh",
      display: isMobile ? "none" : "flex",
      flexDirection: "column",
      padding: "32px 0",
      zIndex: 1000,
    },
    mainContent: {
      flex: 1,
      marginLeft: isMobile ? "0" : "280px",
      padding: isMobile ? "20px" : "40px",
      width: "100%",
    },
    glassCard: {
      background: "#FFFFFF",
      borderRadius: "20px",
      border: "1px solid rgba(226, 232, 240, 0.8)",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.04)",
      padding: isMobile ? "20px" : "32px",
    },
  };

  const NavItem: React.FC<NavItemProps> = ({ menu, icon: Icon, label }) => (
    <div
      onClick={() => {
        setActiveMenu(menu);
        setShowMobileSidebar(false);
      }}
      style={{
        padding: "14px 24px",
        margin: "4px 20px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        cursor: "pointer",
        transition: "0.3s",
        fontSize: "14px",
        fontWeight: activeMenu === menu ? 600 : 400,
        backgroundColor: activeMenu === menu ? "#3B82F6" : "transparent",
        color: activeMenu === menu ? "#FFFFFF" : "#94A3B8",
      }}
    >
      <Icon size={18} /> {label}
    </div>
  );

  const SidebarContent = () => (
    <>
      <div className="px-4 mb-5 d-flex align-items-center gap-3">
        <div
          style={{
            background: "#3B82F6",
            borderRadius: 10,
            display: "flex",
            padding: 8,
          }}
        >
          <LightningChargeFill color="white" size={20} />
        </div>
        <span
          style={{
            color: "white",
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: "-1px",
          }}
        >
          DAKEN SHOP
        </span>
      </div>
      
      <NavItem menu="dashboard" icon={Speedometer2} label="Dashboard" />
      <NavItem menu="user" icon={People} label="User Management" />
      <NavItem menu="categories" icon={Grid3x3Gap} label="Categories" />
      <NavItem menu="products" icon={Box2Fill} label="Products" />
      <NavItem menu="transaction" icon={Wallet2} label="Transaction" />
      
      <div className="mt-auto px-4">
        {/* PERBAIKAN: Menautkan fungsi onClick ke handleSignOut */}
        <Button
          onClick={handleSignOut}
          variant="outline-danger"
          className="w-100 border-0 d-flex align-items-center gap-2 justify-content-center py-2"
          style={{ borderRadius: "10px", fontSize: "14px", fontWeight: 600 }}
        >
          <BoxArrowRight /> Sign Out
        </Button>
      </div>
    </>
  );

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <div>
            <DashboardHome />
          </div>
        );
      case "user":
        return (
          <div>
            <UserManagement />
          </div>
        );
      case "categories":
        return <CategoryManager />;
      case "products":
        return <ProductManager /> ;
      case "transaction":
        return (
          <div>
            <h2 className="fw-bold mb-3">Transaction</h2>
            <p className="text-muted">Kelola data transaction.</p>
          </div>
        );
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Sidebar Desktop */}
      <div style={styles.sidebarDesktop}>
        <SidebarContent />
      </div>

      {/* Sidebar Mobile (Offcanvas) */}
      <Offcanvas
        show={showMobileSidebar}
        onHide={() => setShowMobileSidebar(false)}
        style={{ backgroundColor: "#0F172A", width: "280px" }}
      >
        <Offcanvas.Body
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "32px 0",
          }}
        >
          <SidebarContent />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Konten Utama */}
      <div style={styles.mainContent}>
        {/* Top Navbar */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            {/* Tombol Hamburger Menu untuk Tampilan Mobile */}
            {isMobile && (
              <Button 
                variant="white" 
                onClick={() => setShowMobileSidebar(true)}
                className="border p-2 d-flex align-items-center justify-content-center"
                style={{ borderRadius: "10px" }}
              >
                <List size={20} />
              </Button>
            )}
            {!isMobile && (
              <h4 className="fw-bold m-0 text-capitalize">
                {activeMenu === 'user' ? 'User Management' : activeMenu}
              </h4>
            )}
          </div>
        </div>

        {/* Card Konten SPA Dinamis */}
        <div style={styles.glassCard}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
import React, { CSSProperties, useEffect, useState } from "react";
import { Badge, Button, Offcanvas } from "react-bootstrap";
import {
  Bell,
  BoxArrowRight,
  Grid3x3Gap,
  LightningChargeFill,
  List,
  Search,
} from "react-bootstrap-icons";
import CategoryManager from "./CategoryManager.tsx";

const AdminDashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<"products" | "categories">(
    "categories",
  );
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const NavItem = ({ menu, icon: Icon, label }: any) => (
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
      <NavItem menu="categories" icon={Grid3x3Gap} label="Categories" />
      <div className="mt-auto px-4">
        <Button
          variant="outline-danger"
          className="w-100 border-0 d-flex align-items-center gap-2 justify-content-center py-2"
          style={{ borderRadius: "10px", fontSize: "14px", fontWeight: 600 }}
        >
          <BoxArrowRight /> Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div style={styles.wrapper}>
      <div style={styles.sidebarDesktop}>
        <SidebarContent />
      </div>

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

      <div style={styles.mainContent}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            {isMobile && (
              <Button
                variant="white"
                onClick={() => setShowMobileSidebar(true)}
                className="shadow-sm p-2"
                style={{ borderRadius: "10px" }}
              >
                <List size={24} />
              </Button>
            )}
          </div>
          <div className="d-flex gap-3 align-items-center">
            {!isMobile && <Search size={20} className="text-muted" />}
            <div className="position-relative">
              <Bell size={22} className="text-muted" />
              <Badge
                pill
                bg="primary"
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  fontSize: "8px",
                }}
              >
                2
              </Badge>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#DDD",
              }}
            >
              <img
                src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff"
                style={{ borderRadius: "50%", width: "100%" }}
                alt="profile"
              />
            </div>
          </div>
        </div>

        <div style={styles.glassCard}>
          <CategoryManager />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

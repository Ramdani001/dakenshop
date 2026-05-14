import React from 'react';
import { Container } from 'react-bootstrap';
// Impor Navbar yang sudah kita buat sebelumnya
// Asumsi: Navbar disimpan di folder components atau folder yang sama
import CustomNavbar from './component/Navbar'; 
import HeroSection from './component/HeroSection';
import BestProduct from './component/BestProduct';
import AboutUs from './component/AboutUs';
import FaqSection from './component/FaqSection';
import UnboxingPopup from './component/UnboxingPopup';

const LandingPage = () => {
  return (
    <div className="landing-page">

      <UnboxingPopup />

      {/* 1. Header/Navbar Section */}
      <CustomNavbar />

      {/* 2. Hero Section (Contoh) */}
      <HeroSection />

      {/* 3. Main Content Area */}
      <main className="py-5">
        <Container>
          <BestProduct />
          <AboutUs />
          <FaqSection />
        </Container>
      </main>

      {/* 4. Footer Section */}
      <footer className="bg-dark text-white py-4 mt-5">
        <Container className="text-center">
          <p className="mb-0">&copy; 2026 DakenShop | Powered by Anavallo.id</p>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;
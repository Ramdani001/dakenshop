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

const LandingPage = ({navigateTo}) => {
  return (
    <div className="landing-page">

      <UnboxingPopup />

      <HeroSection 
        navigateTo={navigateTo}
      />

      <main className="py-5">
        <Container>
          <BestProduct />
          <AboutUs />
          <FaqSection />
        </Container>
      </main>

    </div>
  );
};

export default LandingPage;
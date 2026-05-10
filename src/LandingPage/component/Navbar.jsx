import React from 'react';
import { Navbar, Nav, Container, Image } from 'react-bootstrap';
import { Bag, Person } from 'react-bootstrap-icons';

const CustomNavbar = () => {
  return (
    <Navbar bg="white" expand="lg" className="border-bottom py-3">
      <Container fluid className="px-5">
        
        {/* Bagian Kiri: Logo */}
        <Navbar.Brand href="#home" className="d-flex align-items-center">
          <div className="text-center">
            <Image src="/images/daken-shop-logo.png" alt="Logo"
              style={{ width: '50px', height: 'auto' }} 
              className="d-block mx-auto mb-1"/>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          {/* Bagian Tengah: Menu Navigasi */}
          <Nav className="mx-auto text-uppercase fw-bold" style={{ gap: '20px' }}>
            <Nav.Link href="#home" className="text-black">Beranda</Nav.Link>
            <Nav.Link href="#home" className="text-black">Produk</Nav.Link>

            <Nav.Link href="#tentang-kami" className="text-black">Tentang Kami</Nav.Link>
            <Nav.Link href="#faq" className="text-black">FAQ</Nav.Link>
          </Nav>

          {/* Bagian Kanan: Ikon Keranjang & User */}
          <Nav className="align-items-center" style={{ gap: '20px' }}>
            <Nav.Link href="#cart" className="p-0">
              <Bag size={24} color="black" />
            </Nav.Link>
            <Nav.Link href="#profile" className="p-0">
              <Person size={28} color="black" />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>

      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
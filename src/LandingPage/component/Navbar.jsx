import React from 'react';
import { Navbar, Nav, Container, Image, Offcanvas, Button, Modal, Form, Row, Col, FloatingLabel } from 'react-bootstrap';
import { Bag, Person } from 'react-bootstrap-icons';
import { useState } from 'react';
// import Offcanvas from 'react-bootstrap/Offcanvas';
import CheckoutCard from './CheckoutCard';

const CustomNavbar = () => {

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [showProfile, setShowProfile] = useState(false);

  const handleCloseProfile = () => setShowProfile(false);
  const handleShowProfile = () => setShowProfile(true);

  return (
    <Navbar bg="white" expand="lg" className="border-bottom" fixed="top">
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
            <Nav.Link href="#produk" className="text-black">Produk</Nav.Link>

            <Nav.Link href="#tentang-kami" className="text-black">Tentang Kami</Nav.Link>
            <Nav.Link href="#faq" className="text-black">FAQ</Nav.Link>
          </Nav>

          {/* Bagian Kanan: Ikon Keranjang & User */}
          <Nav className="align-items-center" style={{ gap: '20px' }}>
            <Nav.Link className="p-0" onClick={handleShow}>
              <Bag size={24} color="black" />
            </Nav.Link>
            <Nav.Link className="p-0" onClick={handleShowProfile}>
              <Person size={28} color="black" />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>

      </Container>

      <Offcanvas show={show} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold">Keranjang Belanja</Offcanvas.Title>
        </Offcanvas.Header>

        {/* Menggunakan flexbox pada Body untuk memastikan konten dan footer terpisah */}
        <Offcanvas.Body className="d-flex flex-column p-0">
          
          {/* Area Produk: bisa di-scroll */}
          <div className="flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
            <CheckoutCard />
            <CheckoutCard /> {/* Contoh jika produk banyak */}
            <CheckoutCard />
          </div>

          {/* Area Checkout: Fixed di bawah */}
          <div className="p-3 border-top bg-white shadow-lg" style={{ zIndex: 10 }}>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Total Estimasi:</span>
              <span className="fw-bold text-primary">Rp 450.000</span>
            </div>
            
            <Button 
              variant="primary" 
              className="w-100 py-3 rounded-pill fw-bold text-uppercase"
              style={{ letterSpacing: '1px' }}
            >
              Lanjut ke Pembayaran
            </Button>
            
            <Button 
              variant="link" 
              className="w-100 text-decoration-none text-muted mt-2 small"
              onClick={handleClose}
            >
              Lanjut Belanja
            </Button>
          </div>

        </Offcanvas.Body>
      </Offcanvas>


      <Modal show={showProfile} onHide={handleCloseProfile}>
        <Modal.Header closeButton>
          <Modal.Title>Update Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <Form>
            <Row>
              <Col xs={12} className="mb-3">
                <Form.Control 
                  type="text" 
                  placeholder="Nama Lengkap" 
                  className="rounded-3 shadow-sm border-0 bg-light p-3"
                />
              </Col>
              
              <Col xs={12} className="mb-3">
                <Form.Control 
                  type="email" 
                  placeholder="Alamat Email" 
                  className="rounded-3 shadow-sm border-0 bg-light p-3"
                />
              </Col>

              <Col xs={12} className="mb-3">
                <Form.Control 
                  type="number" 
                  placeholder="No Telepon" 
                  className="rounded-3 shadow-sm border-0 bg-light p-3"
                />
              </Col>

              <Col xs={12} className="mb-3">
                <FloatingLabel controlId="floatingTextarea2" label="Alamat Rumah">
                  <Form.Control as="textarea" placeholder="Jl.xxxxxx Rt:04/Rw:09,Kel:xxxxx,Kec:xxxx,Kota/Kab" style={{ height: '100px' }} />
                </FloatingLabel>
              </Col>

            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseProfile}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCloseProfile}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

    </Navbar>
  );
};

export default CustomNavbar;
import React from 'react';
import { Navbar, Nav, Container, Image, Offcanvas, Button, Modal, Form, Row, Col, FloatingLabel} from 'react-bootstrap';
import { Bag, Person } from 'react-bootstrap-icons';
import { useState } from 'react';
// import Offcanvas from 'react-bootstrap/Offcanvas';
import CheckoutCard from './CheckoutCard';

const CustomNavbar = ({ navigateTo, currentPath }) => {

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [showProfile, setShowProfile] = useState(false);

  const handleCloseProfile = () => setShowProfile(false);

  const [expanded, setExpanded] = useState(false);

  const handleNavClick = (path) => {
    navigateTo(path);
    setExpanded(false);
  };

  return (
    <Navbar expanded={expanded} onToggle={setExpanded} collapseOnSelect bg="white" expand="lg" className="border-bottom" fixed="top">
      <Container className="d-flex justify-content-between align-items-center">
            
          <Navbar.Brand onClick={() => handleNavClick("/")} className="d-flex align-items-center">
              <div className="text-center">
                <Image src="/images/daken-shop-logo.png" alt="Logo"
                  style={{ width: '50px', height: 'auto' }} 
                  className="d-block mx-auto mb-1"/>
              </div>
            </Navbar.Brand>

            <div className="d-flex align-items-center order-lg-last">
              
              <div className="nav-icon-wrapper me-2" style={{ gap: '15px' }}>
                
                <Nav.Link className="p-0" onClick={handleShow}>
                  <Bag size={24} color="black" />
                </Nav.Link>

                <Nav.Link onClick={() => handleNavClick("/profile")}>
                  <Person size={28} color="black"/>
                </Nav.Link>
              </div>

              <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />
            </div>

            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mx-auto fw-bold text-center">
                  <Nav.Link 
                    onClick={() => navigateTo("/")}
                    className={currentPath === "/tentang" ? "text-danger" : "text-black"}
                    href="#home"> BERANDA
                  </Nav.Link>
                  <Nav.Link 
                    onClick={() => handleNavClick("/produk")} 
                    className={currentPath === "/produk" ? "text-danger" : "text-black"}
                  > PRODUK
                  </Nav.Link>
                  <Nav.Link 
                      onClick={() => navigateTo("/")}
                      className={currentPath === "/tentang" ? "text-danger" : "text-black"}
                      href="#tentang"> TENTANG KAMI
                  </Nav.Link>
                  <Nav.Link 
                    onClick={() => navigateTo("/")}
                    className={currentPath === "/tentang" ? "text-danger" : "text-black"}
                    href="#faq"> FAQ
                  </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>


        <Offcanvas show={show} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold">Keranjang Belanja</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column p-0">
          
          <div className="flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
            <CheckoutCard />
            <CheckoutCard /> 
            <CheckoutCard />
          </div>

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
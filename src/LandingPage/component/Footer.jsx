import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaFacebookF, 
  FaInstagram, 
  FaTiktok 
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  // Deteksi apakah user sedang berada di halaman dashboard/profile admin
  const isDashboard = location.pathname.startsWith('/dashboard')

  // Trick CSS Jitu: Kita buat dynamic styles menggunakan JavaScript Object
  const footerStyle = {
    borderTop: '1px solid #333',
    boxSizing: 'border-box', // Memastikan padding & margin tidak merusak kalkulasi width
    paddingTop: isDashboard ? '1rem' : '3rem',
    paddingBottom: isDashboard ? '1rem' : '3rem',
    transition: 'all 0.3s ease',
  };

  // --- 1. TAMPILAN FOOTER KHUSUS DASHBOARD (SUPER MINIMALIS) ---
  if (isDashboard) {
    return (
      <>
        {/* Mengatur responsivitas geser layout agar tidak tertutup sidebar di desktop */}
        <style>{`
          .dashboard-footer {
            margin-left: 0px;
            width: 100%;
          }
          @media (min-width: 992px) {
            .dashboard-footer {
              margin-left: 260px !important; 
              width: calc(100% - 260px) !important;
              max-width: calc(100% - 260px) !important;
            }
          }
        `}</style>
        
        <footer className="bg-dark text-white mt-auto dashboard-footer" style={footerStyle}>
          <Container fluid className="px-4"> 
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
              
              {/* JUDUL BRANDING */}
              <div className="mb-1 mb-md-0">
                <h6 className="fw-bold text-uppercase tracking-wider mb-0" style={{ fontSize: '0.9rem' }}>
                  Daken<span className="text-primary">Shop</span>
                </h6>
              </div>

              {/* COPYRIGHT & POWERED BY */}
              <div className="d-flex flex-column flex-sm-row align-items-center gap-1 gap-sm-3 text-secondary" style={{ fontSize: '0.8rem' }}>
                <div>
                  &copy; {currentYear} <strong>DAKENSHOP</strong>. All Rights Reserved.
                </div>
                <div className="d-none d-sm-inline opacity-25">|</div>
                <div>
                  Powered by <a href="https://anavallo.id" target="_blank" rel="noreferrer" className="text-white text-decoration-none fw-semibold">Anavallo.id</a>
                </div>
              </div>

            </div>
          </Container>
        </footer>
      </>
    );
  }

  // --- 2. TAMPILAN FOOTER UNTUK HALAMAN BIASA (NORMAL / LANDING PAGE / AUTH) ---
  return (
    <footer className="bg-dark text-white mt-auto py-5" style={{ borderTop: '1px solid #333' }}>
      <Container>
        <Row className="gy-4">
          <Col lg={8} md={12}>
            <div className="mb-4">
              <h4 className="fw-bold text-uppercase tracking-wider">
                Daken<span className="text-primary">Shop</span>
              </h4>
            </div>
            <p className="text-secondary mb-4" style={{ lineHeight: '1.8', fontSize: '0.95rem', maxWidth: '750px' }}>
              <strong>DakenShop</strong> adalah solusi belanja online terpercaya untuk <strong>alat rumah tangga</strong> dan 
              <strong> keperluan sehari-hari</strong>. Kami menyediakan koleksi lengkap perlengkapan dapur dan perabot rumah tangga berkualitas.
            </p>
            <div className="d-none d-lg-flex gap-3">
              <SocialIconsGroup isDashboard={false} />
            </div>
          </Col>

          <Col lg={4} md={6} className="text-lg-end">
            <h6 className="text-uppercase fw-bold mb-4" style={{ color: '#aaa' }}>Layanan Pelanggan</h6>
            <ul className="list-unstyled">
              <FooterNavLink to="/shipping-policy">Kebijakan Pengiriman</FooterNavLink>
              <FooterNavLink to="/terms-conditions">Syarat & Ketentuan</FooterNavLink>
              <FooterNavLink to="/contact-us">Hubungi Kami</FooterNavLink>
            </ul>
          </Col>
        </Row>

        <div className="d-flex d-lg-none justify-content-center gap-3 mt-4">
          <SocialIconsGroup isDashboard={false} />
        </div>

        <hr className="my-5" style={{ opacity: 0.1 }} />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="small text-secondary text-center text-md-start">
            &copy; {currentYear} <strong>DAKENSHOP</strong>. All Rights Reserved.
          </div>
          <div className="small text-secondary">
            Powered by <a href="https://anavallo.id" target="_blank" rel="noreferrer" className="text-white text-decoration-none fw-semibold">Anavallo.id</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

const SocialIconsGroup = ({ isDashboard }) => (
  <>
    <SocialIcon icon={<FaInstagram />} href="https://www.instagram.com/dakenshop.id/" target="_blank" isDashboard={isDashboard} />
    <SocialIcon icon={<FaFacebookF />} href="#" target="_blank" isDashboard={isDashboard} />
    <SocialIcon icon={<FaTiktok />} href="#" target="_blank" isDashboard={isDashboard} />
  </>
);

const FooterNavLink = ({ to, children, isDashboard }) => (
  <li className={isDashboard ? "mb-0" : "mb-2"}>
    <Link 
      to={to} 
      className="text-secondary text-decoration-none transition-all"
      style={{ fontSize: isDashboard ? '0.85rem' : '0.95rem', display: 'inline-block' }}
      onMouseEnter={(e) => e.target.style.color = '#fff'}
      onMouseLeave={(e) => e.target.style.color = '#6c757d'}
    >
      {children}
    </Link>
  </li>
);

const SocialIcon = ({ icon, href, target, isDashboard }) => (
  <a 
    href={href} 
    target={target}
    rel={target === "_blank" ? "noopener noreferrer" : undefined}
    className="d-flex align-items-center justify-content-center border border-secondary rounded-circle text-white"
    style={{ 
      width: isDashboard ? '32px' : '38px', 
      height: isDashboard ? '32px' : '38px', 
      fontSize: isDashboard ? '0.85rem' : '1rem',
      transition: '0.3s', 
      textDecoration: 'none' 
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = '#fff';
      e.currentTarget.style.color = '#000';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.color = '#fff';
    }}
  >
    {icon}
  </a>
);

export default Footer;
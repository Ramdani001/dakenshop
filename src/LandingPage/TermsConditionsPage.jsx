import React from 'react';
import { Container, Row, Col, Accordion, Card } from 'react-bootstrap';
import { 
  FaGavel, FaUserShield, FaShoppingBag, 
  FaBox, FaMoneyBillWave, FaExclamationTriangle,
  FaCheckCircle, FaInfoCircle
} from 'react-icons/fa';

const TermsConditionsPage = () => {
  return (
    <div style={{ backgroundColor: '#fcfcfc', minHeight: '100vh', paddingTop: '100px' }}>
      
      {/* Header Section - Clean & Soft Blue Accent */}
      <Container className="mb-5">
        <div className="text-center p-5 rounded-4" style={{
          backgroundColor: '#ffffff',
          border: '1px solid #eee',
          boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
        }}>
          <div className="d-inline-block p-3 rounded-circle mb-4" style={{ backgroundColor: 'rgba(13, 110, 253, 0.05)' }}>
            <FaGavel size={35} className="text-primary" />
          </div>
          <h1 className="fw-bold mb-3" style={{ color: '#2c3e50', letterSpacing: '-1px' }}>Syarat & Ketentuan</h1>
          <p className="mx-auto text-muted" style={{ maxWidth: '600px', fontSize: '1.05rem' }}>
            Selamat datang di <strong>DakenShop</strong>. Mohon baca aturan penggunaan layanan kami untuk menjamin kenyamanan transaksi Anda.
          </p>
        </div>
      </Container>

      <Container className="pb-5">
        <Row className="justify-content-center">
          <Col lg={9}>
            
            <Accordion flush className="custom-dakenshop-accordion">
              
              {/* Item 1 */}
              <Accordion.Item eventKey="0" className="mb-3 rounded-4 shadow-sm border">
                <Accordion.Header>
                  <div className="d-flex align-items-center py-2">
                    <div className="icon-wrapper me-3"><FaUserShield /></div>
                    <span className="fw-bold">1. Akun & Keamanan Pengguna</span>
                  </div>
                </Accordion.Header>
                <Accordion.Body className="px-4 pb-4">
                    <div className="ms-md-5 ps-md-2">
                        <ul className="list-unstyled">
                            <li className="mb-3 d-flex align-items-start">
                                <FaCheckCircle className="text-primary me-3 mt-1" />
                                <span>Pengguna bertanggung jawab atas kerahasiaan akun dan password.</span>
                            </li>
                            <li className="mb-3 d-flex align-items-start">
                                <FaCheckCircle className="text-primary me-3 mt-1" />
                                <span>DakenShop tidak akan pernah meminta data OTP atau password Anda.</span>
                            </li>
                            <li className="mb-0 d-flex align-items-start">
                                <FaCheckCircle className="text-primary me-3 mt-1" />
                                <span>Segera hubungi kami jika terjadi penggunaan tanpa izin pada akun Anda.</span>
                            </li>
                        </ul>
                    </div>
                </Accordion.Body>
              </Accordion.Item>

              {/* Item 2 */}
              <Accordion.Item eventKey="1" className="mb-3 rounded-4 shadow-sm border">
                <Accordion.Header>
                  <div className="d-flex align-items-center py-2">
                    <div className="icon-wrapper me-3"><FaShoppingBag /></div>
                    <span className="fw-bold">2. Transaksi & Produk</span>
                  </div>
                </Accordion.Header>
                <Accordion.Body className="px-4 pb-4">
                    <div className="ms-md-5 ps-md-2">
                        <p className="text-muted small mb-3"><FaInfoCircle className="me-2"/> Pastikan Anda membaca deskripsi produk secara detail sebelum checkout.</p>
                        <p className="text-muted small mb-0">Warna produk asli mungkin sedikit berbeda dikarenakan faktor pencahayaan layar masing-masing perangkat.</p>
                    </div>
                </Accordion.Body>
              </Accordion.Item>

              {/* Item 3 */}
              <Accordion.Item eventKey="2" className="mb-3 rounded-4 shadow-sm border">
                <Accordion.Header>
                  <div className="d-flex align-items-center py-2">
                    <div className="icon-wrapper me-3"><FaMoneyBillWave /></div>
                    <span className="fw-bold">3. Metode Pembayaran</span>
                  </div>
                </Accordion.Header>
                <Accordion.Body className="px-4 pb-4">
                    <div className="ms-md-5 ps-md-2 text-muted small">
                        Pembayaran wajib dilakukan dalam waktu <strong>1x24 jam</strong>. Jika tidak, pesanan akan dibatalkan secara otomatis oleh sistem kami.
                    </div>
                </Accordion.Body>
              </Accordion.Item>

              {/* Item 4 - Highlighted */}
              <Accordion.Item eventKey="3" className="mb-3 rounded-4 shadow-sm border border-primary-subtle" style={{ backgroundColor: '#f0f7ff' }}>
                <Accordion.Header>
                  <div className="d-flex align-items-center py-2">
                    <div className="icon-wrapper me-3 bg-primary text-white"><FaBox /></div>
                    <span className="fw-bold">4. Pengiriman & Unboxing</span>
                  </div>
                </Accordion.Header>
                <Accordion.Body className="px-4 pb-4">
                    <div className="ms-md-5 ps-md-2">
                        <div className="p-3 rounded-3 bg-white border border-primary-subtle">
                            <h6 className="fw-bold text-primary mb-2">PENTING!</h6>
                            <p className="text-muted small mb-0">
                                Pembeli wajib menyertakan <strong>Video Unboxing</strong> yang utuh (tanpa potong/edit) untuk klaim kerusakan atau kekurangan produk.
                            </p>
                        </div>
                    </div>
                </Accordion.Body>
              </Accordion.Item>

              {/* Item 5 */}
              <Accordion.Item eventKey="4" className="mb-3 rounded-4 shadow-sm border">
                <Accordion.Header>
                  <div className="d-flex align-items-center py-2">
                    <div className="icon-wrapper me-3"><FaExclamationTriangle /></div>
                    <span className="fw-bold">5. Tanggung Jawab</span>
                  </div>
                </Accordion.Header>
                <Accordion.Body className="px-4 pb-4">
                    <div className="ms-md-5 ps-md-2 text-muted small">
                        DakenShop tidak bertanggung jawab atas kerugian yang timbul akibat penyalahgunaan produk oleh pembeli setelah barang diterima.
                    </div>
                </Accordion.Body>
              </Accordion.Item>

            </Accordion>

            <div className="text-center mt-5">
              <p className="small text-muted mb-1">Terakhir Diperbarui: 17 Mei 2026</p>
              <p className="small text-muted fw-bold">DakenShop Legal Team</p>
            </div>

          </Col>
        </Row>
      </Container>

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-dakenshop-accordion .accordion-item {
          border: 1px solid #eee !important;
          overflow: hidden;
        }
        .custom-dakenshop-accordion .accordion-button {
          background-color: #ffffff !important;
          padding: 1.25rem 1.5rem;
          color: #333 !important;
          box-shadow: none !important;
        }
        .custom-dakenshop-accordion .accordion-button:not(.collapsed) {
          color: #0d6efd !important;
          border-bottom: 1px solid #f0f0f0;
        }
        .icon-wrapper {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background-color: #f8f9fa;
          color: #0d6efd;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }
        .accordion-button:not(.collapsed) .icon-wrapper {
          background-color: #0d6efd;
          color: #fff;
          transform: rotate(5deg);
        }
        .accordion-button::after {
          background-size: 1rem;
        }
        @media (max-width: 768px) {
          .icon-wrapper { display: none; }
        }
      `}} />
    </div>
  );
};

export default TermsConditionsPage;
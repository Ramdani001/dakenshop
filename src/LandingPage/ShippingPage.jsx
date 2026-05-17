import React from 'react';
import { Container, Row, Col, Card, Accordion } from 'react-bootstrap';
import { 
  FaTruck, 
  FaShippingFast, 
  FaReceipt, 
  FaCalendarCheck,
  FaShieldAlt
} from 'react-icons/fa';

const ShippingPage = () => {
  const shippingSteps = [
    {
      icon: <FaCalendarCheck className="text-primary" />,
      title: "Jadwal Operasional",
      desc: "Senin - Sabtu: Pesanan sebelum 15:00 WIB dikirim hari yang sama. Minggu & Tanggal Merah libur."
    },
    {
      icon: <FaTruck className="text-success" />,
      title: "Mitra Kurir",
      desc: "JNE, J&T, Sicepat, dan layanan kilat GoSend/Grab Express (Area Tertentu)."
    },
    {
      icon: <FaReceipt className="text-warning" />,
      title: "Pelacakan Resi",
      desc: "Resi diupdate otomatis maksimal 1x24 jam setelah kurir menjemput paket anda."
    }
  ];

  return (
    // Tambahkan paddingTop (misal 80px) untuk memberi ruang bagi Navbar yang fixed/sticky
    <div style={{ 
      backgroundColor: '#fcfcfc', 
      minHeight: '100vh', 
      paddingTop: '80px' 
    }}>
      
      {/* Hero Section */}
      <div className="bg-dark text-white py-5 mb-5 shadow-sm position-relative overflow-hidden">
        <Container className="text-center py-5">
          <h1 className="display-4 fw-bold mb-3">Pusat Informasi Pengiriman</h1>
          <p className="lead opacity-75 mx-auto" style={{ maxWidth: '700px' }}>
            DakenShop memastikan produk sampai di tangan Anda dengan cepat, aman, dan transparan.
          </p>
        </Container>
      </div>

      <Container className="pb-5">
        {/* Quick Info Cards */}
        <Row className="mb-5 g-4">
          {shippingSteps.map((step, index) => (
            <Col lg={4} md={6} key={index}>
              <Card className="h-100 border-0 shadow-sm hover-up transition-all" style={{ borderRadius: '20px' }}>
                <Card.Body className="text-center p-4">
                  <div className="mb-3 d-inline-block p-3 rounded-circle bg-light fs-1">
                    {step.icon}
                  </div>
                  <h5 className="fw-bold mb-3">{step.title}</h5>
                  <p className="text-muted small mb-0" style={{ lineHeight: '1.6' }}>
                    {step.desc}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="gy-5 align-items-start">
          {/* Estimasi Waktu Section */}
          <Col lg={6}>
            <div className="pe-lg-5">
              <div className="d-flex align-items-center mb-4">
                <div className="p-2 bg-primary rounded-3 me-3 text-white">
                  <FaShippingFast size={24} />
                </div>
                <h2 className="fw-bold mb-0">Estimasi Pengiriman</h2>
              </div>
              
              <div className="position-relative ps-4 border-start border-primary border-2 ms-2">
                <div className="mb-5 position-relative">
                  <div className="bg-primary rounded-circle position-absolute" 
                       style={{ width: '16px', height: '16px', left: '-30px', top: '4px', border: '3px solid #fff', boxShadow: '0 0 0 2px #0d6efd' }}></div>
                  <h6 className="fw-bold mb-1 text-primary">Layanan Instan / Same Day</h6>
                  <p className="text-muted small">Tiba dalam <strong>3 - 6 Jam</strong> setelah pesanan diproses (Khusus area jangkauan).</p>
                </div>

                <div className="mb-5 position-relative">
                  <div className="bg-primary rounded-circle position-absolute" 
                       style={{ width: '16px', height: '16px', left: '-30px', top: '4px', border: '3px solid #fff', boxShadow: '0 0 0 2px #0d6efd' }}></div>
                  <h6 className="fw-bold mb-1 text-primary">Layanan Ekspres</h6>
                  <p className="text-muted small">Estimasi <strong>1 - 2 Hari Kerja</strong> tergantung jarak lokasi tujuan.</p>
                </div>

                <div className="position-relative">
                  <div className="bg-primary rounded-circle position-absolute" 
                       style={{ width: '16px', height: '16px', left: '-30px', top: '4px', border: '3px solid #fff', boxShadow: '0 0 0 2px #0d6efd' }}></div>
                  <h6 className="fw-bold mb-1 text-primary">Layanan Reguler</h6>
                  <p className="text-muted small">Estimasi <strong>2 - 5 Hari Kerja</strong> untuk seluruh wilayah Indonesia.</p>
                </div>
              </div>
            </div>
          </Col>

          {/* FAQ Accordion */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
              <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
                <h4 className="fw-bold d-flex align-items-center">
                  <FaShieldAlt className="text-primary me-2" /> Tanya Jawab
                </h4>
              </Card.Header>
              <Card.Body className="p-4">
                <Accordion flush>
                  <Accordion.Item eventKey="0" className="border-bottom py-2">
                    <Accordion.Header className="fw-semibold">Apakah bisa kirim ke luar pulau?</Accordion.Header>
                    <Accordion.Body className="text-muted small">
                      Tentu saja! DakenShop melayani pengiriman ke seluruh pelosok Indonesia menggunakan layanan Reguler maupun Kargo dengan jangkauan nasional.
                    </Accordion.Body>
                  </Accordion.Item>
                  <Accordion.Item eventKey="1" className="border-bottom py-2">
                    <Accordion.Header className="fw-semibold">Bagaimana jika barang rusak?</Accordion.Header>
                    <Accordion.Body className="text-muted small">
                      Kami menyarankan penggunaan <strong>asuransi pengiriman</strong>. Jika terjadi kerusakan fisik akibat kelalaian kurir, tim kami akan membantu proses klaim hingga selesai.
                    </Accordion.Body>
                  </Accordion.Item>
                  <Accordion.Item eventKey="2" className="py-2">
                    <Accordion.Header className="fw-semibold">Kapan pesanan saya di-pickup?</Accordion.Header>
                    <Accordion.Body className="text-muted small">
                      Semua paket akan di-pickup oleh kurir setiap sore. Update status kiriman biasanya akan muncul di sistem pada malam hari secara otomatis.
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style dangerouslySetInnerHTML={{ __html: `
        .hover-up { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .hover-up:hover { 
          transform: translateY(-12px);
          shadow: 0 1rem 3rem rgba(0,0,0,.175)!important;
        }
        .accordion-button:not(.collapsed) {
          background-color: #f8f9fa;
          color: #0d6efd;
          box-shadow: none;
        }
        .accordion-button:focus {
          box-shadow: none;
          border-color: rgba(0,0,0,.125);
        }
      `}} />
    </div>
  );
};

export default ShippingPage;
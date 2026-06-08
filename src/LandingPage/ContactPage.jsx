import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { FaWhatsapp, FaEnvelope, FaClock, FaQuestionCircle } from 'react-icons/fa';

const ContactPage = () => {
  // --- STATE UNTUK MENAMPUNG INPUT FORMULIR ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Tanya Stok Produk', // Default opsi pertama
    message: ''
  });

  // Fungsi penangkap perubahan teks input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // --- FUNGSI REDIRECT OTOMATIS KE WHATSAPP DENGAN DYNAMIC PAYLOAD ---
  const handleSubmit = (e) => {
    e.preventDefault();

    // Nomor WhatsApp tujuan CS DakenShop (Ubah sesuai kebutuhan)
    const phoneNumber = "6285624432695"; 

    // Menyusun template teks pesan terformat
    const textMessage = `*Pesan Baru dari Hubungi Kami - DakenShop*\n\n` +
                        `👤 *Nama:* ${formData.name}\n` +
                        `✉️ *Email:* ${formData.email}\n` +
                        `📌 *Subjek:* ${formData.subject}\n\n` +
                        `💬 *Isi Pesan:*\n${formData.message}`;

    // Konversi teks biasa ke format URL safe string
    const encodedMessage = encodeURIComponent(textMessage);

    // Gabungkan menjadi url chat wa.me resmi
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Buka aplikasi WA / tab browser baru
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div style={{ backgroundColor: '#fcfcfc', minHeight: '100vh', paddingTop: '80px' }}>
      
      {/* Header Section */}
      <div className="bg-dark text-white py-5 mb-5 shadow-sm">
        <Container className="text-center py-4">
          <h1 className="display-5 fw-bold mb-3">Ada Pertanyaan?</h1>
          <p className="lead opacity-75">Kami siap membantu kebutuhan alat rumah tangga Anda setiap hari.</p>
        </Container>
      </div>

      <Container className="pb-5">
        <Row className="gy-5">
          
          {/* Sisi Kiri: Informasi Kontak */}
          <Col lg={5}>
            <div className="pe-lg-4">
              <h3 className="fw-bold mb-4">Informasi Kontak</h3>
              <p className="text-muted mb-5">
                Jangan ragu untuk menghubungi kami melalui saluran di bawah ini. Kami biasanya membalas dalam hitungan menit pada jam kerja.
              </p>

              {/* Contact Method Cards */}
              <div className="mb-4 d-flex align-items-start p-4 bg-white shadow-sm rounded-4 border-start border-primary border-4 hover-translate">
                <div className="bg-light p-3 rounded-circle me-4 text-primary fs-4">
                  <FaWhatsapp />
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Chat WhatsApp</h6>
                  <p className="mb-0 text-muted small">+62 812-3456-7890</p>
                  <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="small text-primary text-decoration-none fw-bold">Chat Sekarang →</a>
                </div>
              </div>

              <div className="mb-4 d-flex align-items-start p-4 bg-white shadow-sm rounded-4 border-start border-info border-4 hover-translate">
                <div className="bg-light p-3 rounded-circle me-4 text-info fs-4">
                  <FaEnvelope />
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Email Support</h6>
                  <p className="mb-0 text-muted small">support@dakenshop.id</p>
                  <p className="small text-muted mb-0">Respon dalam 1x24 jam</p>
                </div>
              </div>

              <div className="mb-5 d-flex align-items-start p-4 bg-white shadow-sm rounded-4 border-start border-warning border-4 hover-translate">
                <div className="bg-light p-3 rounded-circle me-4 text-warning fs-4">
                  <FaClock />
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Jam Operasional</h6>
                  <p className="mb-0 text-muted small">Senin - Sabtu: 09.00 - 18.00</p>
                  <p className="mb-0 text-muted small">Minggu: Libur (Slow Response)</p>
                </div>
              </div>
            </div>
          </Col>

          {/* Sisi Kanan: Form Kontak */}
          <Col lg={7}>
            <Card className="border-0 shadow-lg p-2 p-md-4" style={{ borderRadius: '25px' }}>
              <Card.Body>
                <div className="mb-4">
                  <h4 className="fw-bold mb-2 text-primary">Kirim Pesan Langsung</h4>
                  <p className="text-muted small">Isi formulir di bawah ini dan kami akan segera menghubungi Anda.</p>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-secondary">NAMA LENGKAP</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Contoh: Budi Santoso" 
                          className="bg-light border-0 py-3 px-4 shadow-none custom-input" 
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-secondary">ALAMAT EMAIL</Form.Label>
                        <Form.Control 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="budi@email.com" 
                          className="bg-light border-0 py-3 px-4 shadow-none custom-input" 
                          required 
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    {/* PERBAIKAN UTAMA: Elemen <Theme.Label> hantu sudah diganti total menjadi <Form.Label> bawaan react-bootstrap */}
                    <Form.Label className="small fw-bold text-secondary">SUBJEK</Form.Label>
                    <Form.Select 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="bg-light border-0 py-3 px-4 shadow-none custom-input"
                    >
                      <option value="Tanya Stok Produk">Tanya Stok Produk</option>
                      <option value="Status Pengiriman">Status Pengiriman</option>
                      <option value="Klaim Garansi / Retur">Klaim Garansi / Retur</option>
                      <option value="Lainnya">Lainnya</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-secondary">PESAN ANDA</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5} 
                      placeholder="Tuliskan detail pertanyaan Anda..." 
                      className="bg-light border-0 py-3 px-4 shadow-none custom-input" 
                      required 
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="py-3 fw-bold rounded-3 shadow-sm transition-all"
                    >
                      Kirim Pesan Sekarang
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
            
            <div className="mt-4 text-center">
              <p className="text-muted small">
                <FaQuestionCircle className="me-2" />
                Ingin jawaban cepat? Cek halaman <a href="/faq" className="text-primary fw-bold text-decoration-none">FAQ Kami</a>
              </p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Internal CSS untuk UX Visual */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-input:focus {
          background-color: #fff !important;
          border: 1px solid #0d6efd !important;
        }
        .hover-translate {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: default;
        }
        .hover-translate:hover {
          transform: translateX(10px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .transition-all:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
        }
        @media (max-width: 768px) {
          .hover-translate:hover {
            transform: translateY(-5px);
          }
        }
      `}} />
    </div>
  );
};

export default ContactPage;
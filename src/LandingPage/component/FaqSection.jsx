import React from 'react';
import { Container, Accordion } from 'react-bootstrap';

const FaqSection = () => {
  return (
    <section id="faq" className="py-5 bg-white">
      <Container>
        <div className="text-center mb-5">
          <h2 className="fw-bold" style={{ color: '#0a1d37' }}>Pertanyaan Sering Diajukan (FAQ)</h2>
          <p className="text-muted">Semua yang perlu Anda ketahui tentang produk dan layanan kami.</p>
        </div>
        
        <div className="mx-auto" style={{ maxWidth: '800px' }}>
          <Accordion flush>
            <Accordion.Item eventKey="0" className="border-bottom py-2">
              <Accordion.Header className="fw-bold">Bagaimana cara memesan produk di DakenShop?</Accordion.Header>
              <Accordion.Body className="text-muted">
                Anda dapat memilih produk yang diinginkan, menambahkannya ke keranjang, dan melakukan checkout melalui sistem pembayaran yang tersedia.
              </Accordion.Body>
            </Accordion.Item>
            
            <Accordion.Item eventKey="1" className="border-bottom py-2">
              <Accordion.Header>Berapa lama waktu pengiriman?</Accordion.Header>
              <Accordion.Body className="text-muted">
                Pengiriman biasanya memakan waktu 2-4 hari kerja tergantung pada lokasi pengiriman Anda.
              </Accordion.Body>
            </Accordion.Item>
            
            <Accordion.Item eventKey="2" className="border-bottom py-2">
              <Accordion.Header>Apakah produk memiliki garansi?</Accordion.Header>
              <Accordion.Body className="text-muted">
                Ya, setiap produk elektronik cerdas di DakenShop dilengkapi dengan garansi resmi selama 1 tahun.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      </Container>
    </section>
  );
};

export default FaqSection;
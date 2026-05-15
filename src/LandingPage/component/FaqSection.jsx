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
              <Accordion.Header>Berapa lama waktu pengemasan?</Accordion.Header>
              <Accordion.Body className="text-muted">
                Pengemasan sesuai dengan operasional toko.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="4" className="border-bottom py-2">
              <Accordion.Header>Jam Operasional Toko</Accordion.Header>
              <Accordion.Body className="text-muted">
                Senin - jumat 08.30 - 17.00, sabtu 08.30 - 15.00, hari minggu dan tanggal merah libur dikirim di hari berikutnya.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      </Container>
    </section>
  );
};

export default FaqSection;
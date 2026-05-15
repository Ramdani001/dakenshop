import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { CameraVideo, BoxSeam, CheckCircleFill } from 'react-bootstrap-icons';

const UnboxingPopup = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenUnboxingPopup');
    
    if (!hasSeenPopup) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem('hasSeenUnboxingPopup', 'true');
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      backdrop="static"
      className="unboxing-modal"
    >
      <Modal.Header closeButton className="border-0 pb-0">
      </Modal.Header>
      
      <Modal.Body className="text-center px-4 pb-5">
        <div className="d-flex justify-content-center mb-4">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
            style={{ 
              width: '100px', 
              height: '100px', 
              backgroundColor: '#fff', 
              marginTop: '-70px',
              border: '4px solid #f8f9fa'
            }}
          >
            <span style={{ fontSize: '40px' }}>🐱</span>
          </div>
        </div>

        <h3 className="fw-bold mb-3" style={{ color: '#000' }}>JANGAN LUPA!</h3>
        
        <p className="text-muted mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
          Jangan lupa untuk <strong>men-videokan ketika unboxing</strong>, sebagai bukti jika ada kesalahan atau kerusakan pada barang tersebut dan video tersebut menjadi syarat untuk <strong>men-claim nya</strong>.
        </p>

        <div className="d-flex align-items-center justify-content-center gap-3 mb-4 py-3 bg-light rounded-3">
          <div className="text-center">
            <BoxSeam size={40} color="#0d6efd" />
          </div>
          <div className="fw-bold text-secondary">→</div>
          <div className="text-center position-relative">
            <CameraVideo size={40} color="#dc3545" />
            <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle" style={{fontSize: '0.6rem'}}>REC</span>
          </div>
          <div className="fw-bold text-secondary">→</div>
          <div className="text-center">
            <CheckCircleFill size={40} color="#198754" />
          </div>
        </div>

        <Button 
          variant="primary" 
          onClick={handleClose}
          className="w-100 py-2 fw-bold shadow-sm"
          style={{ borderRadius: '10px', fontSize: '1.1rem' }}
        >
          SAYA MENGERTI
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default UnboxingPopup;
import React, { useState } from 'react';
import { Card, Button, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { Dash, Plus } from 'react-bootstrap-icons';

const CheckoutCard = () => {
  const [quantity, setQuantity] = useState(1);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  return (
    <Card className="shadow-sm border-0 mb-3" style={{ borderRadius: '15px', overflow: 'hidden' }}>
      <Card.Body className="p-0">
        <Row className="g-0 align-items-center">

          <Col xs={4} md={3}>
            <div style={{ height: '100%', minHeight: '150px', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000"
                alt="Produk"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </Col>

          <Col xs={8} md={9} className="p-3">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <Card.Title className="fw-bold mb-1">Nama Produk Cerdas</Card.Title>
                <Card.Text className="text-muted small mb-2">
                  Deskripsi singkat produk yang sangat berguna untuk rumah tangga modern.
                </Card.Text>
                <h5 className="text-primary fw-bold">Rp 150.000</h5>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <InputGroup style={{ width: '120px' }}>
                <Button variant="outline-secondary" size="sm" onClick={handleDecrease}>
                  <Dash />
                </Button>
                <FormControl
                  className="text-center bg-white"
                  value={quantity}
                  readOnly
                  style={{ borderLeft: 'none', borderRight: 'none' }}
                />
                <Button variant="outline-secondary" size="sm" onClick={handleIncrease}>
                  <Plus />
                </Button>
              </InputGroup>

              <Button variant="danger" size="sm" className="rounded-pill px-3">
                Hapus
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default CheckoutCard;
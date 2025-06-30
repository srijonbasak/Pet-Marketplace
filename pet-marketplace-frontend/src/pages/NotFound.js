import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faHome } from '@fortawesome/free-solid-svg-icons';

const NotFound = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="mb-4">
            <FontAwesomeIcon icon={faPaw} size="4x" className="text-primary" />
          </div>
          <h1 className="display-4 mb-3">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead mb-5">
            Oops! The page you are looking for might have been removed, had its
            name changed, or is temporarily unavailable.
          </p>
          <div className="d-grid gap-2 d-md-flex justify-content-md-center">
            <Link to="/" className="btn btn-primary btn-lg">
              <FontAwesomeIcon icon={faHome} className="me-2" />
              Back to Home
            </Link>
            <Link to="/pets" className="btn btn-outline-primary btn-lg">
              <FontAwesomeIcon icon={faPaw} className="me-2" />
              Explore Pets
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound; 
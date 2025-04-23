import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>
              <FontAwesomeIcon icon={faPaw} className="me-2" />
              Pet Marketplace
            </h5>
            <p className="text-muted">
              Connecting pet lovers with their perfect companions and providing
              quality products for all your pet needs.
            </p>
          </Col>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/pets" className="text-decoration-none text-muted">Pets</Link></li>
              <li><Link to="/products" className="text-decoration-none text-muted">Products</Link></li>
              <li><Link to="/rescues" className="text-decoration-none text-muted">Rescue Operations</Link></li>
              <li><Link to="/login" className="text-decoration-none text-muted">Login</Link></li>
              <li><Link to="/register" className="text-decoration-none text-muted">Register</Link></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact Us</h5>
            <ul className="list-unstyled text-muted">
              <li className="mb-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                123 Pet Street, Pawsville, PP 12345
              </li>
              <li className="mb-2">
                <FontAwesomeIcon icon={faPhone} className="me-2" />
                +1 (123) 456-7890
              </li>
              <li className="mb-2">
                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                info@petmarketplace.com
              </li>
            </ul>
          </Col>
        </Row>
        <hr className="my-4" />
        <Row>
          <Col className="text-center text-muted">
            <small>
              &copy; {new Date().getFullYear()} Pet Marketplace. All rights reserved.
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 
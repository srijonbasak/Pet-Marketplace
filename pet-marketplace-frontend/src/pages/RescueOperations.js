import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandHoldingHeart, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { useAuth } from '../hooks/useAuth';
import RescueLottie from '../components/common/RescueLottie';
import './RescueOperations.css';

const RescueOperations = () => {
  const [rescues, setRescues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchRescues = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/api/rescues');
        setRescues(res.data.rescues || res.data || []);
      } catch (err) {
        setError('Failed to load rescues.');
      }
      setLoading(false);
    };
    fetchRescues();
  }, []);

  // Show all rescues in the main feed
  const rescuedFeed = rescues;

  return (
    <>
      <div className="hero-section text-white py-5 position-relative" style={{ overflow: 'hidden', minHeight: 320, background: 'linear-gradient(90deg, #fc5c7d 0%, #6a82fb 100%)' }}>
        <Container className="position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center flex-column-reverse flex-md-row">
            <div className="col-12 col-md-7 text-center text-md-start mb-4 mb-md-0">
              <motion.h1 className="display-4 fw-bold mb-3"
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}>
                Rescue Operations
              </motion.h1>
              <motion.p className="lead mb-4"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}>
                See the latest animal rescues and help make a difference!
              </motion.p>
            </div>
            <div className="col-12 col-md-5 d-flex justify-content-center align-items-center position-relative" style={{ minHeight: 220 }}>
              <RescueLottie style={{ width: 'min(90vw, 260px)', height: 'min(90vw, 260px)' }} />
            </div>
          </div>
        </Container>
      </div>
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <FontAwesomeIcon icon={faHandHoldingHeart} size="2x" className="text-primary me-2" />
            <span className="fs-2 fw-bold">Rescued Animals Feed</span>
          </div>
          {isAuthenticated && (
            <Button as={Link} to="/rescues/new" variant="primary">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add Rescue
            </Button>
          )}
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : rescuedFeed.length === 0 ? (
          <Alert variant="info">No rescued animals to show yet.</Alert>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {rescuedFeed.map(rescue => (
              <Col key={rescue._id}>
                <div className="h-100">
                  <div className="rescue-card-anim h-100">
                    <Card className="h-100 border-0 shadow-lg rounded-4 overflow-hidden position-relative rescue-card-custom">
                      {rescue.imageUrl && (
                        <div className="overflow-hidden position-relative" style={{ height: 220 }}>
                          <Card.Img 
                            variant="top" 
                            src={rescue.imageUrl} 
                            alt={rescue.title} 
                            style={{ objectFit: 'cover', height: '100%', width: '100%', transition: 'transform 0.5s cubic-bezier(.4,2,.6,1)', borderRadius: '0 0 1.5rem 1.5rem' }}
                            className="rescue-card-img"
                          />
                          <div className="rescue-card-img-overlay position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.0) 60%)', pointerEvents: 'none' }} />
                        </div>
                      )}
                      <Card.Body className="d-flex flex-column justify-content-between p-4">
                        <div>
                          <Card.Title className="fw-bold fs-4 mb-2 text-primary-emphasis">{rescue.title}</Card.Title>
                          <Card.Text className="mb-3 text-secondary">
                            {rescue.description?.length > 100
                              ? rescue.description.slice(0, 100) + '...'
                              : rescue.description}
                          </Card.Text>
                        </div>
                        <div className="mb-2 small">
                          <span className="badge bg-gradient bg-info text-dark me-2 mb-1"><FontAwesomeIcon icon={faHandHoldingHeart} className="me-1" />{rescue.status}</span>
                          <span className="badge bg-gradient bg-light text-dark me-2 mb-1">{rescue.location?.city}, {rescue.location?.state}, {rescue.location?.country}</span>
                        </div>
                        <div className="mb-2 text-muted small">
                          <strong>Posted by:</strong> {rescue.createdBy?.username || 'Unknown'}
                        </div>
                        <div className="d-flex justify-content-end">
                          <Button as={Link} to={`/rescues/${rescue._id}`} variant="gradient-pink" size="sm" className="rounded-pill px-3 rescue-card-btn">
                            <span className="fw-bold">View Details</span>
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
      )}
    </Container>
    </>
  );
};

export default RescueOperations;
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
      {/* Modern Animated Hero Section */}
      <div className="rescue-details-hero" style={{ background: 'linear-gradient(90deg, #fc5c7d 0%, #6a82fb 100%)', minHeight: 320, padding: '3rem 0', marginBottom: 0 }}>
        <Container className="position-relative d-flex flex-column flex-md-row align-items-center justify-content-between" style={{ zIndex: 2 }}>
          <div className="rescue-details-hero-content text-center text-md-start mb-4 mb-md-0" style={{ flex: 1 }}>
            <motion.h1 className="rescue-details-hero-title" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, type: 'spring' }}>
              Rescue Operations
            </motion.h1>
            <motion.p className="rescue-details-hero-subtitle" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}>
              See the latest animal rescues and help make a difference!
            </motion.p>
          </div>
          <motion.div className="rescue-details-hero-lottie d-flex justify-content-center align-items-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, type: 'spring' }}>
            <RescueLottie style={{ width: 320, height: 320, minWidth: 220, maxWidth: 400, background: 'none' }} />
          </motion.div>
        </Container>
      </div>
      <Container className="py-5">
        <motion.div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: 'spring' }}>
          <div className="d-flex align-items-center gap-2">
            <FontAwesomeIcon icon={faHandHoldingHeart} size="2x" className="text-primary me-2" />
            <span className="fs-2 fw-bold">Rescued Animals Feed</span>
          </div>
          {isAuthenticated && (
            <Button as={Link} to="/rescues/new" className="rescue-details-btn px-4 py-2 fw-bold" style={{ fontSize: '1.1rem' }}>
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add Rescue
            </Button>
          )}
        </motion.div>
        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : rescuedFeed.length === 0 ? (
          <Alert variant="info">No rescued animals to show yet.</Alert>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {rescuedFeed.map((rescue, idx) => (
              <Col key={rescue._id}>
                <motion.div
                  className="h-100"
                  initial={{ opacity: 0, y: 40, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 + idx * 0.08, type: 'spring' }}
                  whileHover={{ scale: 1.035, boxShadow: '0 8px 32px 0 rgba(80,80,180,0.18), 0 3px 12px 0 rgba(80,80,180,0.12)' }}
                >
                  <Card className="h-100 border-0 shadow-lg rounded-4 overflow-hidden position-relative rescue-card-custom">
                    {rescue.imageUrl && (
                      <motion.div
                        className="overflow-hidden position-relative"
                        style={{ height: 220 }}
                        initial={{ scale: 0.98, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.15 + idx * 0.08, type: 'spring' }}
                      >
                        <Card.Img 
                          variant="top" 
                          src={rescue.imageUrl} 
                          alt={rescue.title} 
                          style={{ objectFit: 'cover', height: '100%', width: '100%', transition: 'transform 0.5s cubic-bezier(.4,2,.6,1)', borderRadius: '0 0 1.5rem 1.5rem' }}
                          className="rescue-card-img"
                        />
                        <div className="rescue-card-img-overlay position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.0) 60%)', pointerEvents: 'none' }} />
                      </motion.div>
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
                        <Button as={Link} to={`/rescues/${rescue._id}`} className="rescue-details-btn rounded-pill px-3 fw-bold" size="sm">
                          View Details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default RescueOperations;
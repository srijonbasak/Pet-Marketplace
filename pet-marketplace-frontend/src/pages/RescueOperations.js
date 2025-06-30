import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandHoldingHeart, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { useAuth } from '../hooks/useAuth';
import RescueLottie from '../components/common/RescueLottie';

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
              <h1 className="display-4 fw-bold mb-3">Rescue Operations</h1>
              <p className="lead mb-4">See the latest animal rescues and help make a difference!</p>
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
                <Card className="h-100 shadow-sm">
                  {rescue.imageUrl && (
                  <Card.Img 
                    variant="top" 
                    src={rescue.imageUrl} 
                    alt={rescue.title} 
                    style={{ objectFit: 'cover', height: '200px' }}
                  />
                )}
                <Card.Body>
                  <Card.Title>{rescue.title}</Card.Title>
                  <Card.Text className="mb-2">
                    {rescue.description?.length > 100
                      ? rescue.description.slice(0, 100) + '...'
                      : rescue.description}
                  </Card.Text>
                  <div className="mb-2">
                    <strong>Location:</strong> {rescue.location?.city}, {rescue.location?.state}, {rescue.location?.country}
                  </div>
                  <div className="mb-2">
                    <strong>Status:</strong> <span className="badge bg-success">{rescue.status}</span>
                  </div>
                  <div className="mb-2">
                    <strong>Posted by:</strong> {rescue.createdBy?.username || 'Unknown'}
                  </div>
                  <Button as={Link} to={`/rescues/${rescue._id}`} variant="outline-primary" size="sm">
                    View Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
    </>
  );
};

export default RescueOperations;
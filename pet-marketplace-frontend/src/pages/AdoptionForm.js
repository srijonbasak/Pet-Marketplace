import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const AdoptionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [petInfo, setPetInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading pet data
    setTimeout(() => {
      setPetInfo({
        name: 'Sample Pet',
        breed: 'Sample Breed',
        adoptionFee: 100
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Adoption form submitted! This is a placeholder function.');
    navigate('/my-adoptions');
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Link to={`/pets/${id}`} className="btn btn-outline-primary mb-4">
        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
        Back to Pet Details
      </Link>
      
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">
            <FontAwesomeIcon icon={faPaw} className="me-2" />
            Adoption Application
          </h2>
        </Card.Header>
        <Card.Body>
          <Alert variant="info" className="mb-4">
            <p className="mb-0">
              You're applying to adopt <strong>{petInfo.name}</strong> ({petInfo.breed}).
              The adoption fee is <strong>${petInfo.adoptionFee}</strong>.
            </p>
          </Alert>
          
          <Form onSubmit={handleSubmit}>
            <h4 className="mb-3">Personal Information</h4>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control type="text" placeholder="Enter your full name" required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control type="tel" placeholder="Enter your phone number" required />
                </Form.Group>
              </Col>
            </Row>
            
            <h4 className="mb-3">Living Situation</h4>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Housing Type</Form.Label>
                  <Form.Select required>
                    <option value="">Select your housing type</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Do you have a yard?</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      name="hasYard"
                      id="hasYard-yes"
                      label="Yes"
                      value="yes"
                    />
                    <Form.Check
                      inline
                      type="radio"
                      name="hasYard"
                      id="hasYard-no"
                      label="No"
                      value="no"
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-4">
              <Form.Label>Why do you want to adopt this pet?</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Tell us why you'd like to adopt this pet and what kind of home you can provide."
                required
              />
            </Form.Group>
            
            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" size="lg">
                Submit Application
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdoptionForm; 
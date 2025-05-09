import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const AdoptionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [petInfo, setPetInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    housingType: '',
    hasYard: '',
    reason: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchPet = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/pets/${id}`);
        setPetInfo({
          name: res.data.name,
          breed: res.data.breed,
          adoptionFee: res.data.adoptionFee
        });
      } catch (err) {
        setPetInfo(null);
      }
      setLoading(false);
    };
    fetchPet();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/adoptions', {
        petId: id,
        applicationDetails: {
          livingArrangement: form.housingType,
          hasYard: form.hasYard === 'yes',
          reasonForAdoption: form.reason,
          // Add more fields as needed
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Adoption application submitted!');
      setTimeout(() => navigate('/my-adoptions'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    }
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
              You're applying to adopt <strong>{petInfo?.name}</strong> ({petInfo?.breed}).
              The adoption fee is <strong>${petInfo?.adoptionFee}</strong>.
            </p>
          </Alert>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <h4 className="mb-3">Personal Information</h4>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control type="text" placeholder="Enter your full name" name="fullName" value={form.fullName} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control type="tel" placeholder="Enter your phone number" name="phone" value={form.phone} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>
            
            <h4 className="mb-3">Living Situation</h4>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Housing Type</Form.Label>
                  <Form.Select name="housingType" value={form.housingType} onChange={handleChange} required>
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
                      checked={form.hasYard === 'yes'}
                      onChange={handleChange}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      name="hasYard"
                      id="hasYard-no"
                      label="No"
                      value="no"
                      checked={form.hasYard === 'no'}
                      onChange={handleChange}
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
                name="reason"
                value={form.reason}
                onChange={handleChange}
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
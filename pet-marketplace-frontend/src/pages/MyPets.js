import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const MyPets = () => {
  const [adoptedPets, setAdoptedPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchAdoptedPets = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/adoptions?status=approved', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdoptedPets(res.data.adoptions || []);
      } catch (err) {
        setAdoptedPets([]);
      }
      setLoading(false);
    };
    fetchAdoptedPets();
  }, []);

  const renderStatusBadge = (status) => {
    let variant;
    switch (status) {
      case 'available':
        variant = 'success';
        break;
      case 'pending':
        variant = 'warning';
        break;
      case 'adopted':
        variant = 'info';
        break;
      default:
        variant = 'secondary';
    }
    return <Badge bg={variant}>{status}</Badge>;
  };

  const filteredPets = adoptedPets.filter(pet => 
    filterStatus === 'all' || pet.pet?.status === filterStatus
  );

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this pet listing?')) {
      setAdoptedPets(adoptedPets.filter(pet => pet.pet?._id !== id));
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <FontAwesomeIcon icon={faPaw} className="me-2 text-primary" />
          My Pets
        </h1>
        <Button as={Link} to="/add-pet" variant="primary">
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add New Pet
        </Button>
      </div>

      <div className="mb-4">
        <Form.Group as={Row} className="align-items-center">
          <Form.Label column sm={2} className="mb-0">
            Filter by Status:
          </Form.Label>
          <Col sm={4}>
            <Form.Select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Pets</option>
              <option value="available">Available</option>
              <option value="pending">Pending Adoption</option>
              <option value="adopted">Adopted</option>
            </Form.Select>
          </Col>
        </Form.Group>
      </div>

      {filteredPets.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredPets.map(adoption => (
            <Col key={adoption.pet?._id}>
              <Card className="h-100 shadow-sm">
                <div style={{ height: '200px', overflow: 'hidden' }}>
                  {adoption.pet?.images?.[0] && (
                    <Card.Img 
                      variant="top" 
                      src={adoption.pet.images[0]} 
                      alt={adoption.pet.name}
                      style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                    />
                  )}
                </div>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Card.Title>{adoption.pet?.name}</Card.Title>
                    {renderStatusBadge(adoption.pet?.status)}
                  </div>
                  <Card.Text>
                    <strong>Breed:</strong> {adoption.pet?.breed}<br />
                    <strong>Age:</strong> {adoption.pet?.age} {adoption.pet?.age === 1 ? 'year' : 'years'}<br />
                    <strong>Adoption Fee:</strong> ${adoption.pet?.adoptionFee}<br />
                    <strong>Applications:</strong> {adoption.pet?.applicationCount}
                  </Card.Text>
                  <div className="d-flex justify-content-between mt-3">
                    <Button 
                      as={Link} 
                      to={`/edit-pet/${adoption.pet?._id}`} 
                      variant="outline-primary" 
                      size="sm"
                    >
                      <FontAwesomeIcon icon={faEdit} className="me-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(adoption.pet?._id)}
                    >
                      <FontAwesomeIcon icon={faTrash} className="me-1" />
                      Remove
                    </Button>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white">
                  <Button 
                    as={Link} 
                    to={`/pet-applications/${adoption.pet?._id}`} 
                    variant="primary" 
                    className="w-100"
                  >
                    View Applications
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="shadow-sm text-center p-5">
          <Card.Body>
            <h3>You haven't listed any pets yet.</h3>
            <p className="text-muted mb-4">Start by adding a pet for adoption.</p>
            <Button as={Link} to="/add-pet" variant="primary" size="lg">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add Your First Pet
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default MyPets; 
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const MyPets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Simulate loading pets
    setTimeout(() => {
      setPets([
        {
          _id: 'pet1',
          name: 'Max',
          breed: 'Golden Retriever',
          age: 2,
          status: 'available',
          image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          adoptionFee: 200,
          applicationCount: 3
        },
        {
          _id: 'pet2',
          name: 'Luna',
          breed: 'Siamese Cat',
          age: 1,
          status: 'adopted',
          image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          adoptionFee: 150,
          applicationCount: 5
        },
        {
          _id: 'pet3',
          name: 'Buddy',
          breed: 'Labrador Mix',
          age: 3,
          status: 'pending',
          image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          adoptionFee: 180,
          applicationCount: 2
        }
      ]);
      setLoading(false);
    }, 1000);
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

  const filteredPets = pets.filter(pet => 
    filterStatus === 'all' || pet.status === filterStatus
  );

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this pet listing?')) {
      setPets(pets.filter(pet => pet._id !== id));
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
          {filteredPets.map(pet => (
            <Col key={pet._id}>
              <Card className="h-100 shadow-sm">
                <div style={{ height: '200px', overflow: 'hidden' }}>
                  <Card.Img 
                    variant="top" 
                    src={pet.image} 
                    alt={pet.name}
                    style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                  />
                </div>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Card.Title>{pet.name}</Card.Title>
                    {renderStatusBadge(pet.status)}
                  </div>
                  <Card.Text>
                    <strong>Breed:</strong> {pet.breed}<br />
                    <strong>Age:</strong> {pet.age} {pet.age === 1 ? 'year' : 'years'}<br />
                    <strong>Adoption Fee:</strong> ${pet.adoptionFee}<br />
                    <strong>Applications:</strong> {pet.applicationCount}
                  </Card.Text>
                  <div className="d-flex justify-content-between mt-3">
                    <Button 
                      as={Link} 
                      to={`/edit-pet/${pet._id}`} 
                      variant="outline-primary" 
                      size="sm"
                    >
                      <FontAwesomeIcon icon={faEdit} className="me-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(pet._id)}
                    >
                      <FontAwesomeIcon icon={faTrash} className="me-1" />
                      Remove
                    </Button>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white">
                  <Button 
                    as={Link} 
                    to={`/pet-applications/${pet._id}`} 
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
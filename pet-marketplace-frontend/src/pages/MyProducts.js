import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faPencilAlt, faTrashAlt, faPlus, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const MyProducts = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [petToEdit, setPetToEdit] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // This would normally fetch pet data from your backend API
    // For now, we'll use mock data
    setTimeout(() => {
      const petData = [
        {
          _id: 'pet1',
          name: 'Max',
          species: 'Dog',
          breed: 'Golden Retriever',
          age: 2,
          price: 800,
          description: 'Friendly and well-trained golden retriever looking for a loving home.',
          status: 'available',
          image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          createdAt: '2023-05-15'
        },
        {
          _id: 'pet2',
          name: 'Whiskers',
          species: 'Cat',
          breed: 'Persian',
          age: 1,
          price: 600,
          description: 'Beautiful Persian cat with a playful personality.',
          status: 'adopted',
          image: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          createdAt: '2023-06-20'
        },
        {
          _id: 'pet3',
          name: 'Buddy',
          species: 'Dog',
          breed: 'Beagle',
          age: 3,
          price: 700,
          description: 'Energetic beagle that loves to play and go for walks.',
          status: 'available',
          image: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          createdAt: '2023-07-10'
        }
      ];
      
      setPets(petData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDelete = (pet) => {
    setPetToDelete(pet);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    // This would normally send a delete request to your backend API
    // For now, we'll just update the local state
    setPets(pets.filter(pet => pet._id !== petToDelete._id));
    setShowDeleteModal(false);
    setMessage({ type: 'success', text: `${petToDelete.name} has been removed from your listings.` });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
  };

  const handleEdit = (pet) => {
    setPetToEdit(pet);
    setFormData({...pet}); // Copy pet data to form
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // This would normally send the updated data to your backend API
    // For now, we'll just update the local state
    setPets(pets.map(pet => pet._id === petToEdit._id ? {...formData} : pet));
    setShowEditModal(false);
    setMessage({ type: 'success', text: `${formData.name}'s information has been updated.` });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
  };

  const renderStatusBadge = (status) => {
    switch(status) {
      case 'available':
        return <Badge bg="success">Available</Badge>;
      case 'pending':
        return <Badge bg="warning">Pending Adoption</Badge>;
      case 'adopted':
        return <Badge bg="secondary">Adopted</Badge>;
      default:
        return <Badge bg="info">{status}</Badge>;
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
        <Button variant="primary">
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add New Pet
        </Button>
      </div>
      
      {message.text && (
        <Alert variant={message.type} className="mb-4">
          {message.text}
        </Alert>
      )}
      
      {pets.length === 0 ? (
        <Card className="text-center p-5 shadow-sm">
          <Card.Body>
            <h4 className="mb-3">You don't have any pets listed yet</h4>
            <p className="text-muted">Click the "Add New Pet" button to list your first pet for adoption.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {pets.map(pet => (
            <Col key={pet._id} lg={4} md={6} className="mb-4">
              <Card className="h-100 shadow-sm">
                <div style={{ 
                  height: '200px', 
                  backgroundImage: `url(${pet.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}></div>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title>{pet.name}</Card.Title>
                    {renderStatusBadge(pet.status)}
                  </div>
                  <Card.Text className="mb-1">
                    <strong>Species:</strong> {pet.species}
                  </Card.Text>
                  <Card.Text className="mb-1">
                    <strong>Breed:</strong> {pet.breed}
                  </Card.Text>
                  <Card.Text className="mb-1">
                    <strong>Age:</strong> {pet.age} {pet.age === 1 ? 'year' : 'years'}
                  </Card.Text>
                  <Card.Text className="mb-1">
                    <strong>Price:</strong> ${pet.price}
                  </Card.Text>
                  <Card.Text className="mb-3">
                    {pet.description.length > 100 
                      ? `${pet.description.substring(0, 100)}...` 
                      : pet.description
                    }
                  </Card.Text>
                  <div className="d-flex justify-content-between mt-auto">
                    <small className="text-muted">
                      Listed on {new Date(pet.createdAt).toLocaleDateString()}
                    </small>
                    <div>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleEdit(pet)}
                      >
                        <FontAwesomeIcon icon={faPencilAlt} />
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDelete(pet)}
                        disabled={pet.status === 'adopted'}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {petToDelete && (
            <p>Are you sure you want to remove <strong>{petToDelete.name}</strong> from your listings? This action cannot be undone.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Edit Pet Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Pet Information</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Pet Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status || ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="available">Available</option>
                    <option value="pending">Pending Adoption</option>
                    <option value="adopted">Adopted</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Species</Form.Label>
                  <Form.Control
                    type="text"
                    name="species"
                    value={formData.species || ''}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Breed</Form.Label>
                  <Form.Control
                    type="text"
                    name="breed"
                    value={formData.breed || ''}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Age (years)</Form.Label>
                  <Form.Control
                    type="number"
                    name="age"
                    value={formData.age || ''}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price || ''}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="text"
                name="image"
                value={formData.image || ''}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default MyProducts; 
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSave, faEdit } from '@fortawesome/free-solid-svg-icons';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // This would normally fetch user data from your backend API
    // For now, we'll use mock data
    setTimeout(() => {
      const userData = {
        _id: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        },
        bio: 'Animal lover with over 5 years of pet ownership experience. Looking to adopt a new furry friend!',
        joinedDate: '2023-01-15'
      };
      
      setUser(userData);
      setFormData(userData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // This would normally send the data to your backend API
    // For now, we'll just update the local state
    setUser(formData);
    setEditing(false);
    setSaveSuccess(true);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
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
      <h1 className="mb-4">
        <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
        My Profile
      </h1>
      
      {saveSuccess && (
        <Alert variant="success" className="mb-4">
          Your profile has been successfully updated!
        </Alert>
      )}
      
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-end mb-3">
            <Button 
              variant={editing ? "outline-secondary" : "outline-primary"}
              onClick={() => setEditing(!editing)}
            >
              <FontAwesomeIcon icon={editing ? faSave : faEdit} className="me-2" />
              {editing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-4">
                <h4 className="mb-3">Personal Information</h4>
                
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    disabled={true} // Email cannot be edited
                    required
                  />
                  {editing && (
                    <Form.Text className="text-muted">
                      Contact support to change your email address.
                    </Form.Text>
                  )}
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-4">
                <h4 className="mb-3">Address</h4>
                
                <Form.Group className="mb-3">
                  <Form.Label>Street Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address.street"
                    value={formData.address?.street || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    name="address.city"
                    value={formData.address?.city || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>State</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.state"
                        value={formData.address?.state || ''}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Zip Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.zipCode"
                        value={formData.address?.zipCode || ''}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            </Row>
            
            <Form.Group className="mb-4">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="bio"
                value={formData.bio || ''}
                onChange={handleInputChange}
                disabled={!editing}
                placeholder="Tell us about yourself and your experience with pets..."
              />
            </Form.Group>
            
            {editing && (
              <div className="d-grid gap-2">
                <Button variant="primary" type="submit">
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </Form>
          
          {!editing && (
            <div className="mt-3 text-muted text-end">
              <small>Member since {new Date(user.joinedDate).toLocaleDateString()}</small>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserProfile; 
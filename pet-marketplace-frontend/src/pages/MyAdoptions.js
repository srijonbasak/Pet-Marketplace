import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faEye } from '@fortawesome/free-solid-svg-icons';

const MyAdoptions = () => {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading adoptions
    setTimeout(() => {
      setAdoptions([
        {
          _id: 'adoption1',
          petId: 'pet1',
          petName: 'Max',
          petImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          providerName: 'Happy Paws Rescue',
          status: 'pending',
          submittedDate: '2023-08-15'
        },
        {
          _id: 'adoption2',
          petId: 'pet2',
          petName: 'Luna',
          petImage: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          providerName: 'Pet Haven',
          status: 'approved',
          submittedDate: '2023-07-20'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const renderStatusBadge = (status) => {
    let variant;
    switch (status) {
      case 'approved':
        variant = 'success';
        break;
      case 'pending':
        variant = 'warning';
        break;
      case 'rejected':
        variant = 'danger';
        break;
      default:
        variant = 'secondary';
    }
    return <Badge bg={variant}>{status}</Badge>;
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
          My Adoptions
        </h1>
        <Link to="/pets" className="btn btn-primary">
          Find More Pets
        </Link>
      </div>

      {adoptions.length > 0 ? (
        <Card className="shadow-sm">
          <Card.Body>
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>Pet</th>
                  <th>Rescue/Shelter</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adoptions.map(adoption => (
                  <tr key={adoption._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img 
                          src={adoption.petImage} 
                          alt={adoption.petName}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }}
                          className="me-2"
                        />
                        <Link to={`/pets/${adoption.petId}`}>
                          {adoption.petName}
                        </Link>
                      </div>
                    </td>
                    <td>{adoption.providerName}</td>
                    <td>{new Date(adoption.submittedDate).toLocaleDateString()}</td>
                    <td>{renderStatusBadge(adoption.status)}</td>
                    <td>
                      <Button 
                        as={Link} 
                        to={`/adoptions/${adoption._id}`} 
                        variant="outline-primary" 
                        size="sm"
                      >
                        <FontAwesomeIcon icon={faEye} className="me-1" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm text-center p-5">
          <Card.Body>
            <h3>You don't have any adoption applications yet.</h3>
            <p className="text-muted mb-4">Start your journey to pet adoption today!</p>
            <Button as={Link} to="/pets" variant="primary" size="lg">
              Browse Available Pets
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default MyAdoptions; 
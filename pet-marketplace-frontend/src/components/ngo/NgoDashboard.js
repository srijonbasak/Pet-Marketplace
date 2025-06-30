import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { default as api } from '../../services/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faPaw, 
  faUsers, 
  faHandHoldingHeart,
  faEdit,
  faTrash
} from '@fortawesome/free-solid-svg-icons';

const NgoDashboard = () => {
  // const navigate = useNavigate(); // Unused
  const [stats, setStats] = useState({
    totalPets: 0,
    availablePets: 0,
    adoptedPets: 0,
    pendingAdoptions: 0
  });
  const [recentPets, setRecentPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [statsRes, petsRes] = await Promise.all([
        api.get('/pets/stats', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/pets/ngo/recent', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setStats(statsRes.data);
      setRecentPets(petsRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
      console.log(err.response);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePet = async (petId) => {
    if (window.confirm('Are you sure you want to delete this pet?')) {
      try {
        await api.delete(`/pets/${petId}`);
        toast.success('Pet deleted successfully');
        fetchDashboardData();
      } catch (err) {
        toast.error('Failed to delete pet');
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>NGO Dashboard</h1>
          <p className="text-muted">Manage your rescue operations and pets</p>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            as={Link} 
            to="/ngo/add-pet"
            className="d-flex align-items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add New Pet
          </Button>
          <Button
            variant="warning"
            as={Link}
            to="/ngo/pending-adoptions"
            className="ms-2 d-flex align-items-center gap-2"
          >
            Pending Adoptions
          </Button>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FontAwesomeIcon icon={faPaw} size="2x" className="text-primary mb-3" />
              <h3>{stats.totalPets}</h3>
              <p className="text-muted mb-0">Total Pets</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FontAwesomeIcon icon={faPaw} size="2x" className="text-success mb-3" />
              <h3>{stats.availablePets}</h3>
              <p className="text-muted mb-0">Available Pets</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FontAwesomeIcon icon={faUsers} size="2x" className="text-info mb-3" />
              <h3>{stats.adoptedPets}</h3>
              <p className="text-muted mb-0">Adopted Pets</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FontAwesomeIcon icon={faHandHoldingHeart} size="2x" className="text-warning mb-3" />
              <h3>{stats.pendingAdoptions}</h3>
              <p className="text-muted mb-0">Pending Adoptions</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Pets Table */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Recent Pets</h5>
          <Button 
            variant="outline-primary" 
            size="sm" 
            as={Link} 
            to="/my-pets"
          >
            View All
          </Button>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Species</th>
                <th>Breed</th>
                <th>Age</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentPets.map(pet => (
                <tr key={pet._id}>
                  <td>{pet.name}</td>
                  <td>{pet.species}</td>
                  <td>{pet.breed}</td>
                  <td>{`${pet.age} ${pet.ageUnit}`}</td>
                  <td>
                    <Badge bg={
                      pet.status === 'available' ? 'success' :
                      pet.status === 'pending' ? 'warning' : 'info'
                    }>
                      {pet.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      as={Link}
                      to={`/pets/${pet._id}/edit`}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeletePet(pet._id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NgoDashboard; 
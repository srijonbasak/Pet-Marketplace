
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Carousel, Badge, Tabs, Tab, Alert } from 'react-bootstrap'; // All imported components are used
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faPaw, faMapMarkerAlt, faCalendarAlt, faVenusMars, faRulerVertical, faUser } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import PetAdoptionLottie from '../components/common/PetAdoptionLottie';
import './PetDetails.css';

const PetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [provider, setProvider] = useState(null);
  const [similarPets, setSimilarPets] = useState([]);

  useEffect(() => {
    const fetchPetDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/pets/${id}`);
        setPet(res.data);

        // Fetch provider/NGO info if needed
        let providerId = res.data.provider;
        if (providerId && typeof providerId === 'object') {
          providerId = providerId._id;
        }
        if (providerId) {
          const providerRes = await axios.get(`/api/users/${providerId}`);
          setProvider(providerRes.data);
        }

        // Fetch similar pets (optional: you can filter by breed/species)
        const similarRes = await axios.get('/api/pets', {
          params: {
            species: res.data.species,
            breed: res.data.breed,
            status: 'available',
            limit: 3
          }
        });
        setSimilarPets(similarRes.data.pets.filter(p => p._id !== id));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch pet details. Please try again later.');
        setLoading(false);
      }
    };

    fetchPetDetails();
  }, [id]);

  const handleAdoptClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/pets/${id}/adopt` } } });
    } else {
      navigate(`/pets/${id}/adopt`);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      // In a real app, you'd make an API call to toggle favorite status
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
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

  if (error || !pet) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || 'Pet not found. Please check the URL and try again.'}
        </Alert>
      </Container>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="pet-details-hero d-flex flex-column flex-md-row align-items-center justify-content-center text-center gap-4" style={{ marginBottom: '2.5rem' }}>
        <div className="pet-details-hero-content w-100" style={{ maxWidth: 600 }}>
          <motion.h1 className="pet-details-hero-title" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, type: 'spring' }}>
            Meet {pet.name}
          </motion.h1>
          <motion.p className="pet-details-hero-subtitle" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}>
            {pet.breed} • {pet.age} {pet.ageUnit} old • {pet.gender === 'male' ? 'Male' : 'Female'}
          </motion.p>
        </div>
        <motion.div className="pet-details-hero-lottie d-flex justify-content-center align-items-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, type: 'spring' }}>
          <PetAdoptionLottie style={{ width: 320, height: 320, minWidth: 220, maxWidth: 400, background: 'none' }} />
        </motion.div>
      </div>

      <Container className="py-4">
        <Row>
          <Col lg={7} className="mb-4">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, type: 'spring' }}>
              <Carousel interval={null} className="shadow-sm rounded overflow-hidden">
                {pet.images?.map((image, index) => (
                  <Carousel.Item key={index}>
                <img
                  className="d-block w-100 pet-details-img"
                  src={image}
                  alt={`${pet.name}`}
                  style={{ height: '420px', objectFit: 'cover' }}
                />
                  </Carousel.Item>
                ))}
              </Carousel>
            </motion.div>
          </Col>
          <Col lg={5}>
            <motion.div className="pet-details-card mb-4 p-4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, type: 'spring' }}>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="mb-1 fw-bold">{pet.name}</h2>
                  <p className="text-muted mb-2">
                    {pet.breed} • {pet.age} {pet.ageUnit} old
                  </p>
                </div>
                <Button 
                  variant={isFavorite ? 'danger' : 'outline-danger'} 
                  onClick={toggleFavorite}
                  size="sm"
                  className="pet-details-btn"
                >
                  <FontAwesomeIcon icon={faHeart} />
                </Button>
              </div>
              <div className="mb-3">
                <Badge bg={pet.status === 'available' ? 'success' : pet.status === 'pending' ? 'warning' : 'danger'} className="me-2">
                  {pet.status === 'available' ? 'Available' : pet.status === 'pending' ? 'Pending' : 'Adopted'}
                </Badge>
                {pet.vaccinated && (
                  <Badge bg="info" className="me-2">Vaccinated</Badge>
                )}
                {pet.neutered && (
                  <Badge bg="info" className="me-2">Neutered/Spayed</Badge>
                )}
                {pet.microchipped && (
                  <Badge bg="info">Microchipped</Badge>
                )}
              </div>
              <Row className="mb-3">
                <Col xs={6} className="mb-2">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary me-2" />
                    <span>
                      {pet.location?.city && pet.location?.state
                        ? `${pet.location.city}, ${pet.location.state}`
                        : 'Location not specified'}
                    </span>
                  </div>
                </Col>
                <Col xs={6} className="mb-2">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-primary me-2" />
                    <span>{pet.age} {pet.ageUnit}</span>
                  </div>
                </Col>
                <Col xs={6} className="mb-2">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faVenusMars} className="text-primary me-2" />
                    <span>{pet.gender === 'male' ? 'Male' : 'Female'}</span>
                  </div>
                </Col>
                <Col xs={6} className="mb-2">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faRulerVertical} className="text-primary me-2" />
                    <span>{pet.size.charAt(0).toUpperCase() + pet.size.slice(1)}</span>
                  </div>
                </Col>
              </Row>
              <hr />
              <div className="mb-3">
                <h5>Good with</h5>
                <div>
                  {pet.goodWith?.map((item, index) => (
                    <Badge bg="light" text="dark" className="me-2 mb-2" key={index}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h3 className="text-primary mb-0">${pet.adoptionFee}</h3>
                  <small className="text-muted">Adoption Fee</small>
                </div>
                <Button 
                  className="pet-details-btn"
                  size="lg"
                  onClick={handleAdoptClick}
                  disabled={pet.status !== 'available'}
                >
                  <FontAwesomeIcon icon={faPaw} className="me-2" />
                  Adopt Me
                </Button>
              </div>
              {pet.status !== 'available' && (
                <Alert variant="warning">
                  This pet is currently not available for adoption.
                </Alert>
              )}
            </motion.div>
            <motion.div className="pet-details-card mb-4 p-4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}>
              <div className="d-flex align-items-center mb-3">
                <FontAwesomeIcon icon={faUser} className="text-primary me-2" size="lg" />
                <div>
                  <h5 className="mb-0">{provider?.name}</h5>
                  <small className="text-muted">{provider?.type === 'ngo' ? 'Rescue Organization' : 'Pet Seller'}</small>
                </div>
              </div>
              <div className="mb-3">
                <p className="mb-1">
                  <strong>Email:</strong> {provider?.email}
                </p>
                <p className="mb-1">
                  <strong>Phone:</strong> {provider?.phone}
                </p>
                {provider?.website && (
                  <p className="mb-0">
                    <strong>Website:</strong>{' '}
                    <a href={provider.website} target="_blank" rel="noopener noreferrer">
                      {provider.website}
                    </a>
                  </p>
                )}
              </div>
              <div className="d-grid">
                <Link to={`/providers/${provider?._id}`} className="btn btn-outline-primary">
                  View Profile
                </Link>
              </div>
            </motion.div>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <Tabs defaultActiveKey="description" className="mb-4">
              <Tab eventKey="description" title="Description">
                <motion.div className="pet-details-card mb-3 p-4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: 'spring' }}>
                  <h4 className="mb-3">About {pet.name}</h4>
                  <p className="mb-0">{pet.description}</p>
                </motion.div>
              </Tab>
              <Tab eventKey="details" title="Pet Details">
                <motion.div className="pet-details-card mb-3 p-4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}>
                  <Row>
                    <Col md={6}>
                      <h5 className="mb-3">Physical Characteristics</h5>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <strong>Breed:</strong> {pet.breed}
                        </li>
                        <li className="mb-2">
                          <strong>Color:</strong> {pet.color}
                        </li>
                        <li className="mb-2">
                          <strong>Size:</strong> {pet.size.charAt(0).toUpperCase() + pet.size.slice(1)}
                        </li>
                        <li className="mb-2">
                          <strong>Gender:</strong> {pet.gender === 'male' ? 'Male' : 'Female'}
                        </li>
                        <li>
                          <strong>Age:</strong> {pet.age} {pet.ageUnit}
                        </li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <h5 className="mb-3">Personality & Health</h5>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <strong>Activity Level:</strong> {pet.activity}
                        </li>
                        <li className="mb-2">
                          <strong>Vaccinated:</strong> {pet.vaccinated ? 'Yes' : 'No'}
                        </li>
                        <li className="mb-2">
                          <strong>Neutered/Spayed:</strong> {pet.neutered ? 'Yes' : 'No'}
                        </li>
                        <li className="mb-2">
                          <strong>Microchipped:</strong> {pet.microchipped ? 'Yes' : 'No'}
                        </li>
                        <li>
                          <strong>Special Needs:</strong> {pet.specialNeeds ? 'Yes' : 'No'}
                        </li>
                      </ul>
                    </Col>
                  </Row>
                </motion.div>
              </Tab>
              <Tab eventKey="adoption" title="Adoption Process">
                <motion.div className="pet-details-card mb-3 p-4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}>
                  <h4 className="mb-3">Adoption Process</h4>
                  <p>
                    Our adoption process is designed to make sure our pets go to loving, suitable homes.
                    Here's what to expect:
                  </p>
                  <ol className="mb-4">
                    <li className="mb-2">Submit an adoption application through our website</li>
                    <li className="mb-2">Our team will review your application</li>
                    <li className="mb-2">If approved, we'll schedule a meet-and-greet with the pet</li>
                    <li className="mb-2">Complete the adoption paperwork and pay the adoption fee</li>
                    <li>Welcome your new family member home!</li>
                  </ol>
                  <div className="d-grid">
                    <Button 
                      className="pet-details-btn"
                      onClick={handleAdoptClick}
                      disabled={pet.status !== 'available'}
                    >
                      Start Adoption Process
                    </Button>
                  </div>
                </motion.div>
              </Tab>
            </Tabs>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <h3 className="mb-4">Similar Pets</h3>
            <Row xs={1} md={2} lg={4} className="g-4">
              {similarPets.map(similarPet => (
                <Col key={similarPet._id}>
                  <motion.div className="h-100 similar-pet-card" whileHover={{ scale: 1.04, boxShadow: '0 6px 24px 0 rgba(80,180,80,0.18)' }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: 'spring' }}>
                    <Card.Img 
                      variant="top" 
                      src={similarPet.images && similarPet.images.length > 0 ? similarPet.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'} 
                      alt={similarPet.name}
                      className="similar-pet-card-img"
                    />
                    <Card.Body>
                      <Card.Title>{similarPet.name}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        {similarPet.breed} • {similarPet.age} {similarPet.ageUnit} • {similarPet.gender}
                      </Card.Subtitle>
                    </Card.Body>
                    <Card.Footer className="bg-white">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-primary">${similarPet.adoptionFee}</span>
                        <Link to={`/pets/${similarPet._id}`} className="btn btn-sm pet-details-btn">
                          View Details
                        </Link>
                      </div>
                    </Card.Footer>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PetDetails;
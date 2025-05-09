import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSearch, faSortAmountDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const PetListing = () => {
  // State for pets data
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // State for filters
  const [filters, setFilters] = useState({
    species: '',
    breed: '',
    ageMin: '',
    ageMax: '',
    gender: '',
    size: '',
    adoptionFeeMin: '',
    adoptionFeeMax: ''
  });
  
  // State for filter visibility on mobile
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);

        // Build query params from filters
        const params = {
          status: 'available',
          page: currentPage,
          limit: 9,
        };
        if (filters.species) params.species = filters.species;
        if (filters.breed) params.breed = filters.breed;
        if (filters.gender) params.gender = filters.gender;
        if (filters.size) params.size = filters.size;
        // Add more filters as needed

        const res = await axios.get('/api/pets', { params });
        setPets(res.data.pets);
        setTotalPages(res.data.pagination.pages);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch pets. Please try again later.');
        setLoading(false);
      }
    };

    fetchPets();
  }, [currentPage, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterReset = () => {
    setFilters({
      species: '',
      breed: '',
      ageMin: '',
      ageMax: '',
      gender: '',
      size: '',
      adoptionFeeMin: '',
      adoptionFeeMax: ''
    });
    setCurrentPage(1);
  };

  return (
    <Container className="py-4">
      <Row>
        <Col md={12} className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <h1>Pets for Adoption</h1>
            <Button 
              variant="outline-primary" 
              className="d-md-none"
              onClick={handleFilterToggle}
            >
              <FontAwesomeIcon icon={faFilter} className="me-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Filters */}
        <Col md={3} className={`mb-4 ${showFilters ? 'd-block' : 'd-none d-md-block'}`}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <FontAwesomeIcon icon={faFilter} className="me-2" />
              Filters
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Pet Type</Form.Label>
                  <Form.Select 
                    name="species" 
                    value={filters.species}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Types</option>
                    <option value="dog">Dogs</option>
                    <option value="cat">Cats</option>
                    <option value="bird">Birds</option>
                    <option value="small_animal">Small Animals</option>
                    <option value="reptile">Reptiles</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Breed</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Any breed"
                    name="breed"
                    value={filters.breed}
                    onChange={handleFilterChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Age (Years)</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control 
                        type="number" 
                        min="0"
                        placeholder="Min"
                        name="ageMin"
                        value={filters.ageMin}
                        onChange={handleFilterChange}
                      />
                    </Col>
                    <Col>
                      <Form.Control 
                        type="number" 
                        min="0"
                        placeholder="Max"
                        name="ageMax"
                        value={filters.ageMax}
                        onChange={handleFilterChange}
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select 
                    name="gender" 
                    value={filters.gender}
                    onChange={handleFilterChange}
                  >
                    <option value="">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Size</Form.Label>
                  <Form.Select 
                    name="size" 
                    value={filters.size}
                    onChange={handleFilterChange}
                  >
                    <option value="">Any</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra_large">Extra Large</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Adoption Fee ($)</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control 
                        type="number" 
                        min="0"
                        placeholder="Min"
                        name="adoptionFeeMin"
                        value={filters.adoptionFeeMin}
                        onChange={handleFilterChange}
                      />
                    </Col>
                    <Col>
                      <Form.Control 
                        type="number" 
                        min="0"
                        placeholder="Max"
                        name="adoptionFeeMax"
                        value={filters.adoptionFeeMax}
                        onChange={handleFilterChange}
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    type="button"
                    onClick={() => setCurrentPage(1)}
                  >
                    <FontAwesomeIcon icon={faSearch} className="me-2" />
                    Apply Filters
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    type="button"
                    onClick={handleFilterReset}
                  >
                    Reset Filters
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Pets Grid */}
        <Col md={9}>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : (
            <>
              <Row className="mb-3">
                <Col xs={12}>
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="mb-0 text-muted">Showing {pets.length} pets</p>
                    <Form.Select className="w-auto">
                      <option>Sort by: Recent</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Age: Young to Old</option>
                      <option>Age: Old to Young</option>
                    </Form.Select>
                  </div>
                </Col>
              </Row>

              <Row xs={1} md={2} lg={3} className="g-4">
                {pets.map(pet => (
                  <Col key={pet._id}>
                    <Card className="h-100 shadow-sm pet-card">
                      <Card.Img 
                        variant="top" 
                        src={pet.images && pet.images.length > 0 ? pet.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'} 
                        alt={pet.name}
                        className="pet-card-img"
                      />
                      <Card.Body>
                        <Card.Title>{pet.name}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">
                          {pet.breed} • {pet.age} {pet.ageUnit} • {pet.gender}
                        </Card.Subtitle>
                        <Card.Text>{pet.description.substring(0, 80)}...</Card.Text>
                        <div className="d-flex mb-2">
                          {pet.vaccinated && (
                            <span className="badge bg-success me-2">Vaccinated</span>
                          )}
                          {pet.neutered && (
                            <span className="badge bg-info">Neutered/Spayed</span>
                          )}
                        </div>
                      </Card.Body>
                      <Card.Footer className="bg-white">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold text-primary">${pet.adoptionFee}</span>
                          <Link to={`/pets/${pet._id}`} className="btn btn-sm btn-primary">
                            View Details
                          </Link>
                        </div>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.Prev 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  />
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={index + 1 === currentPage}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}
                  
                  <Pagination.Next 
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  />
                </Pagination>
              </div>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default PetListing; 
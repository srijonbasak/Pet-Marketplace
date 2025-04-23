import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPaw, 
  faShoppingCart, 
  faHandHoldingHeart, 
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const Home = () => {
  const [featuredPets, setFeaturedPets] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        // In a real application, you would fetch actual data from your API
        // Here we'll just mock the data
        
        // Simulate API delay
        setTimeout(() => {
          setFeaturedPets([
            {
              _id: '1',
              name: 'Max',
              species: 'dog',
              breed: 'Golden Retriever',
              age: 2,
              ageUnit: 'years',
              gender: 'male',
              description: 'Friendly and playful Golden Retriever looking for a loving home.',
              imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
              adoptionFee: 150
            },
            {
              _id: '2',
              name: 'Luna',
              species: 'cat',
              breed: 'Siamese',
              age: 1,
              ageUnit: 'years',
              gender: 'female',
              description: 'Playful Siamese cat that loves attention and cuddles.',
              imageUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
              adoptionFee: 100
            },
            {
              _id: '3',
              name: 'Charlie',
              species: 'dog',
              breed: 'Beagle',
              age: 1,
              ageUnit: 'years',
              gender: 'male',
              description: 'Energetic Beagle puppy that loves to play fetch and go for walks.',
              imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
              adoptionFee: 120
            }
          ]);

          setFeaturedProducts([
            {
              _id: '1',
              name: 'Premium Dog Food',
              category: 'Food',
              price: 29.99,
              imageUrl: 'https://images.unsplash.com/photo-1589924691822-701767b1d837?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
            },
            {
              _id: '2',
              name: 'Cat Scratching Post',
              category: 'Accessories',
              price: 39.99,
              imageUrl: 'https://images.unsplash.com/photo-1585071550721-fdb362ae2b8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
            },
            {
              _id: '3',
              name: 'Pet Grooming Kit',
              category: 'Grooming',
              price: 24.99,
              imageUrl: 'https://images.unsplash.com/photo-1607077927180-6411c628183f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
            }
          ]);
          
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching featured items:', err);
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section mb-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="text-center text-lg-start">
              <h1 className="display-4 fw-bold mb-4">Find Your Perfect Pet Companion</h1>
              <p className="lead mb-4">
                Connecting pet lovers with their perfect companions and providing
                quality products for all your pet needs.
              </p>
              <div className="d-grid gap-2 d-md-flex">
                <Link to="/pets" className="btn btn-primary btn-lg me-md-2">
                  <FontAwesomeIcon icon={faPaw} className="me-2" />
                  Adopt a Pet
                </Link>
                <Link to="/products" className="btn btn-outline-light btn-lg">
                  <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                  Shop Products
                </Link>
              </div>
            </Col>
            <Col lg={6} className="d-none d-lg-block">
              {/* You can add an image here if you'd like */}
            </Col>
          </Row>
        </Container>
      </div>

      {/* Services Section */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5">Our Services</h2>
          <Row>
            <Col md={4} className="mb-4 mb-md-0">
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                  <FontAwesomeIcon icon={faPaw} size="2x" />
                </div>
                <h4>Pet Adoption</h4>
                <p className="text-muted">
                  Find your perfect companion from our wide selection of pets available for adoption.
                </p>
                <Link to="/pets" className="btn btn-outline-primary">
                  Find Pets
                </Link>
              </div>
            </Col>
            <Col md={4} className="mb-4 mb-md-0">
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                  <FontAwesomeIcon icon={faShoppingCart} size="2x" />
                </div>
                <h4>Pet Products</h4>
                <p className="text-muted">
                  Shop high-quality pet products, from food and toys to accessories and more.
                </p>
                <Link to="/products" className="btn btn-outline-primary">
                  Browse Products
                </Link>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                  <FontAwesomeIcon icon={faHandHoldingHeart} size="2x" />
                </div>
                <h4>Rescue Operations</h4>
                <p className="text-muted">
                  Support our rescue operations or get help for animals in need.
                </p>
                <Link to="/rescues" className="btn btn-outline-primary">
                  Learn More
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Featured Pets Section */}
      <section className="py-5">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Featured Pets</h2>
            <Link to="/pets" className="btn btn-outline-primary">
              <FontAwesomeIcon icon={faSearch} className="me-2" />
              See All Pets
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Row>
              {featuredPets.map(pet => (
                <Col key={pet._id} md={6} lg={4} className="mb-4">
                  <Card className="h-100 shadow-sm pet-card">
                    <Card.Img 
                      variant="top" 
                      src={pet.imageUrl} 
                      alt={pet.name}
                      className="pet-card-img"
                    />
                    <Card.Body>
                      <Card.Title>{pet.name}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        {pet.breed} • {pet.age} {pet.ageUnit} • {pet.gender}
                      </Card.Subtitle>
                      <Card.Text>{pet.description.substring(0, 100)}...</Card.Text>
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
          )}
        </Container>
      </section>

      {/* Featured Products Section */}
      <section className="py-5 bg-light">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Featured Products</h2>
            <Link to="/products" className="btn btn-outline-primary">
              <FontAwesomeIcon icon={faSearch} className="me-2" />
              See All Products
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Row>
              {featuredProducts.map(product => (
                <Col key={product._id} md={6} lg={4} className="mb-4">
                  <Card className="h-100 shadow-sm pet-card">
                    <Card.Img 
                      variant="top" 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="pet-card-img"
                    />
                    <Card.Body>
                      <Card.Title>{product.name}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        {product.category}
                      </Card.Subtitle>
                    </Card.Body>
                    <Card.Footer className="bg-white">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-primary">${product.price.toFixed(2)}</span>
                        <Link to={`/products/${product._id}`} className="btn btn-sm btn-primary">
                          View Details
                        </Link>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* Call to Action */}
      <section className="py-5 bg-primary text-white text-center">
        <Container>
          <h2 className="mb-4">Ready to give a pet a forever home?</h2>
          <p className="lead mb-4">
            Thousands of pets are looking for their forever homes. Start your adoption journey today.
          </p>
          <Link to="/pets" className="btn btn-light btn-lg">
            <FontAwesomeIcon icon={faPaw} className="me-2" />
            Start Adoption
          </Link>
        </Container>
      </section>
    </>
  );
};

export default Home; 
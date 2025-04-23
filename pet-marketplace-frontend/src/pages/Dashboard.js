import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPaw, 
  faShoppingCart, 
  faClipboardList, 
  faUser, 
  faPlus,
  faHeart,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [adoptions, setAdoptions] = useState([]);
  const [pets, setPets] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, these would be API calls
        setTimeout(() => {
          // Mock adoptions data
          setAdoptions([
            {
              _id: 'adoption1',
              petId: 'pet1',
              petName: 'Max',
              petImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
              providerId: 'provider1',
              providerName: 'Happy Paws Rescue',
              status: 'pending',
              date: '2023-08-15',
              applicationDetails: {}
            },
            {
              _id: 'adoption2',
              petId: 'pet2',
              petName: 'Luna',
              petImage: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
              providerId: 'provider2',
              providerName: 'Pet Haven',
              status: 'approved',
              date: '2023-07-20',
              applicationDetails: {}
            }
          ]);

          // Show pets data for sellers and NGOs
          if (['seller', 'ngo', 'admin'].includes(currentUser?.role)) {
            setPets([
              {
                _id: 'pet3',
                name: 'Rocky',
                imageUrl: 'https://images.unsplash.com/photo-1589941013454-ec7d8b3b3f10?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
                status: 'available',
                species: 'dog',
                breed: 'German Shepherd',
                createdAt: '2023-07-10',
                adoptionFee: 180
              },
              {
                _id: 'pet4',
                name: 'Oliver',
                imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
                status: 'pending',
                species: 'cat',
                breed: 'Tabby',
                createdAt: '2023-07-15',
                adoptionFee: 90
              }
            ]);
          }

          // Show products data for sellers
          if (['seller', 'admin'].includes(currentUser?.role)) {
            setProducts([
              {
                _id: 'product1',
                name: 'Premium Dog Food',
                imageUrl: 'https://images.unsplash.com/photo-1589924691822-701767b1d837?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
                price: 29.99,
                stock: 50,
                category: 'Food',
                createdAt: '2023-07-05'
              },
              {
                _id: 'product2',
                name: 'Cat Scratching Post',
                imageUrl: 'https://images.unsplash.com/photo-1585071550721-fdb362ae2b8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
                price: 39.99,
                stock: 15,
                category: 'Accessories',
                createdAt: '2023-07-12'
              }
            ]);
          }

          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const renderStatusBadge = (status) => {
    let variant;
    switch (status) {
      case 'available':
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
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Dashboard</h1>
          <p className="text-muted">
            Welcome back, {currentUser?.username}! 
            {currentUser?.role === 'buyer' && ' Here you can track your adoption applications.'}
            {currentUser?.role === 'seller' && ' Here you can manage your pets and products.'}
            {currentUser?.role === 'ngo' && ' Here you can manage your pets and rescue operations.'}
            {currentUser?.role === 'admin' && ' Here you can manage the platform.'}
          </p>
        </Col>
      </Row>

      {/* My Adoptions Section */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faPaw} className="me-2 text-primary" />
                  My Adoptions
                </h5>
                <Link to="/my-adoptions" className="btn btn-sm btn-outline-primary">
                  View All
                </Link>
              </div>
            </Card.Header>
            <Card.Body>
              {adoptions.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Pet</th>
                      <th>Provider</th>
                      <th>Date</th>
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
                        <td>{new Date(adoption.date).toLocaleDateString()}</td>
                        <td>{renderStatusBadge(adoption.status)}</td>
                        <td>
                          <Link to={`/adoptions/${adoption._id}`} className="btn btn-sm btn-primary">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p className="mb-3">You don't have any adoption applications yet.</p>
                  <Link to="/pets" className="btn btn-primary">
                    Find a Pet to Adopt
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* My Pets Section (for sellers and NGOs) */}
      {['seller', 'ngo', 'admin'].includes(currentUser?.role) && (
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faPaw} className="me-2 text-primary" />
                    My Pets
                  </h5>
                  <div>
                    <Link to="/my-pets" className="btn btn-sm btn-outline-primary me-2">
                      View All
                    </Link>
                    <Link to="/pets/new" className="btn btn-sm btn-primary">
                      <FontAwesomeIcon icon={faPlus} className="me-1" />
                      Add Pet
                    </Link>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                {pets.length > 0 ? (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Pet</th>
                        <th>Species</th>
                        <th>Breed</th>
                        <th>Date Added</th>
                        <th>Status</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pets.map(pet => (
                        <tr key={pet._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img 
                                src={pet.imageUrl} 
                                alt={pet.name}
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }}
                                className="me-2"
                              />
                              <Link to={`/pets/${pet._id}`}>
                                {pet.name}
                              </Link>
                            </div>
                          </td>
                          <td>{pet.species}</td>
                          <td>{pet.breed}</td>
                          <td>{new Date(pet.createdAt).toLocaleDateString()}</td>
                          <td>{renderStatusBadge(pet.status)}</td>
                          <td>${pet.adoptionFee}</td>
                          <td>
                            <Link to={`/pets/${pet._id}/edit`} className="btn btn-sm btn-primary me-2">
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-4">
                    <p className="mb-3">You haven't added any pets yet.</p>
                    <Link to="/pets/new" className="btn btn-primary">
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Add Your First Pet
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* My Products Section (for sellers) */}
      {['seller', 'admin'].includes(currentUser?.role) && (
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faShoppingCart} className="me-2 text-primary" />
                    My Products
                  </h5>
                  <div>
                    <Link to="/my-products" className="btn btn-sm btn-outline-primary me-2">
                      View All
                    </Link>
                    <Link to="/products/new" className="btn btn-sm btn-primary">
                      <FontAwesomeIcon icon={faPlus} className="me-1" />
                      Add Product
                    </Link>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                {products.length > 0 ? (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Date Added</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img 
                                src={product.imageUrl} 
                                alt={product.name}
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                className="me-2"
                              />
                              <Link to={`/products/${product._id}`}>
                                {product.name}
                              </Link>
                            </div>
                          </td>
                          <td>{product.category}</td>
                          <td>{product.stock}</td>
                          <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                          <td>${product.price.toFixed(2)}</td>
                          <td>
                            <Link to={`/products/${product._id}/edit`} className="btn btn-sm btn-primary me-2">
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-4">
                    <p className="mb-3">You haven't added any products yet.</p>
                    <Link to="/products/new" className="btn btn-primary">
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Add Your First Product
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Profile Summary */}
      <Row>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                Profile Summary
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col sm={4} className="mb-3 mb-sm-0">
                  <div className="text-center">
                    <div className="bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                      <FontAwesomeIcon icon={faUser} size="2x" className="text-primary" />
                    </div>
                    <Link to="/profile" className="btn btn-sm btn-outline-primary d-block">
                      Edit Profile
                    </Link>
                  </div>
                </Col>
                <Col sm={8}>
                  <p className="mb-2">
                    <strong>Username:</strong> {currentUser?.username}
                  </p>
                  <p className="mb-2">
                    <strong>Email:</strong> {currentUser?.email}
                  </p>
                  <p className="mb-2">
                    <strong>Role:</strong> {currentUser?.role === 'buyer' ? 'Pet Adopter' : 
                      currentUser?.role === 'seller' ? 'Pet Seller' :
                      currentUser?.role === 'ngo' ? 'Rescue Organization' : 'Admin'}
                  </p>
                  <p className="mb-0">
                    <strong>Member Since:</strong> {new Date(currentUser?.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Links */}
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faClipboardList} className="me-2 text-primary" />
                Quick Links
              </h5>
            </Card.Header>
            <Card.Body>
              <Row xs={1} sm={2} className="g-3">
                <Col>
                  <div className="d-grid">
                    <Link to="/pets" className="btn btn-outline-primary">
                      <FontAwesomeIcon icon={faPaw} className="me-2" />
                      Browse Pets
                    </Link>
                  </div>
                </Col>
                <Col>
                  <div className="d-grid">
                    <Link to="/products" className="btn btn-outline-primary">
                      <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                      Browse Products
                    </Link>
                  </div>
                </Col>
                {currentUser?.role === 'buyer' && (
                  <Col>
                    <div className="d-grid">
                      <Link to="/my-favorites" className="btn btn-outline-primary">
                        <FontAwesomeIcon icon={faHeart} className="me-2" />
                        My Favorites
                      </Link>
                    </div>
                  </Col>
                )}
                {['seller', 'ngo'].includes(currentUser?.role) && (
                  <Col>
                    <div className="d-grid">
                      <Link to="/my-applications" className="btn btn-outline-primary">
                        <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                        View Applications
                      </Link>
                    </div>
                  </Col>
                )}
                {currentUser?.role === 'ngo' && (
                  <Col>
                    <div className="d-grid">
                      <Link to="/rescues/new" className="btn btn-outline-primary">
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        New Rescue
                      </Link>
                    </div>
                  </Col>
                )}
                {currentUser?.role === 'admin' && (
                  <Col>
                    <div className="d-grid">
                      <Link to="/admin/users" className="btn btn-outline-primary">
                        <FontAwesomeIcon icon={faUsers} className="me-2" />
                        Manage Users
                      </Link>
                    </div>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 
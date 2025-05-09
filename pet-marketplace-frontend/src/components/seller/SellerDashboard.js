import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SellerDashboard = () => {
  const [sellerData, setSellerData] = useState(null);
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [pets, setPets] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        // Fetch seller profile
        const profileRes = await axios.get('/api/users/me', config);
        setSellerData(profileRes.data);

        // Fetch seller's shop
        try {
          const shopRes = await axios.get('/api/shops/my-shop', config);
          setShop(shopRes.data);
        } catch (err) {
          if (err.response?.status !== 404) {
            setError('Error fetching shop data');
          }
        }

        // Fetch seller's products
        const productsRes = await axios.get('/api/products/seller', config);
        setProducts(productsRes.data);

        // Fetch seller's pets
        const petsRes = await axios.get('/api/pets/seller', config);
        setPets(petsRes.data);
      } catch (error) {
        console.error('Error fetching seller data:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchSellerData();
  }, [navigate]);

  const handleAddProduct = () => {
    navigate('/seller/add-product');
  };

  const handleAddPet = () => {
    navigate('/seller/add-pet');
  };

  const handleCreateShop = () => {
    navigate('/seller/create-shop');
  };

  const handleEditShop = () => {
    navigate('/seller/edit-shop');
  };

  if (!sellerData) {
    return <div>Loading...</div>;
  }

  return (
    <Container className="py-4">
      {/* User Role and Profile Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>Seller Dashboard</h1>
              <p className="mb-0">Welcome back, {sellerData.firstName}!</p>
            </div>
            <Badge bg="primary" className="fs-6 px-3 py-2">
              {sellerData.role.toUpperCase()}
            </Badge>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Shop Section */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title className="mb-0">My Shop</Card.Title>
                {!shop && (
                  <Button variant="success" onClick={handleCreateShop}>
                    <i className="fas fa-plus me-2"></i>
                    Create New Shop
                  </Button>
                )}
              </div>
              
              {shop ? (
                <>
                  <Row className="mb-3">
                    <Col md={8}>
                      <h4>{shop.name}</h4>
                      <p>{shop.description}</p>
                      <p>
                        <strong>Address:</strong> {shop.address.street}, {shop.address.city}, {shop.address.state} {shop.address.zipCode}
                      </p>
                      <p>
                        <strong>Contact:</strong> {shop.contactInfo.phone} | {shop.contactInfo.email}
                      </p>
                    </Col>
                    <Col md={4} className="text-end">
                      <Button variant="primary" onClick={handleEditShop}>
                        <i className="fas fa-edit me-2"></i>
                        Edit Shop
                      </Button>
                    </Col>
                  </Row>
                </>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-store fa-3x mb-3 text-muted"></i>
                  <h4>No Shop Created Yet</h4>
                  <p className="text-muted mb-4">Create your shop to start selling products and pets</p>
                  <Button variant="success" size="lg" onClick={handleCreateShop}>
                    <i className="fas fa-plus me-2"></i>
                    Create Your Shop
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Products and Pets Section */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title className="mb-0">Products</Card.Title>
                <Button variant="primary" onClick={handleAddProduct}>
                  <i className="fas fa-plus me-2"></i>
                  Add Product
                </Button>
              </div>
              {products.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td>{product.name}</td>
                        <td>${product.price}</td>
                        <td>{product.stock}</td>
                        <td>
                          <Button variant="info" size="sm" className="me-2">
                            <i className="fas fa-edit me-1"></i>
                            Edit
                          </Button>
                          <Button variant="danger" size="sm">
                            <i className="fas fa-trash me-1"></i>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No products added yet</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title className="mb-0">Pets</Card.Title>
                <Button variant="primary" onClick={handleAddPet}>
                  <i className="fas fa-plus me-2"></i>
                  Add Pet
                </Button>
              </div>
              {pets.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pets.map((pet) => (
                      <tr key={pet._id}>
                        <td>{pet.name}</td>
                        <td>{pet.type}</td>
                        <td>{pet.status}</td>
                        <td>
                          <Button variant="info" size="sm" className="me-2">
                            <i className="fas fa-edit me-1"></i>
                            Edit
                          </Button>
                          <Button variant="danger" size="sm">
                            <i className="fas fa-trash me-1"></i>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No pets added yet</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SellerDashboard; 
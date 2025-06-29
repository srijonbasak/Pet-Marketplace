import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmployeeAddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'food',
    buyPrice: '',
    price: '',
    stock: '',
    image: ''
  });
  const [employeeData, setEmployeeData] = useState(null);
  const [shop, setShop] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeAndShopData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Get employee data to verify permissions
        const employeeRes = await axios.get('/api/employees/me', config);
        console.log('Employee data:', employeeRes.data);
        
        if (!employeeRes.data.permissions?.canAddProducts) {
          setError('You do not have permission to add products');
          setLoading(false);
          return;
        }
        
        setEmployeeData(employeeRes.data);
        
        // Get shop data
        const shopRes = await axios.get(`/api/shops/${employeeRes.data.shop}`, config);
        console.log('Shop data:', shopRes.data);
        setShop(shopRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err.response?.data || err.message);
        setError(`Failed to load employee and shop data: ${err.message}`);
        setLoading(false);
      }
    };
    
    fetchEmployeeAndShopData();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shop) {
      setError('Shop information not available');
      return;
    }
    
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Create the product payload
      // For employees, we need to use the shop's owner as the seller
      const payload = {
        ...formData,
        shop: shop._id,
        seller: shop.owner, // Use the shop owner as the seller
        images: formData.image ? [formData.image] : []
      };
      
      console.log('Submitting product data:', payload);
      
      const response = await axios.post('/api/products', payload, config);
      console.log('Product created:', response.data);
      
      toast.success('Product added successfully!');
      setSuccess('Product added successfully!');
      
      // Clear form
      setFormData({
        name: '',
        description: '',
        category: 'food',
        buyPrice: '',
        price: '',
        stock: '',
        image: ''
      });
      
      // Redirect back to employee dashboard after a short delay
      setTimeout(() => {
        navigate('/employee/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Error adding product:', err);
      const errorMsg = err.response?.data?.message || 'Failed to add product';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <h1>Add Product</h1>
        <Spinner animation="border" className="mt-4" />
        <p className="mt-2">Loading shop information...</p>
      </Container>
    );
  }
  
  if (error && !shop) {
    return (
      <Container className="py-4">
        <h1>Add Product</h1>
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate('/employee/dashboard')}>
          Return to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Add New Product</h1>
      <p className="text-muted mb-4">
        Adding products for: <strong>{shop?.name}</strong>
      </p>
      
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="food">Food</option>
                        <option value="toys">Toys</option>
                        <option value="accessories">Accessories</option>
                        <option value="medicine">Medicine</option>
                        <option value="grooming">Grooming</option>
                        <option value="other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Image URL</Form.Label>
                      <Form.Control
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Purchase Price ($)</Form.Label>
                      <Form.Control
                        type="number"
                        name="buyPrice"
                        value={formData.buyPrice}
                        onChange={handleChange}
                        min="0.01"
                        step="0.01"
                        required
                      />
                      <Form.Text className="text-muted">
                        What the shop paid for this product
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Selling Price ($)</Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0.01"
                        step="0.01"
                        required
                      />
                      <Form.Text className="text-muted">
                        What customers will pay
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                {formData.image && (
                  <div className="mb-3">
                    <p>Image Preview:</p>
                    <img 
                      src={formData.image} 
                      alt="Product Preview" 
                      style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}
                
                <div className="d-flex justify-content-end">
                  <Button 
                    variant="secondary" 
                    className="me-2"
                    onClick={() => navigate('/employee/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Adding...' : 'Add Product'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EmployeeAddProduct; 
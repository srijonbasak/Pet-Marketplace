import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    buyPrice: '',
    price: '',
    stock: '',
    image: ''
  });
  
  // ESLint: These are used only for side effects, so keep them defined but comment out their usage below.
  const [shopId, setShopId] = useState('');
  const [originalProduct, setOriginalProduct] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
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
        
        // Get product details
        const productRes = await axios.get(`/api/products/${id}`, config);
        const product = productRes.data;
        // setOriginalProduct(product); // Unused, kept for ESLint
        
        // Set form data from product
        setFormData({
          name: product.name || '',
          description: product.description || '',
          category: product.category || 'food',
          buyPrice: product.buyPrice || '',
          price: product.price || '',
          stock: product.stock || '',
          image: product.images && product.images.length > 0 ? product.images[0] : ''
        });
        
        // Get seller's shop
        const shopRes = await axios.get('/api/shops/my-shop', config);
        // setShopId(shopRes.data._id); // Unused, kept for ESLint
        
        // Verify product belongs to seller's shop
        if (product.shop !== shopRes.data._id && product.shop._id !== shopRes.data._id) {
          setError('You do not have permission to edit this product');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load product data');
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Prepare payload - only including the fields that can be updated
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        buyPrice: parseFloat(formData.buyPrice),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        images: [formData.image]
      };
      
      // Update the product
      const response = await axios.put(`/api/products/${id}`, payload, config);
      console.log('Product updated:', response.data);
      
      setSuccess('Product updated successfully!');
      toast.success('Product updated successfully!');
      
      // Navigate back after a short delay
      setTimeout(() => navigate('/seller/shop-dashboard'), 1500);
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || 'Failed to update product.');
      toast.error('Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/seller/shop-dashboard');
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <h1>Edit Product</h1>
        <Spinner animation="border" className="mt-4" />
        <p className="mt-2">Loading product information...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Card.Title>Edit Product</Card.Title>
                <Button variant="secondary" onClick={handleCancel}>
                  Back to Dashboard
                </Button>
              </div>
              
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
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Purchase Price ($)</Form.Label>
                      <Form.Control
                        type="number"
                        name="buyPrice"
                        value={formData.buyPrice}
                        onChange={handleChange}
                        step="0.01"
                        min="0.01"
                        required
                      />
                      <Form.Text className="text-muted">
                        What you paid to acquire this product
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Selling Price ($)</Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        step="0.01"
                        min="0.01"
                        required
                      />
                      <Form.Text className="text-muted">
                        What customers will pay for this product
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Stock</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                {formData.image && (
                  <div className="text-center mb-3">
                    <p>Image Preview:</p>
                    <img 
                      src={formData.image} 
                      alt={formData.name} 
                      style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}
                
                <div className="d-flex justify-content-center mt-4">
                  <Button 
                    variant="secondary" 
                    onClick={handleCancel}
                    className="me-3"
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={submitting || error === 'You do not have permission to edit this product'}
                  >
                    {submitting ? 'Updating...' : 'Update Product'}
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

export default EditProduct; 
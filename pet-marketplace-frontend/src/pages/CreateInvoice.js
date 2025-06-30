import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
// import { invoiceAPI, productAPI } from '../services/api';

const CreateInvoice = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [shopData, setShopData] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    items: [{ product: '', quantity: 1, price: 0, discount: 0 }],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    paymentMethod: 'cash',
    notes: ''
  });
  
  const navigate = useNavigate();
  // const { user } = useAuth();

  useEffect(() => {
    const fetchShopAndProducts = async () => {
      try {
        setLoading(true);
        console.log('Starting data fetch for invoice creation...');
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        // Get employee data to get shop ID
        const employeeRes = await axios.get('/api/employees/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Employee data:', employeeRes.data);
        
        // Check if employee has invoice creation permission
        if (!employeeRes.data.permissions?.canCreateInvoices) {
          setError('You do not have permission to create invoices');
          setLoading(false);
          return;
        }
        
        const shopId = employeeRes.data.shop;
        
        // Get shop data
        const shopRes = await axios.get(`/api/shops/${shopId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Shop data:', shopRes.data);
        setShopData(shopRes.data);
        
        // Get products for the shop using direct axios call to ensure proper response handling
        console.log(`Fetching products for shop ID: ${shopId}`);
        try {
          const productsRes = await axios.get(`/api/products`, {
            params: { shop: shopId },
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('Products raw response:', productsRes);
          
          if (productsRes && productsRes.data) {
            // Ensure we have an array and filter out null products and those with no stock
            let productsData = [];
            if (Array.isArray(productsRes.data)) {
              productsData = productsRes.data.filter(p => p !== null && p.stock > 0);
              console.log(`Found ${productsData.length} valid products with stock:`, productsData);
            } else {
              console.error('Products data is not an array:', productsRes.data);
            }
            
            setProducts(productsData);
          } else {
            console.error('Invalid products response:', productsRes);
          }
        } catch (err) {
          console.error('Error fetching products:', err);
          toast.error('Failed to load products');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err.response?.data || err.message);
        setError(`Failed to load shop data and products: ${err.message}`);
        setLoading(false);
      }
    };
    
    fetchShopAndProducts();
  }, []);
  
  // Direct product selection handler
  const handleProductSelect = (e, index) => {
    const productId = e.target.value;
    console.log(`Product selected at index ${index}: ${productId}`);
    
    const newItems = [...formData.items];
    const selectedProduct = products.find(p => p._id === productId);
    
    if (selectedProduct) {
      console.log('Found selected product:', selectedProduct);
      newItems[index] = {
        ...newItems[index],
        product: productId,
        price: selectedProduct.price
      };
    } else {
      console.log('No product found with id:', productId);
      newItems[index] = {
        ...newItems[index],
        product: productId,
        price: 0
      };
    }
    
    console.log('Updated items array:', newItems);
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
    
    // Recalculate totals after updating items
    calculateTotals(newItems);
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    console.log(`Input change: ${name} = ${value}`);
    
    if (name.startsWith('items.')) {
  const [, field] = name.split('.');
      const newItems = [...formData.items];
      
      if (field === 'product') {
        console.log(`Product selected at index ${index}: ${value}`);
        // When a product is selected, update its price immediately
        const selectedProduct = products.find(p => p._id === value);
        console.log('Selected product object:', selectedProduct);
        
        if (selectedProduct) {
          newItems[index] = {
            ...newItems[index],
            product: value,
            price: selectedProduct.price
          };
          console.log(`Updated item with price: ${selectedProduct.price}`);
        } else {
          newItems[index] = {
            ...newItems[index],
            product: value,
            price: 0
          };
          console.log('No product found with that ID, setting price to 0');
        }
      } else {
        // For other fields
        newItems[index] = {
          ...newItems[index],
          [field]: field === 'quantity' || field === 'price' || field === 'discount' 
            ? parseFloat(value) || 0 
            : value
        };
      }
      
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));
      
      // Recalculate totals after updating items
      calculateTotals(newItems);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'discount' ? parseFloat(value) || 0 : value
      }));
      
      if (name === 'discount') {
        calculateTotals(formData.items);
      }
    }
  };

  const calculateTotals = (items) => {
    console.log('Calculating totals for items:', items);
    
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity * (1 - item.discount / 100);
      console.log(`Item total: ${item.price} × ${item.quantity} × (1 - ${item.discount}/100) = ${itemTotal}`);
      return sum + itemTotal;
    }, 0);
    
    const tax = subtotal * 0.15; // 15% tax
    const total = subtotal + tax - formData.discount;
    
    console.log(`Subtotal: ${subtotal}, Tax: ${tax}, Total: ${total}`);
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product: '', quantity: 1, price: 0, discount: 0 }]
    }));
    console.log('Added new item');
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) {
      toast.warn('Invoice must have at least one item');
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
    calculateTotals(newItems);
    console.log(`Removed item at index ${index}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.items.some(item => !item.product || item.quantity < 1)) {
      toast.error('Please ensure all items have a product selected and quantity is at least 1');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      console.log('Preparing to submit invoice data:', formData);
      
      // Get the token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        setSubmitting(false);
        return;
      }
      
      // Try direct axios call instead of using the service
      const response = await axios.post('/api/invoices', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Invoice created successfully:', response.data);
      
      toast.success('Invoice created successfully');
      navigate('/employee/dashboard');
    } catch (err) {
      console.error('Error creating invoice:', err.response ? err.response.data : err.message);
      
      // More detailed error handling
      if (err.response && err.response.data) {
        const errorMsg = err.response.data.message || 'Failed to create invoice';
        setError(errorMsg);
        toast.error(errorMsg);
      } else {
        setError('Network error or server is unavailable');
        toast.error('Network error or server is unavailable');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <h1>Create Invoice</h1>
        <div className="spinner-border mt-4" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading shop data and products...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <h1>Create Invoice</h1>
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate('/employee/dashboard')}>
          Return to Dashboard
        </Button>
      </Container>
    );
  }

  console.log('Rendering with products:', products);

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h1>Create Invoice</h1>
          {shopData && <p className="text-muted mb-0">Shop: {shopData.name}</p>}
        </Col>
        <Col xs="auto">
          <Button variant="secondary" onClick={() => navigate('/employee/dashboard')}>
            Back to Dashboard
          </Button>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Card className="mt-4 mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Invoice Items</h5>
                <Button variant="success" size="sm" onClick={addItem}>
                  <i className="fas fa-plus me-1"></i> Add Item
                </Button>
              </Card.Header>
              <Card.Body>
                {products.length === 0 ? (
                  <Alert variant="warning">
                    No products available. Please add products to your shop first.
                  </Alert>
                ) : (
                  <Table responsive>
                    <thead>
                      <tr>
                        <th style={{ width: '40%' }}>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Discount %</th>
                        <th>Total</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <select
                              className="form-select"
                              value={item.product || ''}
                              onChange={(e) => handleProductSelect(e, index)}
                              required
                            >
                              <option value="">Select Product</option>
                              {products.map(product => (
                                <option key={product._id} value={product._id}>
                                  {product.name} (Stock: {product.stock})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              name={`items.${index}.quantity`}
                              value={item.quantity}
                              onChange={(e) => handleInputChange(e, index)}
                              min="1"
                              max={products.find(p => p._id === item.product)?.stock || 999}
                              required
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              name={`items.${index}.price`}
                              value={item.price}
                              readOnly
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              name={`items.${index}.discount`}
                              value={item.discount}
                              onChange={(e) => handleInputChange(e, index)}
                              min="0"
                              max="100"
                            />
                          </td>
                          <td>
                            ${(item.price * item.quantity * (1 - item.discount / 100)).toFixed(2)}
                          </td>
                          <td>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => removeItem(index)}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="mobile_banking">Mobile Banking</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Additional Discount ($)</Form.Label>
                  <Form.Control
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Card className="bg-light">
                  <Card.Body>
                    <h4 className="mb-4">Invoice Summary</h4>
                    <Row className="mb-2">
                      <Col>Subtotal:</Col>
                      <Col className="text-end">${formData.subtotal.toFixed(2)}</Col>
                    </Row>
                    <Row className="mb-2">
                      <Col>Tax (15%):</Col>
                      <Col className="text-end">${formData.tax.toFixed(2)}</Col>
                    </Row>
                    <Row className="mb-2">
                      <Col>Additional Discount:</Col>
                      <Col className="text-end">${formData.discount.toFixed(2)}</Col>
                    </Row>
                    <hr />
                    <Row className="fw-bold">
                      <Col>Total Amount:</Col>
                      <Col className="text-end">${formData.total.toFixed(2)}</Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
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
                {submitting ? 'Creating...' : 'Create Invoice'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateInvoice; 
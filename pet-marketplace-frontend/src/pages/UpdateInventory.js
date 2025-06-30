import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext'; // Unused
import { default as api } from '../services/api';
import { toast } from 'react-toastify';

const UpdateInventory = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  // const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [shopData, setShopData] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  
  const [formData, setFormData] = useState({
    quantityChange: 0,
    reason: 'restock',
    notes: '',
    damagedQuantity: 0,
    expiredQuantity: 0,
    expiryDate: ''
  });
  
  useEffect(() => {
    const fetchProductAndEmployeeData = async () => {
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
        
        // Get employee data to verify permissions
        const employeeRes = await api.get('/api/employees/me', config);
        console.log('Employee data:', employeeRes.data);
        
        if (!employeeRes.data.permissions?.canManageInventory) {
          setError('You do not have permission to manage inventory');
          setLoading(false);
          return;
        }
        
        setEmployeeData(employeeRes.data);
        
        // Get product details
        const productRes = await api.get(`/api/products/${productId}`, config);
        console.log('Product data:', productRes.data);
        setProduct(productRes.data);
        
        // Get shop data
        const shopRes = await api.get(`/api/shops/${employeeRes.data.shop}`, config);
        console.log('Shop data:', shopRes.data);
        setShopData(shopRes.data);
        
        // Set today's date as default expiry date
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({
          ...prev,
          expiryDate: today
        }));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err.response?.data || err.message);
        setError(`Failed to load product information: ${err.message}`);
        setLoading(false);
      }
    };
    
    fetchProductAndEmployeeData();
  }, [productId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric inputs to numbers
    if (['quantityChange', 'damagedQuantity', 'expiredQuantity'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value, 10) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const calculateNewStock = () => {
    if (!product) return 0;
    
    const stockChange = formData.reason === 'restock' 
      ? formData.quantityChange 
      : -Math.abs(formData.quantityChange);
      
    const damagedReduction = formData.damagedQuantity;
    const expiredReduction = formData.expiredQuantity;
    
    // Calculate potential new stock
    const newStock = product.stock + stockChange - damagedReduction - expiredReduction;
    
    // Don't allow negative stock
    return Math.max(0, newStock);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setSubmitting(false);
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // First create inventory adjustment record
      const adjustmentData = {
        product: productId,
        shop: employeeData.shop,
        adjustedBy: employeeData._id,
        type: formData.reason,
        quantityChange: formData.reason === 'restock' 
          ? formData.quantityChange 
          : -Math.abs(formData.quantityChange),
        notes: formData.notes,
        damagedQuantity: formData.damagedQuantity,
        expiredQuantity: formData.expiredQuantity,
        expiryDate: formData.expiryDate,
        previousStock: product.stock,
        newStock: calculateNewStock(),
        requiresApproval: (formData.damagedQuantity > 0 || formData.expiredQuantity > 0),
        status: (formData.damagedQuantity > 0 || formData.expiredQuantity > 0) ? 'pending' : 'approved'
      };
      
      console.log('Submitting inventory adjustment:', adjustmentData);
      
      // Create inventory adjustment record
      const adjustmentRes = await api.post('/api/inventory/adjustments', adjustmentData, config);
      console.log('Adjustment created:', adjustmentRes.data);
      
      // If there are no damaged or expired items, update the product stock directly
      if (formData.damagedQuantity === 0 && formData.expiredQuantity === 0) {
        // Update product stock
        const updateData = {
          stock: calculateNewStock()
        };
        
        const updateRes = await api.put(`/api/products/${productId}/stock`, updateData, config);
        console.log('Product stock updated:', updateRes.data);
        
        toast.success('Inventory updated successfully');
      } else {
        // Otherwise, notify that the adjustment is pending approval
        toast.info('Inventory adjustment submitted for approval');
      }
      
      // Navigate back to employee dashboard
      navigate('/employee/dashboard');
    } catch (err) {
      console.error('Error updating inventory:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update inventory');
      toast.error(err.response?.data?.message || 'Failed to update inventory');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Container className="py-4 text-center">
        <h1>Update Inventory</h1>
        <Spinner animation="border" className="mt-4" />
        <p className="mt-2">Loading product information...</p>
      </Container>
    );
  }
  
  if (error && !product) {
    return (
      <Container className="py-4">
        <h1>Update Inventory</h1>
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate('/employee/dashboard')}>
          Return to Dashboard
        </Button>
      </Container>
    );
  }
  
  const newStock = calculateNewStock();
  const stockWillChange = newStock !== product?.stock;
  const pendingApproval = formData.damagedQuantity > 0 || formData.expiredQuantity > 0;
  
  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h1>Update Inventory</h1>
          {product && <p className="text-muted mb-0">Product: {product.name}</p>}
          {shopData && <p className="text-muted mb-0">Shop: {shopData.name}</p>}
        </Col>
        <Col xs="auto">
          <Button variant="secondary" onClick={() => navigate('/employee/dashboard')}>
            Back to Dashboard
          </Button>
        </Col>
      </Row>
      
      {product && (
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="mb-4">
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <div className="product-image-container mb-3">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name.replace(/(image|photo|picture)/gi, '').trim()} 
                          className="img-fluid rounded"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                          }} 
                        />
                      ) : (
                        <img 
                          src="https://via.placeholder.com/300x200?text=No+Image" 
                          alt="No product" 
                          className="img-fluid rounded" 
                        />
                      )}
                    </div>
                  </Col>
                  <Col md={8}>
                    <h3>{product.name}</h3>
                    <p className="text-muted">{product.description}</p>
                    <div className="d-flex justify-content-between mb-3">
                      <div>
                        <span className="fw-bold">Category:</span> {product.category}
                      </div>
                      <div>
                        <span className="fw-bold">Price:</span> ${product.price}
                      </div>
                    </div>
                    <div className="stock-info p-3 bg-light rounded">
                      <h5>Current Stock: <Badge bg="primary">{product.stock} units</Badge></h5>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            
            <Card>
              <Card.Header as="h5">Inventory Update</Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Row className="mb-3">
                    <Col md={6}>
                      <h5>Regular Stock Adjustment</h5>
                      <Form.Group className="mb-3">
                        <Form.Label>Adjustment Type</Form.Label>
                        <Form.Select
                          name="reason"
                          value={formData.reason}
                          onChange={handleChange}
                          required
                        >
                          <option value="restock">Restock (Add Inventory)</option>
                          <option value="adjustment">Manual Adjustment (Remove Inventory)</option>
                          <option value="sale">Sale (Not through invoice)</option>
                        </Form.Select>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Quantity {formData.reason === 'restock' ? 'to Add' : 'to Remove'}</Form.Label>
                        <Form.Control
                          type="number"
                          name="quantityChange"
                          value={formData.quantityChange}
                          onChange={handleChange}
                          min="0"
                          required
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <h5>Special Adjustments <small className="text-muted">(Requires Approval)</small></h5>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Damaged Quantity</Form.Label>
                        <Form.Control
                          type="number"
                          name="damagedQuantity"
                          value={formData.damagedQuantity}
                          onChange={handleChange}
                          min="0"
                          max={product.stock}
                        />
                        <Form.Text className="text-muted">
                          Number of units that are damaged and need to be removed from inventory
                        </Form.Text>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Expired Quantity</Form.Label>
                        <Form.Control
                          type="number"
                          name="expiredQuantity"
                          value={formData.expiredQuantity}
                          onChange={handleChange}
                          min="0"
                          max={product.stock}
                        />
                        <Form.Text className="text-muted">
                          Number of units that have expired and need to be removed from inventory
                        </Form.Text>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Expiry Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Notes/Reason for Adjustment</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Add details about this inventory update..."
                    />
                  </Form.Group>
                  
                  <div className="summary-section p-3 bg-light rounded mb-4">
                    <h5 className="mb-3">Summary</h5>
                    <Row>
                      <Col md={4}>
                        <div className="d-flex justify-content-between">
                          <span>Current Stock:</span>
                          <span className="fw-bold">{product.stock}</span>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="d-flex justify-content-between">
                          <span>Stock Change:</span>
                          <span className={stockWillChange ? "fw-bold text-primary" : "fw-bold"}>
                            {stockWillChange ? (newStock > product.stock ? '+' : '') + (newStock - product.stock) : '0'}
                          </span>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="d-flex justify-content-between">
                          <span>New Stock:</span>
                          <span className="fw-bold text-success">{newStock}</span>
                        </div>
                      </Col>
                    </Row>
                    
                    {pendingApproval && (
                      <Alert variant="warning" className="mt-3 mb-0">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        This update requires seller approval because it includes damaged or expired items.
                      </Alert>
                    )}
                  </div>
                  
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
                      {submitting ? 'Updating...' : pendingApproval ? 'Submit for Approval' : 'Update Inventory'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default UpdateInventory; 
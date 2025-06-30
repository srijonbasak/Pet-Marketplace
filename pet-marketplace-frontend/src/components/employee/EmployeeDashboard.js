import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, ListGroup, Button, Table, Tab, Tabs, Badge } from 'react-bootstrap'; // Spinner removed
// import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { default as api } from '../../services/api';
// import { invoiceAPI } from '../../services/api'; // Unused

const EmployeeDashboard = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [shopData, setShopData] = useState(null);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const { user } = useAuth(); // Unused
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        console.log('Fetching employee data...');
        
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
        
        // Get employee profile
        const employeeRes = await api.get('/api/employees/me', config);
        console.log('Employee data:', employeeRes.data);
        setEmployeeData(employeeRes.data);
        
        // Get shop info using the shop ID from employee data
        const shopRes = await api.get(`/api/shops/${employeeRes.data.shop}`, config);
        console.log('Shop data:', shopRes.data);
        setShopData(shopRes.data);
        
        // Fetch products for this shop
        if (employeeRes.data.permissions.canAddProducts || employeeRes.data.permissions.canManageInventory) {
          const productsRes = await api.get(`/api/products?shop=${employeeRes.data.shop}`, config);
          setProducts(Array.isArray(productsRes.data) ? productsRes.data.filter(p => p !== null) : []);
        }
        
        // Fetch invoices if employee can create invoices
        if (employeeRes.data.permissions.canCreateInvoices) {
          try {
            console.log('Fetching invoices for shop...');
            const invoicesRes = await api.get('/api/invoices/shop', config);
            console.log('Invoices response:', invoicesRes.data);
            
            if (Array.isArray(invoicesRes.data)) {
              setInvoices(invoicesRes.data.filter(i => i !== null));
            } else {
              console.error('Unexpected invoices response format:', invoicesRes.data);
              setInvoices([]);
            }
          } catch (invoiceErr) {
            console.error('Error fetching invoices:', invoiceErr);
            setInvoices([]);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err.response?.data || err.message);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchEmployeeData();
  }, []);

  // const handleAddProduct = () => { /* ... */ }; // Unused

  const handleEditProduct = (id) => {
    navigate(`/employee/edit-product/${id}`);
  };

  const handleViewInvoice = (id) => {
    // Navigate to invoice details page or show details in a modal
    alert(`View invoice details for ID: ${id}`);
  };

  const handlePaymentStatusChange = async (invoiceId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.put(`/api/invoices/${invoiceId}/status`, { paymentStatus: newStatus }, config);
      
      // Update the invoice status in the local state
      setInvoices(invoices => invoices.map(invoice => 
        invoice._id === invoiceId ? { ...invoice, paymentStatus: newStatus } : invoice
      ));
      
    } catch (err) {
      console.error('Error updating invoice status:', err);
      alert('Failed to update invoice payment status.');
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <h1>Employee Dashboard</h1>
        <div className="spinner-border mt-4" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading your shop information...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <h1>Employee Dashboard</h1>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h1>Employee Dashboard</h1>
          <p className="mb-0">
            Welcome {employeeData?.firstName} {employeeData?.lastName} | 
            <Badge bg="info" className="ms-2">{shopData?.name}</Badge>
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header as="h5">My Profile</Card.Header>
            <Card.Body>
              <Card.Title>{employeeData?.firstName} {employeeData?.lastName}</Card.Title>
              <Card.Text>
                <strong>Email:</strong> {employeeData?.email}<br />
                <strong>Phone:</strong> {employeeData?.phone}<br />
                <strong>Shop:</strong> {shopData?.name || 'N/A'}
              </Card.Text>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header as="h5">My Permissions</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className={employeeData?.permissions?.canAddProducts ? 'text-success' : 'text-muted'}>
                <i className={`fas fa-${employeeData?.permissions?.canAddProducts ? 'check-circle' : 'times-circle'} me-2`}></i>
                Manage Products
              </ListGroup.Item>
              <ListGroup.Item className={employeeData?.permissions?.canCreateInvoices ? 'text-success' : 'text-muted'}>
                <i className={`fas fa-${employeeData?.permissions?.canCreateInvoices ? 'check-circle' : 'times-circle'} me-2`}></i>
                Manage Orders & Invoices
              </ListGroup.Item>
              <ListGroup.Item className={employeeData?.permissions?.canManageInventory ? 'text-success' : 'text-muted'}>
                <i className={`fas fa-${employeeData?.permissions?.canManageInventory ? 'check-circle' : 'times-circle'} me-2`}></i>
                Manage Inventory
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card>
            <Card.Body>
              <Tabs defaultActiveKey="shop" className="mb-3">
                <Tab eventKey="shop" title="Shop Information">
                  {shopData && (
                    <div>
                      <h4>{shopData.name}</h4>
                      <p>{shopData.description}</p>
                      {shopData.address && (
                        <p>
                          <strong>Address:</strong> {shopData.address.street}, {shopData.address.city}, {shopData.address.state} {shopData.address.zipCode}
                        </p>
                      )}
                      {shopData.contactInfo && (
                        <p>
                          <strong>Contact:</strong> {shopData.contactInfo.phone} | {shopData.contactInfo.email}
                        </p>
                      )}
                      <Button 
                        variant="outline-primary" 
                        onClick={() => window.open(`/shop/${shopData.name.replace(/\s+/g, '-').toLowerCase()}`, '_blank')}
                        className="mt-2"
                      >
                        <i className="fas fa-external-link-alt me-2"></i>
                        View Shop Page
                      </Button>
                    </div>
                  )}
                </Tab>
                
                {employeeData?.permissions?.canAddProducts && (
                  <Tab eventKey="products" title="Products">
                    <div className="d-flex justify-content-between mb-3">
                      <h5>Products</h5>
                      {employeeData?.permissions?.canAddProducts && (
                        <Button variant="primary" size="sm" onClick={() => navigate('/employee/add-product')}>
                          <i className="fas fa-plus me-1"></i> Add Product
                        </Button>
                      )}
                    </div>
                    
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          {employeeData?.permissions?.canAddProducts && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan={employeeData?.permissions?.canAddProducts ? 5 : 4} className="text-center">
                              No products found
                            </td>
                          </tr>
                        ) : (
                          products.map(product => (
                            <tr key={product._id}>
                              <td>{product.name}</td>
                              <td>{product.category}</td>
                              <td>${product.price}</td>
                              <td>{product.stock}</td>
                              {employeeData?.permissions?.canAddProducts && (
                                <td>
                                  <Button variant="outline-primary" size="sm" onClick={() => handleEditProduct(product._id)}>
                                    <i className="fas fa-edit"></i>
                                  </Button>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </Tab>
                )}
                
                {employeeData?.permissions?.canCreateInvoices && (
                  <Tab eventKey="orders" title="Orders">
                    <div className="d-flex justify-content-between mb-3">
                      <h5>Invoices</h5>
                      <Button variant="primary" size="sm" onClick={() => navigate('/employee/create-invoice')}>
                        <i className="fas fa-plus me-1"></i> Create Invoice
                      </Button>
                    </div>
                    
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Invoice #</th>
                          <th>Customer</th>
                          <th>Total</th>
                          <th>Payment Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center">
                              No invoices found
                            </td>
                          </tr>
                        ) : (
                          invoices.map(invoice => (
                            <tr key={invoice._id}>
                              <td>{invoice.invoiceNumber}</td>
                              <td>{invoice.customerName}</td>
                              <td>${invoice.total.toFixed(2)}</td>
                              <td>
                                <Badge bg={
                                  invoice.paymentStatus === 'paid' ? 'success' :
                                  invoice.paymentStatus === 'cancelled' ? 'danger' : 'warning'
                                }>
                                  {invoice.paymentStatus || 'Pending'}
                                </Badge>
                              </td>
                              <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                              <td>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm" 
                                  className="me-1"
                                  onClick={() => handleViewInvoice(invoice._id)}
                                >
                                  <i className="fas fa-eye"></i>
                                </Button>
                                {invoice.paymentStatus !== 'paid' && (
                                  <Button 
                                    variant="outline-success" 
                                    size="sm"
                                    onClick={() => handlePaymentStatusChange(invoice._id, 'paid')}
                                  >
                                    <i className="fas fa-check"></i>
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </Tab>
                )}
                
                {employeeData?.permissions?.canManageInventory && (
                  <Tab eventKey="inventory" title="Inventory">
                    <div className="d-flex justify-content-between mb-3">
                      <h5>Inventory Management</h5>
                    </div>
                    
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Current Stock</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="text-center">
                              No products found
                            </td>
                          </tr>
                        ) : (
                          products.map(product => (
                            <tr key={product._id}>
                              <td>{product.name}</td>
                              <td>{product.stock}</td>
                              <td>
                                <Button variant="outline-primary" size="sm" onClick={() => navigate(`/employee/update-inventory/${product._id}`)}>
                                  Update Stock
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </Tab>
                )}
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EmployeeDashboard; 
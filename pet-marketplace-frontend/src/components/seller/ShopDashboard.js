import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Card, Alert, Spinner, Form, Tabs, Tab, Badge, Modal, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { invoiceAPI, inventoryAPI } from '../../services/api';
import axios from 'axios';
import { toast } from 'react-toastify';

const ShopDashboard = () => {
  const [products, setProducts] = useState([]);
  const [shop, setShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [pendingAdjustments, setPendingAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  
  // Modal state for rejected adjustments
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Fetch shop data
        const shopRes = await axios.get('/api/shops/my-shop', config);
        setShop(shopRes.data);
        
        // Fetch products for this shop
        const productsRes = await axios.get(`/api/products?shop=${shopRes.data._id}`, config);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data.filter(p => p !== null) : []);
        
        // Fetch orders for this shop
        const ordersRes = await axios.get(`/api/orders?seller=${shopRes.data._id}`, config);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data.filter(o => o !== null) : []);
        
        // Fetch invoices created by employees
        try {
          const invoicesRes = await invoiceAPI.getSellerShopInvoices();
          console.log('Invoices created by employees:', invoicesRes.data);
          setInvoices(invoicesRes.data);
        } catch (invoiceErr) {
          console.error('Failed to fetch invoices:', invoiceErr);
        }
        
        // Fetch pending inventory adjustments
        try {
          const pendingAdjustmentsRes = await inventoryAPI.getPendingAdjustments();
          console.log('Pending inventory adjustments:', pendingAdjustmentsRes.data);
          setPendingAdjustments(pendingAdjustmentsRes.data);
        } catch (adjustmentErr) {
          console.error('Failed to fetch pending adjustments:', adjustmentErr);
        }
      } catch (err) {
        setError('Failed to fetch shop data.');
        setProducts([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchShopData();
  }, []);

  const handleAddProduct = () => {
    navigate('/seller/add-product');
  };

  const handleEdit = (id) => {
    navigate(`/seller/edit-product/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/products/${id}`, config);
      setProducts(products.filter(p => p._id !== id));
      setSuccess('Product deleted successfully.');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to delete product.');
      setTimeout(() => setError(''), 2000);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus }, config);
      setOrders(orders => orders.map(order => order._id === orderId ? { ...order, status: newStatus } : order));
    } catch (err) {
      alert('Failed to update order status.');
    }
  };
  
  // Handle approving an inventory adjustment
  const handleApproveAdjustment = async (adjustmentId) => {
    try {
      const response = await inventoryAPI.updateAdjustmentStatus(adjustmentId, {
        status: 'approved'
      });
      
      console.log('Adjustment approved:', response.data);
      toast.success('Inventory adjustment approved successfully');
      
      // Remove the approved adjustment from the list
      setPendingAdjustments(
        pendingAdjustments.filter(adj => adj._id !== adjustmentId)
      );
    } catch (err) {
      console.error('Error approving adjustment:', err);
      toast.error('Failed to approve adjustment: ' + (err.response?.data?.message || err.message));
    }
  };
  
  // Handle showing the rejection modal
  const handleShowRejectModal = (adjustment) => {
    setSelectedAdjustment(adjustment);
    setRejectionReason('');
    setShowRejectModal(true);
  };
  
  // Handle rejecting an inventory adjustment
  const handleRejectAdjustment = async () => {
    if (!selectedAdjustment) return;
    
    try {
      const response = await inventoryAPI.updateAdjustmentStatus(selectedAdjustment._id, {
        status: 'rejected',
        rejectionReason: rejectionReason
      });
      
      console.log('Adjustment rejected:', response.data);
      toast.info('Inventory adjustment rejected');
      
      // Remove the rejected adjustment from the list
      setPendingAdjustments(
        pendingAdjustments.filter(adj => adj._id !== selectedAdjustment._id)
      );
      
      // Close the modal
      setShowRejectModal(false);
    } catch (err) {
      console.error('Error rejecting adjustment:', err);
      toast.error('Failed to reject adjustment: ' + (err.response?.data?.message || err.message));
    }
  };

  // Calculate profit metrics
  const calculateProfitMetrics = () => {
    // Only consider paid invoices for profit calculation
    const paidInvoices = invoices.filter(invoice => invoice.paymentStatus === 'paid');
    
    // Total sales
    const totalSales = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    
    // Calculate costs and profits
    let totalCost = 0;
    let totalProfit = 0;
    let categorySales = {};
    let categoryProfits = {};
    
    // Process each invoice
    paidInvoices.forEach(invoice => {
      // Process each item in the invoice
      invoice.items.forEach(item => {
        // Find the product to get its buy price
        const product = products.find(p => p._id === item.product._id);
        
        if (product) {
          const itemCost = (product.buyPrice || 0) * item.quantity;
          const itemSale = item.price * item.quantity;
          const itemProfit = itemSale - itemCost;
          
          totalCost += itemCost;
          totalProfit += itemProfit;
          
          // Categorize sales and profits
          const category = product.category || 'other';
          categorySales[category] = (categorySales[category] || 0) + itemSale;
          categoryProfits[category] = (categoryProfits[category] || 0) + itemProfit;
        }
      });
    });
    
    // Prepare category data for display
    const categoryData = Object.keys(categorySales).map(category => ({
      category,
      sales: categorySales[category],
      profit: categoryProfits[category],
      margin: categoryProfits[category] / categorySales[category] * 100
    })).sort((a, b) => b.profit - a.profit);
    
    return {
      totalSales,
      totalCost,
      totalProfit,
      profitMargin: totalSales > 0 ? (totalProfit / totalSales) * 100 : 0,
      categoryData
    };
  };

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }

  // Calculate profit metrics for display
  const profitMetrics = calculateProfitMetrics();

  return (
    <Container className="py-4">
      <Card>
        <Card.Body>
          <Card.Title className="mb-4 d-flex justify-content-between align-items-center">
            <span>Shop Dashboard</span>
            <div>
              <Button variant="primary" onClick={() => navigate('/shop/employees')} className="me-2">
                Manage Employees
              </Button>
              <Button variant="success" onClick={handleAddProduct}>
                Add Product
              </Button>
            </div>
          </Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          {shop && (
            <div className="mb-4">
              <h5>{shop.name}</h5>
              <p>{shop.description}</p>
            </div>
          )}

          <Tabs defaultActiveKey="products" className="mb-4">
            <Tab eventKey="products" title="Products">
              <div className="mb-3">
                <Row>
                  <Col md={8}>
                    <h5>Inventory & Pricing</h5>
                  </Col>
                  <Col md={4} className="text-end">
                    <Button variant="success" size="sm" onClick={handleAddProduct}>
                      <i className="fas fa-plus me-1"></i> Add Product
                    </Button>
                  </Col>
                </Row>
              </div>
              
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Buy Price</th>
                    <th>Sell Price</th>
                    <th>Profit</th>
                    <th>Stock</th>
                    <th>Value</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!products || products.length === 0 ? (
                    <tr><td colSpan="8" className="text-center">No products found.</td></tr>
                  ) : (
                    products.map(product => product && (
                      <tr key={product._id}>
                        <td>{product.name || 'Unnamed Product'}</td>
                        <td>{product.category || 'Uncategorized'}</td>
                        <td>${product.buyPrice?.toFixed(2) || '0.00'}</td>
                        <td>${product.price?.toFixed(2) || '0.00'}</td>
                        <td>
                          {product.buyPrice && product.price ? (
                            <span className={product.price - product.buyPrice > 0 ? 'text-success' : 'text-danger'}>
                              ${(product.price - product.buyPrice).toFixed(2)} 
                              ({Math.round(((product.price - product.buyPrice) / product.buyPrice) * 100)}%)
                            </span>
                          ) : (
                            '$0.00'
                          )}
                        </td>
                        <td>{product.stock || 0}</td>
                        <td>
                          ${((product.price || 0) * (product.stock || 0)).toFixed(2)}
                        </td>
                        <td>
                          <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(product._id)}>Edit</Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(product._id)}>Delete</Button>
                        </td>
                      </tr>
                    ))
                  )}
                  
                  {/* Summary row */}
                  {products && products.length > 0 && (
                    <tr className="table-dark">
                      <td colSpan="5" className="fw-bold text-end">Total:</td>
                      <td className="fw-bold">
                        {products.reduce((total, product) => total + (product?.stock || 0), 0)}
                      </td>
                      <td className="fw-bold">
                        ${products.reduce((total, product) => 
                          total + ((product?.price || 0) * (product?.stock || 0)), 0).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </Table>
              
              {/* Profit Summary Cards */}
              {products && products.length > 0 && (
                <Row className="mt-4">
                  <Col md={4}>
                    <Card className="bg-light">
                      <Card.Body>
                        <Card.Title>Inventory Cost</Card.Title>
                        <h3 className="text-primary">
                          ${products.reduce((total, product) => 
                            total + ((product?.buyPrice || 0) * (product?.stock || 0)), 0).toFixed(2)}
                        </h3>
                        <Card.Text>
                          Total cost of all products in inventory
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="bg-light">
                      <Card.Body>
                        <Card.Title>Potential Sales</Card.Title>
                        <h3 className="text-primary">
                          ${products.reduce((total, product) => 
                            total + ((product?.price || 0) * (product?.stock || 0)), 0).toFixed(2)}
                        </h3>
                        <Card.Text>
                          Potential revenue if all inventory is sold
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="bg-light">
                      <Card.Body>
                        <Card.Title>Potential Profit</Card.Title>
                        <h3 className="text-success">
                          ${products.reduce((total, product) => 
                            total + (((product?.price || 0) - (product?.buyPrice || 0)) * (product?.stock || 0)), 0).toFixed(2)}
                        </h3>
                        <Card.Text>
                          Potential profit from current inventory
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
            </Tab>

            <Tab eventKey="orders" title="Orders">
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Buyer</th>
                    <th>Products</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {!orders || orders.length === 0 ? (
                    <tr><td colSpan="6" className="text-center">No orders found.</td></tr>
                  ) : (
                    orders.map(order => order && (
                      <tr key={order._id}>
                        <td>{order._id}</td>
                        <td>{order.buyer?.name || order.buyer?.email || 'N/A'}</td>
                        <td>
                          {order.items && order.items.map(item => item && item.product && (
                            <div key={item.product._id || Math.random()}>
                              {item.product.name || 'Unknown Product'} x {item.quantity || 0}
                            </div>
                          ))}
                        </td>
                        <td>{order.paymentMethod || 'N/A'}</td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={order.status || 'Pending'}
                            onChange={e => handleStatusChange(order._id, e.target.value)}
                            style={{ minWidth: 120 }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </Form.Select>
                        </td>
                        <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="invoices" title="Employee Invoices">
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Customer</th>
                    <th>Created By</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {!invoices || invoices.length === 0 ? (
                    <tr><td colSpan="6" className="text-center">No invoices found.</td></tr>
                  ) : (
                    invoices.map(invoice => (
                      <tr key={invoice._id}>
                        <td>{invoice.invoiceNumber}</td>
                        <td>
                          <div>{invoice.customerName}</div>
                          <small className="text-muted">{invoice.customerPhone}</small>
                        </td>
                        <td>
                          {invoice.createdBy ? 
                            `${invoice.createdBy.firstName} ${invoice.createdBy.lastName}` : 
                            'Unknown Employee'}
                        </td>
                        <td>${invoice.total.toFixed(2)}</td>
                        <td>
                          <Badge bg={
                            invoice.paymentStatus === 'paid' ? 'success' :
                            invoice.paymentStatus === 'cancelled' ? 'danger' : 'warning'
                          }>
                            {invoice.paymentMethod.toUpperCase()} - {invoice.paymentStatus.toUpperCase()}
                          </Badge>
                        </td>
                        <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Tab>
            
            <Tab eventKey="inventory" title={
              <>
                Inventory Adjustments
                {pendingAdjustments.length > 0 && 
                  <Badge bg="danger" className="ms-2">{pendingAdjustments.length}</Badge>
                }
              </>
            }>
              <div className="mb-3">
                <h5>Pending Inventory Adjustments</h5>
                <p className="text-muted">Review and approve/reject inventory changes submitted by employees</p>
              </div>
              
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Employee</th>
                    <th>Requested Changes</th>
                    <th>Reason/Notes</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!pendingAdjustments || pendingAdjustments.length === 0 ? (
                    <tr><td colSpan="7" className="text-center">No pending inventory adjustments</td></tr>
                  ) : (
                    pendingAdjustments.map(adjustment => (
                      <tr key={adjustment._id}>
                        <td>
                          {adjustment.product ? (
                            <div className="d-flex align-items-center">
                              {adjustment.product.images && adjustment.product.images[0] ? (
                                <img 
                                  src={adjustment.product.images[0]} 
                                  alt={adjustment.product.name} 
                                  className="me-2"
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                                  }}
                                />
                              ) : null}
                              <div>
                                <div>{adjustment.product.name}</div>
                                <small className="text-muted">${adjustment.product.price}</small>
                              </div>
                            </div>
                          ) : 'Unknown Product'}
                        </td>
                        <td>
                          <Badge bg={
                            adjustment.type === 'restock' ? 'success' :
                            adjustment.type === 'damaged' || adjustment.type === 'expired' ? 'danger' : 'warning'
                          }>
                            {adjustment.type.toUpperCase()}
                          </Badge>
                        </td>
                        <td>
                          {adjustment.adjustedBy ? 
                            `${adjustment.adjustedBy.firstName} ${adjustment.adjustedBy.lastName}` : 
                            'Unknown Employee'}
                        </td>
                        <td>
                          <div className="stock-change">
                            <div>Current: <strong>{adjustment.previousStock}</strong></div>
                            <div className={
                              adjustment.quantityChange > 0 ? 'text-success' : 
                              adjustment.quantityChange < 0 ? 'text-danger' : ''
                            }>
                              Change: <strong>
                                {adjustment.quantityChange > 0 ? '+' : ''}{adjustment.quantityChange}
                              </strong>
                            </div>
                            {adjustment.damagedQuantity > 0 && (
                              <div className="text-danger">
                                Damaged: <strong>-{adjustment.damagedQuantity}</strong>
                              </div>
                            )}
                            {adjustment.expiredQuantity > 0 && (
                              <div className="text-danger">
                                Expired: <strong>-{adjustment.expiredQuantity}</strong>
                              </div>
                            )}
                            <div className="fw-bold">
                              New: <strong>{adjustment.newStock}</strong>
                            </div>
                          </div>
                        </td>
                        <td>{adjustment.notes || 'No notes provided'}</td>
                        <td>{new Date(adjustment.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Button 
                            variant="success" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleApproveAdjustment(adjustment._id)}
                          >
                            <i className="fas fa-check me-1"></i>
                            Approve
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleShowRejectModal(adjustment)}
                          >
                            <i className="fas fa-times me-1"></i>
                            Reject
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="analytics" title="Profit Analytics">
              <h5>Sales & Profit Analysis</h5>
              <p className="text-muted">Financial performance based on completed sales</p>
              
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="text-center h-100">
                    <Card.Body>
                      <h6 className="text-muted">Total Sales</h6>
                      <h3 className="text-primary">${profitMetrics.totalSales.toFixed(2)}</h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center h-100">
                    <Card.Body>
                      <h6 className="text-muted">Cost of Goods</h6>
                      <h3 className="text-secondary">${profitMetrics.totalCost.toFixed(2)}</h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center h-100">
                    <Card.Body>
                      <h6 className="text-muted">Total Profit</h6>
                      <h3 className="text-success">${profitMetrics.totalProfit.toFixed(2)}</h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center h-100">
                    <Card.Body>
                      <h6 className="text-muted">Profit Margin</h6>
                      <h3 className={profitMetrics.profitMargin >= 20 ? 'text-success' : 'text-warning'}>
                        {profitMetrics.profitMargin.toFixed(2)}%
                      </h3>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <h5 className="mt-4">Profit by Category</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Sales</th>
                    <th>Cost</th>
                    <th>Profit</th>
                    <th>Margin %</th>
                  </tr>
                </thead>
                <tbody>
                  {profitMetrics.categoryData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">No sales data available</td>
                    </tr>
                  ) : (
                    profitMetrics.categoryData.map((category, index) => (
                      <tr key={index}>
                        <td className="text-capitalize">{category.category}</td>
                        <td>${category.sales.toFixed(2)}</td>
                        <td>${(category.sales - category.profit).toFixed(2)}</td>
                        <td>${category.profit.toFixed(2)}</td>
                        <td>
                          <span className={category.margin >= 20 ? 'text-success' : 'text-warning'}>
                            {category.margin.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              <div className="mt-4">
                <h5>Recent Profitable Sales</h5>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Total Sale</th>
                      <th>Cost</th>
                      <th>Profit</th>
                      <th>Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.filter(inv => inv.paymentStatus === 'paid').length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center">No completed sales yet</td>
                      </tr>
                    ) : (
                      invoices
                        .filter(inv => inv.paymentStatus === 'paid')
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5)
                        .map(invoice => {
                          // Calculate invoice cost and profit
                          let invoiceCost = 0;
                          invoice.items.forEach(item => {
                            const product = products.find(p => p._id === item.product._id);
                            if (product) {
                              invoiceCost += (product.buyPrice || 0) * item.quantity;
                            }
                          });
                          
                          const invoiceProfit = invoice.total - invoiceCost;
                          const profitMargin = invoice.total > 0 
                            ? (invoiceProfit / invoice.total) * 100 
                            : 0;
                            
                          return (
                            <tr key={invoice._id}>
                              <td>{invoice.invoiceNumber}</td>
                              <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                              <td>{invoice.customerName}</td>
                              <td>${invoice.total.toFixed(2)}</td>
                              <td>${invoiceCost.toFixed(2)}</td>
                              <td>
                                <span className={invoiceProfit >= 0 ? 'text-success' : 'text-danger'}>
                                  ${invoiceProfit.toFixed(2)}
                                </span>
                              </td>
                              <td>
                                <span className={profitMargin >= 20 ? 'text-success' : 'text-warning'}>
                                  {profitMargin.toFixed(2)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </Table>
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
      
      {/* Rejection Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Inventory Adjustment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please provide a reason for rejecting this inventory adjustment:</p>
          <Form.Group>
            <Form.Label>Rejection Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejecting this adjustment"
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleRejectAdjustment}
            disabled={!rejectionReason.trim()}
          >
            Reject Adjustment
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ShopDashboard; 
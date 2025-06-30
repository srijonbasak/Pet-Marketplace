import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { default as api } from '../../services/api';

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showInvoiceDetailsModal, setShowInvoiceDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalInvoices: 0,
    averageInvoiceValue: 0
  });
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

  useEffect(() => {
    fetchInvoices();
    fetchProducts();
    fetchStats();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/api/invoices/shop');
      setInvoices(response.data);
    } catch (error) {
      toast.error('Failed to fetch invoices');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products/shop');
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/invoices/stats/shop');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    }
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    if (name.startsWith('items.')) {
      const [_, field] = name.split('.');
      const newItems = [...formData.items];
      newItems[index][field] = value;
      
      // Update price if product is selected
      if (field === 'product') {
        const product = products.find(p => p._id === value);
        if (product) {
          newItems[index].price = product.price;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));
      
      calculateTotals(newItems);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity * (1 - item.discount / 100));
    }, 0);
    
    const tax = subtotal * 0.15; // 15% tax
    const total = subtotal + tax - formData.discount;
    
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
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
    calculateTotals(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/invoices', formData);
      toast.success('Invoice created successfully');
      setShowNewInvoiceModal(false);
      fetchInvoices();
      fetchStats();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    }
  };

  const resetForm = () => {
    setFormData({
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
  };

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>Invoice Management</h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowNewInvoiceModal(true)}>
            Create New Invoice
          </Button>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Today's Sales</Card.Title>
              <h3>${stats.totalSales.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Total Invoices</Card.Title>
              <h3>{stats.totalInvoices}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Average Invoice Value</Card.Title>
              <h3>${stats.averageInvoiceValue.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Invoices Table */}
      <Card>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice._id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.customerName}</td>
                  <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                  <td>${invoice.total.toFixed(2)}</td>
                  <td>
                    <span className={`badge bg-${invoice.paymentStatus === 'paid' ? 'success' : 'warning'}`}>
                      {invoice.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowInvoiceDetailsModal(true);
                      }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* New Invoice Modal */}
      <Modal show={showNewInvoiceModal} onHide={() => setShowNewInvoiceModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
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
              <Col md={6}>
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
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Customer Email</Form.Label>
              <Form.Control
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
              />
            </Form.Group>

            <h5 className="mt-4">Items</h5>
            {formData.items.map((item, index) => (
              <Row key={index} className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Product</Form.Label>
                    <Form.Select
                      name={`items.${index}.product`}
                      value={item.product}
                      onChange={(e) => handleInputChange(e, index)}
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} (${product.price})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      name={`items.${index}.quantity`}
                      value={item.quantity}
                      onChange={(e) => handleInputChange(e, index)}
                      min="1"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      type="number"
                      name={`items.${index}.price`}
                      value={item.price}
                      onChange={(e) => handleInputChange(e, index)}
                      required
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Discount %</Form.Label>
                    <Form.Control
                      type="number"
                      name={`items.${index}.discount`}
                      value={item.discount}
                      onChange={(e) => handleInputChange(e, index)}
                      min="0"
                      max="100"
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button
                    variant="outline-danger"
                    onClick={() => removeItem(index)}
                    disabled={formData.items.length === 1}
                  >
                    Remove
                  </Button>
                </Col>
              </Row>
            ))}

            <Button variant="outline-primary" onClick={addItem} className="mb-3">
              Add Item
            </Button>

            <Row className="mt-4">
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
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Card className="mt-4">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h5>Subtotal: ${formData.subtotal.toFixed(2)}</h5>
                    <h5>Tax (15%): ${formData.tax.toFixed(2)}</h5>
                    <h5>Discount: ${formData.discount.toFixed(2)}</h5>
                    <h4>Total: ${formData.total.toFixed(2)}</h4>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Button variant="primary" type="submit" className="mt-3">
              Create Invoice
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Invoice Details Modal */}
      <Modal show={showInvoiceDetailsModal} onHide={() => setShowInvoiceDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Invoice Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInvoice && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Invoice #{selectedInvoice.invoiceNumber}</h5>
                  <p>Date: {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                </Col>
                <Col md={6}>
                  <h5>Customer Information</h5>
                  <p>Name: {selectedInvoice.customerName}</p>
                  <p>Phone: {selectedInvoice.customerPhone}</p>
                  <p>Email: {selectedInvoice.customerEmail}</p>
                </Col>
              </Row>

              <Table responsive>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product.name}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.discount}%</td>
                      <td>${(item.price * item.quantity * (1 - item.discount / 100)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4" className="text-end"><strong>Subtotal:</strong></td>
                    <td>${selectedInvoice.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="4" className="text-end"><strong>Tax:</strong></td>
                    <td>${selectedInvoice.tax.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="4" className="text-end"><strong>Discount:</strong></td>
                    <td>${selectedInvoice.discount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="4" className="text-end"><strong>Total:</strong></td>
                    <td>${selectedInvoice.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </Table>

              <Row className="mt-4">
                <Col md={6}>
                  <p><strong>Payment Method:</strong> {selectedInvoice.paymentMethod}</p>
                  <p><strong>Status:</strong> {selectedInvoice.paymentStatus}</p>
                </Col>
                <Col md={6}>
                  {selectedInvoice.notes && (
                    <p><strong>Notes:</strong> {selectedInvoice.notes}</p>
                  )}
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInvoiceDetailsModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            Print Invoice
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InvoiceManagement; 
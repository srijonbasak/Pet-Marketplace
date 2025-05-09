import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Card, Alert, Spinner, Form } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ShopDashboard = () => {
  const [products, setProducts] = useState([]);
  const [shop, setShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShopProductsOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const shopRes = await axios.get('/api/shops/my-shop', config);
        setShop(shopRes.data);
        // Fetch products for this shop
        const productsRes = await axios.get(`/api/products?shop=${shopRes.data._id}`, config);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data.filter(p => p !== null) : []);
        // Fetch orders for this shop (placeholder endpoint)
        const ordersRes = await axios.get(`/api/orders?seller=${shopRes.data._id}`, config);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data.filter(o => o !== null) : []);
      } catch (err) {
        setError('Failed to fetch shop, products, or orders.');
        setProducts([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShopProductsOrders();
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

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }

  return (
    <Container className="py-4">
      <Card>
        <Card.Body>
          <Card.Title className="mb-4 d-flex justify-content-between align-items-center">
            <span>Shop Dashboard</span>
            <Button variant="success" onClick={handleAddProduct}>Add Product</Button>
          </Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          {shop && (
            <div className="mb-4">
              <h5>{shop.name}</h5>
              <p>{shop.description}</p>
            </div>
          )}
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!products || products.length === 0 ? (
                <tr><td colSpan="5" className="text-center">No products found.</td></tr>
              ) : (
                products.map(product => product && (
                  <tr key={product._id}>
                    <td>{product.name || 'Unnamed Product'}</td>
                    <td>{product.category || 'Uncategorized'}</td>
                    <td>${product.price || 0}</td>
                    <td>{product.stock || 0}</td>
                    <td>
                      <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(product._id)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(product._id)}>Delete</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {/* Orders Section */}
          <h4 className="mt-5 mb-3">Orders</h4>
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
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ShopDashboard; 
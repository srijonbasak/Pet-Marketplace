import React, { useState } from 'react';
import { Container, Table, Button, Alert, Form } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { default as api } from '../services/api';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    setOrderError('');
    try {
      // Get shopId from the first product in the cart
      const shopId = cart.items[0]?.product.shop || cart.items[0]?.product.shopId;
      if (!shopId) throw new Error('Shop not found for products in cart.');
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const orderData = {
        shop: shopId,
        items: cart.items.map(item => ({ product: item.product._id, quantity: item.quantity })),
        paymentMethod,
        total: cart.total
      };
      await api.post('/orders', orderData, config);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      setOrderError(err.response?.data?.message || err.message || 'Failed to place order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (orderPlaced) {
    return (
      <Container className="py-5">
        <Alert variant="success">
          Order placed successfully! The seller will be notified. You can view your order in your dashboard.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">My Cart</h1>
      {cart.items.length === 0 ? (
        <Alert variant="info">Your cart is empty.</Alert>
      ) : (
        <>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map(item => (
                <tr key={item.product._id}>
                  <td>{item.product.name}</td>
                  <td>${item.product.price}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="mx-2">{item.quantity}</span>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </td>
                  <td>${(item.product.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => removeFromCart(item.product._id)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <h4 className="text-end">Total: ${cart.total.toFixed(2)}</h4>

          <Form className="my-4">
            <Form.Label as="legend">Select Payment Method</Form.Label>
            <div>
              <Form.Check
                type="radio"
                id="cod"
                label="Cash on Delivery"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
              />
              <Form.Check
                type="radio"
                id="card"
                label="Card"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
              />
              <Form.Check
                type="radio"
                id="bkash"
                label="bKash"
                name="paymentMethod"
                value="bkash"
                checked={paymentMethod === 'bkash'}
                onChange={() => setPaymentMethod('bkash')}
              />
            </div>
          </Form>

          {orderError && <Alert variant="danger">{orderError}</Alert>}

          <div className="text-end">
            <Button variant="success" onClick={handlePlaceOrder} disabled={placingOrder}>
              {placingOrder ? 'Placing Order...' : 'Place Order'}
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};

export default Cart; 
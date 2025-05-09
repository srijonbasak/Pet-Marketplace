import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button, Badge } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartMsg, setCartMsg] = useState('');
  const [wishlistMsg, setWishlistMsg] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productAPI.getProductById(id);
        setProduct(res.data);
      } catch (err) {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product);
    setCartMsg('Added to cart!');
    setTimeout(() => setCartMsg(''), 2000);
  };

  const handleAddToWishlist = () => {
    setWishlistMsg('Added to wishlist!');
    setTimeout(() => setWishlistMsg(''), 2000);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Link to="/products" className="btn btn-outline-primary mt-3">
          Back to Products
        </Link>
      </Container>
    );
  }

  const outOfStock = product.stock === 0;

  return (
    <Container className="py-5">
      <Row>
        <Col md={6} className="mb-4">
          {product.images && product.images.length > 0 ? (
            <Card.Img
              src={product.images[0]}
              alt={product.name}
              style={{ objectFit: 'cover', width: '100%', height: '350px' }}
            />
          ) : (
            <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '350px' }}>
              <span>No Image</span>
            </div>
          )}
        </Col>
        <Col md={6}>
          <h2>{product.name}</h2>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Price:</strong> ${product.price}</p>
          <p>
            <strong>Stock:</strong> {product.stock}{' '}
            {outOfStock && <Badge bg="danger">Out of Stock</Badge>}
          </p>
          <p><strong>Description:</strong> {product.description}</p>
          {product.shop && (
            <p><strong>Shop:</strong> {product.shop.name}</p>
          )}
          {product.seller && (
            <p><strong>Seller:</strong> {product.seller.firstName} {product.seller.lastName}</p>
          )}
          <div className="mb-3">
            <Button
              variant="primary"
              className="me-2"
              onClick={handleAddToCart}
              disabled={outOfStock}
            >
              Add to Cart
            </Button>
            <Button
              variant="outline-secondary"
              onClick={handleAddToWishlist}
            >
              Add to Wishlist
            </Button>
          </div>
          {cartMsg && <Alert variant="success">{cartMsg}</Alert>}
          {wishlistMsg && <Alert variant="success">{wishlistMsg}</Alert>}
          <Link to="/products" className="btn btn-outline-primary mt-3">
            Back to Products
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetails; 
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import './ProductDetails.css';
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
            <motion.img
              src={product.images[0]}
              alt={product.name}
              className="product-details-img w-100"
              style={{ height: '350px', objectFit: 'cover' }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
            />
          ) : (
            <motion.div className="bg-light d-flex align-items-center justify-content-center rounded-4" style={{ height: '350px' }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
            >
              <span>No Image</span>
            </motion.div>
          )}
        </Col>
        <Col md={6}>
          <motion.div className="product-details-card p-4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <h2 className="fw-bold mb-2 text-success-emphasis">{product.name}</h2>
            <p className="mb-2"><strong>Category:</strong> <Badge bg="info" text="dark">{product.category}</Badge></p>
            <p className="mb-2"><strong>Price:</strong> <span className="fw-bold text-success fs-5">${product.price}</span></p>
            <p className="mb-2">
              <strong>Stock:</strong> <Badge bg={outOfStock ? 'danger' : 'success'}>{outOfStock ? 'Out of Stock' : product.stock}</Badge>
            </p>
            <p className="mb-2"><strong>Description:</strong> {product.description}</p>
            {product.shop && (
              <p className="mb-2"><strong>Shop:</strong> {product.shop.name}</p>
            )}
            {product.seller && (
              <p className="mb-2"><strong>Seller:</strong> {product.seller.firstName} {product.seller.lastName}</p>
            )}
            <div className="mb-3 d-flex gap-2">
              <Button
                className="product-details-btn"
                onClick={handleAddToCart}
                disabled={outOfStock}
              >
                Add to Cart
              </Button>
              <Button
                variant="outline-dark"
                className="rounded-pill px-3 product-details-btn"
                onClick={handleAddToWishlist}
              >
                Add to Wishlist
              </Button>
            </div>
            {cartMsg && <Alert variant="success">{cartMsg}</Alert>}
            {wishlistMsg && <Alert variant="success">{wishlistMsg}</Alert>}
            <Link to="/products" className="btn btn-outline-primary mt-3 rounded-pill px-3">
              Back to Products
            </Link>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetails; 
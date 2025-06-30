import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Pagination, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import PetProductLottie from '../components/common/PetProductLottie';
import './ProductListing.css';

const PRODUCTS_PER_PAGE = 6;

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productAPI.getAllProducts();
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="hero-section text-white py-5 position-relative" style={{ overflow: 'hidden', minHeight: 320, background: 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)' }}>
        <Container className="position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center flex-column-reverse flex-md-row">
            <div className="col-12 col-md-7 text-center text-md-start mb-4 mb-md-0">
              <motion.h1 className="display-4 fw-bold mb-3"
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}>
                Pet Products
              </motion.h1>
              <motion.p className="lead mb-4"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}>
                Shop for the best products for your pets, from food to toys and more!
              </motion.p>
            </div>
            <div className="col-12 col-md-5 d-flex justify-content-center align-items-center position-relative" style={{ minHeight: 220 }}>
              <PetProductLottie style={{ width: 'min(90vw, 260px)', height: 'min(90vw, 260px)' }} />
            </div>
          </div>
        </Container>
      </div>
      <Container className="py-5">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : products.length === 0 ? (
          <Alert variant="info">No products found.</Alert>
        ) : (
          <>
            <Row>
              {paginatedProducts.map(product => (
                <Col key={product._id} md={4} sm={6} className="mb-4">
                  <div className="h-100">
                    <div className="product-card-anim h-100">
                      <Card className="h-100 border-0 shadow-lg rounded-4 overflow-hidden position-relative product-card-custom">
                        {product.images && product.images[0] && (
                          <div className="overflow-hidden position-relative" style={{ height: 220 }}>
                            <Card.Img
                              variant="top"
                              src={product.images[0]}
                              alt={product.name}
                              style={{ objectFit: 'cover', height: '100%', width: '100%', transition: 'transform 0.5s cubic-bezier(.4,2,.6,1)', borderRadius: '0 0 1.5rem 1.5rem' }}
                              className="product-card-img"
                            />
                          </div>
                        )}
                        <Card.Body className="d-flex flex-column justify-content-between p-4">
                          <div>
                            <Card.Title className="fw-bold fs-4 mb-2 text-success-emphasis">{product.name}</Card.Title>
                            <Card.Text className="mb-3 text-secondary">
                              <span className="badge bg-gradient bg-info text-dark me-2 mb-1">{product.category}</span>
                              <span className="badge bg-gradient bg-light text-dark me-2 mb-1">Stock: {product.stock}</span>
                            </Card.Text>
                          </div>
                          <div className="mb-2">
                            <span className="fw-bold text-success fs-5">${product.price}</span>
                          </div>
                          <div className="d-flex gap-2 mt-3 justify-content-end">
                            <Button variant="gradient-green" size="sm" className="rounded-pill px-3 product-card-btn" onClick={() => addToCart(product)}>
                              <span className="fw-bold">Add to Cart</span>
                            </Button>
                            <Button variant="gradient-green" size="sm" className="rounded-pill px-3 product-card-btn" onClick={() => { addToCart(product); navigate('/cart'); }}>
                              <span className="fw-bold">Buy Now</span>
                            </Button>
                            <Button variant="outline-dark" size="sm" className="rounded-pill px-3 product-card-btn" onClick={() => navigate(`/products/${product._id}`)}>
                              <span className="fw-bold">View Details</span>
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                {[...Array(totalPages)].map((_, idx) => (
                  <Pagination.Item
                    key={idx + 1}
                    active={currentPage === idx + 1}
                    onClick={() => handlePageChange(idx + 1)}
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
    </>
  );
};

export default ProductListing;
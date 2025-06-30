import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Pagination, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import PetProductLottie from '../components/common/PetProductLottie';

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
              <h1 className="display-4 fw-bold mb-3">Pet Products</h1>
              <p className="lead mb-4">Shop for the best products for your pets, from food to toys and more!</p>
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
                  <Card className="h-100 product-card">
                    {product.images && product.images[0] && (
                    <Card.Img
                      variant="top"
                      src={product.images[0]}
                      alt={product.name}
                      style={{ objectFit: 'cover', height: '200px' }}
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{product.name}</Card.Title>
                    <Card.Text>
                      <strong>Category:</strong> {product.category}<br />
                      <strong>Price:</strong> ${product.price}<br />
                      <strong>Stock:</strong> {product.stock}
                    </Card.Text>
                    <div className="d-flex gap-2 mt-3">
                      <Button variant="primary" onClick={() => addToCart(product)}>
                        Add to Cart
                      </Button>
                      <Button variant="success" onClick={() => { addToCart(product); navigate('/cart'); }}>
                        Buy Now
                      </Button>
                      <Button variant="outline-secondary" onClick={() => navigate(`/products/${product._id}`)}>
                        View Details
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
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
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Image, Button } from 'react-bootstrap';
import axios from 'axios';

const ShopPage = () => {
  const { shopname } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const shopRes = await axios.get(`/api/shops/by-name/${shopname}`);
        setShop(shopRes.data.shop);
        setProducts(shopRes.data.products || []);
      } catch (err) {
        setError('Failed to load shop info.');
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [shopname]);

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }
  if (error) {
    return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
  }
  if (!shop) {
    return <Container className="py-5"><Alert variant="info">Shop not found.</Alert></Container>;
  }

  // Show all products for the shop
  const displayedProducts = products;

  return (
    <Container className="py-5">
      {/* Banner */}
      {shop.banner && (
        <div className="mb-4">
          <Image src={shop.banner} alt="Shop Banner" fluid rounded style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
        </div>
      )}
      <Row className="align-items-center mb-4">
        <Col xs="auto">
          {shop.profilePic && (
            <Image src={shop.profilePic} alt="Profile" roundedCircle width={100} height={100} />
          )}
        </Col>
        <Col>
          <h2 className="mb-1">{shop.name}</h2>
          <div className="text-muted mb-2">@{shop.shopname}</div>
          <div>{shop.description}</div>
          <div className="mt-2">
            {shop.address && (
              <div>
                <strong>Address:</strong>{' '}
                {shop.address.street ? shop.address.street + ', ' : ''}
                {shop.address.city ? shop.address.city + ', ' : ''}
                {shop.address.state ? shop.address.state + ' ' : ''}
                {shop.address.zipCode ? shop.address.zipCode + ', ' : ''}
                {shop.address.country || ''}
              </div>
            )}
            {(shop.phone || shop.email) && <div><strong>Contact:</strong> {shop.phone} {shop.phone && shop.email && '|'} {shop.email}</div>}
            {shop.website && (
              <div>
                <strong>Website:</strong> <a href={shop.website} target="_blank" rel="noopener noreferrer">{shop.website}</a>
              </div>
            )}
          </div>
          <div className="mt-3 d-flex gap-2 flex-wrap">
            {shop.email && <Button variant="outline-primary" onClick={() => window.location = `mailto:${shop.email}`}>Contact Seller</Button>}
            {shop.website && (
              <Button variant="outline-secondary" href={shop.website} target="_blank">Visit Website</Button>
            )}
            <Button variant="outline-success" onClick={() => navigator.clipboard.writeText(window.location.href)}>Share Shop</Button>
          </div>
        </Col>
      </Row>
      <h3 className="mb-4">Products</h3>
      <Row>
        {displayedProducts.length === 0 ? (
          <Col><Alert variant="info">No products found.</Alert></Col>
        ) : (
          displayedProducts.map(product => (
            <Col key={product._id} md={4} className="mb-4">
              <Card className="h-100">
                {product.images && product.images[0] && (
                  <Card.Img variant="top" src={product.images[0]} alt={product.name} style={{ objectFit: 'cover', height: '200px' }} />
                )}
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text>
                    <strong>Category:</strong> {product.category}<br />
                    <strong>Price:</strong> ${product.price}<br />
                    <strong>Stock:</strong> {product.stock}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default ShopPage; 
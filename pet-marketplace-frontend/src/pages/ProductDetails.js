import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';

const ProductDetails = () => {
  const { id } = useParams();

  return (
    <Container className="py-5">
      <h1 className="mb-4">Product Details</h1>
      <Alert variant="info">
        <Alert.Heading>Product Information</Alert.Heading>
        <p>
          This product (ID: {id}) details page is currently under development. Check back soon!
        </p>
        <hr />
        <div className="d-flex justify-content-end">
          <Link to="/products" className="btn btn-outline-primary">
            Back to Products
          </Link>
        </div>
      </Alert>
    </Container>
  );
};

export default ProductDetails; 
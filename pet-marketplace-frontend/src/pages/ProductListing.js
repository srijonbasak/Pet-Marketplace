import React from 'react';
import { Container, Alert } from 'react-bootstrap';

const ProductListing = () => {
  return (
    <Container className="py-5">
      <h1 className="mb-4">Pet Products</h1>
      <Alert variant="info">
        <Alert.Heading>Coming Soon!</Alert.Heading>
        <p>
          We're currently working on our product marketplace. Check back soon for a wide selection of pet products!
        </p>
      </Alert>
    </Container>
  );
};

export default ProductListing; 
import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const RescueDetails = () => {
  const { id } = useParams();

  return (
    <Container className="py-5">
      <Link to="/rescues" className="btn btn-outline-primary mb-4">
        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
        Back to Rescue Operations
      </Link>
      
      <h1 className="mb-4">Rescue Operation Details</h1>
      
      <Alert variant="info">
        <Alert.Heading>Rescue Information</Alert.Heading>
        <p>
          Details for rescue operation (ID: {id}) are currently under development. Check back soon for complete information about this rescue mission.
        </p>
      </Alert>
    </Container>
  );
};

export default RescueDetails; 
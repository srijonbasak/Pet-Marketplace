import React from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandHoldingHeart } from '@fortawesome/free-solid-svg-icons';

const RescueOperations = () => {
  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <FontAwesomeIcon icon={faHandHoldingHeart} size="3x" className="text-primary mb-3" />
        <h1>Animal Rescue Operations</h1>
        <p className="lead">Help us save animals in need</p>
      </div>
      
      <Alert variant="info" className="mb-5">
        <Alert.Heading>Coming Soon!</Alert.Heading>
        <p>
          Our rescue operations platform is currently under development. Soon, you'll be able to discover and support animal rescue missions in your area.
        </p>
      </Alert>
      
      <Row className="mb-5">
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h4>What We Do</h4>
              <p>
                We coordinate rescue operations for animals in distress, working with local volunteers, veterinarians, and shelters to provide care and find forever homes.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h4>How You Can Help</h4>
              <p>
                You can support our rescue operations by donating, volunteering, or providing temporary foster homes for animals in need.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RescueOperations; 
import React from 'react';
import { Container, Button, Alert } from 'react-bootstrap'; // Card removed, not used
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import RescueLottie from '../components/common/RescueLottie';
import './RescueDetails.css';

const RescueDetails = () => {
  const { id } = useParams();

  // Placeholder rescue data for demo (replace with real fetch if available)
  const rescue = {
    title: 'Emergency Flood Rescue',
    location: 'Springfield, IL',
    date: '2024-05-10',
    status: 'Ongoing',
    description: 'Our team responded to severe flooding in Springfield, rescuing over 30 animals and providing emergency care. The operation is ongoing as we continue to help displaced pets and families.',
    ngo: {
      name: 'SafePaws Rescue',
      contact: 'contact@safepaws.org',
      phone: '+1 555-123-4567',
      website: 'https://safepaws.org',
    },
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="rescue-details-hero">
        <div className="rescue-details-hero-content">
          <motion.h1 className="rescue-details-hero-title" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, type: 'spring' }}>
            Rescue Operation
          </motion.h1>
          <motion.p className="rescue-details-hero-subtitle" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}>
            {rescue.title} • {rescue.location}
          </motion.p>
        </div>
        <motion.div className="rescue-details-hero-lottie" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, type: 'spring' }}>
          <RescueLottie style={{ width: '100%', height: '100%' }} />
        </motion.div>
      </div>

      <Container className="py-4">
        <Link to="/rescues" className="btn btn-outline-primary mb-4">
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Rescue Operations
        </Link>

        <motion.div className="rescue-details-card p-4 mb-4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: 'spring' }}>
          <h2 className="fw-bold mb-2">{rescue.title}</h2>
          <div className="mb-2">
            <span className="badge bg-info me-2">{rescue.status}</span>
            <span className="text-muted">{rescue.date}</span>
          </div>
          <p className="mb-3">{rescue.description}</p>
          <h5 className="mb-2">Rescue Organization</h5>
          <div className="mb-2"><strong>Name:</strong> {rescue.ngo.name}</div>
          <div className="mb-2"><strong>Email:</strong> {rescue.ngo.contact}</div>
          <div className="mb-2"><strong>Phone:</strong> {rescue.ngo.phone}</div>
          <div className="mb-2"><strong>Website:</strong> <a href={rescue.ngo.website} target="_blank" rel="noopener noreferrer">{rescue.ngo.website}</a></div>
          <Button className="rescue-details-btn mt-3" size="lg">Support This Rescue</Button>
        </motion.div>

        <Alert variant="info">
          <Alert.Heading>Operation ID: {id}</Alert.Heading>
          <p>
            This is a demo rescue operation. Replace with real data as needed.
          </p>
        </Alert>
      </Container>
    </div>
  );
};

export default RescueDetails;
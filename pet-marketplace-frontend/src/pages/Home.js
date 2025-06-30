import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faShoppingCart, faHandHoldingHeart, faSearch, faTag, faHeart } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { petAPI } from '../services/api';
import AnimatedCard from '../components/common/AnimatedCard';
import SkeletonCard from '../components/common/SkeletonCard';
import InteractivePetBackground from '../components/common/InteractivePetBackground';
import FeaturedPetsCarousel from '../components/common/FeaturedPetsCarousel';
import './Home.css';

import MultiLottieAnimation from '../components/common/MultiLottieAnimation';
import HeroLottie from '../components/common/HeroLottie';
import PetAdoptionLottie from '../components/common/PetAdoptionLottie';
import PetProductLottie from '../components/common/PetProductLottie';
import RescueLottie from '../components/common/RescueLottie';

const Home = () => {
  const [featuredPets, setFeaturedPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        setLoading(true);
        const petsRes = await petAPI.getAllPets({ limit: 3, status: 'available' });
        setFeaturedPets(petsRes.data.pets || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching featured items:', err);
        setError('Could not load featured pets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Hero Section */}
      <div className="hero-section text-white py-5 position-relative" style={{ overflow: 'hidden', minHeight: 420 }}>
        <Container className="position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center flex-column-reverse flex-md-row">
            <div className="col-12 col-md-6 text-center text-md-start mb-4 mb-md-0">
              <motion.h1 className="display-3 fw-bold mb-4" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, type: 'spring' }}>
                Find Your Forever Friend
              </motion.h1>
              <motion.p className="lead mb-4" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}>
                Where pets find their people.
              </motion.p>
              <motion.div className="d-grid gap-3 d-md-flex justify-content-md-start justify-content-center" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.4, type: 'spring' }}>
                <Link to="/pets" className="btn btn-primary btn-lg">
                  <FontAwesomeIcon icon={faPaw} className="me-2" />
                  Adopt a Pet
                </Link>
                <Link to="/products" className="btn btn-light btn-lg">
                  <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                  Shop Products
                </Link>
              </motion.div>
            </div>
            <div className="col-12 col-md-6 d-flex justify-content-center align-items-center position-relative" style={{ minHeight: 320 }}>
              {/* Appended Lottie animations in the hero section */}
              <div style={{ position: 'relative', width: 'min(90vw, 520px)', height: 'min(90vw, 520px)', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MultiLottieAnimation style={{ width: '65%', height: '80%' }} />
                <div style={{ width: '55%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <HeroLottie style={{ width: '100%', height: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Services Section */}
      <div className="py-5 bg-light full-width-section">
        <Container>
          <h2 className="text-center mb-5 display-5 fw-bold">Our Services</h2>
          <Row>
            <Col md={4} className="mb-4 text-center">
              <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <div className="service-icon-wrapper mx-auto mb-4" style={{ width: 120, height: 120 }}>
                  <PetAdoptionLottie style={{ width: '100%', height: '100%' }} />
                </div>
                <h4>Pet Adoption</h4>
                <p className="text-muted">Find your perfect companion from our selection of loving pets.</p>
                <Link to="/pets" className="btn btn-outline-primary">Learn More</Link>
              </motion.div>
            </Col>
            <Col md={4} className="mb-4 text-center">
              <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
                <div className="service-icon-wrapper mx-auto mb-4" style={{ width: 120, height: 120 }}>
                  <PetProductLottie style={{ width: '100%', height: '100%' }} />
                </div>
                <h4>Pet Products</h4>
                <p className="text-muted">High-quality food, toys, and accessories for your furry friends.</p>
                <Link to="/products" className="btn btn-outline-primary">Learn More</Link>
              </motion.div>
            </Col>
            <Col md={4} className="mb-4 text-center">
              <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}>
                <div className="service-icon-wrapper mx-auto mb-4" style={{ width: 120, height: 120 }}>
                  <RescueLottie style={{ width: '100%', height: '100%' }} />
                </div>
                <h4>Support Rescue</h4>
                <p className="text-muted">Help us save animals in need through donations and support.</p>
                <Link to="/rescues" className="btn btn-outline-primary">Learn More</Link>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Featured Pets Section */}
      <section className="featured-section full-width-section py-5">
        <Container>
          <h2 className="text-center mb-4">Meet Your New Best Friend</h2>
          <FeaturedPetsCarousel pets={featuredPets} loading={loading} />
        </Container>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section full-width-section py-5 text-center text-white">
        <Container>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <h2 className="display-5 fw-bold">Join Our Community</h2>
                <p className="lead my-4">Be the first to know about new arrivals, special offers, and community events.</p>
                <Link to="/register" className="btn btn-light btn-lg">
                    Sign Up Now
                </Link>
            </motion.div>
        </Container>
      </section>
    </motion.div>
  );
};

export default Home;
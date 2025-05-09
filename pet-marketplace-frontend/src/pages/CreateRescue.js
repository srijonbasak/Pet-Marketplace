import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateRescue = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    city: '',
    state: '',
    country: '',
    imageUrl: '',
    plannedDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/rescues', {
        title: form.title,
        description: form.description,
        location: {
          city: form.city,
          state: form.state,
          country: form.country
        },
        imageUrl: form.imageUrl,
        rescueDate: { planned: form.plannedDate }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setTimeout(() => navigate('/rescues'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create rescue');
    }
    setLoading(false);
  };

  return (
    <Container className="py-5">
      <h1>Create Rescue Operation</h1>
      <Form onSubmit={handleSubmit} className="mt-4">
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Rescue created successfully!</Alert>}
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control name="title" value={form.title} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" name="description" value={form.description} onChange={handleChange} required rows={4} />
        </Form.Group>
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control name="city" value={form.city} onChange={handleChange} required />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control name="state" value={form.state} onChange={handleChange} required />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control name="country" value={form.country} onChange={handleChange} required />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Planned Date</Form.Label>
          <Form.Control type="date" name="plannedDate" value={form.plannedDate} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Image URL</Form.Label>
          <Form.Control name="imageUrl" value={form.imageUrl} onChange={handleChange} required />
        </Form.Group>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Rescue'}
        </Button>
      </Form>
    </Container>
  );
};

export default CreateRescue; 
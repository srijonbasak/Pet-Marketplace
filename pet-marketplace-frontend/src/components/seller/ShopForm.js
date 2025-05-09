import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ShopForm = ({ shop, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    contactInfo: {
      phone: '',
      email: '',
      website: ''
    },
    businessHours: {
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '' }
    },
    categories: []
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (shop) {
      setFormData(shop);
    }
  }, [shop]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'businessHours') {
        const [day, time] = child.split('.');
        setFormData(prev => ({
          ...prev,
          businessHours: {
            ...prev.businessHours,
            [day]: {
              ...prev.businessHours[day],
              [time]: value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'logo') {
      setLogo(file);
    } else {
      setBanner(file);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Debug: log formData before sending
    console.log('Submitting shop formData:', formData);

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Validate business hours (optional: ensure open/close are valid times or empty)
      const validBusinessHours = {};
      for (const day of Object.keys(formData.businessHours)) {
        const open = formData.businessHours[day].open;
        const close = formData.businessHours[day].close;
        validBusinessHours[day] = {
          open: open || '',
          close: close || ''
        };
      }
      const payload = {
        ...formData,
        businessHours: validBusinessHours
      };

      let shopData;
      if (isEdit) {
        const res = await axios.put(`/api/shops/${shop._id}`, payload, config);
        shopData = res.data;
      } else {
        const res = await axios.post('/api/shops', payload, config);
        shopData = res.data;
      }

      // Upload logo if selected
      if (logo) {
        const logoFormData = new FormData();
        logoFormData.append('logo', logo);
        await axios.post(`/api/shops/${shopData._id}/logo`, logoFormData, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Upload banner if selected
      if (banner) {
        const bannerFormData = new FormData();
        bannerFormData.append('banner', banner);
        await axios.post(`/api/shops/${shopData._id}/banner`, bannerFormData, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      navigate('/seller/dashboard');
    } catch (err) {
      // Show more detailed error if available
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">
                {isEdit ? 'Edit Shop' : 'Create New Shop'}
              </Card.Title>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Shop Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={onChange}
                    required
                  />
                </Form.Group>

                <Card.Subtitle className="mb-3">Contact Information</Card.Subtitle>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="contactInfo.phone"
                        value={formData.contactInfo.phone}
                        onChange={onChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="contactInfo.email"
                        value={formData.contactInfo.email}
                        onChange={onChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Website</Form.Label>
                      <Form.Control
                        type="url"
                        name="contactInfo.website"
                        value={formData.contactInfo.website}
                        onChange={onChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Card.Subtitle className="mb-3">Address</Card.Subtitle>
                <Form.Group className="mb-3">
                  <Form.Label>Street Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={onChange}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={onChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>State</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.state"
                        value={formData.address.state}
                        onChange={onChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>ZIP Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={onChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Country</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={onChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Card.Subtitle className="mb-3">Business Hours</Card.Subtitle>
                {Object.keys(formData.businessHours).map(day => (
                  <Row key={day} className="mb-2">
                    <Col md={3}>
                      <Form.Label className="text-capitalize">{day}</Form.Label>
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="time"
                        name={`businessHours.${day}.open`}
                        value={formData.businessHours[day].open}
                        onChange={onChange}
                      />
                    </Col>
                    <Col md={1} className="text-center">
                      <Form.Label>to</Form.Label>
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="time"
                        name={`businessHours.${day}.close`}
                        value={formData.businessHours[day].close}
                        onChange={onChange}
                      />
                    </Col>
                  </Row>
                ))}

                <Card.Subtitle className="mb-3 mt-4">Shop Images</Card.Subtitle>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Shop Logo</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'logo')}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Shop Banner</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'banner')}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mt-4"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : isEdit ? 'Update Shop' : 'Create Shop'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ShopForm; 
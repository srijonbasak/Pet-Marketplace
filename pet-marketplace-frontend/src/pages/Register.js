import React, { useState } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const { username, email, password, confirmPassword, role } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setError('');
      setIsLoading(true);
      
      const userData = { username, email, password, role };
      const res = await register(userData);
      if (res && res.user) {
        // Redirect based on role
        switch (res.user.role) {
          case 'seller':
            navigate('/seller/dashboard');
            break;
          case 'ngo':
            navigate('/ngo/dashboard');
            break;
          case 'employee':
            navigate('/employee/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-1">
                  <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                  Register
                </h2>
                <p className="text-muted">Create your Pet Marketplace account</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="username">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Choose a username"
                        name="username"
                        value={username}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="password">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Create a password"
                        name="password"
                        value={password}
                        onChange={handleChange}
                        required
                      />
                      <Form.Text className="text-muted">
                        Password must be at least 6 characters long
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="confirmPassword">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm your password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-4" controlId="role">
                  <Form.Label>Register as</Form.Label>
                  <Form.Select
                    name="role"
                    value={role}
                    onChange={handleChange}
                    required
                  >
                    <option value="buyer">Pet Buyer/Adopter</option>
                    <option value="seller">Pet Seller</option>
                    <option value="ngo">NGO/Rescue Organization</option>
                    <option value="employee">Employee</option>
                  </Form.Select>
                </Form.Group>
                
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Register'}
                </Button>
              </Form>
              
              <div className="text-center mt-4">
                <p className="mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-decoration-none">Login</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register; 
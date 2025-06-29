import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setError('');
      setIsLoading(true);
      const res = await login(email, password);
      console.log('Login response:', res);
      if (res && res.user) {
        // Redirect based on role immediately after login
        switch (res.user.role) {
          case 'seller':
            navigate('/seller/dashboard', { replace: true });
            break;
          case 'ngo':
            navigate('/ngo/dashboard', { replace: true });
            break;
          case 'employee':
            // For employees, direct them to the employee dashboard which shows shop features
            console.log('Employee login detected, redirecting to employee dashboard');
            navigate('/employee/dashboard', { replace: true });
            break;
          default:
            navigate('/dashboard', { replace: true });
        }
      }
    } catch (err) {
      setError('Failed to log in. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-1">
                  <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                  Login
                </h2>
                <p className="text-muted">Access your Pet Marketplace account</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="d-flex justify-content-end mt-1">
                    <Link to="/forgot-password" className="text-decoration-none small">
                      Forgot password?
                    </Link>
                  </div>
                </Form.Group>
                
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
              
              <div className="text-center mt-4">
                <p className="mb-0">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-decoration-none">Register</Link>
                </p>
                <small className="text-muted mt-3 d-block">
                  Employees: Use the email and password provided by your shop manager
                </small>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login; 
import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Email entry, 2: New password entry
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    
    // This would normally send a request to your backend API to send a reset code
    // For now, we'll just simulate the process
    setMessage({ type: 'success', text: 'If an account with this email exists, a password reset code has been sent.' });
    
    // Simulate moving to step 2 after 2 seconds
    setTimeout(() => {
      setStep(2);
      setMessage({ type: '', text: '' });
    }, 2000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'danger', text: 'Passwords do not match.' });
      return;
    }
    
    // This would normally send a request to your backend API to reset the password
    // For now, we'll just simulate success
    setMessage({ type: 'success', text: 'Your password has been successfully reset. You can now log in with your new password.' });
    
    // Clear form
    setNewPassword('');
    setConfirmPassword('');
    setResetCode('');
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-center">
        <Card className="shadow-sm" style={{ maxWidth: '500px', width: '100%' }}>
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <FontAwesomeIcon icon={faKey} size="3x" className="text-primary mb-3" />
              <h2>Forgot Password</h2>
              <p className="text-muted">
                {step === 1 
                  ? 'Enter your email to reset your password.' 
                  : 'Enter your reset code and new password.'}
              </p>
            </div>
            
            {message.text && (
              <Alert variant={message.type} className="mb-4">
                {message.text}
              </Alert>
            )}
            
            {step === 1 ? (
              <Form onSubmit={handleEmailSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Form.Text className="text-muted">
                    We'll send a password reset code to this email.
                  </Form.Text>
                </Form.Group>
                
                <div className="d-grid gap-2 mb-3">
                  <Button variant="primary" type="submit">
                    Request Reset Code
                  </Button>
                </div>
                
                <div className="text-center">
                  <Link to="/login" className="text-decoration-none">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Back to Login
                  </Link>
                </div>
              </Form>
            ) : (
              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Reset Code</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter reset code from email"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <Form.Text className="text-muted">
                    Password must be at least 8 characters.
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <div className="d-grid gap-2 mb-3">
                  <Button variant="primary" type="submit">
                    Reset Password
                  </Button>
                </div>
                
                <div className="text-center">
                  <Button 
                    variant="link" 
                    className="text-decoration-none p-0"
                    onClick={() => {
                      setStep(1);
                      setMessage({ type: '', text: '' });
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Back to Email Entry
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default ForgotPassword; 
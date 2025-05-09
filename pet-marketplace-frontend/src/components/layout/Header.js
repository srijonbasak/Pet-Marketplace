import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faShoppingCart, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { cart } = useCart();

  return (
    <Navbar expand="lg" bg="primary" variant="dark" sticky="top" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <FontAwesomeIcon icon={faPaw} className="me-2" />
          Pet Marketplace
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/pets">Pets</Nav.Link>
            <Nav.Link as={NavLink} to="/products">Products</Nav.Link>
            <Nav.Link as={NavLink} to="/rescues">Rescues</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={NavLink} to="/cart" className="position-relative">
              <FontAwesomeIcon icon={faShoppingCart} />
              {cart.length > 0 && (
                <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                  {cart.length}
                </Badge>
              )}
            </Nav.Link>
            {isAuthenticated ? (
              <>
                <NavDropdown title={
                  <span>
                    <FontAwesomeIcon icon={faUser} className="me-1" />
                    {currentUser?.username || 'Account'}
                  </span>
                } id="user-dropdown">
                  <NavDropdown.Item as={Link} to="/dashboard">Dashboard</NavDropdown.Item>
                  
                  {/* Conditional menu items based on user role */}
                  {currentUser?.role === 'seller' && (
                    <>
                      <NavDropdown.Item as={Link} to="/my-products">My Products</NavDropdown.Item>
                    </>
                  )}
                  
                  {['seller', 'admin', 'ngo'].includes(currentUser?.role) && (
                    <>
                      <NavDropdown.Item as={Link} to="/my-pets">My Pets</NavDropdown.Item>
                    </>
                  )}
                  
                  <NavDropdown.Item as={Link} to="/my-adoptions">My Adoptions</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logout}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login">Login</Nav.Link>
                <Nav.Link as={NavLink} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 
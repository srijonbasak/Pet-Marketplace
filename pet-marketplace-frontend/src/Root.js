import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import './utils/axiosConfig';

function Root() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <App />
            <ToastContainer position="top-right" autoClose={3000} />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default Root; 
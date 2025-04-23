import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Page components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PetListing from './pages/PetListing';
import PetDetails from './pages/PetDetails';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import RescueOperations from './pages/RescueOperations';
import RescueDetails from './pages/RescueDetails';
import Dashboard from './pages/Dashboard';
import AdoptionForm from './pages/AdoptionForm';
import MyAdoptions from './pages/MyAdoptions';
import MyPets from './pages/MyPets';
import MyProducts from './pages/MyProducts';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';

// Protected route component
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container py-4" style={{ minHeight: 'calc(100vh - 160px)' }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pets" element={<PetListing />} />
          <Route path="/pets/:id" element={<PetDetails />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/rescues" element={<RescueOperations />} />
          <Route path="/rescues/:id" element={<RescueDetails />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/pets/:id/adopt" element={
            <ProtectedRoute>
              <AdoptionForm />
            </ProtectedRoute>
          } />
          <Route path="/my-adoptions" element={
            <ProtectedRoute>
              <MyAdoptions />
            </ProtectedRoute>
          } />
          <Route path="/my-pets" element={
            <ProtectedRoute>
              <MyPets />
            </ProtectedRoute>
          } />
          <Route path="/my-products" element={
            <ProtectedRoute>
              <MyProducts />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;

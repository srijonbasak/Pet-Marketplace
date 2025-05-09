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
import ForgotPassword from './pages/ForgotPassword';
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
import Cart from './pages/Cart';
import ShopPage from './pages/ShopPage';

// Seller components
import SellerRegister from './components/auth/SellerRegister';
import SellerDashboard from './components/seller/SellerDashboard';
import ShopForm from './components/seller/ShopForm';
import AddProduct from './components/seller/AddProduct';
import ShopDashboard from './components/seller/ShopDashboard';

// Protected route component
import ProtectedRoute from './components/common/ProtectedRoute';
import PrivateRoute from './components/common/PrivateRoute';

import NgoDashboard from './components/ngo/NgoDashboard';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import AddPet from './components/ngo/AddPet';

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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/pets" element={<PetListing />} />
          <Route path="/pets/:id" element={<PetDetails />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/rescues" element={<RescueOperations />} />
          <Route path="/rescues/:id" element={<RescueDetails />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <PrivateRoute role="buyer">
              <Dashboard />
            </PrivateRoute>
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
          <Route path="/cart" element={<Cart />} />
          
          {/* Seller routes */}
          <Route path="/seller/register" element={<SellerRegister />} />
          <Route
            path="/seller/dashboard"
            element={
              <PrivateRoute role="seller">
                <SellerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/seller/create-shop"
            element={
              <PrivateRoute role="seller">
                <ShopForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/seller/edit-shop"
            element={
              <PrivateRoute role="seller">
                <ShopForm isEdit={true} />
              </PrivateRoute>
            }
          />
          <Route
            path="/seller/add-product"
            element={
              <PrivateRoute role="seller">
                <AddProduct />
              </PrivateRoute>
            }
          />
          <Route
            path="/seller/shop-dashboard"
            element={
              <PrivateRoute role="seller">
                <ShopDashboard />
              </PrivateRoute>
            }
          />
          
          {/* NGO routes */}
          <Route
            path="/ngo/dashboard"
            element={
              <PrivateRoute role="ngo">
                <NgoDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/ngo/add-pet"
            element={
              <PrivateRoute role="ngo">
                <AddPet />
              </PrivateRoute>
            }
          />
          
          {/* Employee routes */}
          <Route
            path="/employee/dashboard"
            element={
              <PrivateRoute role="employee">
                <EmployeeDashboard />
              </PrivateRoute>
            }
          />
          
          {/* Shop routes */}
          <Route path="/shop/:shopname" element={<ShopPage />} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;

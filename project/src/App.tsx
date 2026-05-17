import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

import AddProduct from './pages/farmer/AddProduct';
import MyProducts from './pages/farmer/MyProducts';
import Community from './pages/farmer/Community';
import SuggestedPrices from './pages/farmer/SuggestedPrices';
import OrdersReceived from './pages/farmer/OrdersReceived';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import AIShowcase from './pages/farmer/AIShowcase';

import Marketplace from './pages/consumer/Marketplace';
import ProductDetails from './pages/consumer/ProductDetails';
import Cart from './pages/consumer/Cart';
import MyOrders from './pages/consumer/MyOrders';
import RateFarm from './pages/consumer/RateFarm';
import ConsumerAIShowcase from './pages/consumer/AIShowcase';

import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import SuggestedPricesAdmin from './pages/admin/SuggestedPricesAdmin';
import ReviewsManagement from './pages/admin/ReviewsManagement';
import Announcements from './pages/admin/Announcements';
import Reports from './pages/admin/Reports';
import AdminSettings from './pages/admin/AdminSettings';
import DeliveryAssignment from './pages/admin/DeliveryAssignment';
import AdminAIShowcase from './pages/admin/AIShowcase';

import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import AssignedDeliveries from './pages/delivery/AssignedDeliveries';
import DeliveryHistory from './pages/delivery/DeliveryHistory';
import Notifications from './pages/delivery/Notifications';
import ProfileSettings from './pages/delivery/ProfileSettings';
import DeliveryEarnings from './pages/delivery/Earnings';
import DeliveryAIShowcase from './pages/delivery/AIShowcase';

import Checkout from './pages/consumer/Checkout';
import FarmerEarnings from './pages/farmer/Earnings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetails />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute role="farmer">
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/products"
            element={
              <ProtectedRoute role="farmer">
                <MyProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/add-product"
            element={
              <ProtectedRoute role="farmer">
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/community"
            element={
              <ProtectedRoute role="farmer">
                <Community />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/suggested-prices"
            element={
              <ProtectedRoute role="farmer">
                <SuggestedPrices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/orders"
            element={
              <ProtectedRoute role="farmer">
                <OrdersReceived />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/earnings"
            element={
              <ProtectedRoute role="farmer">
                <FarmerEarnings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/ai-showcase"
            element={
              <ProtectedRoute role="farmer">
                <AIShowcase />
              </ProtectedRoute>
            }
          />

          <Route
            path="/consumer/checkout"
            element={
              <ProtectedRoute role="consumer">
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/cart"
            element={
              <ProtectedRoute role="consumer">
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/orders"
            element={
              <ProtectedRoute role="consumer">
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/rate"
            element={
              <ProtectedRoute role="consumer">
                <RateFarm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/ai-showcase"
            element={
              <ProtectedRoute role="consumer">
                <ConsumerAIShowcase />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="admin">
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute role="admin">
                <ProductManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute role="admin">
                <OrderManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/prices"
            element={
              <ProtectedRoute role="admin">
                <SuggestedPricesAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute role="admin">
                <ReviewsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <ProtectedRoute role="admin">
                <Announcements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute role="admin">
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute role="admin">
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/delivery-assignment"
            element={
              <ProtectedRoute role="admin">
                <DeliveryAssignment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ai-showcase"
            element={
              <ProtectedRoute role="admin">
                <AdminAIShowcase />
              </ProtectedRoute>
            }
          />

          <Route
            path="/delivery/dashboard"
            element={
              <ProtectedRoute role="delivery_man">
                <DeliveryDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery/assigned"
            element={
              <ProtectedRoute role="delivery_man">
                <AssignedDeliveries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery/history"
            element={
              <ProtectedRoute role="delivery_man">
                <DeliveryHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery/notifications"
            element={
              <ProtectedRoute role="delivery_man">
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery/profile"
            element={
              <ProtectedRoute role="delivery_man">
                <ProfileSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery/earnings"
            element={
              <ProtectedRoute role="delivery_man">
                <DeliveryEarnings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery/ai-showcase"
            element={
              <ProtectedRoute role="delivery_man">
                <DeliveryAIShowcase />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

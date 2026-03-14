import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Receipts from './pages/Receipts';
import ReceiptDetail from './pages/ReceiptDetail';
import Deliveries from './pages/Deliveries';
import DeliveryDetail from './pages/DeliveryDetail';
import Transfers from './pages/Transfers';
import TransferDetail from './pages/TransferDetail';
import Adjustments from './pages/Adjustments';
import MoveHistory from './pages/MoveHistory';
import Stock from './pages/Stock';
import Settings from './pages/Settings';

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <>
      <Sidebar />
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
      <Route path="/verify-otp" element={isAuthenticated ? <Navigate to="/dashboard" /> : <VerifyOTP />} />
      <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ResetPassword />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/receipts" element={<Receipts />} />
        <Route path="/receipts/:id" element={<ReceiptDetail />} />
        <Route path="/deliveries" element={<Deliveries />} />
        <Route path="/deliveries/:id" element={<DeliveryDetail />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/transfers/:id" element={<TransferDetail />} />
        <Route path="/adjustments" element={<Adjustments />} />
        <Route path="/move-history" element={<MoveHistory />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

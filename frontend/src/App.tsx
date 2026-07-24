import { Navigate, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import Reservations from './pages/Reservations';
import Loyalty from './pages/Loyalty';
import Notifications from './pages/Notifications';
import OwnerDashboard from './pages/OwnerDashboard';
import AgentDashboard from './pages/AgentDashboard';
import AdminPanel from './pages/AdminPanel';
import DeliveryLocation from './pages/DeliveryLocation';
import ProtectedRoute from './components/ProtectedRoute';


<></>
function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurants/:id" element={<RestaurantDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<ProtectedRoute roles={['customer']}><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute roles={['customer']}><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute roles={['customer']}><Orders /></ProtectedRoute>} />
        <Route path="/reservations" element={<ProtectedRoute roles={['customer']}><Reservations /></ProtectedRoute>} />
        <Route path="/delivery-location" element={<ProtectedRoute roles={['customer']}><DeliveryLocation /></ProtectedRoute>} />
        <Route path="/loyalty" element={<ProtectedRoute roles={['customer']}><Loyalty /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute roles={['customer']}><Notifications /></ProtectedRoute>} />
        <Route path="/owner" element={<ProtectedRoute roles={['restaurantOwner']}><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/agent" element={<ProtectedRoute roles={['deliveryAgent']}><AgentDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container">
        <div className="brand-group">
          <Link to="/" className="brand">TiffinBox</Link>
          {(!user || user.role === 'customer') && (
            <Link to={user ? '/delivery-location' : '/login'} className="location-pill">📍 Set delivery location</Link>
          )}
        </div>
        <nav>
          {(!user || user.role === 'customer') && <Link to="/">Restaurants</Link>}
          {user?.role === 'customer' && <Link to="/orders">Orders</Link>}
          {user?.role === 'customer' && <Link to="/reservations">Reservations</Link>}
          {user?.role === 'customer' && <Link to="/loyalty">Rewards</Link>}
          {user?.role === 'customer' && <Link to="/notifications">🔔</Link>}
          {user?.role === 'customer' && <Link to="/cart">Cart</Link>}
          {user?.role === 'restaurantOwner' && <Link to="/owner">Owner Dashboard</Link>}
          {user?.role === 'deliveryAgent' && <Link to="/agent">Delivery Dashboard</Link>}
          {user?.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
          {user ? (
            <button
              className="btn btn-outline"
              onClick={handleLogout}
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
            >
              Logout
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

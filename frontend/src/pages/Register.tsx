import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const fields = ['name', 'email', 'phone', 'password', 'address'] as const;

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', address: '' });
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/users/register', { ...form, role });
      login(data);
      if (role === 'restaurantOwner') navigate('/owner');
      else if (role === 'deliveryAgent') navigate('/agent');
      else navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container" style={{ paddingTop: 60, maxWidth: 400 }}>
      <h1 className="display">Create your account</h1>
      <form onSubmit={handleSubmit}>
        {fields.map((field) => (
          <div className="form-group" key={field}>
            <label style={{ textTransform: 'capitalize' }}>{field}</label>
            <input
              type={field === 'password' ? 'password' : 'text'}
              name={field}
              value={form[field]}
              onChange={handleChange}
              required={field !== 'address'}
            />
          </div>
        ))}
        <div className="form-group">
          <label>I am signing up as</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="restaurantOwner">Restaurant Owner</option>
            <option value="deliveryAgent">Delivery Agent</option>
          </select>
        </div>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button className="btn btn-primary" type="submit">Sign up</button>
      </form>
    </div>
  );
};

export default Register;

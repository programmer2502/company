import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CartPage from './pages/CartPage';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/cart" element={<CartPage />} />
            </Routes>
          </div>
          <footer style={{
            textAlign: 'center',
            padding: '2rem',
            borderTop: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
            fontSize: '0.9rem'
          }}>
            &copy; {new Date().getFullYear()} MANNER THE WAY OF STYLE. Premium Fashion.
          </footer>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

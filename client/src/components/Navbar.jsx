import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingBag, User, LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cart } = useContext(CartContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav style={{
            borderBottom: '1px solid var(--color-border)',
            padding: '1.5rem 0',
            backgroundColor: 'rgba(10, 10, 10, 0.8)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem', maxWidth: '100%' }}>
                <Link to="/" style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    MANNER THE WAY OF STYLE
                </Link>

                {/* Desktop Menu - Hidden on Admin Page */}
                {location.pathname !== '/admin' && (
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <Link to="/">Home</Link>
                        <Link to="/shop">Shop</Link>
                        <Link to="/shop?category=Clothing">Clothing</Link>
                        <Link to="/shop?category=Shoes">Shoes</Link>
                        <Link to="/shop?category=Watches">Watches</Link>
                        <Link to="/shop?category=Glasses">Glasses</Link>
                        <Link to="/shop?category=Perfume">Perfume</Link>
                        <Link to="/shop?category=Accessories">Accessories</Link>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {user ? (
                        <>
                            {user.role === 'admin' ? (
                                <Link to="/admin" style={{ color: 'var(--color-primary)' }}>Dashboard</Link>
                            ) : (
                                <span style={{ color: 'var(--color-text-muted)' }}>Hello, {user.username}</span>
                            )}
                            <button onClick={handleLogout} style={{ background: 'none', color: 'var(--color-text)' }}>
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Sign Up</Link>

                        </>
                    )}

                    {location.pathname !== '/admin' && (
                        <Link to="/cart" style={{ position: 'relative' }}>
                            <ShoppingBag size={24} />
                            {cart.length > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    backgroundColor: 'var(--color-primary)',
                                    color: '#000',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold'
                                }}>
                                    {cart.length}
                                </span>
                            )}
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

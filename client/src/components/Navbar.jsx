import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingBag, User, LogOut, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cart } = useContext(CartContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    <span className="textTitle"> MANNER THE WAY OF STYLE</span>
                </Link>

                {/* Desktop Menu - Hidden on Admin Page */}
                {location.pathname !== '/admin' && (
                    <>
                        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                            <Link to="/" onClick={closeMenu}>Home</Link>
                            <Link to="/shop" onClick={closeMenu}>Shop</Link>
                            <Link to="/shop?category=Clothing" onClick={closeMenu}>Clothing</Link>
                            <Link to="/shop?category=Shoes" onClick={closeMenu}>Shoes</Link>
                            <Link to="/shop?category=Watches" onClick={closeMenu}>Watches</Link>
                            <Link to="/shop?category=Glasses" onClick={closeMenu}>Glasses</Link>
                            <Link to="/shop?category=Perfume" onClick={closeMenu}>Perfume</Link>
                            <Link to="/shop?category=Accessories" onClick={closeMenu}>Accessories</Link>

                            {/* Mobile Only Actions */}
                            <div className="mobile-actions">
                                {user ? (
                                    <>
                                        <span className="mobile-user-greeting">Hello, {user.username}</span>
                                        {user.role === 'admin' && <Link to="/admin" onClick={closeMenu}>Dashboard</Link>}
                                        <button onClick={handleLogout} className="mobile-logout">Logout</button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" onClick={closeMenu}>Login</Link>
                                        <Link to="/register" onClick={closeMenu}>Sign Up</Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}

                <div className="navbar-actions">
                    {user ? (
                        <>
                            {user.role === 'admin' ? (
                                <Link to="/admin" style={{ color: 'var(--color-primary)' }} className="desktop-only">Dashboard</Link>
                            ) : (
                                <span style={{ color: 'var(--color-text-muted)', display: 'none' }} className="desktop-only">Hello, {user.username}</span>
                            )}
                            <button onClick={handleLogout} style={{ background: 'none', color: 'var(--color-text)' }} className="desktop-only">
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="desktop-only">Login</Link>
                            <Link to="/register" className="btn btn-outline desktop-only" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Sign Up</Link>
                        </>
                    )}

                    {location.pathname !== '/admin' && (
                        <Link to="/cart" style={{ position: 'relative' }} onClick={closeMenu}>
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

                    {/* Toggle Button */}
                    {location.pathname !== '/admin' && (
                        <button className="menu-toggle" onClick={toggleMenu}>
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
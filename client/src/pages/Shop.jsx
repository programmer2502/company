import { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import { CartContext } from '../context/CartContext';
import { Search, CheckCircle } from 'lucide-react';
import Modal from '../components/Modal';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category');
    const { addToCart } = useContext(CartContext);
    const [showModal, setShowModal] = useState(false);

    const handleAddToCart = (product) => {
        addToCart(product);
        setShowModal(true);
        setTimeout(() => {
            setShowModal(false);
        }, 7000);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const url = category ? `/products?category=${category}` : '/products';
                const { data } = await api.get(url);
                setProducts(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProducts();
    }, [category]);

    return (
        <div className="container" style={{ padding: '3rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}>{category ? `${category} Collection` : 'All Products'}</h2>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.8rem 1rem 0.8rem 2.5rem',
                            borderRadius: '50px',
                            border: '1px solid #ddd',
                            outline: 'none',
                            fontSize: '1rem'
                        }}
                    />
                </div>
            </div>

            <div className="grid-products">
                {products
                    .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((product) => (
                        <div key={product._id} className="card">
                            <div style={{ height: '300px', backgroundColor: '#f0f0f0', marginBottom: '1rem', overflow: 'hidden', borderRadius: '4px' }}>
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl.startsWith('http') ? product.imageUrl : `https://company-v2oe.onrender.com${product.imageUrl}`}
                                        alt={product.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                                        No Image
                                    </div>
                                )}
                            </div>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                            <p style={{ color: 'var(--color-primary)', fontSize: '1.1rem', fontWeight: 'bold' }}>₹{product.price}</p>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '1rem' }}
                                onClick={() => handleAddToCart(product)}
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))}
            </div>
            {products.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>No products found.</p>}

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title=""
            >
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#dcfce7',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto'
                    }}>
                        <CheckCircle size={48} color="#16a34a" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Successfully Added!</h3>
                    <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                        Item has been added to your cart.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => setShowModal(false)}
                            className="btn btn-outline"
                        >
                            Continue Shopping
                        </button>
                        <Link to="/cart" className="btn btn-primary">
                            Go to Cart
                        </Link>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Shop;

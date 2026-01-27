import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import { CartContext } from '../context/CartContext';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category');
    const { addToCart } = useContext(CartContext);

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
            <h2 className="section-title">{category ? `${category} Collection` : 'All Products'}</h2>
            <div className="grid-products">
                {products.map((product) => (
                    <div key={product._id} className="card">
                        <div style={{ height: '300px', backgroundColor: '#f0f0f0', marginBottom: '1rem', overflow: 'hidden', borderRadius: '4px' }}>
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`}
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
                            onClick={() => addToCart(product)}
                        >
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>
            {products.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>No products found.</p>}
        </div>
    );
};

export default Shop;

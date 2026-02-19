import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { CartContext } from '../context/CartContext';
import { CheckCircle, ShoppingCart, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../components/Modal';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useContext(CartContext);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products?_id=${id}`);
                // The API returns an array when querying by properties
                const productData = Array.isArray(data) ? data[0] : data;

                if (!productData) throw new Error('Product not found');

                setProduct(productData);
                if (productData.imageUrl) setSelectedImage(productData.imageUrl);
                if (productData.images && productData.images.length > 0) setSelectedImage(productData.images[0]);
                setLoading(false);
            } catch (err) {
                // Try fetching specific ID if the above was a list
                try {
                    const { data } = await api.get(`/products/${id}`);
                    setProduct(data);
                    setSelectedImage(data.imageUrl); // Default
                    if (data.images && data.images.length > 0) setSelectedImage(data.images[0]); // Override if array exists
                    setLoading(false);
                } catch (e) {
                    setError('Failed to load product');
                    setLoading(false);
                }
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;

        // Validation: If product has colors/sizes, user must select them
        if (product.colors && product.colors.length > 0 && !selectedColor) {
            alert('Please select a color');
            return;
        }
        if (product.sizes && product.sizes.length > 0 && selectedSizes.length === 0) {
            alert('Please select at least one size');
            return;
        }

        // Add each selected size as a separate item
        if (selectedSizes.length > 0) {
            selectedSizes.forEach(size => {
                addToCart({
                    ...product,
                    selectedColor,
                    selectedSize: size,
                    quantity
                });
            });
        } else {
            // Fallback if no sizes (e.g. product without sizes)
            addToCart({
                ...product,
                selectedColor,
                selectedSize: null,
                quantity
            });
        }
        setShowModal(true);
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;
    if (error || !product) return <div style={{ padding: '4rem', textAlign: 'center' }}>Product not found</div>;

    // Use images array if available, otherwise fallback to single imageUrl
    const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

    return (
        <div className="container" style={{ padding: '3rem 0' }}>
            <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '2rem', color: '#666', textDecoration: 'none' }}>
                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Shop
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                {/* Image Gallery */}
                <div>
                    <div style={{
                        width: '100%',
                        height: '500px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        marginBottom: '1rem',
                        backgroundColor: '#f9f9f9',
                        border: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <img
                            src={selectedImage?.startsWith('http') ? selectedImage : `https://company-v2oe.onrender.com${selectedImage}`}
                            alt={product.name}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                    </div>



                    {/* Thumbnails Gallery */}
                    {images.length > 1 && (
                        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', justifyContent: 'center' }}>
                            {images.map((img, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedImage(img)}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '4px',
                                        border: selectedImage === img ? '2px solid var(--color-primary)' : '1px solid #ddd',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        flexShrink: 0
                                    }}
                                >
                                    <img
                                        src={img.startsWith('http') ? img : `https://company-v2oe.onrender.com${img}`}
                                        alt={`${product.name} view ${index + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{product.name}</h1>
                    <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1.5rem' }}>{product.category}</p>

                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '2rem' }}>
                        ₹{product.price}
                    </div>

                    {/* Colors */}
                    {product.colors && product.colors.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Color: <span style={{ fontWeight: 'normal', color: '#666' }}>{selectedColor}</span></h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {product.colors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '4px',
                                            border: selectedColor === color ? '2px solid var(--color-primary)' : '1px solid #ccc',
                                            backgroundColor: selectedColor === color ? '#f0fdf4' : 'white',
                                            cursor: 'pointer',
                                            color: selectedColor === color ? 'var(--color-primary)' : '#333'
                                        }}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sizes */}
                    {product.sizes && product.sizes.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Sizes: <span style={{ fontWeight: 'normal', color: '#666' }}>{selectedSizes.join(', ')}</span></h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {product.sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => {
                                            setSelectedSizes(prev =>
                                                prev.includes(size)
                                                    ? prev.filter(s => s !== size)
                                                    : [...prev, size]
                                            );
                                        }}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            border: selectedSizes.includes(size) ? '2px solid var(--color-primary)' : '1px solid #ccc',
                                            backgroundColor: selectedSizes.includes(size) ? 'var(--color-primary)' : 'white',
                                            color: selectedSizes.includes(size) ? 'white' : '#333',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description  */}
                    <div style={{ marginBottom: '2rem' }}>
                        <p style={{ lineHeight: '1.6', color: '#444' }}>{product.description}</p>
                    </div>

                    {/* Add to Cart Button moved here */}

                    <button
                        className="btn btn-primary"
                        style={{ padding: '1rem 2rem', fontSize: '1.1rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart size={20} /> Add to Cart
                    </button>

                    {product.stock < 5 && product.stock > 0 && (
                        <p style={{ color: '#eab308', marginTop: '1rem', fontSize: '0.9rem' }}>Only {product.stock} left in stock!</p>
                    )}
                    {product.stock === 0 && (
                        <p style={{ color: '#dc2626', marginTop: '1rem', fontSize: '0.9rem' }}>Out of Stock</p>
                    )}
                </div>
            </div>

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
                        {product.name} ({selectedColor ? `${selectedColor} / ` : ''}{selectedSizes.length > 0 ? selectedSizes.join(', ') : ''}) has been added to your cart.
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
        </div >
    );
};

export default ProductDetails;

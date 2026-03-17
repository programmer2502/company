import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useContext(CartContext);
    // Initialize with the first image from the array or the legacy imageUrl
    const initialImage = (product.images && product.images.length > 0) ? product.images[0] : product.imageUrl;
    const [displayImage, setDisplayImage] = useState(initialImage);

    // Helper to handle image URLs and apply transformations for speed
    const getImageUrl = (img, isThumbnail = false) => {
        if (!img) return '';
        let url = img.startsWith('http') ? img : `https://company-3qjr.onrender.com${img}`;

        // Apply ImageKit transformations if applicable
        if (url.includes('ik.imagekit.io')) {
            const separator = url.includes('?') ? '&' : '?';
            const transform = isThumbnail ? 'tr=w-50,h-50,cm-pad_resize' : 'tr=w-300,h-300,cm-pad_resize';
            return `${url}${separator}${transform}`;
        }
        return url;
    };

    const [isHovered, setIsHovered] = useState(false);

    const handleAddToCart = (e) => {
        e.preventDefault(); // Prevent navigating to the product detail page, since it's wrapped in a link

        // Select the first available color and size as default for quick add
        const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : null;
        const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;

        addToCart({
            ...product,
            selectedColor: defaultColor,
            selectedSize: defaultSize,
            quantity: 1
        });

        // Optionally add a toast notification here later
    };

    return (
        <div className="card" style={{ scrollPaddingBottom: '20px', background: 'white', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div className="product-card-content">
                <div className="product-image-container">
                    {displayImage ? (
                        <img
                            src={getImageUrl(displayImage)}
                            alt={product.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}

                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                            No Image
                        </div>
                    )}
                </div>
                <div className="cardDesign" style={{}}>

                    <h3 className="product-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 'bold', color: 'black' }}>{product.name}</h3>

                    {/* Mini Image Blocks */}
                    {product.images && product.images.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', margin: '0.5rem 0' }}>
                            {(product.images.length > 0 ? product.images : [product.imageUrl]).slice(0, 5).map((img, idx) => (
                                <img
                                    key={idx}
                                    src={getImageUrl(img, true)}
                                    alt={`${product.name} ${idx}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setDisplayImage(img);
                                    }}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                        flexShrink: 0,
                                        border: displayImage === img ? '2px solid var(--color-primary)' : '1px solid #eee',
                                        cursor: 'pointer',
                                        transition: 'border 0.2s'
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Colors and Sizes */}
                    <div style={{ marginTop: 'auto', fontSize: '0.9rem', color: '#666' }}>
                        {product.colors && product.colors.length > 0 && (
                            <div style={{ marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ color: '#888' }}>Colors: </span>
                                {product.colors.join(', ')}
                            </div>
                        )}
                        {product.sizes && product.sizes.length > 0 && (
                            <div>
                                <span style={{ color: '#888' }}>Sizes: </span>
                                {product.sizes.join(', ')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="cardSubDesign">
                <div className="product-price" style={{ display: 'flex', alignItems: 'center' }}>
                    {product.discountPrice ? (
                        <>
                            <span style={{ color: '#888', textDecoration: 'line-through', fontSize: '1rem', marginRight: '0.5rem' }}>₹{product.price}</span>
                            <span style={{ color: 'var(--color-primary)', fontSize: '1.25rem', fontWeight: '700' }}>₹{product.discountPrice}</span>
                        </>
                    ) : (
                        <span style={{ color: 'var(--color-primary)', fontSize: '1.25rem', fontWeight: '700' }}>₹{product.price}</span>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                        onClick={handleAddToCart}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--color-primary)',
                            color: 'var(--color-primary)',
                            padding: '0.4rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            transition: 'all 0.2s ease-in-out',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                            e.currentTarget.style.color = '#000';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--color-primary)';
                        }}
                        title="Add to Cart"
                    >
                        <ShoppingCart size={20} />
                    </button>
                    <Link
                        to={`/product/${product._id}`}
                        className="cardDesignBtn"
                        style={{ flex: 1, textAlign: 'center' }}
                    >
                        View Details
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default ProductCard;

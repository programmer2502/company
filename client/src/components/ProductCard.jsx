import { useState } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    // Initialize with the first image from the array or the legacy imageUrl
    const initialImage = (product.images && product.images.length > 0) ? product.images[0] : product.imageUrl;
    const [displayImage, setDisplayImage] = useState(initialImage);

    // Helper to handle image URLs
    const getImageUrl = (img) => {
        if (!img) return '';
        return img.startsWith('http') ? img : `https://company-v2oe.onrender.com${img}`;
    };

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', padding: '15px' }}>
            <div>
                <div style={{ height: '300px', backgroundColor: '#f0f0f0', marginBottom: '1rem', overflow: 'hidden', borderRadius: '4px', position: 'relative' }}>
                    {displayImage ? (
                        <img
                            src={getImageUrl(displayImage)}
                            alt={product.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                            No Image
                        </div>
                    )}
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>{product.name}</h3>
                <p style={{ color: 'var(--color-primary)', fontSize: '1.1rem', fontWeight: 'bold' }}>₹{product.price}</p>

                {/* Mini Image Blocks */}
                {product.images && product.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginTop: '0.5rem' }}>
                        {(product.images.length > 0 ? product.images : [product.imageUrl]).slice(0, 5).map((img, idx) => (
                            <img
                                key={idx}
                                src={getImageUrl(img)}
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
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
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

            <Link
                to={`/product/${product._id}`}
                className="btn"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    width: '60%',
                    margin: '1rem auto 0 auto',
                    display: 'block',
                    textAlign: 'center',
                    textDecoration: 'none',
                    padding: '10px',
                    fontWeight: 'bold',
                    backgroundColor: isHovered ? '#000' : 'var(--color-primary)',
                    color: isHovered ? 'var(--color-primary)' : '#000',
                    transition: 'all 0.3s ease',
                    borderRadius: '50px'
                }}
            >
                View Details
            </Link>
        </div>
    );
};

export default ProductCard;

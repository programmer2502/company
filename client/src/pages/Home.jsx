import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            {/* Hero Section */}
            <div style={{
                height: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                textAlign: 'center'
            }}>
                <div>
                    <h1 style={{ fontSize: '4rem', marginBottom: '1rem', letterSpacing: '2px' }}>DEFINE YOUR STYLE</h1>
                    <p style={{ fontSize: '1.2rem', color: '#e0e0e0', marginBottom: '2rem' }}>Premium Clothing, Shoes, Watches, Glasses & More</p>
                    <Link to="/shop" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1rem' }}>SHOP NOW</Link>
                </div>
            </div>

            {/* Categories Preview */}
            <div className="container" style={{ padding: '5rem 2rem' }}>
                <h2 className="section-title">Collections</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {[
                        { name: 'Clothing', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2070&auto=format&fit=crop' },
                        { name: 'Shoes', image: './img2.jpeg' },
                        { name: 'Watches', image: './img.jpeg' },
                        { name: 'Glasses', image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=2070&auto=format&fit=crop' },
                        { name: 'Perfume', image: 'img1.jpeg' },
                        { name: 'Accessories', image: 'img3.jpeg' }
                    ].map((cat) => (
                        <div key={cat.name} className="card" style={{
                            height: '250px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            cursor: 'pointer',
                            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${cat.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            color: 'white',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            transition: 'all 0.3s ease',
                            border: 'none',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                            }}
                        >
                            <h3 style={{
                                fontSize: '2rem',
                                marginBottom: '0.75rem',
                                fontWeight: '700',
                                letterSpacing: '1px',
                                textTransform: 'uppercase'
                            }}>{cat.name}</h3>
                            <Link
                                to={`/shop?category=${cat.name}`}
                                className="btn"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    color: '#000',
                                    border: 'none',
                                    padding: '0.6rem 1.8rem',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1.5px',
                                    borderRadius: '50px',
                                    transition: 'background-color 0.2s',
                                    textDecoration: 'none'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#fff'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'}
                            >
                                Explore
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;

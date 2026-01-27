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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {['Clothing', 'Shoes', 'Watches', 'Glasses', 'Perfume', 'Accessories'].map((cat) => (
                        <div key={cat} className="card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', cursor: 'pointer' }}>
                            <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{cat}</h3>
                            <Link to={`/shop?category=${cat}`} className="btn btn-outline">Explore</Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;

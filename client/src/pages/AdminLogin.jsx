import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { adminLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminLogin(username, password);
            navigate('/admin');
        } catch (err) {
            alert('Admin login failed. Ensure you have admin privileges.');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '5rem' }}>
            <div className="card" style={{ borderColor: 'var(--color-primary)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Admin Login</h2>
                <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>Authorized Personnel Only</p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-outline">Login</button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;

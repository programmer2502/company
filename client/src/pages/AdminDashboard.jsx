import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Package, TrendingUp, Plus, Edit } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ totalSales: 0, orderCount: 0, lowStockItems: [] });
    const [products, setProducts] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', category: 'Clothing', price: '', stock: '', image: null, description: '' });
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchStats();
        fetchProducts();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/admin/stats');
            setStats(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', newItem.name);
            formData.append('category', newItem.category);
            formData.append('price', newItem.price);
            formData.append('stock', newItem.stock);
            formData.append('description', newItem.description);
            if (newItem.image) {
                formData.append('image', newItem.image);
            }

            // Important: Send headers for multipart/form-data (axios usually handles this automatically with FormData)
            await api.post('/products', formData);
            alert('Product added successfully');
            setNewItem({ name: '', category: 'Clothing', price: '', stock: '', image: null, description: '' });
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchProducts();
        } catch (err) {
            console.error(err);
            alert('Failed to add product');
        }
    };

    const handleUpdateStock = async (id, newStock) => {
        try {
            await api.put(`/products/${id}`, { stock: newStock });
            fetchProducts();
            fetchStats(); // Update low stock stats
        } catch (err) {
            alert('Failed to update stock');
        }
    };

    return (
        <div className="container" style={{ padding: '3rem 0' }}>
            <h2 className="section-title">Host Dashboard</h2>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <TrendingUp size={16} style={{ marginRight: '8px' }} /> Overview
                </button>
                <button
                    className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('inventory')}
                >
                    <Package size={16} style={{ marginRight: '8px' }} /> Manage Inventory
                </button>
                <button
                    className={`btn ${activeTab === 'add' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('add')}
                >
                    <Plus size={16} style={{ marginRight: '8px' }} /> Add Item
                </button>
            </div>

            {activeTab === 'overview' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <h3>Monthly Sales</h3>
                            <p style={{ fontSize: '2rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>₹{stats.totalSales}</p>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <h3>Orders This Month</h3>
                            <p style={{ fontSize: '2rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>{stats.orderCount}</p>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <h3>Low Stock Alerts</h3>
                            <p style={{ fontSize: '2rem', color: 'red', fontWeight: 'bold' }}>{stats.lowStockCount}</p>
                        </div>
                    </div>

                    <h3>Low Stock Items</h3>
                    {stats.lowStockItems.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {stats.lowStockItems.map(item => (
                                <li key={item._id} className="card" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{item.name}</span>
                                    <span style={{ color: 'red' }}>{item.stock} remaining</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#888' }}>Inventory levels are healthy.</p>
                    )}
                </div>
            )}

            {activeTab === 'inventory' && (
                <div className="grid-products">
                    {products.map((product) => (
                        <div key={product._id} className="card">
                            <h4>{product.name}</h4>
                            <p style={{ color: '#888' }}>{product.category}</p>
                            <div style={{ marginTop: '1rem' }}>
                                <label style={{ fontSize: '0.9rem', color: '#aaa' }}>Stock Level:</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <input
                                        type="number"
                                        defaultValue={product.stock}
                                        onBlur={(e) => handleUpdateStock(product._id, e.target.value)}
                                        style={{ width: '80px', padding: '0.5rem' }}
                                    />
                                    <button className="btn btn-outline" style={{ padding: '0.5rem' }} disabled>Autosaved</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'add' && (
                <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h3 style={{ marginBottom: '2rem' }}>Add New Item</h3>
                    <form onSubmit={handleAddItem} encType="multipart/form-data" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Product Name"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            required
                        />
                        <select
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        >
                            <option value="Clothing">Clothing</option>
                            <option value="Shoes">Shoes</option>
                            <option value="Watches">Watches</option>
                            <option value="Glasses">Glasses</option>
                            <option value="Perfume">Perfume</option>
                            <option value="Accessories">Accessories</option>
                        </select>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                type="number"
                                placeholder="Price"
                                value={newItem.price}
                                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Stock"
                                value={newItem.stock}
                                onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                                required
                            />
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setNewItem({ ...newItem, image: e.target.files[0] })}
                            ref={fileInputRef}
                            required
                        />
                        <textarea
                            placeholder="Description"
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        />
                        <button type="submit" className="btn btn-primary">Add Product</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

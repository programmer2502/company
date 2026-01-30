import { useState, useEffect, useRef } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import { Package, TrendingUp, Plus, Edit, User, Eye, Truck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ totalSales: 0, orderCount: 0, lowStockItems: [] });
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', category: 'Clothing', price: '', stock: '', image: null, description: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchStats();
        fetchProducts();
        fetchOrders();
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

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/admin/users-orders');
            setOrders(data);
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

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
                fetchStats();
            } catch (err) {
                alert('Failed to delete product');
            }
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    const handleUpdateOrderStatus = async (status) => {
        try {
            await api.put(`/admin/orders/${selectedOrder._id}/status`, { status });
            alert(`Order marked as ${status}`);
            setShowOrderModal(false);
            fetchOrders();
        } catch (err) {
            alert('Failed to update status');
        }

    };

    const handleBlockUser = async (userId) => {
        if (!userId) return;
        if (window.confirm('Are you sure you want to change the block status of this user?')) {
            try {
                await api.put(`/admin/users/${userId}/block`);
                alert('User status updated');
                fetchOrders(); // Refresh to see new status
            } catch (err) {
                alert('Failed to update user status');
            }
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
                <button
                    className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('users')}
                >
                    <User size={16} style={{ marginRight: '8px' }} /> Users
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

                    <div className="card" style={{ marginBottom: '3rem', height: '400px' }}>
                        <h3>Sales Trends (Last 7 Days)</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={stats.salesTrend || []}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="sales" fill="var(--color-primary)" />
                            </BarChart>
                        </ResponsiveContainer>
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

            {activeTab === 'users' && (
                <div className="card">
                    <h3>User Purchase History</h3>
                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>User</th>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>Items</th>
                                <th style={{ padding: '1rem' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders
                                .filter(order => {
                                    const term = userSearchTerm.toLowerCase();
                                    const username = order.user?.username?.toLowerCase() || '';
                                    const email = order.user?.email?.toLowerCase() || '';
                                    return username.includes(term) || email.includes(term);
                                })
                                .map(order => (
                                    <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 'bold' }}>{order.user?.username || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{order.user?.email}</div>
                                            {order.user?.isBlocked && (
                                                <span style={{ fontSize: '0.7rem', color: 'red', fontWeight: 'bold' }}>BLOCKED</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                {order.items.map((item, idx) => (
                                                    <li key={idx} style={{ fontSize: '0.9rem' }}>
                                                        {item.product?.name || 'Deleted Product'} (x{item.quantity})
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>₹{order.totalAmount}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <button onClick={() => handleViewOrder(order)} className="btn btn-outline" style={{ padding: '0.4rem', borderRadius: '4px', marginRight: '0.5rem' }}>
                                                <Eye size={16} style={{ marginRight: '4px' }} /> View
                                            </button>
                                            <button
                                                onClick={() => handleBlockUser(order.user?._id)}
                                                className="btn"
                                                style={{
                                                    padding: '0.4rem',
                                                    borderRadius: '4px',
                                                    backgroundColor: order.user?.isBlocked ? '#dcfce7' : '#fee2e2',
                                                    color: order.user?.isBlocked ? '#16a34a' : '#dc2626',
                                                    border: 'none',
                                                    fontSize: '0.8rem'
                                                }}
                                                disabled={!order.user}
                                            >
                                                {order.user?.isBlocked ? 'Unblock' : 'Block'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'inventory' && (
                <div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="All">All Categories</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Shoes">Shoes</option>
                            <option value="Watches">Watches</option>
                            <option value="Glasses">Glasses</option>
                            <option value="Perfume">Perfume</option>
                            <option value="Accessories">Accessories</option>
                        </select>
                    </div>
                    <div className="grid-products">
                        {products
                            .filter(product => {
                                const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
                                const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
                                return matchesSearch && matchesCategory;
                            })
                            .map((product) => (
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
                                            <button
                                                onClick={() => handleDeleteProduct(product._id)}
                                                className="btn"
                                                style={{ padding: '0.5rem', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #dc2626' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
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
                        <input
                            type="text"
                            placeholder="Category (e.g. Clothing, Shoes)"
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                            required
                        />
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

            {selectedOrder && (
                <Modal
                    isOpen={showOrderModal}
                    onClose={() => setShowOrderModal(false)}
                    title={`Order #${selectedOrder._id.slice(-6)}`}
                >
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div>
                                <strong>User:</strong> {selectedOrder.user?.username}<br />
                                <strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '20px',
                                    backgroundColor: selectedOrder.status === 'Pending' ? '#fff7ed' : '#dcfce7',
                                    color: selectedOrder.status === 'Pending' ? '#c2410c' : '#16a34a',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem'
                                }}>
                                    {selectedOrder.status || 'Pending'}
                                </span>
                            </div>
                        </div>

                        <h4>Items</h4>
                        <ul style={{ listStyle: 'none', padding: 0, borderTop: '1px solid #eee', marginTop: '0.5rem' }}>
                            {selectedOrder.items.map((item, idx) => (
                                <li key={idx} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {item.product?.imageUrl && (
                                            <img
                                                src={item.product.imageUrl.startsWith('http') ? item.product.imageUrl : `http://localhost:5000${item.product.imageUrl}`}
                                                alt={item.product.name}
                                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                        )}
                                        <span>{item.product?.name} (x{item.quantity})</span>
                                    </div>
                                    <span>₹{item.priceAtPurchase || item.product?.price}</span>
                                </li>
                            ))}
                        </ul>
                        <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '1rem', fontSize: '1.2rem' }}>
                            Total: ₹{selectedOrder.totalAmount}
                        </div>

                        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                            <h4>Update Status (Email Notification)</h4>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button
                                    onClick={() => handleUpdateOrderStatus('Shipped')}
                                    className="btn"
                                    style={{ flex: 1, backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none' }}
                                >
                                    <Truck size={16} style={{ marginRight: '5px' }} /> Mark Shipped
                                </button>
                                <button
                                    onClick={() => handleUpdateOrderStatus('Delivered')}
                                    className="btn"
                                    style={{ flex: 1, backgroundColor: '#dcfce7', color: '#16a34a', border: 'none' }}
                                >
                                    Mark Delivered
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminDashboard;

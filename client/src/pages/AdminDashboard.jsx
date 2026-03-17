import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import Modal from '../components/Modal';
import { Package, TrendingUp, Plus, Edit, User, Eye, Truck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ totalSales: 0, orderCount: 0, lowStockItems: [] });
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', category: 'Clothing', price: '', discountPrice: '', stock: '', images: [], description: '', colors: '', sizes: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    // Edit Product State
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const editFileInputRef = useRef(null);

    const fileInputRef = useRef(null);

    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['admin_stats'],
        queryFn: async () => {
            const { data } = await api.get('/admin/stats');
            return data;
        },
        staleTime: 1000 * 60 * 2, // 2 mins
    });

    const { data: productsResult, isLoading: productsLoading } = useQuery({
        queryKey: ['admin_products'],
        queryFn: async () => {
            const { data } = await api.get('/products?limit=100');
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });

    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ['admin_orders'],
        queryFn: async () => {
            const { data } = await api.get('/admin/users-orders');
            return data;
        },
        staleTime: 1000 * 60 * 2,
    });

    const productsData = productsResult?.products || productsResult || [];
    const isLoading = statsLoading || productsLoading || ordersLoading;

    // Use derived state for display
    const [localStats, setLocalStats] = useState(null);
    const [localProducts, setLocalProducts] = useState([]);
    const [localOrders, setLocalOrders] = useState([]);

    useEffect(() => {
        if (statsData) setStats(statsData);
        if (productsData) setProducts(productsData);
        if (ordersData) setOrders(ordersData);
    }, [statsData, productsData, ordersData]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', newItem.name);
            formData.append('category', newItem.category);
            formData.append('price', newItem.price);
            if (newItem.discountPrice) formData.append('discountPrice', newItem.discountPrice);
            formData.append('stock', newItem.stock);
            formData.append('description', newItem.description);
            formData.append('colors', newItem.colors || '');
            formData.append('sizes', newItem.sizes || '');

            if (newItem.images) {
                for (let i = 0; i < newItem.images.length; i++) {
                    formData.append('images', newItem.images[i]);
                }
            }

            // Important: Send headers for multipart/form-data (axios usually handles this automatically with FormData)
            await api.post('/products', formData);
            alert('Product added successfully');
            setNewItem({ name: '', category: 'Clothing', price: '', discountPrice: '', stock: '', images: [], description: '', colors: '', sizes: '' });
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

    const handleEditProduct = (product) => {
        setEditingProduct({
            ...product,
            // Ensure colors/sizes are strings for the input fields
            colors: Array.isArray(product.colors) ? product.colors.join(', ') : product.colors,
            sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes,
            // Keep track of existing images separately from new uploads
            existingImages: product.images && product.images.length > 0 ? product.images : (product.imageUrl ? [product.imageUrl] : []),
            newImages: []
        });
        setShowEditModal(true);
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', editingProduct.name);
            formData.append('category', editingProduct.category);
            formData.append('price', editingProduct.price);
            if (editingProduct.discountPrice) formData.append('discountPrice', editingProduct.discountPrice);
            formData.append('stock', editingProduct.stock);
            formData.append('description', editingProduct.description);
            formData.append('colors', editingProduct.colors || '');
            formData.append('sizes', editingProduct.sizes || '');

            // Append existing images
            if (editingProduct.existingImages && editingProduct.existingImages.length > 0) {
                editingProduct.existingImages.forEach(img => {
                    formData.append('existingImages', img);
                });
            }

            // Append new images
            if (editingProduct.newImages && editingProduct.newImages.length > 0) {
                for (let i = 0; i < editingProduct.newImages.length; i++) {
                    formData.append('images', editingProduct.newImages[i]);
                }
            }

            await api.put(`/products/${editingProduct._id}`, formData);
            alert('Product updated successfully');
            setShowEditModal(false);
            setEditingProduct(null);
            fetchProducts();
            fetchStats();
        } catch (err) {
            console.error(err);
            alert('Failed to update product');
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

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
                <div className="spinner" style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ color: '#666', fontWeight: '500' }}>Loading Dashboard Data...</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

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

                    <div className="card" style={{ marginBottom: '3rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Sales Trends (Last 7 Days)</h3>
                        <div style={{ flex: 1, minHeight: 0, minWidth: 0, width: '100%', position: 'relative' }}>
                            {stats.salesTrend && stats.salesTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                    <BarChart
                                        data={stats.salesTrend}
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
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
                                    No sales data available
                                </div>
                            )}
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
                                    <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                        {product.images && product.images.length > 0 ? (
                                            product.images.map((imgUrl, idx) => (
                                                <img
                                                    key={idx}
                                                    src={imgUrl.startsWith('http') ? imgUrl : `https://company-3qjr.onrender.com${imgUrl}`}
                                                    alt={`${product.name} ${idx + 1}`}
                                                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                                                />
                                            ))
                                        ) : (
                                            product.imageUrl && (
                                                <img
                                                    src={product.imageUrl.startsWith('http') ? product.imageUrl : `https://company-3qjr.onrender.com${product.imageUrl}`}
                                                    alt={product.name}
                                                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            )
                                        )}
                                    </div>
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
                                                onClick={() => handleEditProduct(product)}
                                                className="btn"
                                                style={{ padding: '0.5rem', backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #0369a1' }}
                                            >
                                                <Edit size={16} />
                                            </button>
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

                        <select
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
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
                                placeholder="Discount Price (Optional)"
                                value={newItem.discountPrice}
                                onChange={(e) => setNewItem({ ...newItem, discountPrice: e.target.value })}
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
                            type="text"
                            placeholder="Colors (comma separated, e.g., Red, Blue)"
                            value={newItem.colors || ''}
                            onChange={(e) => setNewItem({ ...newItem, colors: e.target.value })}
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#666' }}>Available Sizes</label>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {(newItem.category === 'Shoes' ? ['5', '6', '7', '8', '9', '10', '11', '12'] : ['S', 'M', 'L', 'XL', 'XXL']).map(size => (
                                    <label key={size} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={newItem.sizes ? newItem.sizes.split(', ').includes(size) : false}
                                            onChange={(e) => {
                                                const currentSizes = newItem.sizes ? newItem.sizes.split(', ').filter(s => s) : [];
                                                let newSizes;
                                                if (e.target.checked) {
                                                    newSizes = [...currentSizes, size];
                                                } else {
                                                    newSizes = currentSizes.filter(s => s !== size);
                                                }
                                                // Sort based on standard size order if needed, or just join
                                                const sizeOrder = newItem.category === 'Shoes'
                                                    ? ['5', '6', '7', '8', '9', '10', '11', '12']
                                                    : ['S', 'M', 'L', 'XL', 'XXL'];

                                                // Custom sort to handle mixed types if necessary, but strictly adhering to category helps
                                                newSizes.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));

                                                setNewItem({ ...newItem, sizes: newSizes.join(', ') });
                                            }}
                                        />
                                        {size}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#666' }}>Product Images (Select multiple, max 5)</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    if (e.target.files) {
                                        const newFiles = Array.from(e.target.files);
                                        setNewItem(prev => {
                                            const currentImages = prev.images || [];
                                            const combinedImages = [...currentImages, ...newFiles];
                                            if (combinedImages.length > 5) {
                                                alert('You can only upload a maximum of 5 images.');
                                                return prev;
                                            }
                                            return { ...prev, images: combinedImages };
                                        });
                                        // Reset input to allow selecting the same file again if needed
                                        e.target.value = '';
                                    }
                                }}
                                ref={fileInputRef}
                            // Remove required if we want to allow adding images later, or keep it but check array length validation manually
                            />
                            {newItem.images && newItem.images.length > 0 && (
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', overflowX: 'auto' }}>
                                    {newItem.images.map((file, idx) => (
                                        <div key={idx} style={{ position: 'relative' }}>
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="Preview"
                                                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setNewItem(prev => ({
                                                        ...prev,
                                                        images: prev.images.filter((_, i) => i !== idx)
                                                    }));
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '-5px',
                                                    right: '-5px',
                                                    background: 'red',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '18px',
                                                    height: '18px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                x
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

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
                                                src={item.product.imageUrl.startsWith('http') ? item.product.imageUrl : `https://company-3qjr.onrender.com${item.product.imageUrl}`}
                                                alt={item.product.name}
                                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                        )}
                                        <span>
                                            {item.product?.name} (x{item.quantity})
                                            {item.selectedSize && <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: '#666', backgroundColor: '#f3f4f6', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Size: {item.selectedSize}</span>}
                                            {item.selectedColor && <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: '#666', backgroundColor: '#f3f4f6', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Color: {item.selectedColor}</span>}
                                        </span>
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

            {editingProduct && (
                <Modal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    title="Edit Product"
                >
                    <form onSubmit={handleUpdateProduct} encType="multipart/form-data" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Product Name"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            required
                        />

                        <select
                            value={editingProduct.category}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
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

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                type="number"
                                placeholder="Price"
                                value={editingProduct.price}
                                onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Discount Price (Optional)"
                                value={editingProduct.discountPrice || ''}
                                onChange={(e) => setEditingProduct({ ...editingProduct, discountPrice: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Stock"
                                value={editingProduct.stock}
                                onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                                required
                            />
                        </div>

                        <input
                            type="text"
                            placeholder="Colors (comma separated)"
                            value={editingProduct.colors}
                            onChange={(e) => setEditingProduct({ ...editingProduct, colors: e.target.value })}
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#666' }}>Available Sizes</label>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {(editingProduct.category === 'Shoes' ? ['5', '6', '7', '8', '9', '10', '11', '12'] : ['S', 'M', 'L', 'XL', 'XXL']).map(size => (
                                    <label key={size} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={editingProduct.sizes ? editingProduct.sizes.split(', ').includes(size) : false}
                                            onChange={(e) => {
                                                const currentSizes = editingProduct.sizes ? editingProduct.sizes.split(', ').filter(s => s) : [];
                                                let newSizes;
                                                if (e.target.checked) {
                                                    newSizes = [...currentSizes, size];
                                                } else {
                                                    newSizes = currentSizes.filter(s => s !== size);
                                                }
                                                const sizeOrder = editingProduct.category === 'Shoes'
                                                    ? ['5', '6', '7', '8', '9', '10', '11', '12']
                                                    : ['S', 'M', 'L', 'XL', 'XXL'];
                                                newSizes.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));
                                                setEditingProduct({ ...editingProduct, sizes: newSizes.join(', ') });
                                            }}
                                        />
                                        {size}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#666' }}>Existing Images (Click 'x' to remove)</label>
                            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                {editingProduct.existingImages && editingProduct.existingImages.map((img, idx) => (
                                    <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                                        <img
                                            src={img.startsWith('http') ? img : `https://company-3qjr.onrender.com${img}`}
                                            alt={`Existing ${idx}`}
                                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingProduct(prev => ({
                                                    ...prev,
                                                    existingImages: prev.existingImages.filter((_, i) => i !== idx)
                                                }));
                                            }}
                                            style={{
                                                position: 'absolute', top: '-5px', right: '-5px',
                                                background: 'red', color: 'white', border: 'none',
                                                borderRadius: '50%', width: '18px', height: '18px',
                                                fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <label style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>Add New Images</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    if (e.target.files) {
                                        const newFiles = Array.from(e.target.files);
                                        setEditingProduct(prev => ({
                                            ...prev,
                                            newImages: [...(prev.newImages || []), ...newFiles]
                                        }));
                                        e.target.value = '';
                                    }
                                }}
                                ref={editFileInputRef}
                            />
                            {editingProduct.newImages && editingProduct.newImages.length > 0 && (
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', overflowX: 'auto' }}>
                                    {editingProduct.newImages.map((file, idx) => (
                                        <div key={idx} style={{ position: 'relative' }}>
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="New Preview"
                                                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingProduct(prev => ({
                                                        ...prev,
                                                        newImages: prev.newImages.filter((_, i) => i !== idx)
                                                    }));
                                                }}
                                                style={{
                                                    position: 'absolute', top: '-5px', right: '-5px',
                                                    background: 'red', color: 'white', border: 'none',
                                                    borderRadius: '50%', width: '18px', height: '18px',
                                                    fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                            >
                                                x
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <textarea
                            placeholder="Description"
                            value={editingProduct.description}
                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                            rows={4}
                        />
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default AdminDashboard;

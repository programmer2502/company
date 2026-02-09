import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import api from '../api';
import Modal from '../components/Modal';
import { CheckCircle } from 'lucide-react';

const CartPage = () => {
    const { cart, removeFromCart, clearCart, total } = useContext(CartContext);
    const [showModal, setShowModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const handleWhatsAppPayment = async () => {
        // Open window immediately to avoid popup blockers (especially on iOS)
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write('Redirecting to WhatsApp...');
        }

        try {
            // Construct WhatsApp message
            let message = `*New Order Request*\n\n`;
            cart.forEach((item, index) => {
                message += `${index + 1}. ${item.name} (Qty: ${item.quantity})\n`;
                message += `   Price: ₹${item.price}\n`;
                if (item.imageUrl) {
                    // With ImageKit, it's always an HTTP URL. 
                    const imgUrl = item.imageUrl.startsWith('http') ? item.imageUrl : `https://company-v2oe.onrender.com${item.imageUrl}`;
                    // WhatsApp preview works best with the direct link. Cleaning up display.
                    message += `   Image: ${imgUrl}\n`;
                }
                message += `\n`;
            });
            message += `*Total Amount: ₹${total}*`;

            const phoneNumber = "918310681424";
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            // Create order in backend first to ensure user is logged in
            const items = cart.map(c => ({ product: c._id, quantity: c.quantity, priceAtPurchase: c.price }));
            await api.post('/orders', { items, totalAmount: total });

            // Clear cart and redirect
            clearCart();

            if (newWindow) {
                newWindow.location.href = whatsappUrl;
            } else {
                // Fallback if window.open failed (though less likely if called synchronously)
                window.location.href = whatsappUrl;
            }

            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
            }, 7000);
        } catch (err) {
            console.error(err);
            if (newWindow) newWindow.close(); // Close the blank window if error
            setShowLoginModal(true);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
                <h2>Your Bag is Empty</h2>
                <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '3rem 0' }}>
            <h2 className="section-title">Shopping Bag</h2>
            <div className="cart-layout">
                <div>
                    {cart.map((item) => (
                        <div key={item._id} className="card cart-item">
                            <div className="cart-item-details">
                                {item.imageUrl && (
                                    <img
                                        src={item.imageUrl.startsWith('http') ? item.imageUrl : `https://company-v2oe.onrender.com${item.imageUrl}`}
                                        alt={item.name}
                                        className="cart-item-image"
                                    />
                                )}
                                <div className="cart-item-info">
                                    <h3>{item.name}</h3>
                                    <p style={{ color: '#888', margin: 0 }}>Qty: {item.quantity}</p>
                                </div>
                            </div>
                            <div className="cart-item-actions">
                                <p>₹{item.price * item.quantity}</p>
                                <button onClick={() => removeFromCart(item._id)} style={{ color: 'red', fontSize: '0.8rem', background: 'none' }}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="card" style={{ height: 'fit-content' }}>
                    <h3>Summary</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0' }}>
                        <span>Total</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>₹{total}</span>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleWhatsAppPayment}>Proceed to WhatsApp Payment</button>

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
                    <h2 style={{ fontSize: '1.8rem', color: '#1a1a1a', marginBottom: '1rem' }}>Thank You for Your Purchase!</h2>
                    <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '2rem' }}>
                        We've redirected you to WhatsApp to complete your order.
                    </p>
                    <Link
                        to="/shop"
                        className="btn btn-primary"
                        onClick={() => setShowModal(false)}
                        style={{ display: 'inline-block', padding: '0.8rem 2rem', fontSize: '1.1rem' }}
                    >
                        Continue Shopping
                    </Link>
                </div>
            </Modal>

            <Modal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                title="Login Required"
            >
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '2rem' }}>
                        Please login to complete your purchase.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => setShowLoginModal(false)}
                            className="btn btn-outline"
                        >
                            Cancel
                        </button>
                        <Link
                            to="/login"
                            className="btn btn-primary"
                            style={{ display: 'inline-block', padding: '0.8rem 2rem', fontSize: '1.1rem' }}
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </Modal>
        </div >
    );
};

export default CartPage;

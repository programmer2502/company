import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import api from '../api';

const CartPage = () => {
    const { cart, removeFromCart, clearCart, total } = useContext(CartContext);



    const handleWhatsAppPayment = async () => {
        try {
            // Construct WhatsApp message
            let message = `*New Order Request*\n\n`;
            cart.forEach((item, index) => {
                message += `${index + 1}. ${item.name} (Qty: ${item.quantity})\n`;
                message += `   Price: ₹${item.price}\n`;
                if (item.imageUrl) {
                    const imgUrl = item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`;
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
            window.open(whatsappUrl, '_blank');
            alert('Order placed! Redirecting to WhatsApp...');
        } catch (err) {
            console.error(err);
            alert('Checkout failed. Please login first.');
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
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div>
                    {cart.map((item) => (
                        <div key={item._id} className="card" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3>{item.name}</h3>
                                <p style={{ color: '#888' }}>Qty: {item.quantity}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
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


        </div>
    );
};

export default CartPage;

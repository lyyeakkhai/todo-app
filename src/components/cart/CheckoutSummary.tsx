import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

// Audit Requirement: Zero props allowed! Cart data is read strictly via useContext(CartContext).
export function CheckoutSummary() {
  const { totalItems, subtotal } = useCart();
  const { user } = useAuth();
  const [orderPlaced, setOrderPlaced] = useState(false);

  const tax = subtotal * 0.08;
  const shipping = subtotal > 0 ? (subtotal >= 100 ? 0 : 9.99) : 0;
  const total = subtotal + tax + shipping;

  const handleCheckout = () => {
    setOrderPlaced(true);
    setTimeout(() => {
      setOrderPlaced(false);
    }, 4000);
  };

  return (
    <aside className="checkout-summary-card" aria-label="Checkout Summary">
      <h3 className="summary-title">Checkout Summary</h3>

      <div className="summary-list">
        <div className="summary-row">
          <span className="summary-label">Total Items</span>
          <span className="summary-value" data-testid="checkout-total-items">
            {totalItems}
          </span>
        </div>

        <div className="summary-row">
          <span className="summary-label">Subtotal</span>
          <span className="summary-value" data-testid="checkout-subtotal">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        <div className="summary-row">
          <span className="summary-label">Estimated Tax (8%)</span>
          <span className="summary-value">${tax.toFixed(2)}</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">Shipping</span>
          <span className="summary-value">
            {subtotal === 0 ? '$0.00' : shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="summary-divider" />

        <div className="summary-row total-row">
          <span className="summary-total-label">Estimated Total</span>
          <span className="summary-total-amount" data-testid="checkout-total">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {orderPlaced ? (
        <div className="order-success-banner">
          🎉 Order placed successfully{user ? ` for ${user.email}` : ''}!
        </div>
      ) : (
        <button
          type="button"
          className="checkout-action-btn"
          disabled={totalItems === 0}
          onClick={handleCheckout}
        >
          {totalItems === 0
            ? 'Cart is Empty'
            : user
            ? `Checkout as ${user.email.split('@')[0]}`
            : 'Sign In & Checkout'}
        </button>
      )}

      {totalItems > 0 && subtotal < 100 && (
        <p className="shipping-upsell">
          Add ${(100 - subtotal).toFixed(2)} more for <strong>FREE shipping</strong>!
        </p>
      )}
    </aside>
  );
}

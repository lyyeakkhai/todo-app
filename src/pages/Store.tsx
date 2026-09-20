import { useCart, type CartItem } from '../context/CartContext';
import { CheckoutSummary } from '../components/cart/CheckoutSummary';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  icon: string;
}

const CATALOG_PRODUCTS: Product[] = [
  {
    id: 101,
    name: 'Keychron Mechanical Keyboard',
    price: 89.99,
    category: 'Hardware',
    description: 'Hot-swappable tactile switches with RGB backlighting.',
    icon: '⌨️',
  },
  {
    id: 102,
    name: 'Ergonomic Vertical Mouse',
    price: 39.99,
    category: 'Hardware',
    description: 'Natural handshake position reducing wrist strain.',
    icon: '🖱️',
  },
  {
    id: 103,
    name: 'UltraWide Curved Monitor',
    price: 299.99,
    category: 'Displays',
    description: '34-inch 144Hz IPS display with USB-C power delivery.',
    icon: '🖥️',
  },
  {
    id: 104,
    name: 'Noise-Canceling Headphones',
    price: 149.99,
    category: 'Audio',
    description: 'Active noise cancellation with 30-hour battery life.',
    icon: '🎧',
  },
  {
    id: 105,
    name: 'Desk Mat - Slate Gray',
    price: 24.99,
    category: 'Accessories',
    description: 'Micro-weave cloth surface with non-slip rubber base.',
    icon: '⬛',
  },
  {
    id: 106,
    name: '10-in-1 Aluminum USB-C Hub',
    price: 49.99,
    category: 'Accessories',
    description: 'Dual 4K HDMI, Gigabit Ethernet, and 100W PD charging.',
    icon: '🔌',
  },
];

export function Store() {
  const { state, dispatch } = useCart();

  const handleAddToCart = (product: Product) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
      },
    });
  };

  const handleIncrement = (item: CartItem) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id: item.id, quantity: item.quantity + 1 },
    });
  };

  const handleDecrement = (item: CartItem) => {
    // When quantity is 1 and decremented, quantity is 0 -> removes line!
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id: item.id, quantity: item.quantity - 1 },
    });
  };

  const handleRemove = (id: number) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: { id },
    });
  };

  return (
    <main className="store-page">
      <div className="store-header">
        <h2>Developer Store</h2>
        <p className="store-subtitle">
          Pure Reducer Cart Architecture • Zero Prop-Drilling Checkout
        </p>
      </div>

      <div className="store-layout">
        {/* Left Column: Products Catalog */}
        <section className="catalog-section">
          <h3 className="section-title">Products Catalog</h3>
          <div className="catalog-grid">
            {CATALOG_PRODUCTS.map((product) => {
              const inCartItem = state.items.find((i) => i.id === product.id);

              return (
                <div key={product.id} className="product-card">
                  <div className="product-icon">{product.icon}</div>
                  <div className="product-body">
                    <span className="product-category">{product.category}</span>
                    <h4 className="product-name">{product.name}</h4>
                    <p className="product-desc">{product.description}</p>
                    <div className="product-footer">
                      <span className="product-price">${product.price.toFixed(2)}</span>
                      <button
                        type="button"
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product)}
                      >
                        {inCartItem ? `Add More (${inCartItem.quantity})` : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Active Cart & Zero-Prop Checkout Summary */}
        <section className="cart-section">
          <div className="cart-card">
            <div className="cart-card-header">
              <h3 className="section-title">Your Cart</h3>
              <span className="cart-count-pill">{state.items.length} unique items</span>
            </div>

            {state.items.length === 0 ? (
              <div className="cart-empty-state">
                <span className="cart-empty-icon">🛒</span>
                <p className="cart-empty-text">Your cart is currently empty.</p>
                <p className="cart-empty-hint">
                  Click <strong>Add to Cart</strong> on any product to see pure reducer state in action.
                </p>
              </div>
            ) : (
              <div className="cart-items-list" data-testid="cart-items-list">
                {state.items.map((item) => (
                  <div key={item.id} className="cart-item-row" data-testid={`cart-item-${item.id}`}>
                    <div className="cart-item-info">
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-unit-price">${item.price.toFixed(2)} each</span>
                    </div>

                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button
                          type="button"
                          className="qty-btn decrement-btn"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() => handleDecrement(item)}
                        >
                          −
                        </button>
                        <span className="qty-display" data-testid={`qty-${item.id}`}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="qty-btn increment-btn"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() => handleIncrement(item)}
                        >
                          +
                        </button>
                      </div>

                      <span className="cart-item-total">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>

                      <button
                        type="button"
                        className="remove-item-btn"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => handleRemove(item.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Zero prop drilling: CheckoutSummary accepts 0 props! */}
            <CheckoutSummary />
          </div>
        </section>
      </div>
    </main>
  );
}

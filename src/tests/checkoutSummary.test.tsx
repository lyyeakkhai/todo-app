import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider, useCart } from '../context/CartContext';
import { CheckoutSummary } from '../components/cart/CheckoutSummary';

function TestWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}

function CartPopulator() {
  const { dispatch } = useCart();
  const { signIn } = useAuth();

  return (
    <div>
      <button
        onClick={() =>
          dispatch({
            type: 'ADD_ITEM',
            payload: { id: 1, name: 'Desk Mat', price: 20 },
          })
        }
      >
        Add Item
      </button>
      <button onClick={() => signIn('tester@example.com')}>Sign In Tester</button>
    </div>
  );
}

describe('CheckoutSummary Component', () => {
  it('renders empty checkout summary with zero props', () => {
    render(
      <TestWrapper>
        {/* Zero props passed */}
        <CheckoutSummary />
      </TestWrapper>
    );

    expect(screen.getByTestId('checkout-total-items').textContent).toBe('0');
    expect(screen.getByTestId('checkout-subtotal').textContent).toBe('$0.00');
    expect(screen.getByTestId('checkout-total').textContent).toBe('$0.00');

    const checkoutBtn = screen.getByRole('button', { name: /Cart is Empty/i }) as HTMLButtonElement;
    expect(checkoutBtn.disabled).toBe(true);
  });

  it('updates totals dynamically from CartContext when items are added without prop drilling', () => {
    render(
      <TestWrapper>
        <CartPopulator />
        {/* Zero props passed */}
        <CheckoutSummary />
      </TestWrapper>
    );

    const addBtn = screen.getByText('Add Item');
    fireEvent.click(addBtn);

    expect(screen.getByTestId('checkout-total-items').textContent).toBe('1');
    expect(screen.getByTestId('checkout-subtotal').textContent).toBe('$20.00');

    // Tax is 8% of 20 = $1.60. Shipping under $100 is $9.99. Total = $31.59
    expect(screen.getByTestId('checkout-total').textContent).toBe('$31.59');

    // Sign in to check personalized button text
    fireEvent.click(screen.getByText('Sign In Tester'));
    expect(screen.getByRole('button', { name: /Checkout as tester/i })).toBeTruthy();
  });
});

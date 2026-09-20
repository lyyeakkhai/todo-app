# Architecture Backbone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the React application with robust architectural foundations: a typed generic `useFetch<T>` hook, an `AuthContext` managing user authentication, a pure `useReducer`-backed `CartContext` using discriminated-union actions, and a zero-prop-drilling checkout summary.

**Architecture:** We decouple asynchronous data fetching into a strictly typed `useFetch<T>` state machine, lift application-wide authentication into an `AuthContext` provider wrapping the component tree, and isolate complex shopping cart mutation rules into a pure reducer function powered by TypeScript discriminated unions. Components consume cart and auth state strictly through custom hooks (`useAuth`, `useCart`), eliminating prop drilling while guaranteeing compile-time type safety.

**Tech Stack:** React 19, TypeScript 5.8+, Vite 8, React Router 7, Puppeteer-core, Vitest & React Testing Library (for automated testing).

## Global Constraints
- `useFetch<T>(url)` must return `{ data: T | null; loading: boolean; error: string | null }` with zero `any` types and require explicit null narrowing before accessing properties (e.g. `data.map`).
- `AuthContext` must be hand-written from scratch without AI boilerplate, exposing `user`, `signIn(email)`, and `signOut()`.
- `CartContext` must use a pure reducer (no `fetch`, no `localStorage`, no `console`) whose `default` case returns state untouched.
- `UPDATE_QUANTITY` with quantity `<= 0` must remove the line item from the cart.
- Checkout summary must read cart data solely via `useContext`/`useCart()`—no props carrying cart data anywhere in the tree.
- Atomic Git commits split per requirement.

---

## Deliverable Question: The Impossible State

> **One sentence:**
> "By modeling actions as a discriminated union and enforcing in the pure reducer that any non-positive quantity automatically evicts the item while rejecting negative payload transitions at compile time, the cart state machine guarantees that an item with quantity -1 is structurally unrepresentable."

---

## File Structure

```
src/
├── hooks/
│   └── useFetch.ts                     # Generic useFetch<T> hook
├── context/
│   ├── AuthContext.tsx                 # AuthContext and AuthProvider
│   └── CartContext.tsx                 # CartContext, pure reducer, and CartProvider
├── components/
│   ├── Navbar.tsx                      # Updated with Auth session & Store link
│   ├── auth/
│   │   └── SignInModal.tsx             # Interactive email sign-in modal
│   └── cart/
│       ├── ProductCard.tsx             # Catalog item card with Add to Cart button
│       ├── CartDrawer.tsx              # Cart line items with +/- / remove buttons
│       └── CheckoutSummary.tsx         # Checkout summary consuming CartContext (0 props)
├── pages/
│   ├── Store.tsx                       # Store catalog + Cart view
│   └── UserDirectory.tsx               # Updated to consume generic useFetch<User[]>
└── tests/
    ├── useFetch.test.ts                # Unit tests for useFetch narrowing & loading
    ├── authContext.test.tsx            # Tests for AuthProvider & useAuth
    └── cartReducer.test.ts             # Tests for reducer purity, UPDATE_QUANTITY <= 0 removal
```

---

## Proposed Changes & Tasks

### Task 1: Generic `useFetch<T>` with Type Narrowing Audit

**Files:**
- Create: `src/hooks/useFetch.ts`
- Modify: `src/pages/UserDirectory.tsx`
- Test: `src/tests/useFetch.test.ts`

**Interfaces:**
- Consumes: URL string
- Produces: `useFetch<T>(url: string): { data: T | null; loading: boolean; error: string | null }`

- [ ] **Step 1: Write tests for `useFetch<T>`**

```ts
// src/tests/useFetch.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from '../hooks/useFetch';

describe('useFetch<T>', () => {
  const mockData = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with loading true, data null, error null', () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useFetch<typeof mockData>('/api/users'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('returns narrowed data and loading false on success', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { result } = renderHook(() => useFetch<typeof mockData>('/api/users'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it('handles fetch error status and sets error message', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const { result } = renderHook(() => useFetch<typeof mockData>('/api/users'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Failed to fetch (Status: 404)');
  });
});
```

- [ ] **Step 2: Implement generic `useFetch<T>` in `src/hooks/useFetch.ts`**

```ts
import { useState, useEffect } from 'react';

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isCancelled = false;
    setState({ data: null, loading: true, error: null });

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch (Status: ${res.status})`);
        }
        return res.json() as Promise<T>;
      })
      .then((data: T) => {
        if (!isCancelled) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((err: Error) => {
        if (!isCancelled) {
          setState({ data: null, loading: false, error: err.message });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [url]);

  return state;
}
```

- [ ] **Step 3: Update `UserDirectory.tsx` to consume `useFetch<User[]>` and verify TypeScript narrowing**

Replace internal manual `fetch` state with `useFetch<User[]>('https://jsonplaceholder.typicode.com/users')`.
Verify that attempting `data.map(...)` without null check causes TypeScript compilation error (`'data' is possibly 'null'`), confirming strict type narrowing.

- [ ] **Step 4: Commit Requirement 1**

```bash
git add src/hooks/useFetch.ts src/pages/UserDirectory.tsx src/tests/useFetch.test.ts
git commit -m "feat(fetch): implement generic useFetch<T> with strict type narrowing"
```

---

### Task 2: Hand-Crafted `AuthContext` and NavBar Session Controls

**Files:**
- Create: `src/context/AuthContext.tsx`
- Create: `src/components/auth/SignInModal.tsx`
- Modify: `src/components/Navbar.tsx`
- Modify: `src/App.tsx`
- Test: `src/tests/authContext.test.tsx`

**Interfaces:**
- `AuthUser`: `{ email: string; name?: string }`
- `AuthContextType`: `{ user: AuthUser | null; signIn: (email: string) => void; signOut: () => void }`

- [ ] **Step 1: Write tests for `AuthContext`**

```tsx
// src/tests/authContext.test.tsx
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';

describe('AuthContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('provides null user initially', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBe(null);
  });

  it('updates user on signIn and clears on signOut', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.signIn('alex@example.com');
    });
    expect(result.current.user).toEqual({ email: 'alex@example.com' });

    act(() => {
      result.current.signOut();
    });
    expect(result.current.user).toBe(null);
  });

  it('throws error when useAuth is called outside provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    );
  });
});
```

- [ ] **Step 2: Implement hand-crafted `AuthContext.tsx`**

```tsx
// src/context/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

export interface AuthUser {
  email: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  signIn: (email: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const signIn = (email: string) => {
    if (!email.trim()) return;
    setUser({ email: email.trim() });
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

- [ ] **Step 3: Create `SignInModal.tsx` and integrate into `Navbar.tsx`**

In `Navbar.tsx`:
- Show "Sign in" button when `user === null`.
- Show "Hi, {user.email}" and "Sign out" button when `user !== null`.
- Clicking "Sign in" opens `SignInModal` with an email input and "Sign In" button.
- Ensure all consumers sit below `AuthProvider` in `src/App.tsx`.

- [ ] **Step 4: Commit Requirement 2**

```bash
git add src/context/AuthContext.tsx src/components/auth/SignInModal.tsx src/components/Navbar.tsx src/App.tsx src/tests/authContext.test.tsx
git commit -m "feat(auth): add hand-crafted AuthContext and NavBar user session controls"
```

---

### Task 3: Pure `CartContext` with `useReducer` and Discriminated Union Actions

**Files:**
- Create: `src/context/CartContext.tsx`
- Test: `src/tests/cartReducer.test.ts`

**Interfaces:**
```ts
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } };
```

- [ ] **Step 1: Write tests for `cartReducer`**

```ts
// src/tests/cartReducer.test.ts
import { describe, it, expect } from 'vitest';
import { cartReducer, type CartState, type CartAction } from '../context/CartContext';

describe('cartReducer purity and rules', () => {
  const item1 = { id: 1, name: 'Vim Keycaps', price: 25, quantity: 1 };
  const item2 = { id: 2, name: 'Ergonomic Desk Mat', price: 40, quantity: 2 };
  const initialState: CartState = { items: [item1, item2] };

  it('ADD_ITEM adds new item if not present', () => {
    const action: CartAction = {
      type: 'ADD_ITEM',
      payload: { id: 3, name: 'USB-C Cable', price: 15 },
    };
    const newState = cartReducer(initialState, action);
    expect(newState.items).toHaveLength(3);
    expect(newState.items[2]).toEqual({ id: 3, name: 'USB-C Cable', price: 15, quantity: 1 });
  });

  it('ADD_ITEM increments quantity if already present', () => {
    const action: CartAction = {
      type: 'ADD_ITEM',
      payload: { id: 1, name: 'Vim Keycaps', price: 25 },
    };
    const newState = cartReducer(initialState, action);
    expect(newState.items[0].quantity).toBe(2);
  });

  it('REMOVE_ITEM deletes item from cart', () => {
    const action: CartAction = {
      type: 'REMOVE_ITEM',
      payload: { id: 1 },
    };
    const newState = cartReducer(initialState, action);
    expect(newState.items).toHaveLength(1);
    expect(newState.items[0].id).toBe(2);
  });

  it('UPDATE_QUANTITY changes quantity when > 0', () => {
    const action: CartAction = {
      type: 'UPDATE_QUANTITY',
      payload: { id: 1, quantity: 4 },
    };
    const newState = cartReducer(initialState, action);
    expect(newState.items[0].quantity).toBe(4);
  });

  it('UPDATE_QUANTITY removes line item when quantity is 0', () => {
    const action: CartAction = {
      type: 'UPDATE_QUANTITY',
      payload: { id: 1, quantity: 0 },
    };
    const newState = cartReducer(initialState, action);
    expect(newState.items.find((i) => i.id === 1)).toBeUndefined();
    expect(newState.items).toHaveLength(1);
  });

  it('UPDATE_QUANTITY removes line item when quantity is negative (< 0)', () => {
    const action: CartAction = {
      type: 'UPDATE_QUANTITY',
      payload: { id: 1, quantity: -1 },
    };
    const newState = cartReducer(initialState, action);
    expect(newState.items.find((i) => i.id === 1)).toBeUndefined();
  });

  it('returns state untouched for unknown action type (purity audit)', () => {
    // @ts-expect-error Testing default branch with invalid action
    const newState = cartReducer(initialState, { type: 'UNKNOWN_ACTION' });
    expect(newState).toBe(initialState);
  });
});
```

- [ ] **Step 2: Implement `cartReducer`, `CartProvider`, and `useCart`**

Ensure:
1. Pure reducer: zero external side effects (no `fetch`, no `localStorage`, no `console.log`).
2. Default branch returns `state` untouched.
3. Quantity 0 or less in `UPDATE_QUANTITY` removes the line.

```tsx
// src/context/CartContext.tsx
import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
}

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex((item) => item.id === action.payload.id);
      const addQty = action.payload.quantity ?? 1;

      if (existingIndex > -1) {
        const updatedItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + addQty }
            : item
        );
        return { ...state, items: updatedItems };
      }

      const newItem: CartItem = {
        id: action.payload.id,
        name: action.payload.name,
        price: action.payload.price,
        quantity: addQty,
        image: action.payload.image,
        description: action.payload.description,
      };
      return { ...state, items: [...state.items, newItem] };
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
      };
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }

    default:
      return state;
  }
}

export interface CartContextType {
  state: CartState;
  dispatch: Dispatch<CartAction>;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ state, dispatch, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
```

- [ ] **Step 3: Commit Requirement 3**

```bash
git add src/context/CartContext.tsx src/tests/cartReducer.test.ts
git commit -m "feat(cart): implement CartContext with pure useReducer and discriminated union actions"
```

---

### Task 4: Store View & Checkout Summary via `useContext` (Zero Prop Drilling)

**Files:**
- Create: `src/components/cart/CheckoutSummary.tsx`
- Create: `src/components/cart/ProductCard.tsx`
- Create: `src/components/cart/CartDrawer.tsx`
- Create: `src/pages/Store.tsx`
- Modify: `src/App.tsx` (Add `<CartProvider>` and `/store` route)
- Modify: `src/components/Navbar.tsx` (Add Store link and Cart badge)

**Interfaces:**
- `<CheckoutSummary />`: Takes **0 props**. Directly reads `useCart()`.
- Real buttons dispatch actions:
  - Add to Cart: `dispatch({ type: 'ADD_ITEM', payload: product })`
  - Plus button: `dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity + 1 } })`
  - Minus button: `dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity - 1 } })` — at quantity 1, clicking `-` sets quantity to 0 and removes the line!
  - Remove button: `dispatch({ type: 'REMOVE_ITEM', payload: { id: item.id } })`

- [ ] **Step 1: Implement `CheckoutSummary.tsx`**

```tsx
// src/components/cart/CheckoutSummary.tsx
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

// Notice: ZERO PROPS. Cart data is accessed strictly via useContext(CartContext).
export function CheckoutSummary() {
  const { totalItems, subtotal } = useCart();
  const { user } = useAuth();

  const tax = subtotal * 0.08;
  const shipping = subtotal > 0 ? (subtotal > 100 ? 0 : 10) : 0;
  const total = subtotal + tax + shipping;

  return (
    <aside className="checkout-summary-card">
      <h3 className="summary-title">Order Summary</h3>
      <div className="summary-row">
        <span>Items ({totalItems})</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="summary-row">
        <span>Estimated Tax (8%)</span>
        <span>${tax.toFixed(2)}</span>
      </div>
      <div className="summary-row">
        <span>Shipping</span>
        <span>{subtotal === 0 ? '$0.00' : shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
      </div>
      <div className="summary-divider" />
      <div className="summary-row total-row">
        <span>Total</span>
        <span className="summary-total-price">${total.toFixed(2)}</span>
      </div>

      <button
        type="button"
        className="checkout-btn"
        disabled={totalItems === 0}
        onClick={() => {
          if (!user) {
            alert('Please sign in to complete your purchase.');
          } else {
            alert(`Thank you, ${user.email}! Order placed successfully.`);
          }
        }}
      >
        {user ? `Checkout as ${user.email.split('@')[0]}` : 'Sign In to Checkout'}
      </button>
    </aside>
  );
}
```

- [ ] **Step 2: Implement Store and Cart Components**

Create `src/pages/Store.tsx` with curated products (e.g. Mechanical Keyboard, Noise-Canceling Headphones, Desk Mat, USB-C Dock) and a responsive two-column layout:
- Left Column: Products grid with "Add to Cart" real buttons.
- Right Column: Cart items with item thumbnails, price, quantity controls (`-`, `+`, Remove), and the zero-prop `CheckoutSummary`.
- Verify the disappearance of cart line when quantity hits 0.

- [ ] **Step 3: Update `App.tsx` and `Navbar.tsx`**

Wrap routes with `AuthProvider` and `CartProvider`:
```tsx
<AuthProvider>
  <CartProvider>
    <BrowserRouter>
      ...
```
Add Store link to `Navbar` with dynamic item count badge.

- [ ] **Step 4: Commit Requirement 4**

```bash
git add src/pages/Store.tsx src/components/cart/ src/App.tsx src/components/Navbar.tsx src/App.css
git commit -m "feat(store): add Store and zero-prop-drilling CheckoutSummary via CartContext"
```

---

### Task 5: Vitest Test Suite & Audit Verification

**Files:**
- Modify: `package.json` (add vitest, testing-library scripts)
- Run: `npm run test`
- Run: `npm run build`
- Run: `npm run lint`

- [ ] **Step 1: Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`**
- [ ] **Step 2: Run test suite to verify all requirements pass**
- [ ] **Step 3: Run TypeScript compiler and ESLint**
- [ ] **Step 4: Commit Requirement 5**

```bash
git commit -m "test: add vitest test suite verifying useFetch, AuthContext, and Cart reducer purity"
```

---

### Task 6: Capture Required Screenshots

**Files:**
- Create/Modify: `capture_architecture_screenshots.cjs`
- Outputs:
  1. `screenshots/navbar-signed-out.png`
  2. `screenshots/navbar-signed-in.png`
  3. `screenshots/cart-quantity-one.png`
  4. `screenshots/cart-quantity-zero-removed.png`

- [ ] **Step 1: Script browser automation to record auth state changes & cart line disappearing at quantity 0**
- [ ] **Step 2: Execute script and inspect generated screenshots**
- [ ] **Step 3: Commit screenshots**

```bash
git add screenshots/ capture_architecture_screenshots.cjs
git commit -m "chore: add screenshots verifying navbar auth states and cart line removal at quantity 0"
```

---

## Verification Plan

### Automated Tests
- Run `npx vitest run` -> 100% tests pass for `useFetch`, `AuthContext`, and `cartReducer`.
- Run `npm run build` (`tsc -b && vite build`) -> Confirms zero TypeScript errors and successful production bundle.
- Run `npm run lint` -> Confirms 0 ESLint errors.

### Manual / Browser Verification
1. **useFetch Narrowing**: Visit `/users`. Verify user list renders properly using generic `useFetch<User[]>`.
2. **Auth Flow**: In NavBar, verify "Sign in" is visible. Click it, enter an email (e.g. `alex@example.com`). Verify NavBar now renders "Hi, alex@example.com" and a "Sign out" button. Click "Sign out" and verify it toggles back to "Sign in".
3. **Cart Operations**: Visit `/store`. Click "Add to Cart" on a product. Verify cart updates and Checkout Summary reflects price and item count.
4. **Quantity 0 Removal**: In the cart item, click `-` until quantity reaches 0. Verify the entire line item disappears from the cart immediately.
5. **Zero Prop Drilling Audit**: Confirm `<CheckoutSummary />` accepts 0 props and reads directly from context.

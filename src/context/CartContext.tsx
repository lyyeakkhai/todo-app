import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } };

/**
 * Pure reducer owning all cart rules.
 * - Zero side effects: no fetch, no localStorage, no console calls.
 * - Default branch returns state untouched.
 * - UPDATE_QUANTITY removes line item when quantity <= 0.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((item) => item.id === action.payload.id);
      const quantityToAdd = action.payload.quantity ?? 1;

      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + quantityToAdd }
              : item
          ),
        };
      }

      const newItem: CartItem = {
        id: action.payload.id,
        name: action.payload.name,
        price: action.payload.price,
        quantity: quantityToAdd,
        image: action.payload.image,
        category: action.payload.category,
      };

      return {
        ...state,
        items: [...state.items, newItem],
      };
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

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

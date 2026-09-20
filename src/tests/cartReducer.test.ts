import { describe, it, expect } from 'vitest';
import { cartReducer, type CartState, type CartAction } from '../context/CartContext';

describe('cartReducer purity and business rules', () => {
  const item1 = { id: 101, name: 'Mechanical Keyboard', price: 89.99, quantity: 1 };
  const item2 = { id: 102, name: 'Vertical Mouse', price: 39.99, quantity: 2 };
  const initialState: CartState = { items: [item1, item2] };

  it('ADD_ITEM adds a new line item with quantity 1 if not already in cart', () => {
    const action: CartAction = {
      type: 'ADD_ITEM',
      payload: { id: 103, name: 'Desk Mat', price: 24.99 },
    };

    const nextState = cartReducer(initialState, action);

    expect(nextState.items).toHaveLength(3);
    expect(nextState.items[2]).toEqual({
      id: 103,
      name: 'Desk Mat',
      price: 24.99,
      quantity: 1,
      image: undefined,
      category: undefined,
    });
  });

  it('ADD_ITEM increments quantity if item already exists in cart', () => {
    const action: CartAction = {
      type: 'ADD_ITEM',
      payload: { id: 101, name: 'Mechanical Keyboard', price: 89.99 },
    };

    const nextState = cartReducer(initialState, action);

    expect(nextState.items).toHaveLength(2);
    expect(nextState.items[0].quantity).toBe(2);
  });

  it('REMOVE_ITEM filters out the item by id', () => {
    const action: CartAction = {
      type: 'REMOVE_ITEM',
      payload: { id: 101 },
    };

    const nextState = cartReducer(initialState, action);

    expect(nextState.items).toHaveLength(1);
    expect(nextState.items[0].id).toBe(102);
  });

  it('UPDATE_QUANTITY updates item quantity when positive (> 0)', () => {
    const action: CartAction = {
      type: 'UPDATE_QUANTITY',
      payload: { id: 101, quantity: 5 },
    };

    const nextState = cartReducer(initialState, action);

    expect(nextState.items[0].quantity).toBe(5);
  });

  it('UPDATE_QUANTITY with quantity 0 removes the line item from cart', () => {
    const action: CartAction = {
      type: 'UPDATE_QUANTITY',
      payload: { id: 101, quantity: 0 },
    };

    const nextState = cartReducer(initialState, action);

    // Item 101 was removed!
    expect(nextState.items.find((i) => i.id === 101)).toBeUndefined();
    expect(nextState.items).toHaveLength(1);
    expect(nextState.items[0].id).toBe(102);
  });

  it('UPDATE_QUANTITY with negative quantity (< 0) also removes the line item, making negative quantity impossible', () => {
    const action: CartAction = {
      type: 'UPDATE_QUANTITY',
      payload: { id: 101, quantity: -1 },
    };

    const nextState = cartReducer(initialState, action);

    expect(nextState.items.find((i) => i.id === 101)).toBeUndefined();
    expect(nextState.items).toHaveLength(1);
  });

  it('default branch returns state untouched (pure reducer check)', () => {
    // @ts-expect-error Testing unknown action type runtime behavior
    const unknownAction = { type: 'INVALID_ACTION_TYPE' } as CartAction;
    const nextState = cartReducer(initialState, unknownAction);

    // Exact referential equality check
    expect(nextState).toBe(initialState);
  });
});

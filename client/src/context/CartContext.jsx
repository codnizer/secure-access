import React, { createContext, useReducer, useContext } from 'react';

// Initial state for the cart
const initialState = {
  cartItems: [],
  totalAmount: 0,
  totalItems: 0,
};

// Reducer function to handle cart actions
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { id, item } = action.payload;
      const existingItem = state.cartItems.find(cartItem => cartItem.id === id);

      let updatedCartItems;
      if (existingItem) {
        updatedCartItems = state.cartItems.map(cartItem =>
          cartItem.id === id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        updatedCartItems = [...state.cartItems, { ...item, quantity: 1 }];
      }

      const totalAmount = updatedCartItems.reduce(
        (acc, cartItem) => acc + cartItem.price * cartItem.quantity,
        0
      );
      const totalItems = updatedCartItems.reduce(
        (acc, cartItem) => acc + cartItem.quantity,
        0
      );

      return { cartItems: updatedCartItems, totalAmount, totalItems };
    }

    case 'REMOVE_FROM_CART': {
      const updatedCartItems = state.cartItems.filter(
        cartItem => cartItem.id !== action.payload.id
      );

      const totalAmount = updatedCartItems.reduce(
        (acc, cartItem) => acc + cartItem.price * cartItem.quantity,
        0
      );
      const totalItems = updatedCartItems.reduce(
        (acc, cartItem) => acc + cartItem.quantity,
        0
      );

      return { cartItems: updatedCartItems, totalAmount, totalItems };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
    
      // Update the cart items and remove any item with quantity <= 0
      const updatedCartItems = state.cartItems
        .map(cartItem =>
          cartItem.id === id ? { ...cartItem, quantity } : cartItem
        )
        .filter(cartItem => cartItem.quantity > 0); // Remove items with quantity 0
    
      const totalAmount = updatedCartItems.reduce(
        (acc, cartItem) => acc + cartItem.price * cartItem.quantity,
        0
      );
    
      const totalItems = updatedCartItems.reduce(
        (acc, cartItem) => acc + cartItem.quantity,
        0
      );
    
      return { cartItems: updatedCartItems, totalAmount, totalItems };
    }
    
    case 'CLEAR_CART': {
      return { cartItems: [], totalAmount: 0, totalItems: 0 };
    }


    default:
      return state;
  }
};

// Create Context
const CartContext = createContext();

// Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = (id, item) => {
    dispatch({ type: 'ADD_TO_CART', payload: { id, item } });
  };

  const removeFromCart = id => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id } });
  };

  const updateQuantity = (id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ ...state, addToCart, removeFromCart, updateQuantity,clearCart  }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook for easy access to the cart context
export const useCart = () => {
  return useContext(CartContext);
};

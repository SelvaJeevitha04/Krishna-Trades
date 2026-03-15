import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem, CartState } from '../types';
import api from '../services/api';

interface CartContextType extends CartState {
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  syncCartFromServer: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const getProductId = (p: any) => typeof p === 'string' ? p : p?._id;
      const incomingId = getProductId(action.payload.product);
      const existingItem = state.items.find(item => getProductId(item.product) === incomingId);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          getProductId(item.product) === incomingId
            ? { ...item, quantity: item.quantity + action.payload.quantity, total: (item.quantity + action.payload.quantity) * item.price }
            : item
        );
        return calculateTotals({ ...state, items: updatedItems });
      } else {
        const newItem = { ...action.payload, total: action.payload.price * action.payload.quantity };
        return calculateTotals({ ...state, items: [...state.items, newItem] });
      }
    }
    
    case 'REMOVE_FROM_CART': {
      const getProductId = (p: any) => typeof p === 'string' ? p : p?._id;
      const updatedItems = state.items.filter(item => getProductId(item.product) !== getProductId(action.payload));
      return calculateTotals({ ...state, items: updatedItems });
    }
    
    case 'UPDATE_QUANTITY': {
      const getProductId = (p: any) => typeof p === 'string' ? p : p?._id;
      const updatedItems = state.items.map(item =>
        getProductId(item.product) === getProductId(action.payload.productId)
          ? { ...item, quantity: action.payload.quantity, total: action.payload.quantity * item.price }
          : item
      );
      return calculateTotals({ ...state, items: updatedItems });
    }
    
    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0 };
    
    case 'LOAD_CART':
      return calculateTotals({ ...state, items: action.payload });
    
    default:
      return state;
  }
};

const calculateTotals = (state: CartState): CartState => {
  const total = state.items.reduce((sum, item) => sum + (item.total || (item.price * item.quantity) || 0), 0);
  const itemCount = state.items.length;
  return { ...state, total, itemCount };
};

const CART_STORAGE_KEY = 'kt_cart_v2';

const loadCartFromStorage = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
};

const initialState: CartState = {
  items: loadCartFromStorage(),
  total: 0,
  itemCount: 0,
};

// ─── Server sync helpers ──────────────────────────────────────────────────────

/**
 * Fetch the user's cart from the backend and return normalised CartItems.
 * Returns [] if not authenticated or on error.
 */
const fetchServerCart = async (): Promise<CartItem[]> => {
  const token = localStorage.getItem('accessToken');
  if (!token) return [];
  try {
    const res = await api.get('/cart');
    if (res.data?.success) {
      const serverItems: any[] = res.data.data?.cart?.items ?? res.data.data?.items ?? [];
      return serverItems.map((si: any) => {
        const prod = si.product ?? {};
        return {
          product: typeof si.product === 'string' ? si.product : (prod._id ?? si.product),
          name: prod.name ?? si.name ?? '',
          price: prod.price ?? si.price ?? 0,
          quantity: si.quantity,
          minOrderQuantity: prod.minOrderQuantity ?? si.minOrderQuantity ?? 1,
          stock: prod.stock ?? si.stock ?? 0,
          brand: prod.brand ?? si.brand ?? '',
          total: si.total ?? (si.quantity * (prod.price ?? si.price ?? 0)),
          images: prod.images,
        };
      });
    }
  } catch {
    // silently ignore – user may not be logged in
  }
  return [];
};

/**
 * Push the local cart snapshot to the server (best-effort).
 * We clear the server cart then re-add every item.
 */
const pushCartToServer = async (items: CartItem[]) => {
  const token = localStorage.getItem('accessToken');
  if (!token || items.length === 0) return;
  try {
    // Clear existing server cart first
    await api.delete('/cart');
    // Add each item
    for (const item of items) {
      const productId = typeof item.product === 'string' ? item.product : (item.product as any)?._id;
      if (!productId) continue;
      await api.post('/cart', {
        productId,
        quantity: item.quantity,
        price: item.price,
        total: item.total ?? item.price * item.quantity,
      });
    }
  } catch {
    // silently ignore – cart is still in localStorage
  }
};

// ─────────────────────────────────────────────────────────────────────────────

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { ...initialState, ...calculateTotals(initialState) });

  // On mount: try to load from server; fall back to localStorage
  const syncCartFromServer = async () => {
    const serverItems = await fetchServerCart();
    if (serverItems.length > 0) {
      dispatch({ type: 'LOAD_CART', payload: serverItems });
      saveCartToStorage(serverItems);
    }
    // else keep whatever is in localStorage (already loaded into state via initialState)
  };

  React.useEffect(() => {
    syncCartFromServer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage whenever cart changes
  React.useEffect(() => {
    saveCartToStorage(state.items);
  }, [state.items]);

  const addToCart = async (item: CartItem) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
    // Also sync to server in background
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const productId = typeof item.product === 'string' ? item.product : (item.product as any)?._id;
        await api.post('/cart', {
          productId,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        });
      } catch {
        // silently ignore
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    // We push the full updated cart to server after local state updates
    // (done via useEffect on state change would be tricky, so no-op for now)
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' });
    saveCartToStorage([]);
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await api.delete('/cart');
      } catch {
        // silently ignore
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCartFromServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

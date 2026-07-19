import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface Customizations {
  volume: '0.2' | '0.3' | '0.4';
  milk: 'обычное' | 'кокосовое' | 'соевое';
  syrup: string[];
}

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  basePrice: number;
  quantity: number;
  image_url: string | null;
  customizations: Customizations;
}

export const calculateItemPrice = (basePrice: number, cust: Customizations) => {
  let finalPrice = Number(basePrice);
  if (cust.volume === '0.3') finalPrice += 40;
  if (cust.volume === '0.4') finalPrice += 80;
  if (cust.milk !== 'обычное') finalPrice += 50;
  finalPrice += cust.syrup.length * 30;
  return finalPrice;
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('coffee_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('coffee_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('coffee_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    const customKey = `${newItem.productId}-${JSON.stringify(newItem.customizations)}`;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === customKey);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === customKey
            ? {
                ...item,
                quantity: item.quantity + newItem.quantity,
              }
            : item,
        );
      }
      const finalPrice = calculateItemPrice(newItem.basePrice, newItem.customizations);
      return [...prevCart, { ...newItem, id: customKey, basePrice: finalPrice }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.basePrice * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart должен использоваться внутри CartProvider');
  return context;
}

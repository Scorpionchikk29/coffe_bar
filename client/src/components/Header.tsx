import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import CartWidget from './CartWidget.tsx';

export default function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const totalItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <header className="bg-amber-900 text-amber-50 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-wider flex items-center gap-2">
          ☕ <span className="font-serif">Кофейня</span>
        </Link>

        <nav className="flex items-center gap-6 font-medium text-sm">
          {}
          <button
            onClick={() => setIsCartOpen(true)}
            className="hover:text-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer relative py-1"
          >
            🛒 Корзина
            {totalItemsCount > 0 && (
              <span className="bg-amber-500 text-stone-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-scale-in">
                {totalItemsCount}
              </span>
            )}
          </button>

          {user ? (
            <>
              <Link to="/profile" className="hover:text-amber-200 transition-colors">
                Профиль 👤
              </Link>
              <Link to="/orders" className="hover:text-amber-200 transition-colors">
                Мои заказы
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-amber-300 hover:text-amber-100 transition-colors font-semibold"
                >
                  Панель Бариста
                </Link>
              )}
              <button
                onClick={logout}
                className="bg-amber-800 hover:bg-amber-700 px-3 py-1.5 rounded transition-colors cursor-pointer"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-amber-200 transition-colors">
                Войти
              </Link>
              <Link
                to="/register"
                className="bg-amber-500 hover:bg-amber-600 text-stone-900 px-4 py-2 rounded-full font-bold transition-all shadow-sm"
              >
                Создать профиль
              </Link>
            </>
          )}
        </nav>
      </div>

      {}
      <CartWidget isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}

import { useCart } from '../context/CartContext.tsx';
import { useNavigate } from 'react-router-dom';

interface CartWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartWidget({ isOpen, onClose }: CartWidgetProps) {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end animate-fade-in">
      {}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>

      <div className="bg-white max-w-sm w-full h-full p-6 shadow-2xl flex flex-col justify-between animate-slide-left">
        <div>
          <div className="flex justify-between items-center border-b border-stone-100 pb-4 mb-4">
            <h3 className="text-lg font-bold font-serif text-amber-950">Корзина заказа</h3>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 text-xl cursor-pointer"
            >
              &times;
            </button>
          </div>

          {cart.length === 0 ? (
            <p className="text-center text-stone-400 text-xs py-12">Ваша корзина пока пуста ☕</p>
          ) : (
            <div className="divide-y divide-stone-100 max-h-[65vh] overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex justify-between gap-3 text-sm">
                  <div className="flex-1">
                    <p className="font-semibold text-stone-800">{item.name}</p>
                    <p className="text-[11px] text-stone-400 capitalize mt-0.5">
                      {item.customizations.volume}л, {item.customizations.milk} молоко
                      {item.customizations.syrup.length > 0 &&
                        ` (+ ${item.customizations.syrup.join(', ')})`}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-5 h-5 bg-stone-100 rounded text-xs font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-medium px-1">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-5 h-5 bg-stone-100 rounded text-xs font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-between items-end">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[10px] text-stone-300 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      Удалить
                    </button>
                    <span className="font-bold text-stone-700 mt-1">
                      {item.basePrice * item.quantity} ₽
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {}
        {cart.length > 0 && (
          <div className="border-t border-stone-100 pt-4 bg-white">
            <div className="flex justify-between items-center font-bold text-amber-950 font-serif mb-4">
              <span>Итого:</span>
              <span>{getCartTotal()} ₽</span>
            </div>
            <button
              onClick={() => {
                navigate('/checkout');
                onClose();
              }}
              className="w-full bg-amber-800 hover:bg-amber-900 text-white text-center font-bold py-3 rounded-xl transition-all shadow-md text-xs cursor-pointer"
            >
              Перейти к оформлению
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

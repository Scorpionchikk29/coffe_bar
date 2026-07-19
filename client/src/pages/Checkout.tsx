import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../api/axios.ts';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pickupTime, setPickupTime] = useState('');
  const [limits, setLimits] = useState({
    workStart: '08:00',
    workEnd: '21:00',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => setLimits(res.data))
      .catch((err) => console.error('Ошибка загрузки лимитов времени:', err));
  }, []);

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-stone-600">Ваша корзина пуста</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-amber-800 font-semibold hover:underline cursor-pointer"
        >
          Вернуться к меню
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const now = new Date();
      const [hours, minutes] = pickupTime.split(':').map(Number);

      const targetDate = new Date();
      targetDate.setHours(hours!, minutes!, 0, 0);

      if (targetDate.getTime() <= now.getTime()) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      const formattedItems = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        customizations: item.customizations,
      }));

      await api.post('/orders', {
        items: formattedItems,
        pickupTime: targetDate.toISOString(),
      });

      clearCart();
      alert('🎉 Заказ успешно принят! Ждем вас в кофейне.');
      navigate('/orders');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось оформить заказ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto my-6">
      <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
        <h2 className="text-xl font-bold font-serif text-amber-950 mb-5">Детали самовывоза</h2>
        {error && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Имя клиента
            </label>
            <input
              type="text"
              value={`${user?.firstName} ${user?.lastName}`}
              disabled
              className="w-full px-4 py-2 rounded-lg border border-stone-100 text-sm bg-stone-50 text-stone-400 select-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Время самовывоза
            </label>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              required
              min={limits.workStart}
              max={limits.workEnd}
              className="w-full px-4 py-2 rounded-lg border border-stone-200 text-sm focus:outline-amber-700 bg-white"
            />
            <span className="block text-[10px] text-stone-400 mt-1">
              Часы работы сегодня: с {limits.workStart} до {limits.workEnd}. Если указанное время
              меньше текущего, заказ будет перенесен на завтра.
            </span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-800 hover:bg-amber-900 text-white font-bold py-3 rounded-xl transition-colors shadow-md mt-2 text-sm cursor-pointer disabled:bg-stone-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Оформление...' : 'Подтвердить заказ'}
          </button>
        </form>
      </div>

      <div className="bg-stone-100 p-6 rounded-2xl flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold font-serif text-amber-950 mb-5">Ваш чек</h2>
          <div className="divide-y divide-stone-200 max-h-64 overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-start text-sm">
                <div>
                  <p className="font-semibold text-stone-800">
                    {item.name} <span className="text-stone-400 font-normal">x{item.quantity}</span>
                  </p>
                  <p className="text-xs text-stone-500 capitalize">
                    {item.customizations.volume}л, молоко: {item.customizations.milk}
                    {item.customizations.syrup.length > 0 &&
                      `, сироп: ${item.customizations.syrup.join('+')}`}
                  </p>
                </div>
                <span className="font-medium text-stone-700">
                  {item.basePrice * item.quantity} ₽
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-stone-300 pt-4 mt-4 flex justify-between items-center font-bold text-lg text-amber-950 font-serif">
          <span>Итого к оплате:</span>
          <span>{getCartTotal()} ₽</span>
        </div>
      </div>
    </div>
  );
}

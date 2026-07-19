import { useState, useEffect } from 'react';
import { api } from '../api/axios.ts';
import AdminNav from '../components/AdminNav.tsx';

interface OrderItem {
  id: number;
  quantity: number;
  customizations: { volume: string; milk: string; syrup: string[] };
  products: { name: string };
}

interface UserProfile {
  first_name: string;
  phone: string | null;
}

interface UserData {
  id: number;
  user_profiles: UserProfile | null;
}

interface Order {
  id: number;
  total_price: string;
  created_at: string;
  pickup_time: string | null;
  status_id: number;
  statuses: { title: string };
  users: UserData | null;
  order_items: OrderItem[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    api
      .get('/orders')
      .then((res) => setOrders(res.data))
      .catch((err) => console.error('Ошибка загрузки панели бариста:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: number, nextStatusId: number) => {
    try {
      await api.patch(`/orders/${orderId}/status`, {
        status_id: nextStatusId,
      });
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status_id: nextStatusId } : order)),
      );
      fetchOrders();
    } catch (err) {
      console.error('Не удалось обновить статус заказа:', err);
      alert('Ошибка при обновлении статуса');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('🛑 Вы уверены, что хотите БЕЗУСЛОВНО ОТМЕНИТЬ этот заказ?')) return;
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status_id: 5 } : order)),
      );
      alert('Заказ успешно аннулирован');
    } catch (err) {
      console.error('Ошибка аннулирования заказа:', err);
      alert('Не удалось отменить заказ');
    }
  };

  if (loading)
    return (
      <div className="text-center py-12 text-sm text-stone-500">Загрузка панели заказов...</div>
    );

  const activeOrders = orders.filter((order) => order.status_id !== 4 && order.status_id !== 5);

  return (
    <div className="max-w-6xl mx-auto my-4">
      <AdminNav />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-serif text-amber-950">
            Панель управления заказами
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Отображение активных заказов со статусами готовности в реальном времени
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
        >
          🔄 Обновить список
        </button>
      </div>

      {activeOrders.length === 0 ? (
        <div className="bg-white border border-stone-100 text-center py-12 rounded-xl shadow-sm">
          <p className="text-stone-500 text-sm font-medium">
            Нет активных заказов в очереди. Время выпить кофе! ☕
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-stone-200 rounded-xl shadow-sm p-5 flex flex-col justify-between hover:border-amber-700/30 transition-all"
            >
              <div>
                <div className="flex justify-between items-start gap-2 border-b border-stone-100 pb-3 mb-3">
                  <div>
                    <span className="text-xs font-bold text-amber-900 block">
                      Заказ #{order.id}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Получен:{' '}
                      {new Date(order.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-stone-500 block">
                      К какому времени:
                    </span>
                    <span className="text-sm font-bold text-amber-950">
                      {order.pickup_time
                        ? new Date(order.pickup_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Сейчас'}
                    </span>
                  </div>
                </div>

                <div className="bg-stone-50 p-2.5 rounded-lg text-xs text-stone-700 mb-4 flex flex-col gap-0.5">
                  <p>
                    <strong>Покупатель:</strong>{' '}
                    {order.users?.user_profiles?.first_name || 'Клиент'}
                  </p>
                  {order.users?.user_profiles?.phone && (
                    <p>
                      <strong>Телефон:</strong> {order.users.user_profiles.phone}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 mb-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="text-xs border-l-2 border-amber-800 pl-2.5">
                      <p className="font-bold text-stone-800">
                        {item.products.name}{' '}
                        <span className="text-amber-800">x{item.quantity}</span>
                      </p>
                      <p className="text-[11px] text-stone-500 capitalize mt-0.5">
                        Объем: {item.customizations.volume}л, молоко: {item.customizations.milk}
                        {item.customizations.syrup.length > 0 &&
                          ` (+ сироп: ${item.customizations.syrup.join(', ')})`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-stone-100 pt-3 mt-2">
                <div className="flex justify-between items-center text-xs mb-3">
                  <span className="text-stone-400">
                    Сумма: <strong>{parseFloat(order.total_price)} ₽</strong>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      order.status_id === 1
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : order.status_id === 2
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-green-50 text-green-700 border border-green-200'
                    }`}
                  >
                    {order.status_id === 1
                      ? 'Принят'
                      : order.status_id === 2
                        ? 'Готовится'
                        : 'Готов'}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    {order.status_id === 1 && (
                      <button
                        onClick={() => handleStatusChange(order.id, 2)}
                        className="w-full bg-amber-800 hover:bg-amber-900 text-white font-semibold py-2 rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
                      >
                        👨‍🍳 Начать готовить
                      </button>
                    )}
                    {order.status_id === 2 && (
                      <button
                        onClick={() => handleStatusChange(order.id, 3)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
                      >
                        ✨ Заказ готов
                      </button>
                    )}
                    {order.status_id === 3 && (
                      <button
                        onClick={() => handleStatusChange(order.id, 4)}
                        className="w-full bg-stone-800 hover:bg-stone-900 text-stone-100 font-semibold py-2 rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
                      >
                        📦 Выдать клиенту
                      </button>
                    )}
                  </div>

                  {}
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="w-full text-center text-stone-400 hover:text-red-600 text-[10px] font-bold py-1 border border-transparent hover:border-red-200 rounded transition-all cursor-pointer"
                  >
                    ❌ Отменить заказ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

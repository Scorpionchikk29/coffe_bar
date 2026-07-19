import { useState, useEffect } from 'react';
import { api } from '../api/axios.ts';

interface OrderItem {
  id: number;
  quantity: number;
  customizations: { volume: string; milk: string; syrup: string[] };
  products: { name: string };
}

interface Order {
  id: number;
  total_price: string;
  created_at: string;
  pickup_time: string | null;
  status_id: number;
  statuses: { title: string };
  order_items: OrderItem[];
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentTab, setCurrentTab] = useState<'active' | 'archive'>('active');

  const fetchOrderHistory = () => {
    api
      .get('/orders')
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => console.error('Ошибка загрузки истории:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Вы точно хотите отменить этот заказ?')) return;

    try {
      const response = await api.patch(`/orders/${orderId}/cancel`);
      alert(response.data.message || 'Заказ отменен');

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status_id: 5,
                statuses: { title: 'Отменен' },
              }
            : order,
        ),
      );
    } catch (err: any) {
      alert(err.response?.data?.error || 'Не удалось отменить заказ');
    }
  };

  if (loading)
    return <div className="text-center py-12 text-sm text-stone-500">Загрузка истории...</div>;

  const activeOrders = orders.filter(
    (o) => o.status_id === 1 || o.status_id === 2 || o.status_id === 3,
  );
  const archivedOrders = orders.filter((o) => o.status_id === 4 || o.status_id === 5);

  const displayedOrders = currentTab === 'active' ? activeOrders : archivedOrders;

  return (
    <div className="max-w-4xl mx-auto my-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-stone-200 pb-2">
        <h2 className="text-2xl font-bold font-serif text-amber-950">Ваши заказы</h2>

        <div className="flex gap-2 bg-stone-100 p-1 rounded-xl max-w-max self-start md:self-auto">
          <button
            type="button"
            onClick={() => setCurrentTab('active')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'active'
                ? 'bg-white text-amber-990 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            🔥 Активные ({activeOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('archive')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'archive'
                ? 'bg-white text-amber-990 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            📦 Архив ({archivedOrders.length})
          </button>
        </div>
      </div>

      {displayedOrders.length === 0 ? (
        <p className="text-stone-400 text-sm py-6 bg-white border border-stone-100 rounded-xl text-center font-medium">
          {currentTab === 'active'
            ? 'У вас нет активных заказов в очереди.'
            : 'Архив выполненных заказов пуст.'}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {displayedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-stone-100 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-bold text-sm text-stone-800">Заказ #{order.id}</span>
                  <span className="text-xs text-stone-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      order.status_id === 4
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : order.status_id === 5
                          ? 'bg-stone-50 text-stone-500 border-stone-200'
                          : order.status_id === 3
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 animate-pulse'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {order.statuses.title}
                  </span>
                </div>

                <div className="text-xs text-stone-600 flex flex-col gap-1 mt-3">
                  {order.order_items.map((item) => (
                    <p key={item.id}>
                      • <span className="font-semibold text-stone-700">{item.products.name}</span>{' '}
                      (x{item.quantity})
                      <span className="text-stone-400 capitalize">
                        {' '}
                        — {item.customizations.volume}л, молоко {item.customizations.milk}
                      </span>
                    </p>
                  ))}
                </div>
              </div>

              <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-stone-100 min-w-44 flex flex-col md:items-end justify-between h-full gap-2">
                <div>
                  <p className="text-xs text-stone-400">Самовывоз к:</p>
                  <p className="text-sm font-semibold text-stone-700 mb-1">
                    {order.pickup_time
                      ? new Date(order.pickup_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Как можно скорее'}
                  </p>
                  <p className="text-base font-bold font-serif text-amber-950">
                    {parseFloat(order.total_price)} ₽
                  </p>
                </div>

                {order.status_id === 1 && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="mt-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-bold py-1 px-3 rounded-lg transition-colors cursor-pointer max-w-max md:max-w-none shadow-sm"
                  >
                    Отменить заказ
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

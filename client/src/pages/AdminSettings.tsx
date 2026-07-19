import { useState, useEffect } from 'react';
import { api } from '../api/axios.ts';
import AdminNav from '../components/AdminNav.tsx';

export default function AdminSettings() {
  const [form, setForm] = useState({ workStart: '08:00', workEnd: '21:00' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => setForm(res.data))
      .catch((err) => console.error('Ошибка чтения конфигурации:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubLoading(true);

    try {
      const response = await api.post('/settings', form);
      setMessage(response.data.message || 'График работы успешно обновлен');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось сохранить изменения');
    } finally {
      setSubLoading(false);
    }
  };

  if (loading)
    return <div className="text-center py-12 text-sm text-stone-500">Загрузка конфигурации...</div>;

  return (
    <div className="max-w-xl mx-auto my-4 bg-white border border-stone-200 p-6 rounded-2xl shadow-sm">
      <AdminNav />
      <div className="mb-6 border-b border-stone-100 pb-3">
        <h2 className="text-xl font-bold font-serif text-amber-950">Рабочее время кофейни</h2>
        <p className="text-xs text-stone-500 mt-1">
          Настройка интервалов, ограничивающих доступ покупателей к оформлению самовывоза
        </p>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 text-xs p-3 rounded-lg mb-4">{message}</div>
      )}
      {error && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Время открытия
            </label>
            <input
              type="time"
              value={form.workStart}
              onChange={(e) => setForm({ ...form, workStart: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-stone-200 text-sm focus:outline-amber-700 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Время закрытия
            </label>
            <input
              type="time"
              value={form.workEnd}
              onChange={(e) => setForm({ ...form, workEnd: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-stone-200 text-sm focus:outline-amber-700 bg-white"
            />
          </div>
        </div>

        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100 text-xs text-stone-500 leading-relaxed">
          💡 <strong>Внимание:</strong> Изменения вступают в силу мгновенно. Клиенты не смогут
          оформить новые заказы на время, выходящее за рамки указанного диапазона.
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-amber-800 hover:bg-amber-900 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm max-w-xs cursor-pointer disabled:bg-stone-200 disabled:cursor-not-allowed"
        >
          {submitting ? 'Сохранение...' : 'Применить расписание'}
        </button>
      </form>
    </div>
  );
}

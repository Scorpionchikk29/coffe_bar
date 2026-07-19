import { useState, useEffect } from 'react';
import { api } from '../api/axios.ts';
import AdminNav from '../components/AdminNav.tsx';

interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
}

export default function AdminMenu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form, setForm] = useState({
    category_id: '1',
    name: '',
    description: '',
    price: '',
    image_url: '',
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Ошибка загрузки меню:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleAvailable = async (product: Product) => {
    try {
      const nextStatus = !product.is_available;
      await api.put(`/products/${product.id}`, {
        is_available: nextStatus,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_available: nextStatus } : p)),
      );
    } catch (err) {
      alert('Не удалось изменить статус доступности');
    }
  };

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setForm({
        category_id: String(product.category_id),
        name: product.name,
        description: product.description || '',
        price: String(product.price),
        image_url: product.image_url || '',
      });
    } else {
      setEditingProduct(null);
      setForm({
        category_id: '1',
        name: '',
        description: '',
        price: '',
        image_url: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        price: Number(form.price),
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        alert('Товар успешно обновлен');
      } else {
        await api.post('/products', payload);
        alert('Товар успешно добавлен');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Ошибка сохранения данных');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите полностью удалить этот товар?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Ошибка удаления');
    }
  };

  if (loading)
    return <div className="text-center py-12 text-sm text-stone-500">Загрузка позиций меню...</div>;

  return (
    <div className="max-w-5xl mx-auto my-4">
      <AdminNav />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-serif text-amber-950">Управление ассортиментом</h2>
          <p className="text-xs text-stone-500 mt-1">
            Добавление новых напитков, корректировка цен и скрытие товаров
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-amber-800 hover:bg-amber-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          ➕ Добавить позицию
        </button>
      </div>

      {}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs font-semibold uppercase tracking-wider">
              <th className="p-4">Название</th>
              <th className="p-4">Категория</th>
              <th className="p-4">Цена</th>
              <th className="p-4 text-center">В наличии</th>
              <th className="p-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-stone-50/50">
                <td className="p-4">
                  <div className="font-semibold text-stone-900">{product.name}</div>
                  <div className="text-xs text-stone-400 mt-0.5 line-clamp-1 max-w-xs">
                    {product.description || 'Без описания'}
                  </div>
                </td>
                <td className="p-4 text-xs text-stone-500">
                  {product.category_id === 1
                    ? '☕ Кофе'
                    : product.category_id === 2
                      ? 'Чай'
                      : '🍰 Выпечка'}
                </td>
                <td className="p-4 font-medium text-stone-900">{product.price} ₽</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleToggleAvailable(product)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                      product.is_available
                        ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100/50'
                        : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100/50'
                    }`}
                  >
                    {product.is_available ? 'Доступен' : 'Скрыт'}
                  </button>
                </td>
                <td className="p-4 text-right flex justify-end gap-3">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="text-amber-800 hover:text-amber-950 text-xs font-semibold hover:underline"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-stone-400 hover:text-red-600 text-xs font-semibold transition-colors"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-lg font-bold font-serif text-amber-950">
              {editingProduct ? 'Редактировать товар' : 'Добавить новый товар'}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                  Категория
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-amber-700 bg-white"
                >
                  <option value="1">Кофе</option>
                  <option value="2">Чай</option>
                  <option value="3">Выпечка</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                  Название товара
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-amber-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                  Цена (₽)
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-amber-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                  Описание
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-amber-700 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                  Ссылка на фото товара
                </label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      image_url: e.target.value,
                    })
                  }
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-amber-700"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-amber-800 hover:bg-amber-900 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

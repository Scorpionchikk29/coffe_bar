import { useState, useEffect } from 'react';
import { api } from '../api/axios.ts';
import ProductModal from '../components/ProductModal.tsx';

interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    setLoading(true);

    const url = activeCategory ? `/products?category_id=${activeCategory}` : '/products';

    api
      .get(url)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error('Ошибка загрузки каталога:', err))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="flex flex-col gap-8">
      {}
      <div className="bg-amber-950 text-amber-50 p-8 md:p-12 rounded-3xl shadow-sm bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900 via-amber-950 to-stone-900">
        <div className="max-w-xl">
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-3 tracking-wide">
            Свежий кофе в один клик
          </h1>
          <p className="text-sm text-amber-200/80 leading-relaxed">
            Выбирайте любимые напитки, настраивайте объем, сиропы или тип молока под себя и
            забирайте заказ без очереди.
          </p>
        </div>
      </div>

      {}
      <div className="flex flex-wrap gap-2.5 pb-2 border-b border-stone-200">
        {[
          { id: null, title: '✨ Всё меню' },
          { id: 1, title: '☕ Кофе' },
          { id: 2, title: 'Чай' },
          { id: 3, title: '🍰 Выпечка' },
        ].map((category) => (
          <button
            key={category.id ?? 'all'}
            onClick={() => setActiveCategory(category.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${
              activeCategory === category.id
                ? 'bg-amber-800 border-amber-800 text-white shadow-sm'
                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
            }`}
          >
            {category.title}
          </button>
        ))}
      </div>

      {}
      {loading ? (
        <div className="text-center py-12 text-sm text-stone-400">Обновляем витрину...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-sm text-stone-400 font-medium">
          Позиции в данной категории временно отсутствуют ☕
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-stone-200/60 transition-all group"
            >
              <div>
                {}
                <div className="w-full h-44 bg-stone-100 rounded-xl overflow-hidden mb-4 relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-amber-50/50">
                      {product.category_id === 3 ? '🍰' : '☕'}
                    </div>
                  )}
                </div>

                {}
                <h3 className="font-bold text-stone-900 group-hover:text-amber-950 transition-colors text-base font-serif">
                  {product.name}
                </h3>
                <p className="text-xs text-stone-400 mt-1 line-clamp-2 min-h-[2rem]">
                  {product.description || 'Классический рецепт от наших бариста.'}
                </p>
              </div>

              {}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-50">
                <span className="font-bold text-stone-900 text-base">{product.price} ₽</span>
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="bg-amber-100 hover:bg-amber-800 text-amber-900 hover:text-amber-50 font-bold p-2 px-4 rounded-xl text-xs transition-all shadow-sm active:scale-95"
                >
                  Выбрать
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}

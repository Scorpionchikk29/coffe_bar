import { useState } from 'react';
import { useCart, calculateItemPrice } from '../context/CartContext.tsx';
import type { Customizations } from '../context/CartContext.tsx';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
}

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const [volume, setVolume] = useState<Customizations['volume']>('0.2');
  const [milk, setMilk] = useState<Customizations['milk']>('обычное');
  const [selectedSyrups, setSelectedSyrups] = useState<string[]>([]);

  const handleSyrupChange = (syrup: string) => {
    setSelectedSyrups((prev) =>
      prev.includes(syrup) ? prev.filter((s) => s !== syrup) : [...prev, syrup],
    );
  };

  const currentTotalPrice = calculateItemPrice(product.price, {
    volume,
    milk,
    syrup: selectedSyrups,
  });

  const handleAdd = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      basePrice: product.price,
      image_url: product.image_url,
      quantity: 1,
      customizations: {
        volume,
        milk,
        syrup: selectedSyrups,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto flex flex-col gap-5 shadow-xl">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold font-serif text-amber-950">{product.name}</h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-lg cursor-pointer"
          >
            &times;
          </button>
        </div>

        {}
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
            Объем
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(['0.2', '0.3', '0.4'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVolume(v)}
                className={`py-2 text-sm font-medium rounded-lg border transition-all cursor-pointer ${
                  volume === v
                    ? 'border-amber-700 bg-amber-50 text-amber-900 font-bold'
                    : 'border-stone-200 text-stone-600'
                }`}
              >
                {v} л {v !== '0.2' && `(+${v === '0.3' ? '40' : '80'}₽)`}
              </button>
            ))}
          </div>
        </div>

        {}
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
            Молоко
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(['обычное', 'кокосовое', 'соевое'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMilk(m)}
                className={`py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  milk === m
                    ? 'border-amber-700 bg-amber-50 text-amber-900 font-bold'
                    : 'border-stone-200 text-stone-600'
                }`}
              >
                {m} {m !== 'обычное' && '(+50₽)'}
              </button>
            ))}
          </div>
        </div>

        {}
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
            Сиропы (+30₽/шт)
          </span>
          <div className="flex flex-wrap gap-2">
            {['Ваниль', 'Карамель', 'Орех', 'Кокос'].map((syrup) => {
              const isSelected = selectedSyrups.includes(syrup);
              return (
                <button
                  key={syrup}
                  type="button"
                  onClick={() => handleSyrupChange(syrup)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-800 border-amber-800 text-white'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  {syrup}
                </button>
              );
            })}
          </div>
        </div>

        {}
        <button
          onClick={handleAdd}
          className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-3 rounded-xl transition-all shadow-md mt-2 text-sm cursor-pointer"
        >
          Добавить в корзину — {currentTotalPrice} ₽
        </button>
      </div>
    </div>
  );
}

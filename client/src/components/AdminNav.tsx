import { Link, useLocation } from 'react-router-dom';

export default function AdminNav() {
  const location = useLocation();

  const tabs = [
    { path: '/admin', title: '📋 Очередь заказов' },
    { path: '/admin/menu', title: '📦 Ассортимент меню' },
    { path: '/admin/settings', title: '⏰ Часы работы' },
  ];

  return (
    <div className="flex flex-wrap gap-2 pb-3 border-b border-stone-200 mb-6">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              isActive
                ? 'bg-amber-800 border-amber-800 text-white shadow-sm'
                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
            }`}
          >
            {tab.title}
          </Link>
        );
      })}
    </div>
  );
}

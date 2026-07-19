import { useState, useEffect } from 'react';
import { api } from '../api/axios.ts';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import AdminNav from '../components/AdminNav.tsx';

interface AnalyticsData {
  date: string;
  'Выручка (₽)': number;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/analytics/revenue')
      .then((res) => setData(res.data))
      .catch((err) => console.error('Ошибка при загрузке графиков:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="text-center py-12 text-sm text-stone-500">
        Построение графиков аналитики...
      </div>
    );

  const totalWeeklyRevenue = data.reduce((sum, item) => sum + item['Выручка (₽)'], 0);

  return (
    <div className="max-w-4xl mx-auto my-4">
      <AdminNav />
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-serif text-amber-950">Аналитика кофейни</h2>
        <p className="text-xs text-stone-500 mt-1">
          Финансовые показатели и динамика продаж за последние 7 дней
        </p>
      </div>

      {}
      <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm mb-6 max-w-xs">
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
          Выручка за неделю
        </span>
        <span className="text-3xl font-bold text-amber-950 font-serif block mt-1">
          {totalWeeklyRevenue.toLocaleString()} ₽
        </span>
      </div>

      {}
      <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm">
        <h3 className="text-sm font-bold text-stone-700 mb-4">График ежедневной выручки</h3>
        <div className="w-full h-72 text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#78350f" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#78350f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
              <XAxis dataKey="date" stroke="#a8a29e" />
              <YAxis stroke="#a8a29e" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e7e5e4',
                  fontFamily: 'sans-serif',
                }}
              />
              <Area
                type="monotone"
                dataKey="Выручка (₽)"
                stroke="#78350f"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

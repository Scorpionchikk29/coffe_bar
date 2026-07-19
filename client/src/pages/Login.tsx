import { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await loginUser({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось авторизоваться');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
      <h2 className="text-2xl font-bold text-center font-serif text-amber-950 mb-6">
        Вход в кофейню
      </h2>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:outline-amber-600 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:outline-amber-600 text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-amber-800 hover:bg-amber-900 text-amber-50 font-bold py-3 rounded-lg transition-colors text-sm shadow-sm mt-2"
        >
          Войти
        </button>
      </form>
      <p className="text-center text-xs text-stone-500 mt-6">
        Впервые у нас?{' '}
        <Link to="/register" className="text-amber-800 font-semibold hover:underline">
          Создать профиль
        </Link>
      </p>
    </div>
  );
}

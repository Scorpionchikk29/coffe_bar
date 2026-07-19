import { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
  });

  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const { registerUser, loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (!agreed) {
      setError('Необходимо согласиться с условиями обработки персональных данных');
      return;
    }

    try {
      const { confirmPassword, ...submitData } = formData;
      void confirmPassword;

      await registerUser(submitData);
      await loginUser({
        email: formData.email,
        password: formData.password,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при регистрации');
    }
  };

  return (
    <div className="max-w-md mx-auto my-4 bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
      <h2 className="text-2xl font-bold text-center font-serif text-amber-950 mb-6">
        Регистрация профиля
      </h2>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Имя
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-amber-600 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Фамилия
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-amber-600 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Отчество <span className="text-stone-400 text-[10px]">(необязательно)</span>
          </label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-amber-600 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Телефон
          </label>
          <input
            type="text"
            name="phone"
            placeholder="+7 (999) 000-00-00"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-amber-600 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-amber-600 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Пароль
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-amber-600 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Повторите пароль
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-amber-600 text-sm"
          />
        </div>
        <div className="flex items-start gap-2.5 my-1">
          <input
            type="checkbox"
            id="agreement"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 rounded border-stone-300 accent-amber-800 cursor-pointer"
          />
          <label
            htmlFor="agreement"
            className="text-[11px] text-stone-500 leading-tight cursor-pointer select-none"
          >
            Я согласен с условиями{' '}
            <span className="text-amber-800 hover:underline">Пользовательского соглашения</span> и
            даю согласие на обработку персональных данных согласно 152-ФЗ.
          </label>
        </div>
        <button
          type="submit"
          disabled={!agreed}
          className="bg-amber-800 hover:bg-amber-900 text-amber-50 font-bold py-2.5 rounded-lg transition-colors text-sm shadow-sm mt-1 cursor-pointer disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
        >
          Создать аккаунт
        </button>
      </form>
      <p className="text-center text-xs text-stone-500 mt-5">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="text-amber-800 font-semibold hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}

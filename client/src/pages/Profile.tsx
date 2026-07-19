import { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../api/axios.ts';

export default function Profile() {
  const { user, loginUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'security'>('personal');

  const [personalForm, setPersonalForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    middleName: '',
    phone: '',
  });

  const [securityForm, setSecurityForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalForm({ ...personalForm, [e.target.name]: e.target.value });
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecurityForm({ ...securityForm, [e.target.name]: e.target.value });
  };

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await api.put('/auth/profile', personalForm);
      setMessage(response.data.message || 'Данные успешно обновлены');

      const savedToken = localStorage.getItem('coffee_token');
      if (savedToken) {
        localStorage.setItem('coffee_user', JSON.stringify(response.data.user));
        await loginUser({
          email: response.data.user.email,
          password: '',
        }).catch(() => {});
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось обновить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (securityForm.newPassword !== securityForm.confirmNewPassword) {
      setError('Новый пароль и подтверждение не совпадают');
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch('/auth/change-password', {
        oldPassword: securityForm.oldPassword,
        newPassword: securityForm.newPassword,
      });

      setMessage(response.data.message || 'Пароль успешно изменен');
      setSecurityForm({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось изменить пароль');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm(
      '🚨 ВНИМАНИЕ: Вы уверены, что хотите навсегда удалить свой аккаунт? Это действие необратимо, все ваши персональные данные и история заказов будут стерты.',
    );
    if (!isConfirmed) return;

    setLoading(true);
    try {
      await api.delete('/auth/account');
      alert('Учетная запись успешно удалена. До свидания!');
      logout();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось удалить аккаунт');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-serif text-amber-950">Личный кабинет</h2>
        <p className="text-xs text-stone-500 mt-1">
          Управление персональными данными, контактной информацией и безопасностью аккаунта
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {}
        <div className="flex flex-row md:flex-col gap-1.5 border-b md:border-b-0 md:border-r border-stone-200 pb-3 md:pb-0 md:pr-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab('personal');
              setMessage('');
              setError('');
            }}
            className={`flex-1 text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'personal'
                ? 'bg-amber-50 text-amber-900 font-bold'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            👤 Личные данные
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('security');
              setMessage('');
              setError('');
            }}
            className={`flex-1 text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-amber-50 text-amber-900 font-bold'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            🔒 Безопасность
          </button>
        </div>

        {}
        <div className="md:col-span-3 bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
          {message && (
            <div className="bg-green-50 text-green-700 text-xs p-3 rounded-lg mb-4">{message}</div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4">{error}</div>
          )}

          {activeTab === 'personal' ? (
            <form onSubmit={handlePersonalSubmit} className="flex flex-col gap-4">
              <h3 className="text-base font-bold font-serif text-amber-950 mb-1">
                Редактирование профиля
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                    Имя
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={personalForm.firstName}
                    onChange={handlePersonalChange}
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
                    value={personalForm.lastName}
                    onChange={handlePersonalChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-amber-600 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                  Отчество
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={personalForm.middleName}
                  onChange={handlePersonalChange}
                  placeholder="При наличии"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-amber-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                  Telephone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={personalForm.phone}
                  onChange={handlePersonalChange}
                  placeholder="+7 (999) 000-00-00"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-amber-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                  Email <span className="text-[10px]">(Смена email не поддерживается)</span>
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-stone-100 bg-stone-50 text-stone-400 text-sm select-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-amber-800 hover:bg-amber-900 text-white font-bold py-2.5 rounded-lg transition-colors text-xs shadow-sm mt-2 max-w-xs cursor-pointer disabled:bg-stone-200 disabled:cursor-not-allowed"
              >
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-8">
              {}
              <form onSubmit={handleSecuritySubmit} className="flex flex-col gap-4">
                <h3 className="text-base font-bold font-serif text-amber-950 mb-1">
                  Обновление пароля
                </h3>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                    Текущий пароль
                  </label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={securityForm.oldPassword}
                    onChange={handleSecurityChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-amber-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                    Новый пароль
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={securityForm.newPassword}
                    onChange={handleSecurityChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-amber-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                    Подтвердите новый пароль
                  </label>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={securityForm.confirmNewPassword}
                    onChange={handleSecurityChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-amber-600 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-amber-800 hover:bg-amber-900 text-white font-bold py-2.5 rounded-lg transition-colors text-xs shadow-sm mt-2 max-w-xs cursor-pointer disabled:bg-stone-200 disabled:cursor-not-allowed"
                >
                  {loading ? 'Обновление...' : 'Изменить пароль'}
                </button>
              </form>

              {}
              <div className="border-t border-stone-200 pt-6 mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
                  Удаление профиля
                </h4>
                <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                  После удаления учетной записи доступ к личному кабинету и истории ваших заказов
                  будет закрыт безвозвратно. Все данные будут стерты согласно 152-ФЗ.
                </p>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleDeleteAccount}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold px-4 py-2.5 rounded-lg text-xs transition-colors cursor-pointer disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Удаление...' : 'Удалить аккаунт'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useAuth } from '../context/auth-context';
import { useToast } from '../context/toast-context';
import { Button } from '../components/Button';

export function Register() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/auth/register', { email, password, municipality });
      await login(email, password);
      showToast(t('toast.registered'));
      navigate('/');
    } catch {
      setError(t('authForm.registerError'));
    }
  }

  return (
    <div className="flex justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-slate-800">{t('authForm.registerTitle')}</h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-slate-700">{t('authForm.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            {t('authForm.password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            {t('authForm.municipality')}
          </label>
          <input
            type="text"
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <Button type="submit" className="w-full">
          {t('authForm.registerSubmit')}
        </Button>
      </form>
    </div>
  );
}

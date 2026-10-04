import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/auth-context';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/auth/register', { email, password, municipality });
      await login(email, password);
      navigate('/');
    } catch {
      setError('Registration failed. Email may already be in use.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-semibold text-slate-800">Create account</h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Municipality</label>
          <input
            type="text"
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
            required
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700"
        >
          Create account
        </button>
      </form>
    </div>
  );
}

import { Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useAuth } from './context/auth-context';
import { Issues } from './pages/Issues';
import { Navbar } from './components/Navbar';
import { NewIssue } from './pages/NewIssue';
import { useTranslation } from 'react-i18next';
import { IssueDetail } from './pages/IssueDetail';

import './App.css';

function Home() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-2">
      <h1 className="text-2xl font-semibold text-slate-800">{t('nav.title')}</h1>
      {user ? (
        <p className="text-slate-600">{t('home.welcomeBack', { role: user.role })}</p>
      ) : (
        <p className="text-slate-600">{t('home.tagline')}</p>
      )}
    </div>
  );
}

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/issues" element={<Issues />} />
        <Route path="/issues/new" element={<NewIssue />} />
        <Route path="/issues/:id" element={<IssueDetail />} />
      </Routes>
    </>
  );
}

export default App;

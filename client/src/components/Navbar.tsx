import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/auth-context';

export function Navbar() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  function toggleLanguage() {
    i18n.changeLanguage(i18n.language === 'en' ? 'fi' : 'en');
  }

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <Link to="/" onClick={closeMenu} className="font-semibold text-slate-800">
          {t('nav.title')}
        </Link>

        <div className="hidden sm:flex items-center gap-4 text-sm">
          <Link to="/issues" className="text-slate-600 hover:text-blue-600">
            {t('nav.issues')}
          </Link>
          {user && (
            <Link to="/issues/new" className="text-slate-600 hover:text-blue-600">
              {t('nav.reportIssue')}
            </Link>
          )}
          {user ? (
            <>
              <span className="text-slate-500">({user.role})</span>
              <button onClick={logout} className="text-blue-600 hover:underline">
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-600 hover:underline">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="text-blue-600 hover:underline">
                {t('nav.register')}
              </Link>
            </>
          )}
          <button
            onClick={toggleLanguage}
            className="border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-600"
          >
            {i18n.language === 'en' ? 'FI' : 'EN'}
          </button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden text-slate-600"
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="sm:hidden mt-3 flex flex-col gap-3 text-sm pb-2">
          <Link to="/issues" onClick={closeMenu} className="text-slate-600 hover:text-blue-600">
            {t('nav.issues')}
          </Link>
          {user && (
            <Link
              to="/issues/new"
              onClick={closeMenu}
              className="text-slate-600 hover:text-blue-600"
            >
              {t('nav.reportIssue')}
            </Link>
          )}
          {user ? (
            <>
              <span className="text-slate-500">({user.role})</span>
              <button
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="text-blue-600 hover:underline text-left"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className="text-blue-600 hover:underline">
                {t('nav.login')}
              </Link>
              <Link to="/register" onClick={closeMenu} className="text-blue-600 hover:underline">
                {t('nav.register')}
              </Link>
            </>
          )}
          <button
            onClick={() => {
              toggleLanguage();
              closeMenu();
            }}
            className="border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-600 self-start"
          >
            {i18n.language === 'en' ? 'FI' : 'EN'}
          </button>
        </div>
      )}
    </nav>
  );
}

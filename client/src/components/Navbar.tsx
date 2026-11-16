import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/auth-context';
import { Button, ButtonLink } from './Button';
import { useToast } from '../context/toast-context';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

export function Navbar() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();

  function closeMenu() {
    setOpen(false);
  }

  function handleLogout() {
    logout();
    showToast(t('toast.loggedOut'));
    closeMenu();
  }

  function toggleLanguage() {
    i18n.changeLanguage(i18n.language === 'en' ? 'fi' : 'en');
  }

  const languageLabel = i18n.language === 'en' ? 'EN' : 'FI';

  const roleBadge = user && (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        user.role === 'moderator' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {user.role}
    </span>
  );

  return (
    <nav className="sticky top-0 z-1100 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2 font-semibold text-slate-800"
        >
          <span aria-hidden="true">📍</span>
          {t('nav.title')}
        </Link>

        {/* Desktop menu */}
        <div className="hidden items-center gap-2 sm:flex">
          <NavLink to="/" end className={navLinkClass}>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/issues" end className={navLinkClass}>
            {t('nav.issues')}
          </NavLink>
          {user ? (
            <>
              <NavLink to="/issues/new" className={navLinkClass}>
                {t('nav.reportIssue')}
              </NavLink>
              {roleBadge}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                {t('nav.logout')}
              </Button>
            </>
          ) : (
            <>
              <ButtonLink to="/login" variant="ghost" size="sm">
                {t('nav.login')}
              </ButtonLink>
              <ButtonLink to="/register" variant="ghost" size="sm">
                {t('nav.register')}
              </ButtonLink>
            </>
          )}
          <Button variant="secondary" size="sm" onClick={toggleLanguage}>
            {languageLabel}
          </Button>
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="sm:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </Button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="flex flex-col gap-2 border-t border-slate-100 px-4 pb-4 pt-3 sm:hidden">
          <NavLink to="/" end onClick={closeMenu} className={navLinkClass}>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/issues" end onClick={closeMenu} className={navLinkClass}>
            {t('nav.issues')}
          </NavLink>
          {user ? (
            <>
              <NavLink to="/issues/new" onClick={closeMenu} className={navLinkClass}>
                {t('nav.reportIssue')}
              </NavLink>
              <div className="flex items-center justify-between">
                {roleBadge}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                >
                  {t('nav.logout')}
                </Button>
              </div>
            </>
          ) : (
            <>
              <ButtonLink to="/login" variant="secondary" onClick={closeMenu} className="w-full">
                {t('nav.login')}
              </ButtonLink>
              <ButtonLink to="/register" variant="secondary" onClick={closeMenu} className="w-full">
                {' '}
                {t('nav.register')}
              </ButtonLink>
            </>
          )}
          <Button
            variant="secondary"
            size="sm"
            className="self-start"
            onClick={() => {
              toggleLanguage();
              closeMenu();
            }}
          >
            {languageLabel}
          </Button>
        </div>
      )}
    </nav>
  );
}

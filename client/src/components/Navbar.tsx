import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

export function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <Link to="/" onClick={closeMenu} className="font-semibold text-slate-800">
          Civic Issue Tracker
        </Link>
        <div className="hidden sm:flex items-center gap-4 text-sm">
          <Link to="/issues" className="text-slate-600 hover:text-blue-600">
            Issues
          </Link>
          {user && (
            <Link to="/issues/new" className="text-slate-600 hover:text-blue-600">
              Report Issue
            </Link>
          )}
          {user ? (
            <>
              <span className="text-slate-500">({user.role})</span>
              <button onClick={logout} className="text-blue-600 hover:underline">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-600 hover:underline">
                Log in
              </Link>
              <Link to="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Hamburger button - only shown below sm: */}
        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden text-slate-600"
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown - only visible below sm: */}
      {open && (
        <div className="sm:hidden mt-3 flex flex-col gap-3 text-sm pb-2">
          <Link to="/issues" onClick={closeMenu} className="text-slate-600 hover:text-blue-600">
            Issues
          </Link>
          {user && (
            <Link
              to="/issues/new"
              onClick={closeMenu}
              className="text-slate-600 hover:text-blue-600"
            >
              Report Issue
            </Link>
          )}
          {user ? (
            <>
              <span className="text-slate-500">Logged in ({user.role})</span>
              <button
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="text-blue-600 hover:underline text-left"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className="text-blue-600 hover:underline">
                Log in
              </Link>
              <Link to="/register" onClick={closeMenu} className="text-blue-600 hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

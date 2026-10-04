import { Routes, Route, Link } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useAuth } from './context/auth-context';
import './App.css'

function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <h1 className="text-2xl font-semibold text-slate-800">Civic Issue Tracker</h1>

      {user ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-slate-600">Logged in (role: {user.role})</p>
          <button onClick={logout} className="text-blue-600 hover:underline">
            Log out
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;

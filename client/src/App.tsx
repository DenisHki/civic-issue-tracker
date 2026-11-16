import { Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Issues } from './pages/Issues';
import { Navbar } from './components/Navbar';
import { NewIssue } from './pages/NewIssue';
import { IssueDetail } from './pages/IssueDetail';
import { Footer } from './components/Footer';
import { ToastProvider } from './components/ToastProvider';

import './App.css';

function App() {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/issues/new" element={<NewIssue />} />
            <Route path="/issues/:id" element={<IssueDetail />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}

export default App;

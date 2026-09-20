import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { TodoApp } from './pages/TodoApp';
import { UserDirectory } from './pages/UserDirectory';
import { UserDetail } from './pages/UserDetail';
import { NotFound } from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <div className="content-container">
            <Routes>
              <Route path="/" element={<Navigate to="/todos" replace />} />
              <Route path="/todos" element={<TodoApp />} />
              <Route path="/users" element={<UserDirectory />} />
              <Route path="/users/:id" element={<UserDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

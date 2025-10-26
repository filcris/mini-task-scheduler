import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import TasksPage from "./pages/Tasks";
import LoginPage from "./pages/Login";
import KanbanPage from "./pages/Kanban";

function useAuth() {
  const [token, setToken] = React.useState<string | null>(null);
  React.useEffect(() => {
    const t =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("jwt");
    setToken(t);
  }, []);
  return { token, setToken };
}

const Header: React.FC<{ authed: boolean; onLogout: () => void }> = ({ authed, onLogout }) => (
  <header className="sticky top-0 z-20 bg-white/70 dark:bg-gray-900/70 backdrop-blur border-b border-gray-200 dark:border-gray-800">
    <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-xl bg-brand/10 flex items-center justify-center">
          <span className="text-brand font-bold">✓</span>
        </div>
        <h1 className="text-lg font-semibold">Mini Task-Scheduler</h1>
      </Link>
      <nav className="flex items-center gap-2">
        <Link to="/" className="btn-outline">Lista</Link>
        <Link to="/kanban" className="btn-outline">Kanban</Link>
        {authed ? (
          <button onClick={onLogout} className="btn-outline">Sair</button>
        ) : (
          <Link to="/login" className="btn">Entrar</Link>
        )}
      </nav>
    </div>
  </header>
);

const App: React.FC = () => {
  const { token, setToken } = useAuth();

  const handleLogout = () => {
    ["token","access_token","jwt"].forEach(k => localStorage.removeItem(k));
    document.cookie = "token=; Max-Age=0; path=/";
    location.href = "/login";
  };

  return (
    <BrowserRouter>
      <Header authed={!!token} onLogout={handleLogout} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={token ? <TasksPage/> : <Navigate to="/login" replace />} />
          <Route path="/kanban" element={token ? <KanbanPage/> : <Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <LoginPage
                onSuccess={(t) => {
                  localStorage.setItem("token", t);
                  location.href = "/";
                }}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="py-8 text-center text-xs text-gray-500">✔ Backend disponível</footer>
    </BrowserRouter>
  );
};

export default App;





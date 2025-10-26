import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[rgb(var(--bg))]/70 backdrop-blur supports-[backdrop-filter]:bg-[rgb(var(--bg))]/60">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[rgb(var(--primary))] text-white font-bold">MT</span>
          <span className="text-sm font-semibold">Mini Task Scheduler</span>
        </Link>
        <div className="flex items-center gap-2">
          <NavLink to="/tasks" className="btn btn-ghost text-sm">Tarefas</NavLink>
          <NavLink to="/login" className="btn btn-primary text-sm">Login</NavLink>
        </div>
      </nav>
    </header>
  );
}

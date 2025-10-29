import React from 'react'
import { Link } from 'react-router-dom'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="h-14 border-b bg-white flex items-center px-4">
        <div className="font-semibold">Mini Task Scheduler</div>
        <nav className="ml-auto text-sm text-slate-600 space-x-4">
          <Link to="/" className="hover:underline">Início</Link>
          <Link to="/tasks" className="hover:underline">Tasks</Link>
        </nav>
      </header>
      <main className="container-safe py-6">
        {children}
      </main>
    </div>
  )
}

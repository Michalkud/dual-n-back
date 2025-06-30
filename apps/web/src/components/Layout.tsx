import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary">
              Dual N-Back
            </Link>
            <nav className="flex space-x-6">
              <Link
                to="/"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive('/') ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Home
              </Link>
              <Link
                to="/game"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive('/game') ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Play
              </Link>
              <Link
                to="/progress"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive('/progress') ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Progress
              </Link>
              <Link
                to="/settings"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive('/settings') ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
} 
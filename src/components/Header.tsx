import { Link, useRouterState } from '@tanstack/react-router'
import { Home, Bookmark } from 'lucide-react'
import { cn } from '../lib/utils'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const routerState = useRouterState()
  const isBookmarksRoute = routerState.location.pathname === '/bookmarks'

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-cyan-500/20",
      className
    )}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left side - Title */}
        <h1 className="text-xl font-mono font-semibold text-[#00ff00]">
          {isBookmarksRoute ? 'SYS.BOOKMARKS' : 'SYS.AIRCRAFT.DATABASE'}
        </h1>

        {/* Right side - Navigation */}
        <nav className="flex items-center gap-4">
          {isBookmarksRoute ? (
            <Link
              to="/"
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors group relative"
              activeProps={{ className: 'text-cyan-300' }}
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-mono tracking-wider">HOME</span>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform" />
            </Link>
          ) : (
            <Link
              to="/bookmarks"
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors group relative"
              activeProps={{ className: 'text-cyan-300' }}
            >
              <Bookmark className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-mono tracking-wider">BOOKMARKS</span>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform" />
            </Link>
          )}
        </nav>

        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-500/40" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-500/40" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-500/40" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-500/40" />
      </div>
    </header>
  )
} 
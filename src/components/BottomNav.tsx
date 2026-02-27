import { Calendar, CalendarDays, Compass, PlusSquare, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const items = [
  { to: '/feed', label: 'Feed', icon: Compass },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/schedule', label: 'Schedule', icon: Calendar },
  { to: '/create', label: 'Create', icon: PlusSquare },
  { to: '/profile', label: 'Profile', icon: UserRound },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-app -translate-x-1/2 border-t border-borderlight bg-white px-2 py-2">
      <div className="grid grid-cols-5 gap-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center rounded-xl py-1 text-xs transition-all duration-200 active:scale-95',
                isActive ? 'text-scarlet' : 'text-text-secondary hover:bg-red-50',
              )
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

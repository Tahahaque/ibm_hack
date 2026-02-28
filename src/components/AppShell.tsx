import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { useAppContext } from '@/context/AppContext'
import { initializeWatsonChat } from '@/services/watsonChat'

export function AppShell() {
  const { user } = useAppContext()

  useEffect(() => {
    initializeWatsonChat()
  }, [])

  return (
    <div className="min-h-screen w-full bg-white text-text-primary">
      <main className={user ? 'px-4 pb-24 pt-4' : 'px-4 py-4'}>
        <Outlet />
      </main>
      {user ? <BottomNav /> : null}
    </div>
  )
}

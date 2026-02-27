import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppContext } from '@/context/AppContext'
import type { Role } from '@/types'

export function SelectRolePage() {
  const navigate = useNavigate()
  const { selectRole } = useAppContext()
  const [role, setRole] = useState<Role>('student')

  const submit = () => {
    selectRole(role)
    navigate(role === 'student' ? '/onboarding' : '/org-onboarding')
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h2 className="text-xl font-bold">Choose your role</h2>
      {(['student', 'organization'] as const).map((item) => (
        <Card
          key={item}
          className={cn('cursor-pointer p-4 transition-all duration-200', role === item ? 'border-scarlet ring-1 ring-scarlet' : '')}
          onClick={() => setRole(item)}
        >
          <p className="font-semibold capitalize">{item}</p>
          <p className="text-sm text-text-secondary">{item === 'student' ? 'Discover events that match your schedule.' : 'Publish events and track insights.'}</p>
        </Card>
      ))}
      <Button className="w-full" onClick={submit}>
        Continue
      </Button>
      <p className="text-xs text-text-secondary">TODO: Save role to Firebase user document</p>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { INTERESTS } from '@/data/mockData'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppContext } from '@/context/AppContext'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { updateInterests } = useAppContext()
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (interest: string) => {
    setSelected((prev) => (prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest]))
  }

  const submit = () => {
    if (selected.length < 3) return
    updateInterests(selected)
    navigate('/feed')
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Pick your interests</h2>
      <p className="text-sm text-text-secondary">Select at least 3 to personalize your For You feed.</p>
      <div className="grid grid-cols-2 gap-2">
        {INTERESTS.map((interest) => (
          <button
            key={interest}
            onClick={() => toggle(interest)}
            className={cn(
              'rounded-xl border px-3 py-2 text-sm capitalize transition-all duration-200 active:scale-95',
              selected.includes(interest) ? 'border-scarlet bg-red-50 text-scarlet' : 'border-borderlight bg-white text-text-secondary',
            )}
          >
            {interest}
          </button>
        ))}
      </div>
      <Button className="w-full" disabled={selected.length < 3} onClick={submit}>
        Finish Setup
      </Button>
      <p className="text-xs text-text-secondary">TODO: Persist interests in Firebase</p>
    </div>
  )
}

import { useState } from 'react'
import { UserRoundPlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAppContext } from '@/context/AppContext'

export function ProfilePage() {
  const { user, events, isRsvped, friends, addFriend, removeFriend, friendsGoingToEvent } = useAppContext()
  const [friendEmail, setFriendEmail] = useState('')
  if (!user) return null

  const upcoming = events.filter((event) => isRsvped(event.id)).slice(0, 3)

  const addFriendByEmail = () => {
    const normalized = friendEmail.trim().toLowerCase()
    if (!normalized || !normalized.includes('@')) return

    const nameFromEmail = normalized
      .split('@')[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')

    addFriend(nameFromEmail || 'New Friend', normalized)
    setFriendEmail('')
  }

  if (user.role === 'organization') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-scarlet">🏢</div>
          <div>
            <p className="font-semibold">{user.organizationName ?? user.name}</p>
            <p className="text-xs text-text-secondary">{user.verified ? 'Verified organization' : 'Pending verification'}</p>
          </div>
        </div>
        <Card className="p-3 text-sm text-text-secondary">{user.description}</Card>
        <Card className="p-3 text-sm">Quick stats: 12 events • 847 RSVPs • Avg attendance 71</Card>
        <p className="text-xs text-text-secondary">TODO: Fetch org profile from Firestore</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-scarlet text-lg font-bold text-white">{user.name[0]}</div>
        <div>
          <p className="font-semibold">{user.name}</p>
          <p className="text-xs text-text-secondary">{user.email}</p>
        </div>
      </div>

      <Card className="p-3">
        <p className="mb-2 text-sm font-semibold">Interests</p>
        <div className="flex flex-wrap gap-2">
          {user.interests.map((interest) => (
            <span key={interest} className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs text-scarlet capitalize">
              {interest}
            </span>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Friends ({friends.length})</p>
        <div className="flex gap-2">
          <Input
            value={friendEmail}
            onChange={(event) => setFriendEmail(event.target.value)}
            placeholder="friend@osu.edu"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addFriendByEmail()
              }
            }}
          />
          <Button size="sm" variant="outline" className="h-10 w-10 px-0" onClick={addFriendByEmail}>
            <UserRoundPlus size={18} />
          </Button>
        </div>

        <div className="space-y-2">
          {friends.map((friend) => (
            <Card key={friend.id} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-sm font-semibold text-white">
                  {friend.name[0]}
                </div>
                <div>
                  <p className="text-base font-semibold leading-tight">{friend.name}</p>
                  <p className="text-sm text-text-secondary">{friend.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {friend.status === 'pending' ? (
                  <span className="rounded-full border border-borderlight bg-muted px-2 py-0.5 text-xs font-medium text-text-secondary">
                    Pending
                  </span>
                ) : null}
                <button
                  className={cn('rounded-md p-1 text-text-secondary transition-colors hover:bg-muted hover:text-text-primary')}
                  onClick={() => removeFriend(friend.id)}
                  aria-label={`Remove ${friend.name}`}
                >
                  <X size={18} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-3">
        <p className="text-sm font-semibold">Upcoming RSVPs</p>
        <ul className="mt-2 space-y-2 text-sm text-text-secondary">
          {upcoming.map((event) => {
            const friendsGoing = friendsGoingToEvent(event.id)
            return (
              <li key={event.id}>
                <p className="font-medium text-text-primary">{event.title}</p>
                <p>
                  {event.startTime} - {event.endTime} • {event.location}
                </p>
                {friendsGoing.length > 0 ? <p className="text-xs text-sky-600">{friendsGoing.length} friend going</p> : null}
              </li>
            )
          })}
        </ul>
      </Card>

      <Card className="p-3">
        <p className="font-semibold text-scarlet">🔴 Engagement Score (AI)</p>
        <p className="mt-1 text-sm">Campus Engagement Score: 82/100</p>
        <p className="text-xs text-text-secondary">Based on events attended, diversity of categories, and weekly activity.</p>
        <p className="mt-2 text-[11px] text-text-secondary">TODO: Watsonx engagement scoring model</p>
      </Card>
    </div>
  )
}

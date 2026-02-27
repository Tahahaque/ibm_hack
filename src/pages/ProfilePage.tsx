import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAppContext } from '@/context/AppContext'

export function ProfilePage() {
  const { user, events, isRsvped } = useAppContext()
  if (!user) return null

  const upcoming = events.filter((event) => isRsvped(event.id)).slice(0, 3)

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
        <Input className="mt-2" placeholder="Edit interests (demo)" />
      </Card>

      <Card className="p-3">
        <p className="text-sm font-semibold">Upcoming RSVPs</p>
        <ul className="mt-2 text-sm text-text-secondary">
          {upcoming.map((event) => (
            <li key={event.id}>• {event.title}</li>
          ))}
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

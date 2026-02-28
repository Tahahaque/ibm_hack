import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAppContext } from '@/context/AppContext'

export function OrgPage() {
  const { id } = useParams()
  const { events, followingOrgs, toggleFollowOrg } = useAppContext()
  const orgEvents = events.filter((event) => event.orgId === id)
  const orgName = orgEvents[0]?.orgName ?? 'Organization'
  const isFollowing = id ? followingOrgs.includes(id) : false

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl text-scarlet">🏢</div>
        <div>
          <h1 className="text-xl font-bold">{orgName}</h1>
          <p className="text-xs text-text-secondary">Verified badge</p>
        </div>
      </div>

      <p className="text-sm text-text-secondary">Campus organization focused on student development and community engagement.</p>

      {id ? (
        <Button variant={isFollowing ? 'default' : 'outline'} onClick={() => toggleFollowOrg(id)}>
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      ) : null}

      <Card className="p-3">
        <p className="mb-2 font-semibold">Society Events</p>
        {orgEvents.length > 0 ? (
          <ul className="space-y-1 text-sm text-text-secondary">
            {orgEvents.map((event) => (
              <li key={event.id}>
                <Link to={`/event/${event.id}`} className="hover:text-scarlet hover:underline">
                  {event.title} • {event.date}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-secondary">No events posted by this society yet.</p>
        )}
      </Card>
      <p className="text-xs text-text-secondary">TODO: Fetch org and events from Firestore</p>
    </div>
  )
}

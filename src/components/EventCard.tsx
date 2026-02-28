import { Flame, MapPin, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAppContext } from '@/context/AppContext'
import type { EventItem } from '@/types'

type EventCardProps = {
  event: EventItem
  aiReasons?: string[]
  forYou?: boolean
}

export function EventCard({ event, aiReasons, forYou = false }: EventCardProps) {
  const navigate = useNavigate()
  const { toggleRsvp, isRsvped, isRsvpPending, friendsGoingToEvent } = useAppContext()
  const isTrending = event.rsvpCount > 100
  const pending = isRsvpPending(event.id)
  const friendsAttending = friendsGoingToEvent(event.id)
  const friendLine =
    friendsAttending.length > 0
      ? `Friends going: ${friendsAttending
          .slice(0, 2)
          .map((friend) => friend.name)
          .join(', ')}${friendsAttending.length > 2 ? ` +${friendsAttending.length - 2} more` : ''}`
      : 'No friends going yet'

  return (
    <Card
      className="cursor-pointer transition-all duration-200 md:hover:-translate-y-0.5 md:hover:shadow-md"
      onClick={() => navigate(`/event/${event.id}`)}
    >
      <CardHeader>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge className={event.source === 'official' ? 'border-red-100 bg-red-50 text-scarlet' : 'border-gray-200 bg-white text-text-secondary'}>
            {event.source === 'official' ? 'Official' : 'Unofficial'}
          </Badge>
          <Badge className="border-gray-200 bg-white text-text-secondary">{event.category}</Badge>
          {isTrending ? (
            <Badge className="border-scarlet bg-scarlet text-white">
              <Flame className="mr-1 h-3 w-3" /> Trending
            </Badge>
          ) : null}
        </div>
        <h3 className="text-base font-semibold leading-snug text-text-primary hover:text-scarlet">{event.title}</h3>
        <p className="text-xs text-text-secondary">
          {event.date} • {event.startTime} - {event.endTime}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2 text-text-secondary">
            <MapPin size={14} /> {event.location}
          </p>
          <p className="flex items-center gap-2 text-text-secondary">
            <Users size={14} /> {event.rsvpCount} RSVPs
          </p>
          <p className="text-xs text-text-secondary">{friendLine}</p>
        </div>

        <Button
          className="mt-3 w-full"
          variant={isRsvped(event.id) ? 'success' : 'default'}
          disabled={pending}
          onClick={(eventClick) => {
            eventClick.stopPropagation()
            toggleRsvp(event.id)
          }}
        >
          {pending ? 'Updating...' : isRsvped(event.id) ? 'RSVP Confirmed' : 'RSVP'}
        </Button>

        {forYou && aiReasons?.length ? (
          <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm animate-fadePop">
            <p className="mb-1 font-semibold text-scarlet">🤖 Why this event?</p>
            <ul className="space-y-1 text-xs text-text-secondary">
              {aiReasons.map((reason) => (
                <li key={reason}>• {reason}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

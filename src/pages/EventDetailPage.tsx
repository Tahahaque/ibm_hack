import { ArrowLeft, CalendarClock, MapPin, Users } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAppContext } from '@/context/AppContext'

function toMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function overlaps(startA: string, endA: string, startB: string, endB: string) {
  return toMinutes(startA) < toMinutes(endB) && toMinutes(startB) < toMinutes(endA)
}

function dateToDay(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' })
}

function normalizeDay(day: string) {
  return day.slice(0, 3)
}

export function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { events, toggleRsvp, isRsvped, scheduleBlocks } = useAppContext()

  const event = events.find((item) => item.id === id)
  if (!event) return <p>Event not found.</p>

  const eventDay = dateToDay(event.date)
  const conflictingClasses = scheduleBlocks.filter(
    (block) => normalizeDay(block.day) === eventDay && overlaps(block.start, block.end, event.startTime, event.endTime),
  )

  const hasConflict = conflictingClasses.length > 0

  const handleRsvpClick = () => {
    if (isRsvped(event.id)) {
      toggleRsvp(event.id)
      return
    }

    if (hasConflict) {
      const conflictSummary = conflictingClasses.map((block) => `${block.name} (${block.start}-${block.end})`).join(', ')
      const shouldContinue = window.confirm(
        `This event overlaps with your schedule: ${conflictSummary}.\n\nDo you still want to RSVP and add it to your calendar?`,
      )
      if (!shouldContinue) {
        return
      }
    }

    toggleRsvp(event.id)
  }

  return (
    <div className="pb-20">
      <button className="mb-3 inline-flex items-center gap-1 text-sm text-text-secondary" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-2 flex flex-wrap gap-2">
        <Badge className={event.source === 'official' ? 'border-red-100 bg-red-50 text-scarlet' : 'border-gray-200 text-text-secondary'}>
          {event.source === 'official' ? 'Official' : 'Unofficial'}
        </Badge>
        <Badge className="border-gray-200 text-text-secondary">{event.category}</Badge>
      </div>

      <h1 className="text-2xl font-bold">{event.title}</h1>

      <div className="mt-2 space-y-1 text-sm text-text-secondary">
        <p className="flex items-center gap-2">
          <CalendarClock size={14} /> {event.date} • {event.startTime} - {event.endTime}
        </p>
        <p className="flex items-center gap-2">
          <MapPin size={14} /> {event.location}
        </p>
        <p className="flex items-center gap-2">
          <Users size={14} /> {event.rsvpCount} RSVPs
        </p>
        {event.orgName ? (
          <p className="text-xs">
            Posted by{' '}
            <Link to={`/org/${event.orgId ?? 'u-org-1'}`} className="text-scarlet underline underline-offset-2">
              {event.orgName}
            </Link>
          </p>
        ) : null}
      </div>

      <Card className="mt-4 border-l-4 border-l-scarlet">
        <CardHeader>
          <p className="font-semibold text-scarlet">🤖 AI Summary</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary">{event.aiSummary}</p>
          <p className="mt-2 text-[11px] text-text-secondary">TODO: Call watsonx for event summarization.</p>
        </CardContent>
      </Card>

      <Card className="mt-4 border border-scarlet">
        <CardHeader>
          <p className="font-semibold text-scarlet">🤖 AI Compatibility Check</p>
        </CardHeader>
        <CardContent className="text-sm text-text-secondary">
          {hasConflict ? (
            <div className="space-y-1">
              <p>
                ⚠ Conflicts with {conflictingClasses[0].name} ({conflictingClasses[0].start}–{conflictingClasses[0].end})
              </p>
              {conflictingClasses.length > 1 ? <p>+ {conflictingClasses.length - 1} more overlap(s)</p> : null}
            </div>
          ) : (
            <ul className="space-y-1">
              <li>✔ No class conflicts</li>
              <li>✔ You’re free 45 minutes before this event</li>
              <li>✔ Great fit based on your interests</li>
            </ul>
          )}
          <p className="mt-2 text-[11px]">TODO: Watsonx conflict detection logic.</p>
        </CardContent>
      </Card>

      <p className="mt-4 text-sm text-text-secondary">{event.description}</p>

      <div className="fixed bottom-16 left-1/2 w-full max-w-app -translate-x-1/2 bg-white px-4 pb-3 pt-2">
        <Button className="w-full" variant={isRsvped(event.id) ? 'success' : 'default'} onClick={handleRsvpClick}>
          {isRsvped(event.id) ? 'RSVP Confirmed' : 'RSVP'}
        </Button>
        <p className="mt-1 text-center text-[11px] text-text-secondary">TODO: Firestore transaction for RSVP</p>
      </div>
    </div>
  )
}

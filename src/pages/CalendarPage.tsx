import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useAppContext } from '@/context/AppContext'

const fullWeekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function dateToDay(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' })
}

export function CalendarPage() {
  const { events } = useAppContext()

  const allEventsByDay = fullWeekDays.reduce<Record<string, typeof events>>((acc, day) => ({ ...acc, [day]: [] }), {})
  events.forEach((event) => {
    const day = dateToDay(event.date)
    if (day in allEventsByDay) {
      allEventsByDay[day].push(event)
    }
  })

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="border-b border-red-100 bg-red-50 px-4 py-3">
          <h2 className="text-xl font-bold text-text-primary">All Events Calendar</h2>
          <p className="text-sm text-text-secondary">Tap any event to open details.</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-text-secondary">{events.length} total events this week</p>
        </div>
      </Card>

      <Card className="p-4">
        <div className="overflow-x-auto">
          <div className="grid min-w-[1120px] grid-cols-7 gap-3 text-sm">
            {fullWeekDays.map((day) => (
              <div key={day} className="rounded-xl border border-borderlight bg-white p-3">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">{day}</p>
                <div className="space-y-2.5">
                  {allEventsByDay[day].length ? (
                    allEventsByDay[day].map((event) => (
                      <Link
                        key={event.id}
                        to={`/event/${event.id}`}
                        className="block rounded-lg border border-red-100 bg-red-50 p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-scarlet active:scale-95"
                      >
                        <p className="flex items-center justify-between gap-1 font-medium">
                          <span>{event.title}</span>
                          <ExternalLink size={14} className="text-scarlet" />
                        </p>
                        <p className="mt-1 text-xs text-text-secondary">
                          {event.startTime}-{event.endTime}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-text-secondary">No events</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

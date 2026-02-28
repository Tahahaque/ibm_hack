import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useAppContext } from '@/context/AppContext'
import { cn } from '@/lib/utils'

type CalendarRange = 'date' | 'next-week' | 'next-month'

function toStartOfDay(value: Date) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dateLabel(date: Date) {
  return `${date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()} ${date.getMonth() + 1}/${date.getDate()}`
}

function getRangeDates(range: CalendarRange, today: Date) {
  if (range === 'date') {
    return [today]
  }

  if (range === 'next-week') {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() + index)
      return date
    })
  }

  const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const lastOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0)
  const days = lastOfNextMonth.getDate()

  return Array.from({ length: days }, (_, index) => new Date(firstOfNextMonth.getFullYear(), firstOfNextMonth.getMonth(), index + 1))
}

function getMonthGridCells(dates: Date[]) {
  if (!dates.length) return [] as Array<Date | null>

  const first = dates[0]
  const firstWeekdayIndex = (first.getDay() + 6) % 7
  const leadingEmpty = Array.from({ length: firstWeekdayIndex }, () => null)
  const trailingCount = (7 - ((leadingEmpty.length + dates.length) % 7)) % 7
  const trailingEmpty = Array.from({ length: trailingCount }, () => null)

  return [...leadingEmpty, ...dates, ...trailingEmpty]
}

export function CalendarPage() {
  const { events } = useAppContext()
  const [range, setRange] = useState<CalendarRange>('next-week')

  const today = toStartOfDay(new Date())
  const visibleDates = getRangeDates(range, today)
  const visibleDateKeys = new Set(visibleDates.map((date) => formatDateKey(date)))

  const filteredEvents = events.filter((event) => visibleDateKeys.has(event.date))

  const allEventsByDate = visibleDates.reduce<Record<string, typeof events>>((acc, date) => ({ ...acc, [formatDateKey(date)]: [] }), {})
  filteredEvents.forEach((event) => {
    if (event.date in allEventsByDate) {
      allEventsByDate[event.date].push(event)
    }
  })

  const monthCells = range === 'next-month' ? getMonthGridCells(visibleDates) : visibleDates

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="border-b border-red-100 bg-red-50 px-4 py-3">
          <h2 className="text-xl font-bold text-text-primary">All Events Calendar</h2>
          <p className="text-sm text-text-secondary">Tap any event to open details.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 border-b border-red-100 bg-white px-4 py-3">
          {[
            { key: 'date', label: 'Date' },
            { key: 'next-week', label: 'Next Week' },
            { key: 'next-month', label: 'Next Month' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setRange(item.key as CalendarRange)}
              className={cn(
                'rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200 active:scale-95',
                range === item.key ? 'bg-scarlet text-white' : 'border border-borderlight bg-white text-text-secondary',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-text-secondary">{filteredEvents.length} total events in selected range</p>
        </div>
      </Card>

      <Card className="p-4">
        <div className="overflow-x-auto">
          <div
            className={cn(
              'grid gap-3 text-sm',
              range === 'date' ? 'min-w-[280px] grid-cols-1' : 'min-w-[1120px] grid-cols-7',
            )}
          >
            {monthCells.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} className="rounded-xl border border-dashed border-borderlight bg-white/60 p-3" />
              }

              const key = formatDateKey(cell)
              const eventsForDate = allEventsByDate[key] ?? []

              return (
                <div key={key} className="rounded-xl border border-borderlight bg-white p-3">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">{dateLabel(cell)}</p>
                  <div className="space-y-2.5">
                    {eventsForDate.length ? (
                      eventsForDate.map((event) => (
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
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}

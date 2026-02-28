import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useAppContext } from '@/context/AppContext'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { askWatsonAboutSchedule } from '@/services/watsonChat'

const classDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const fullWeekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type MyCalendarEntry = {
  id: string
  title: string
  start: string
  end: string
  type: 'class' | 'event'
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function buildOverlapGroups(entries: MyCalendarEntry[]) {
  if (!entries.length) return [] as MyCalendarEntry[][]

  const sorted = [...entries].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
  const groups: MyCalendarEntry[][] = []
  let currentGroup: MyCalendarEntry[] = [sorted[0]]
  let currentMaxEnd = timeToMinutes(sorted[0].end)

  for (let index = 1; index < sorted.length; index += 1) {
    const entry = sorted[index]
    const entryStart = timeToMinutes(entry.start)
    const entryEnd = timeToMinutes(entry.end)

    if (entryStart < currentMaxEnd) {
      currentGroup.push(entry)
      currentMaxEnd = Math.max(currentMaxEnd, entryEnd)
    } else {
      groups.push(currentGroup)
      currentGroup = [entry]
      currentMaxEnd = entryEnd
    }
  }

  groups.push(currentGroup)
  return groups
}

function durationMinutes(start: string, end: string) {
  return Math.max(0, timeToMinutes(end) - timeToMinutes(start))
}

function dateToDay(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' })
}

function normalizeDay(day: string) {
  return day.slice(0, 3)
}

export function SchedulePage() {
  const { user, scheduleBlocks, parseSchedule, scheduleParsed, events, isRsvped } = useAppContext()
  const [rawInput, setRawInput] = useState('Paste your schedule here...')
  const [view, setView] = useState<'classes' | 'my'>('classes')

  const classStats = useMemo(() => {
    const uniqueClasses = new Set(scheduleBlocks.map((block) => block.name)).size
    const occupiedByDay = classDays.reduce<Record<string, number>>((acc, day) => ({ ...acc, [day]: 0 }), {})

    let totalOccupiedMinutes = 0
    scheduleBlocks.forEach((block) => {
      const normalized = normalizeDay(block.day)
      const minutes = durationMinutes(block.start, block.end)
      totalOccupiedMinutes += minutes
      if (normalized in occupiedByDay) {
        occupiedByDay[normalized] += minutes
      }
    })

    const totalWindowMinutes = 13 * 60 * classDays.length
    const freeHours = Math.max(0, (totalWindowMinutes - totalOccupiedMinutes) / 60)
    const busiestDay = Object.entries(occupiedByDay).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A'

    return {
      uniqueClasses,
      freeHours,
      busiestDay,
    }
  }, [scheduleBlocks])

  const myCalendarByDay = useMemo(() => {
    const grouped = fullWeekDays.reduce<Record<string, MyCalendarEntry[]>>((acc, day) => ({ ...acc, [day]: [] }), {})

    scheduleBlocks.forEach((block) => {
      const day = normalizeDay(block.day)
      if (day in grouped) {
        grouped[day].push({
          id: block.id,
          title: block.name,
          start: block.start,
          end: block.end,
          type: 'class',
        })
      }
    })

    events
      .filter((event) => isRsvped(event.id))
      .forEach((event) => {
        const day = dateToDay(event.date)
        if (day in grouped) {
          grouped[day].push({
            id: event.id,
            title: event.title,
            start: event.startTime,
            end: event.endTime,
            type: 'event',
          })
        }
      })

    fullWeekDays.forEach((day) => {
      grouped[day].sort((first, second) => timeToMinutes(first.start) - timeToMinutes(second.start))
    })

    return grouped
  }, [events, isRsvped, scheduleBlocks])

  const renderCalendarEntry = (entry: MyCalendarEntry) => {
    if (entry.type === 'event') {
      return (
        <Link
          key={`${entry.type}-${entry.id}`}
          to={`/event/${entry.id}`}
          className="block rounded-lg border border-scarlet bg-scarlet p-2.5 text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 active:scale-95"
        >
          <p className="flex items-center justify-between gap-1 font-medium">
            <span>{entry.title}</span>
            <ExternalLink size={14} />
          </p>
          <p className="mt-1 text-xs text-red-50">
            {entry.start}-{entry.end}
          </p>
        </Link>
      )
    }

    return (
      <div key={`${entry.type}-${entry.id}`} className="rounded-lg border border-red-100 bg-red-50 p-2.5">
        <p className="font-medium">{entry.title}</p>
        <p className="mt-1 text-xs text-text-secondary">
          {entry.start}-{entry.end}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="border-b border-red-100 bg-red-50 px-4 py-3">
          <h2 className="text-xl font-bold text-text-primary">Schedule</h2>
          <p className="text-sm text-text-secondary">Parse your classes and view your personal calendar.</p>
        </div>
        <div className="space-y-3 p-4">
          <Textarea value={rawInput} onChange={(event) => setRawInput(event.target.value)} />
          <Button className="w-full" onClick={() => parseSchedule(rawInput)}>
            Parse with AI
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2 rounded-xl border border-borderlight bg-red-50 p-1">
        <button
          className={`rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200 active:scale-95 ${
            view === 'classes' ? 'bg-scarlet text-white shadow-sm' : 'text-text-secondary'
          }`}
          onClick={() => setView('classes')}
        >
          Class Calendar
        </button>
        <button
          className={`rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200 active:scale-95 ${
            view === 'my' ? 'bg-scarlet text-white shadow-sm' : 'text-text-secondary'
          }`}
          onClick={() => setView('my')}
        >
          My Calendar
        </button>
      </div>

      {!scheduleParsed ? (
        <div className="space-y-2">
          <LoadingSkeleton className="h-16" />
          <LoadingSkeleton className="h-16" />
        </div>
      ) : (
        <>
          {view === 'classes' ? (
            <Card className="p-4">
              <p className="mb-3 text-base font-semibold text-scarlet">Class Calendar (8AM–9PM)</p>
              <div className="overflow-x-auto">
                <div className="grid min-w-[900px] grid-cols-5 gap-3 text-sm">
                  {classDays.map((day) => (
                    <div key={day} className="rounded-xl border border-borderlight bg-white p-3">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">{day}</p>
                      <div className="space-y-2.5">
                        {scheduleBlocks
                          .filter((block) => normalizeDay(block.day) === day)
                          .map((block) => (
                            <div key={block.id} className="rounded-lg border border-red-100 bg-red-50 p-2.5">
                              <p className="font-medium">{block.name}</p>
                              <p className="mt-1 text-xs text-text-secondary">
                                {block.start}-{block.end}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : null}

          {view === 'my' ? (
            <Card className="p-4">
              <p className="mb-3 text-base font-semibold text-scarlet">My Calendar (Classes + RSVP Events)</p>
              <div className="overflow-x-auto">
                <div className="grid min-w-[1120px] grid-cols-7 gap-3 text-sm">
                  {fullWeekDays.map((day) => (
                    <div key={day} className="rounded-xl border border-borderlight bg-white p-3">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">{day}</p>
                      <div className="space-y-2.5">
                        {myCalendarByDay[day].length ? (
                          buildOverlapGroups(myCalendarByDay[day]).map((group, groupIndex) =>
                            group.length > 1 ? (
                              <div key={`${day}-overlap-${groupIndex}`} className="grid grid-cols-2 gap-2 rounded-lg border border-red-200 bg-red-50/40 p-2">
                                {group.map((entry) => (
                                  <div key={`${entry.type}-${entry.id}`}>{renderCalendarEntry(entry)}</div>
                                ))}
                              </div>
                            ) : (
                              <div key={`${day}-single-${groupIndex}`}>{renderCalendarEntry(group[0])}</div>
                            ),
                          )
                        ) : (
                          <p className="text-xs text-text-secondary">No items</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-xs text-text-secondary">RSVP an event from the feed/event detail and it appears here automatically.</p>
            </Card>
          ) : null}
        </>
      )}

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <Card className="p-3">
          <p className="text-[11px] text-text-secondary">Classes</p>
          <p className="mt-1 text-base font-semibold text-scarlet">{classStats.uniqueClasses}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-text-secondary">Free Hours</p>
          <p className="mt-1 text-base font-semibold text-scarlet">{classStats.freeHours.toFixed(1)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-text-secondary">Busiest Day</p>
          <p className="mt-1 text-base font-semibold text-scarlet">{classStats.busiestDay}</p>
        </Card>
      </div>

      <Card className="p-3">
        <p className="font-semibold text-scarlet">🤖 Free Time Suggestions</p>
        <ul className="mt-2 text-sm text-text-secondary">
          <li>• Pickup Basketball (Wed 6 PM)</li>
          <li>• Ramen Crawl (Sat 12 PM)</li>
        </ul>
        <Button
          className="mt-3 w-full"
          onClick={() =>
            askWatsonAboutSchedule({
              user,
              scheduleBlocks,
              events,
              isRsvped,
            })
          }
        >
          Ask AI about my schedule
        </Button>
        <p className="mt-2 text-[11px] text-text-secondary">TODO: Watsonx schedule parser • TODO: Watsonx free-time matching</p>
      </Card>
    </div>
  )
}

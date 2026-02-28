import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useAppContext } from '@/context/AppContext'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { askWatsonAboutSchedule } from '@/services/watsonChat'
import { cn } from '@/lib/utils'

const classDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const DAY_MS = 24 * 60 * 60 * 1000

type CalendarRange = 'date' | 'next-week' | 'next-month'

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

function normalizeDay(day: string) {
  return day.slice(0, 3)
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function weekdayShort(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

function dateLabel(date: Date) {
  return `${weekdayShort(date).toUpperCase()} ${date.getMonth() + 1}/${date.getDate()}`
}

function toStartOfDay(value: Date) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

function isDateInRange(dateValue: string, range: CalendarRange, today: Date) {
  const date = toStartOfDay(new Date(`${dateValue}T00:00:00`))
  const diffDays = Math.floor((date.getTime() - today.getTime()) / DAY_MS)

  if (range === 'date') return diffDays === 0
  if (range === 'next-week') return diffDays >= 0 && diffDays < 7
  return diffDays >= 0 && diffDays < 30
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

export function SchedulePage() {
  const { user, scheduleBlocks, parseSchedule, removeScheduleBlock, scheduleParsed, events, isRsvped } = useAppContext()
  const [rawInput, setRawInput] = useState('Paste your schedule here...')
  const [view, setView] = useState<'classes' | 'my'>('classes')
  const [range, setRange] = useState<CalendarRange>('next-week')
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [aiStatus, setAiStatus] = useState('')
  const [askingAi, setAskingAi] = useState(false)

  const today = toStartOfDay(new Date())
  const visibleDates = useMemo(() => getRangeDates(range, today), [range, today])
  const monthCells = range === 'next-month' ? getMonthGridCells(visibleDates) : visibleDates
  const visibleDateKeys = new Set(visibleDates.map((date) => formatDateKey(date)))
  const visibleClassDays = classDays.filter((day) => visibleDates.some((date) => weekdayShort(date) === day))

  const filteredScheduleBlocks = scheduleBlocks.filter((block) => visibleClassDays.includes(normalizeDay(block.day)))
  const filteredRsvpEvents = events.filter((event) => isRsvped(event.id) && visibleDateKeys.has(event.date) && isDateInRange(event.date, range, today))

  const classStats = useMemo(() => {
    const classBlocks = filteredScheduleBlocks.length
    const occupiedByDay = classDays.reduce<Record<string, number>>((acc, day) => ({ ...acc, [day]: 0 }), {})

    let totalOccupiedMinutes = 0
    filteredScheduleBlocks.forEach((block) => {
      const normalized = normalizeDay(block.day)
      const minutes = durationMinutes(block.start, block.end)
      totalOccupiedMinutes += minutes
      if (normalized in occupiedByDay) {
        occupiedByDay[normalized] += minutes
      }
    })

    const totalWindowMinutes = 13 * 60 * Math.max(1, visibleClassDays.length)
    const freeHours = Math.max(0, (totalWindowMinutes - totalOccupiedMinutes) / 60)
    const busiestDay = Object.entries(occupiedByDay).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A'

    return {
      classBlocks,
      freeHours,
      busiestDay,
    }
  }, [filteredScheduleBlocks, visibleClassDays.length])

  const myCalendarByDay = useMemo(() => {
    const grouped = visibleDates.reduce<Record<string, MyCalendarEntry[]>>((acc, date) => ({ ...acc, [formatDateKey(date)]: [] }), {})

    visibleDates.forEach((date) => {
      const key = formatDateKey(date)
      const weekday = weekdayShort(date)
      const dayBlocks = filteredScheduleBlocks
        .filter((block) => normalizeDay(block.day) === weekday)
        .map((block) => ({
          id: `${key}-${block.id}`,
          title: block.name,
          start: block.start,
          end: block.end,
          type: 'class' as const,
        }))

      grouped[key] = [...grouped[key], ...dayBlocks]
    })

    filteredRsvpEvents.forEach((event) => {
      if (event.date in grouped) {
        grouped[event.date].push({
          id: event.id,
          title: event.title,
          start: event.startTime,
          end: event.endTime,
          type: 'event',
        })
      }
    })

    visibleDates.forEach((date) => {
      const key = formatDateKey(date)
      grouped[key].sort((first, second) => timeToMinutes(first.start) - timeToMinutes(second.start))
    })

    return grouped
  }, [filteredRsvpEvents, filteredScheduleBlocks, visibleDates])

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

      <div className="grid grid-cols-3 gap-2 rounded-xl border border-borderlight bg-white p-2">
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
              range === item.key ? 'bg-scarlet text-white shadow-sm' : 'border border-borderlight bg-white text-text-secondary',
            )}
          >
            {item.label}
          </button>
        ))}
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
                <div className={cn('grid gap-3 text-sm', range === 'date' ? 'min-w-[280px] grid-cols-1' : 'min-w-[1120px] grid-cols-7')}>
                  {monthCells.map((cell, index) => {
                    if (!cell) {
                      return <div key={`empty-class-${index}`} className="rounded-xl border border-dashed border-borderlight bg-white/60 p-3" />
                    }

                    const key = formatDateKey(cell)
                    const weekday = weekdayShort(cell)
                    const blocksForDate = filteredScheduleBlocks.filter((block) => normalizeDay(block.day) === weekday)

                    return (
                      <div key={key} className="rounded-xl border border-borderlight bg-white p-3">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">{dateLabel(cell)}</p>
                        <div className="space-y-2.5">
                          {blocksForDate.length ? (
                            blocksForDate.map((block) => (
                              <div key={`${key}-${block.id}`} className="rounded-lg border border-red-100 bg-red-50 p-2.5">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-medium">{block.name}</p>
                                  <button
                                    className="rounded p-0.5 text-text-secondary transition-colors hover:bg-red-100 hover:text-text-primary"
                                    onClick={() => removeScheduleBlock(block.id)}
                                    aria-label={`Remove ${block.name}`}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                                <p className="mt-1 text-xs text-text-secondary">
                                  {block.start}-{block.end}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-text-secondary">No classes</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          ) : null}

          {view === 'my' ? (
            <Card className="p-4">
              <p className="mb-3 text-base font-semibold text-scarlet">My Calendar (Classes + RSVP Events)</p>
              <div className="overflow-x-auto">
                <div className={cn('grid gap-3 text-sm', range === 'date' ? 'min-w-[280px] grid-cols-1' : 'min-w-[1120px] grid-cols-7')}>
                  {monthCells.map((cell, index) => {
                    if (!cell) {
                      return <div key={`empty-my-${index}`} className="rounded-xl border border-dashed border-borderlight bg-white/60 p-3" />
                    }

                    const key = formatDateKey(cell)
                    const entries = myCalendarByDay[key] ?? []

                    return (
                      <div key={key} className="rounded-xl border border-borderlight bg-white p-3">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">{dateLabel(cell)}</p>
                        <div className="space-y-2.5">
                          {entries.length ? (
                            buildOverlapGroups(entries).map((group, groupIndex) =>
                              group.length > 1 ? (
                                <div key={`${key}-overlap-${groupIndex}`} className="grid grid-cols-2 gap-2 rounded-lg border border-red-200 bg-red-50/40 p-2">
                                  {group.map((entry) => (
                                    <div key={`${entry.type}-${entry.id}`}>{renderCalendarEntry(entry)}</div>
                                  ))}
                                </div>
                              ) : (
                                <div key={`${key}-single-${groupIndex}`}>{renderCalendarEntry(group[0])}</div>
                              ),
                            )
                          ) : (
                            <p className="text-xs text-text-secondary">No items</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
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
          <p className="mt-1 text-base font-semibold text-scarlet">{classStats.classBlocks}</p>
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
          disabled={askingAi}
          onClick={async () => {
            if (askingAi) return

            setAskingAi(true)
            try {
              const result = await askWatsonAboutSchedule({
                user,
                scheduleBlocks,
                events,
                isRsvped,
                selectedRangeLabel: range === 'date' ? 'Date' : range === 'next-week' ? 'Next Week' : 'Next Month',
                visibleDates: visibleDates.map((date) => formatDateKey(date)),
              })
              setAiSuggestions(result.suggestions)
              if (result.sentToChat) {
                setAiStatus('Opened side chat and added your schedule context automatically.')
                return
              }

              if (result.copiedToClipboard) {
                setAiStatus('Copied schedule context. Paste it in the side chat to continue.')
                return
              }

              setAiStatus('Opened side chat. Use one of the suggested prompts below.')
            } finally {
              setAskingAi(false)
            }
          }}
        >
          {askingAi ? 'Opening AI...' : 'Ask AI about my schedule'}
        </Button>
        {aiStatus ? <p className="mt-2 text-xs text-text-secondary">{aiStatus}</p> : null}
        {aiSuggestions.length ? (
          <ul className="mt-2 space-y-1 text-xs text-text-secondary">
            {aiSuggestions.map((suggestion) => (
              <li key={suggestion}>• {suggestion}</li>
            ))}
          </ul>
        ) : null}
        <p className="mt-2 text-[11px] text-text-secondary">TODO: Watsonx schedule parser • TODO: Watsonx free-time matching</p>
      </Card>
    </div>
  )
}

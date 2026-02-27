import { useMemo, useState } from 'react'
import { EventCard } from '@/components/EventCard'
import { useAppContext } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import type { EventSource } from '@/types'

export function FeedPage() {
  const { events, recommendationReasons } = useAppContext()
  const [source, setSource] = useState<'all' | EventSource>('all')
  const [tab, setTab] = useState<'for-you' | 'all-events'>('for-you')

  const recommendationMap = useMemo(
    () => recommendationReasons.reduce<Record<string, string[]>>((acc, item) => ({ ...acc, [item.eventId]: item.reasons }), {}),
    [recommendationReasons],
  )

  const filtered = useMemo(() => {
    const base = source === 'all' ? events : events.filter((event) => event.source === source)
    if (tab === 'for-you') {
      return base.filter((event) => Boolean(recommendationMap[event.id]))
    }
    return base
  }, [events, source, tab, recommendationMap])

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'official', 'unofficial'] as const).map((item) => (
          <button
            key={item}
            onClick={() => setSource(item)}
            className={cn(
              'whitespace-nowrap rounded-full border px-3 py-1 text-xs capitalize transition-all duration-200 active:scale-95',
              source === item ? 'border-scarlet bg-scarlet text-white' : 'border-borderlight bg-white text-text-secondary',
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 border-b border-borderlight">
        {[{ key: 'for-you', label: 'For You' }, { key: 'all-events', label: 'All Events' }].map((item) => {
          const active = tab === item.key
          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key as 'for-you' | 'all-events')}
              className={cn('relative py-2 text-sm font-medium transition-all duration-200', active ? 'text-scarlet' : 'text-text-secondary')}
            >
              {item.label}
              <span
                className={cn(
                  'absolute bottom-0 left-1/2 h-0.5 w-16 -translate-x-1/2 rounded-full bg-scarlet transition-all duration-200',
                  active ? 'opacity-100' : 'opacity-0',
                )}
              />
            </button>
          )
        })}
      </div>

      {tab === 'for-you' ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-3">
          <p className="font-semibold text-scarlet">🔴 AI-Powered Recommendations</p>
          <p className="text-xs text-text-secondary">Personalized for your interests, schedule, and campus trends.</p>
          <p className="mt-2 text-[11px] text-text-secondary">TODO: Replace recommendation logic with watsonx scoring engine.</p>
        </div>
      ) : null}

      <div className="space-y-3">
        {filtered.map((event) => (
          <EventCard key={event.id} event={event} forYou={tab === 'for-you'} aiReasons={recommendationMap[event.id]} />
        ))}
      </div>
    </div>
  )
}

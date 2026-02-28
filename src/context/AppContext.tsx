import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { mockEvents, mockOrgUser, mockRecommendations, mockScheduleBlocks, mockStudentUser } from '@/data/mockData'
import { createEventRequest, fetchBootstrap, toggleRsvpWithEventRequest, updateUserInterests } from '@/services/api'
import type { EventItem, RecommendationReason, Role, ScheduleBlock, User } from '@/types'

type AppContextType = {
  user: User | null
  events: EventItem[]
  recommendationReasons: RecommendationReason[]
  selectedRole: Role | null
  scheduleBlocks: ScheduleBlock[]
  scheduleParsed: boolean
  login: () => void
  logout: () => void
  selectRole: (role: Role) => void
  toggleRsvp: (eventId: string) => void
  createEvent: (event: Omit<EventItem, 'id' | 'rsvpCount'>) => void
  updateInterests: (interests: string[]) => void
  parseSchedule: (rawText: string) => Promise<void>
  isRsvped: (eventId: string) => boolean
  followingOrgs: string[]
  toggleFollowOrg: (orgId: string) => void
  aiTagSuggestions: string[]
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const DEFAULT_AI_TAGS = ['networking', 'career', 'innovation']

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(mockStudentUser)
  const [events, setEvents] = useState<EventItem[]>(mockEvents)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>(mockScheduleBlocks)
  const [scheduleParsed, setScheduleParsed] = useState(true)
  const [rsvpEventIds, setRsvpEventIds] = useState<string[]>(['e1', 'e2'])
  const [followingOrgs, setFollowingOrgs] = useState<string[]>(['u-org-1'])

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const bootstrap = await fetchBootstrap(mockStudentUser.id)
        if (!isMounted) return

        setEvents(bootstrap.events.length > 0 ? bootstrap.events : mockEvents)

        if (bootstrap.user) {
          setUser(bootstrap.user)
        }

        setRsvpEventIds(bootstrap.rsvpEventIds)
      } catch {
      }
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [])

  const login = () => {
    setUser(mockStudentUser)
  }

  const logout = () => {
    setUser(null)
  }

  const selectRole = (role: Role) => {
    setSelectedRole(role)
  }

  const toggleRsvp = (eventId: string) => {
    setRsvpEventIds((previous) => {
      const hadRsvp = previous.includes(eventId)
      const next = hadRsvp ? previous.filter((id) => id !== eventId) : [...previous, eventId]

      setEvents((previousEvents) =>
        previousEvents.map((item) => {
          if (item.id !== eventId) return item
          return {
            ...item,
            rsvpCount: hadRsvp ? Math.max(0, item.rsvpCount - 1) : item.rsvpCount + 1,
          }
        }),
      )

      const activeUserId = user?.id
      if (activeUserId) {
        void toggleRsvpWithEventRequest(activeUserId, eventId)
          .then(({ rsvpEventIds, event }) => {
            setRsvpEventIds(rsvpEventIds)
            if (event) {
              setEvents((previousEvents) => previousEvents.map((item) => (item.id === event.id ? event : item)))
            }
          })
          .catch(() => {
          })
      }
      return next
    })
  }

  const createEvent = (event: Omit<EventItem, 'id' | 'rsvpCount'>) => {
    const localCreated: EventItem = {
      ...event,
      id: `local-${Date.now()}`,
      rsvpCount: 0,
    }

    setEvents((previous) => [localCreated, ...previous])

    void createEventRequest(event)
      .then((savedEvent) => {
        setEvents((previous) => [savedEvent, ...previous.filter((item) => item.id !== localCreated.id)])
      })
      .catch(() => {
        setEvents((previous) => previous.filter((item) => item.id !== localCreated.id))
      })
  }

  const updateInterests = (interests: string[]) => {
    setUser((previous) => (previous ? { ...previous, interests } : previous))

    const activeUserId = user?.id
    if (activeUserId) {
      void updateUserInterests(activeUserId, interests).catch(() => {
      })
    }
  }

  const parseSchedule = async (_rawText: string) => {
    setScheduleParsed(false)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setScheduleBlocks(mockScheduleBlocks)
    setScheduleParsed(true)
  }

  const isRsvped = (eventId: string) => rsvpEventIds.includes(eventId)

  const toggleFollowOrg = (orgId: string) => {
    setFollowingOrgs((prev) => (prev.includes(orgId) ? prev.filter((id) => id !== orgId) : [...prev, orgId]))
  }

  const recommendationReasons = useMemo(() => mockRecommendations, [])

  const value = {
    user,
    events,
    recommendationReasons,
    selectedRole,
    scheduleBlocks,
    scheduleParsed,
    login,
    logout,
    selectRole,
    toggleRsvp,
    createEvent,
    updateInterests,
    parseSchedule,
    isRsvped,
    followingOrgs,
    toggleFollowOrg,
    aiTagSuggestions: DEFAULT_AI_TAGS,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}

export const mockOrgProfile = mockOrgUser

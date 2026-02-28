import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { mockEvents, mockFriends, mockOrgUser, mockRecommendations, mockScheduleBlocks, mockStudentUser } from '@/data/mockData'
import { createEventRequest, fetchBootstrap, toggleRsvpWithEventRequest, updateUserInterests } from '@/services/api'
import type { EventItem, Friend, RecommendationReason, Role, ScheduleBlock, User } from '@/types'

type AppContextType = {
  user: User | null
  events: EventItem[]
  recommendationReasons: RecommendationReason[]
  selectedRole: Role | null
  scheduleBlocks: ScheduleBlock[]
  scheduleParsed: boolean
  login: () => Promise<void>
  logout: () => void
  selectRole: (role: Role) => void
  toggleRsvp: (eventId: string) => void
  createEvent: (event: Omit<EventItem, 'id' | 'rsvpCount'>) => void
  updateInterests: (interests: string[]) => void
  parseSchedule: (rawText: string) => Promise<void>
  removeScheduleBlock: (blockId: string) => void
  isRsvped: (eventId: string) => boolean
  isRsvpPending: (eventId: string) => boolean
  followingOrgs: string[]
  toggleFollowOrg: (orgId: string) => void
  friends: Friend[]
  addFriend: (name: string, email?: string) => void
  removeFriend: (friendId: string) => void
  friendsGoingToEvent: (eventId: string) => Friend[]
  aiTagSuggestions: string[]
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const DEFAULT_AI_TAGS = ['networking', 'career', 'innovation']

const DAY_MAP: Record<string, string> = {
  mon: 'Mon',
  monday: 'Mon',
  tue: 'Tue',
  tues: 'Tue',
  tuesday: 'Tue',
  wed: 'Wed',
  wednesday: 'Wed',
  thu: 'Thu',
  thur: 'Thu',
  thurs: 'Thu',
  thursday: 'Thu',
  fri: 'Fri',
  friday: 'Fri',
  sat: 'Sat',
  saturday: 'Sat',
  sun: 'Sun',
  sunday: 'Sun',
}

function to24Hour(hoursRaw: string, minutesRaw: string | undefined, amPmRaw: string | undefined) {
  let hours = Number(hoursRaw)
  const minutes = Number(minutesRaw ?? '0')
  const amPm = amPmRaw?.toLowerCase()

  if (amPm === 'pm' && hours < 12) hours += 12
  if (amPm === 'am' && hours === 12) hours = 0

  const safeHours = Number.isFinite(hours) ? Math.min(23, Math.max(0, hours)) : 0
  const safeMinutes = Number.isFinite(minutes) ? Math.min(59, Math.max(0, minutes)) : 0

  return `${String(safeHours).padStart(2, '0')}:${String(safeMinutes).padStart(2, '0')}`
}

function parseScheduleText(rawText: string) {
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const parsed = lines
    .map((line, index) => {
      const dayMatches = [...line.matchAll(/\b(mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b/gi)]
      const timeMatch = line.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)

      if (!dayMatches.length || !timeMatch) return null

      const days = dayMatches
        .map((match) => DAY_MAP[match[1].toLowerCase()])
        .filter((day): day is string => Boolean(day))

      if (!days.length) return null

      const start = to24Hour(timeMatch[1], timeMatch[2], timeMatch[3])
      const end = to24Hour(timeMatch[4], timeMatch[5], timeMatch[6])

      const title = line
        .replace(/\b(mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b/gi, '')
        .replace(timeMatch[0], '')
        .replace(/[-,()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      return days.map((day, dayIndex) => ({
        id: `schedule-${Date.now()}-${index}-${dayIndex}`,
        name: title || `Class ${index + 1}`,
        day,
        start,
        end,
      }))
    })
    .flat()
    .filter((item): item is { id: string; name: string; day: string; start: string; end: string } => Boolean(item))

  return parsed
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [events, setEvents] = useState<EventItem[]>(mockEvents)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>(mockScheduleBlocks)
  const [scheduleParsed, setScheduleParsed] = useState(true)
  const [rsvpEventIds, setRsvpEventIds] = useState<string[]>(['e1', 'e2'])
  const [pendingRsvpEventIds, setPendingRsvpEventIds] = useState<string[]>([])
  const [followingOrgs, setFollowingOrgs] = useState<string[]>(['u-org-1'])
  const [friends, setFriends] = useState<Friend[]>(mockFriends)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const bootstrap = await fetchBootstrap(mockStudentUser.id)
        if (!isMounted) return

        setEvents(bootstrap.events.length > 0 ? bootstrap.events : mockEvents)
      } catch {
      }
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [])

  const login = async () => {
    setUser(mockStudentUser)

    try {
      const bootstrap = await fetchBootstrap(mockStudentUser.id)
      setEvents(bootstrap.events.length > 0 ? bootstrap.events : mockEvents)
      setRsvpEventIds(bootstrap.rsvpEventIds)
      if (bootstrap.user) {
        setUser(bootstrap.user)
      }
    } catch {
    }
  }

  const logout = () => {
    setUser(null)
    setRsvpEventIds([])
  }

  const selectRole = (role: Role) => {
    setSelectedRole(role)
  }

  const toggleRsvp = (eventId: string) => {
    const activeUserId = user?.id
    if (!activeUserId) return
    if (pendingRsvpEventIds.includes(eventId)) return

    const hadRsvp = rsvpEventIds.includes(eventId)
    const optimisticIds = hadRsvp ? rsvpEventIds.filter((id) => id !== eventId) : [...rsvpEventIds, eventId]

    setRsvpEventIds(optimisticIds)
    setEvents((previousEvents) =>
      previousEvents.map((item) => {
        if (item.id !== eventId) return item
        return {
          ...item,
          rsvpCount: hadRsvp ? Math.max(0, item.rsvpCount - 1) : item.rsvpCount + 1,
        }
      }),
    )

    setPendingRsvpEventIds((previous) => [...previous, eventId])

    void toggleRsvpWithEventRequest(activeUserId, eventId)
      .then(({ rsvpEventIds, event }) => {
        setRsvpEventIds(rsvpEventIds)
        if (event) {
          setEvents((previousEvents) => previousEvents.map((item) => (item.id === event.id ? event : item)))
        }
      })
      .catch(() => {
        setRsvpEventIds((previous) => (hadRsvp ? [...previous, eventId] : previous.filter((id) => id !== eventId)))
        setEvents((previousEvents) =>
          previousEvents.map((item) => {
            if (item.id !== eventId) return item
            return {
              ...item,
              rsvpCount: hadRsvp ? item.rsvpCount + 1 : Math.max(0, item.rsvpCount - 1),
            }
          }),
        )
      })
      .finally(() => {
        setPendingRsvpEventIds((previous) => previous.filter((id) => id !== eventId))
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

  const parseSchedule = async (rawText: string) => {
    setScheduleParsed(false)

    await new Promise((resolve) => setTimeout(resolve, 450))

    const parsedBlocks = parseScheduleText(rawText)
    setScheduleBlocks((previous) => {
      const existingKeys = new Set(previous.map((block) => `${block.name}|${block.day}|${block.start}|${block.end}`))
      const newUnique = parsedBlocks.filter((block) => !existingKeys.has(`${block.name}|${block.day}|${block.start}|${block.end}`))
      return [...previous, ...newUnique]
    })
    setScheduleParsed(true)
  }

  const removeScheduleBlock = (blockId: string) => {
    setScheduleBlocks((previous) => previous.filter((block) => block.id !== blockId))
  }

  const isRsvped = (eventId: string) => rsvpEventIds.includes(eventId)
  const isRsvpPending = (eventId: string) => pendingRsvpEventIds.includes(eventId)

  const toggleFollowOrg = (orgId: string) => {
    setFollowingOrgs((prev) => (prev.includes(orgId) ? prev.filter((id) => id !== orgId) : [...prev, orgId]))
  }

  const addFriend = (name: string, email?: string) => {
    const normalizedName = name.trim()
    if (!normalizedName) return

    setFriends((prev) => {
      const duplicate = prev.some((friend) => friend.name.toLowerCase() === normalizedName.toLowerCase())
      if (duplicate) return prev

      return [
        ...prev,
        {
          id: `f-${Date.now()}`,
          name: normalizedName,
          email: email?.trim() ? email.trim() : `${normalizedName.toLowerCase().replace(/\s+/g, '.')}@osu.edu`,
          eventIds: [],
          status: 'pending',
        },
      ]
    })
  }

  const removeFriend = (friendId: string) => {
    setFriends((prev) => prev.filter((friend) => friend.id !== friendId))
  }

  const friendsGoingToEvent = (eventId: string) => friends.filter((friend) => friend.eventIds.includes(eventId))

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
    removeScheduleBlock,
    isRsvped,
    isRsvpPending,
    followingOrgs,
    toggleFollowOrg,
    friends,
    addFriend,
    removeFriend,
    friendsGoingToEvent,
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

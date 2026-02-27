import { createContext, useContext, useMemo, useState } from 'react'
import { mockEvents, mockOrgUser, mockRecommendations, mockScheduleBlocks, mockStudentUser } from '@/data/mockData'
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
    setRsvpEventIds((previous) => (previous.includes(eventId) ? previous.filter((id) => id !== eventId) : [...previous, eventId]))
  }

  const createEvent = (event: Omit<EventItem, 'id' | 'rsvpCount'>) => {
    const created: EventItem = {
      ...event,
      id: `e-${Date.now()}`,
      rsvpCount: 0,
    }
    setEvents((previous) => [created, ...previous])
  }

  const updateInterests = (interests: string[]) => {
    setUser((previous) => (previous ? { ...previous, interests } : previous))
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

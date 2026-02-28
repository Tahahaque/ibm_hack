export type Role = 'student' | 'organization'

export type EventSource = 'official' | 'unofficial'

export type User = {
  id: string
  role: Role
  name: string
  email: string
  interests: string[]
  major?: string
  organizationName?: string
  description?: string
  verified?: boolean
}

export type Friend = {
  id: string
  name: string
  email: string
  eventIds: string[]
  status?: 'accepted' | 'pending'
}

export type EventItem = {
  id: string
  title: string
  description: string
  aiSummary: string
  category: string
  source: EventSource
  date: string
  startTime: string
  endTime: string
  location: string
  rsvpCount: number
  orgId?: string
  orgName?: string
  tags: string[]
  image?: string
}

export type ScheduleBlock = {
  id: string
  name: string
  day: string
  start: string
  end: string
}

export type RecommendationReason = {
  eventId: string
  reasons: string[]
}

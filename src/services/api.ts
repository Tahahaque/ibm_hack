import type { EventItem, User } from '@/types'

type BootstrapResponse = {
  events: EventItem[]
  user: User | null
  rsvpEventIds: string[]
}

type CreateEventPayload = Omit<EventItem, 'id' | 'rsvpCount'>

export async function fetchBootstrap(userId: string): Promise<BootstrapResponse> {
  const response = await fetch(`/api/bootstrap?userId=${encodeURIComponent(userId)}`)
  if (!response.ok) {
    throw new Error('Failed to fetch bootstrap data')
  }
  return response.json() as Promise<BootstrapResponse>
}

export async function createEventRequest(payload: CreateEventPayload): Promise<EventItem> {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to create event')
  }

  return response.json() as Promise<EventItem>
}

export async function updateUserInterests(userId: string, interests: string[]): Promise<User> {
  const response = await fetch(`/api/users/${encodeURIComponent(userId)}/interests`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ interests }),
  })

  if (!response.ok) {
    throw new Error('Failed to update interests')
  }

  return response.json() as Promise<User>
}

export async function toggleRsvpWithEventRequest(userId: string, eventId: string): Promise<{ rsvpEventIds: string[]; event: EventItem | null }> {
  const response = await fetch(`/api/users/${encodeURIComponent(userId)}/rsvps/${encodeURIComponent(eventId)}/toggle`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to toggle RSVP')
  }

  return response.json() as Promise<{ rsvpEventIds: string[]; event: EventItem | null }>
}
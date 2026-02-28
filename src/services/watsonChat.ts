import type { EventItem, ScheduleBlock, User } from '@/types'

declare global {
  interface Window {
    wxOConfiguration?: {
      orchestrationID: string
      hostURL: string
      rootElementID: string
      chatOptions: {
        agentId: string
      }
    }
    wxoLoader?: {
      init: () => void
    }
    __wxoInitialized?: boolean
  }
}

type AskWatsonAboutScheduleInput = {
  user: User | null
  scheduleBlocks: ScheduleBlock[]
  events: EventItem[]
  isRsvped: (eventId: string) => boolean
}

export function initializeWatsonChat() {
  if (window.__wxoInitialized) {
    return
  }

  const chatRootId = 'wxo-chat-root'
  let chatRoot = document.getElementById(chatRootId)
  if (!chatRoot) {
    chatRoot = document.createElement('div')
    chatRoot.id = chatRootId
    document.body.appendChild(chatRoot)
  }

  window.__wxoInitialized = true
  window.wxOConfiguration = {
    orchestrationID: '20260227-2050-2380-8091-e4b04f4b3324_20260227-2050-3337-5008-fe5571a0c723',
    hostURL: 'https://dl.watson-orchestrate.ibm.com',
    rootElementID: chatRootId,
    chatOptions: {
      agentId: '57a7d0d1-5c6c-4a06-a2eb-831c8366057f',
    },
  }

  setTimeout(() => {
    if (document.querySelector('script[data-wxo-loader="true"]')) {
      return
    }
    const script = document.createElement('script')
    script.dataset.wxoLoader = 'true'
    script.src = `${window.wxOConfiguration?.hostURL}/wxochat/wxoLoader.js?embed=true`
    script.addEventListener('load', () => {
      window.wxoLoader?.init()
    })
    document.head.appendChild(script)
  }, 0)
}

export function askWatsonAboutSchedule(input: AskWatsonAboutScheduleInput) {
  initializeWatsonChat()

  const selectedEvents = input.events.filter((event) => input.isRsvped(event.id))
  const prompt = [
    `Student: ${input.user?.name ?? 'Unknown'}`,
    `Interests: ${(input.user?.interests ?? []).join(', ') || 'None provided'}`,
    `Classes: ${input.scheduleBlocks.length}`,
    `RSVP events: ${selectedEvents.map((event) => event.title).join(', ') || 'None yet'}`,
  ].join('\n')

  console.info('Watson schedule context', prompt)
}

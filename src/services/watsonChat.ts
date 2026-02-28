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
      open?: () => void
      sendMessage?: (message: string) => void
    }
    wxo?: {
      open?: () => void
      sendMessage?: (message: string) => void
      chat?: {
        open?: () => void
        sendMessage?: (message: string) => void
      }
    }
    __wxoInitialized?: boolean
    __wxoBooting?: boolean
    __wxoPromptQueue?: string[]
  }
}

type AskWatsonAboutScheduleInput = {
  user: User | null
  scheduleBlocks: ScheduleBlock[]
  events: EventItem[]
  isRsvped: (eventId: string) => boolean
  selectedRangeLabel?: string
  visibleDates?: string[]
}

export type AskWatsonAboutScheduleResult = {
  prompt: string
  suggestions: string[]
  sentToChat: boolean
  copiedToClipboard: boolean
}

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function normalizeDayLabel(day: string) {
  const value = day.trim().toLowerCase()
  const map: Record<string, string> = {
    mon: 'Mon',
    monday: 'Mon',
    tue: 'Tue',
    tues: 'Tue',
    tuesday: 'Tue',
    wed: 'Wed',
    weds: 'Wed',
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

  return map[value] ?? day.slice(0, 3)
}

function parseLocalDate(dateValue: string) {
  return new Date(`${dateValue}T00:00:00`)
}

function weekdayFromDate(dateValue: string) {
  return parseLocalDate(dateValue).toLocaleDateString('en-US', { weekday: 'short' })
}

function buildVisibleDateKeys(input: AskWatsonAboutScheduleInput) {
  if (input.visibleDates?.length) {
    return new Set(input.visibleDates)
  }

  return new Set(input.events.map((event) => event.date))
}

function expandClassBlocksByDate(scheduleBlocks: ScheduleBlock[], visibleDateKeys: Set<string>) {
  if (!visibleDateKeys.size) return [] as string[]

  const sortedDates = [...visibleDateKeys].sort((a, b) => a.localeCompare(b))
  const expanded = sortedDates.flatMap((dateKey) => {
    const weekday = weekdayFromDate(dateKey)
    return scheduleBlocks
      .filter((block) => normalizeDayLabel(block.day) === weekday)
      .map((block) => `${dateKey} (${weekday}) ${block.name} ${block.start}-${block.end}`)
  })

  return expanded
}

function dayOrder(day: string) {
  const normalized = normalizeDayLabel(day)
  return DAY_ORDER.indexOf(normalized)
}

function formatScheduleContext(scheduleBlocks: ScheduleBlock[]) {
  const byDay = new Map<string, ScheduleBlock[]>()

  scheduleBlocks.forEach((block) => {
    const day = normalizeDayLabel(block.day)
    const existing = byDay.get(day) ?? []
    byDay.set(day, [...existing, block])
  })

  const lines = [...byDay.entries()]
    .sort((a, b) => dayOrder(a[0]) - dayOrder(b[0]))
    .map(([day, blocks]) => {
      const entries = blocks
        .sort((a, b) => a.start.localeCompare(b.start))
        .map((block) => `${block.name} (${block.start}-${block.end})`)
        .join(', ')
      return `${day}: ${entries}`
    })

  return lines.join('\n') || 'No classes available.'
}

function buildSuggestions(scheduleBlocks: ScheduleBlock[], selectedEvents: EventItem[]) {
  const hasMorningClasses = scheduleBlocks.some((block) => Number(block.start.split(':')[0]) < 10)
  const hasEveningEvents = selectedEvents.some((event) => Number(event.startTime.split(':')[0]) >= 18)

  const suggestions = [
    'What are my best free 2-hour windows this week?',
    'Which RSVP events conflict with my classes?',
    'Suggest 3 events that fit my class schedule and interests.',
  ]

  if (hasMorningClasses) {
    suggestions.push('Give me a balanced weekly plan with lighter mornings after late evenings.')
  }

  if (hasEveningEvents) {
    suggestions.push('How can I avoid burnout with my evening events this week?')
  }

  return suggestions.slice(0, 4)
}

function buildAllEventsContext(events: EventItem[], visibleDateKeys: Set<string>) {
  if (!events.length) {
    return {
      inRangeSummary: 'No events found in selected calendar range.',
      inRangeLines: [] as string[],
      allSummary: 'No events found in All Events Calendar.',
      allLines: [] as string[],
    }
  }

  const visible = events.filter((event) => visibleDateKeys.has(event.date))

  const sortedVisible = [...visible].sort((first, second) => {
    const firstKey = `${first.date}T${first.startTime}`
    const secondKey = `${second.date}T${second.startTime}`
    return firstKey.localeCompare(secondKey)
  })

  const sortedAll = [...events].sort((first, second) => {
    const firstKey = `${first.date}T${first.startTime}`
    const secondKey = `${second.date}T${second.startTime}`
    return firstKey.localeCompare(secondKey)
  })

  const bySourceVisible = sortedVisible.reduce<Record<string, number>>(
    (acc, event) => ({
      ...acc,
      [event.source]: (acc[event.source] ?? 0) + 1,
    }),
    {},
  )

  const bySourceAll = sortedAll.reduce<Record<string, number>>(
    (acc, event) => ({
      ...acc,
      [event.source]: (acc[event.source] ?? 0) + 1,
    }),
    {},
  )

  const inRangeSummary = `All Events Calendar total in selected range: ${sortedVisible.length} (official: ${bySourceVisible.official ?? 0}, unofficial: ${bySourceVisible.unofficial ?? 0})`
  const inRangeLines = sortedVisible
    .slice(0, 20)
    .map(
      (event) =>
        `${event.title} | ${event.date} (${weekdayFromDate(event.date)}) ${event.startTime}-${event.endTime} | ${event.location} | ${event.category} | ${event.source}`,
    )

  const allSummary = `All Events Calendar total (full): ${sortedAll.length} (official: ${bySourceAll.official ?? 0}, unofficial: ${bySourceAll.unofficial ?? 0})`
  const allLines = sortedAll
    .slice(0, 30)
    .map(
      (event) =>
        `${event.title} | ${event.date} (${weekdayFromDate(event.date)}) ${event.startTime}-${event.endTime} | ${event.location} | ${event.category} | ${event.source}`,
    )

  return {
    inRangeSummary,
    inRangeLines,
    allSummary,
    allLines,
  }
}

function tryOpenChatWidget() {
  const loaderOpen = window.wxoLoader?.open
  if (typeof loaderOpen === 'function') {
    loaderOpen()
    return
  }

  const widgetChatOpen = window.wxo?.chat?.open
  if (typeof widgetChatOpen === 'function') {
    widgetChatOpen()
    return
  }

  const widgetOpen = window.wxo?.open
  if (typeof widgetOpen === 'function') {
    widgetOpen()
    return
  }

  const selectors = [
    '[aria-label*="chat" i]',
    '[aria-label*="assistant" i]',
    '[aria-label*="watson" i]',
    '[aria-label*="orchestrate" i]',
    '[data-testid*="chat" i]',
    '[class*="chat" i]',
    '[id*="chat" i]',
    '[class*="wxo" i]',
    '[id*="wxo" i]',
  ]

  for (const selector of selectors) {
    const launcher = document.querySelector(selector) as HTMLElement | null
    if (!launcher) continue
    launcher.click()
    return
  }
}

function trySendToChat(prompt: string) {
  if (typeof window.wxoLoader?.sendMessage === 'function') {
    window.wxoLoader.sendMessage(prompt)
    return true
  }

  if (typeof window.wxo?.sendMessage === 'function') {
    window.wxo.sendMessage(prompt)
    return true
  }

  if (typeof window.wxo?.chat?.sendMessage === 'function') {
    window.wxo.chat.sendMessage(prompt)
    return true
  }

  window.dispatchEvent(new CustomEvent('wxo:send-message', { detail: { message: prompt } }))

  const iframes = [...document.querySelectorAll('iframe')] as HTMLIFrameElement[]
  for (const frame of iframes) {
    if (!frame.contentWindow) continue
    frame.contentWindow.postMessage({ type: 'wxo:send-message', message: prompt }, '*')
    frame.contentWindow.postMessage({ event: 'sendMessage', message: prompt }, '*')
    frame.contentWindow.postMessage({ event: 'chat:send', payload: { text: prompt } }, '*')
  }

  return false
}

function attemptAutoSendToDom(prompt: string) {
  const selectors = [
    'textarea[placeholder*="message" i]',
    'textarea[aria-label*="message" i]',
    'input[placeholder*="message" i]',
    '[contenteditable="true"]',
  ]

  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLTextAreaElement | HTMLInputElement | HTMLElement | null
    if (!element) continue

    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      element.focus()
      element.value = prompt
      element.dispatchEvent(new Event('input', { bubbles: true }))
      return true
    }

    element.focus()
    element.textContent = prompt
    element.dispatchEvent(new Event('input', { bubbles: true }))
    return true
  }

  return false
}

async function trySendToChatWithRetries(prompt: string) {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    tryOpenChatWidget()

    if (trySendToChat(prompt)) {
      return true
    }

    if (attemptAutoSendToDom(prompt)) {
      return true
    }

    await new Promise((resolve) => setTimeout(resolve, 400))
  }

  return false
}

async function flushPromptQueue() {
  const queue = window.__wxoPromptQueue ?? []
  if (!queue.length) return true

  const remaining: string[] = []
  for (const prompt of queue) {
    const sent = await trySendToChatWithRetries(prompt)
    if (!sent) {
      remaining.push(prompt)
    }
  }

  window.__wxoPromptQueue = remaining
  return remaining.length === 0
}

function ensureWatsonLoaderScript() {
  const chatRootId = 'wxo-chat-root'
  let chatRoot = document.getElementById(chatRootId)
  if (!chatRoot) {
    chatRoot = document.createElement('div')
    chatRoot.id = chatRootId
    document.body.appendChild(chatRoot)
  }

  window.__wxoPromptQueue = window.__wxoPromptQueue ?? []
  window.wxOConfiguration = {
    orchestrationID: '20260227-2050-2380-8091-e4b04f4b3324_20260227-2050-3337-5008-fe5571a0c723',
    hostURL: 'https://dl.watson-orchestrate.ibm.com',
    rootElementID: chatRootId,
    chatOptions: {
      agentId: '57a7d0d1-5c6c-4a06-a2eb-831c8366057f',
    },
  }

  const existingScript = document.querySelector('script[data-wxo-loader="true"]') as HTMLScriptElement | null
  if (existingScript) {
    return
  }

  const script = document.createElement('script')
  script.dataset.wxoLoader = 'true'
  script.src = `${window.wxOConfiguration?.hostURL}/wxochat/wxoLoader.js?embed=true`
  script.addEventListener('load', () => {
    window.wxoLoader?.init()
    void flushPromptQueue()
  })
  document.head.appendChild(script)
}

async function waitForWatsonRuntime(timeoutMs = 6000) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    if (window.wxoLoader || window.wxo) {
      return true
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  return false
}

export async function initializeWatsonChat() {
  if (window.__wxoBooting) {
    await waitForWatsonRuntime(6000)
    return
  }

  window.__wxoBooting = true
  ensureWatsonLoaderScript()

  const ready = await waitForWatsonRuntime(6000)
  if (ready) {
    window.__wxoInitialized = true
    window.wxoLoader?.init()
    void flushPromptQueue()
  }

  window.__wxoBooting = false
}

export async function askWatsonAboutSchedule(input: AskWatsonAboutScheduleInput): Promise<AskWatsonAboutScheduleResult> {
  await initializeWatsonChat()

  const visibleDateKeys = buildVisibleDateKeys(input)
  const selectedEvents = input.events.filter((event) => input.isRsvped(event.id) && visibleDateKeys.has(event.date))
  const scheduleContext = formatScheduleContext(input.scheduleBlocks)
  const datedClassContext = expandClassBlocksByDate(input.scheduleBlocks, visibleDateKeys)
  const suggestions = buildSuggestions(input.scheduleBlocks, selectedEvents)
  const allEventsContext = buildAllEventsContext(input.events, visibleDateKeys)

  const prompt = [
    `Student: ${input.user?.name ?? 'Unknown'}`,
    `Interests: ${(input.user?.interests ?? []).join(', ') || 'None provided'}`,
    `Today: ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`,
    `Selected calendar range: ${input.selectedRangeLabel ?? 'All visible'}`,
    `Visible dates: ${[...visibleDateKeys].sort((a, b) => a.localeCompare(b)).join(', ') || 'None'}`,
    `Class blocks: ${input.scheduleBlocks.length}`,
    `Schedule:`,
    scheduleContext,
    'Class occurrences with explicit dates:',
    ...(datedClassContext.length ? datedClassContext : ['None in selected range']),
    `RSVP events: ${
      selectedEvents
        .map((event) => `${event.title} (${event.date} ${weekdayFromDate(event.date)} ${event.startTime}-${event.endTime})`)
        .join('; ') || 'None yet'
    }`,
    allEventsContext.inRangeSummary,
    'All Events Calendar entries for selected range (up to 20):',
    ...(allEventsContext.inRangeLines.length ? allEventsContext.inRangeLines : ['None in selected range']),
    allEventsContext.allSummary,
    'All Events Calendar full entries (up to 30):',
    ...allEventsContext.allLines,
    'Please suggest the best events/times for me this week, detect conflicts, and propose a balanced plan.',
  ].join('\n')

  const queue = window.__wxoPromptQueue ?? []
  const nextQueue = queue.includes(prompt) ? queue : [...queue, prompt]
  window.__wxoPromptQueue = nextQueue
  const sentToChat = await flushPromptQueue()

  let copiedToClipboard = false
  if (!sentToChat && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(prompt)
      copiedToClipboard = true
    } catch {
    }
  }

  console.info('Watson schedule context', prompt)

  return {
    prompt,
    suggestions,
    sentToChat,
    copiedToClipboard,
  }
}

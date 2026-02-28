import cors from 'cors'
import express from 'express'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbFilePath = path.join(__dirname, 'db.json')

const app = express()
const port = process.env.PORT ?? 8787

app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({
    message: 'BuckeyeBoard API is running',
    health: '/api/health',
    bootstrap: '/api/bootstrap?userId=u-student-1',
  })
})

async function readDb() {
  const raw = await fs.readFile(dbFilePath, 'utf-8')
  return JSON.parse(raw)
}

async function writeDb(data) {
  await fs.writeFile(dbFilePath, JSON.stringify(data, null, 2), 'utf-8')
}

app.get('/api/health', async (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/bootstrap', async (req, res) => {
  const userId = String(req.query.userId ?? 'u-student-1')
  const db = await readDb()

  const user = db.users[userId] ?? null
  const rsvpEventIds = db.rsvps[userId] ?? []

  res.json({
    events: db.events,
    user,
    rsvpEventIds,
  })
})

app.post('/api/events', async (req, res) => {
  const db = await readDb()

  const payload = req.body
  const created = {
    ...payload,
    id: `e-${Date.now()}`,
    rsvpCount: 0,
  }

  db.events = [created, ...db.events]
  await writeDb(db)

  res.status(201).json(created)
})

app.put('/api/users/:id/interests', async (req, res) => {
  const userId = String(req.params.id)
  const interests = Array.isArray(req.body?.interests) ? req.body.interests : []
  const db = await readDb()

  if (!db.users[userId]) {
    return res.status(404).json({ error: 'User not found' })
  }

  db.users[userId] = {
    ...db.users[userId],
    interests,
  }

  await writeDb(db)
  return res.json(db.users[userId])
})

app.post('/api/users/:id/rsvps/:eventId/toggle', async (req, res) => {
  const userId = String(req.params.id)
  const eventId = String(req.params.eventId)
  const db = await readDb()

  const current = db.rsvps[userId] ?? []
  const hadRsvp = current.includes(eventId)
  db.rsvps[userId] = hadRsvp ? current.filter((id) => id !== eventId) : [...current, eventId]

  const eventIndex = db.events.findIndex((item) => item.id === eventId)
  if (eventIndex >= 0) {
    const currentCount = Number(db.events[eventIndex].rsvpCount ?? 0)
    db.events[eventIndex].rsvpCount = hadRsvp ? Math.max(0, currentCount - 1) : currentCount + 1
  }

  await writeDb(db)
  return res.json({
    rsvpEventIds: db.rsvps[userId],
    event: eventIndex >= 0 ? db.events[eventIndex] : null,
  })
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`)
})

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAppContext } from '@/context/AppContext'

export function CreateEventPage() {
  const navigate = useNavigate()
  const { createEvent, user, aiTagSuggestions } = useAppContext()
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [generated, setGenerated] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'technology',
    date: '2026-03-20',
    startTime: '17:00',
    endTime: '18:30',
    location: 'Ohio Union',
    expectedAttendance: '120',
    registrationLink: '',
    recurring: false,
  })

  const addTag = () => {
    if (!tagInput.trim()) return
    setTags((prev) => (prev.includes(tagInput.trim()) ? prev : [...prev, tagInput.trim()]))
    setTagInput('')
  }

  const previewTitle = useMemo(() => form.title || 'Event title preview', [form.title])

  return (
    <div className="mx-auto w-full max-w-2xl space-y-3">
      <h2 className="text-xl font-bold">Create Event</h2>
      <Input placeholder="Title" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
      <Textarea placeholder="Description" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
      <Input placeholder="Category" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} />
      <div className="grid grid-cols-2 gap-2">
        <Input type="date" value={form.date} onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))} />
        <Input placeholder="Location" value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} />
        <Input type="time" value={form.startTime} onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))} />
        <Input type="time" value={form.endTime} onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))} />
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Input placeholder="Add tag" value={tagInput} onChange={(event) => setTagInput(event.target.value)} />
          <Button type="button" variant="outline" onClick={addTag}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className={generated ? 'animate-fadePop rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-scarlet' : 'rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-scarlet'}>
              {tag}
            </span>
          ))}
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setTags(aiTagSuggestions)
            setGenerated(true)
          }}
        >
          ✨ Generate Tags with AI
        </Button>
        <p className="text-[11px] text-text-secondary">TODO: Watsonx tag generation endpoint</p>
      </div>

      {user?.role === 'organization' ? (
        <div className="space-y-2 rounded-xl border border-borderlight p-3">
          <Input type="file" />
          <Input
            placeholder="Expected attendance"
            value={form.expectedAttendance}
            onChange={(event) => setForm((prev) => ({ ...prev, expectedAttendance: event.target.value }))}
          />
          <Input
            placeholder="Registration link"
            value={form.registrationLink}
            onChange={(event) => setForm((prev) => ({ ...prev, registrationLink: event.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={form.recurring}
              onChange={(event) => setForm((prev) => ({ ...prev, recurring: event.target.checked }))}
            />
            Recurring event
          </label>
        </div>
      ) : null}

      <Card className="p-3">
        <p className="text-xs text-text-secondary">Live Preview</p>
        <p className="font-semibold">{previewTitle}</p>
        <p className="text-xs text-text-secondary">{form.date} • {form.startTime}-{form.endTime} • {form.location}</p>
      </Card>

      <Button
        className="w-full"
        onClick={() => {
          createEvent({
            title: form.title || 'New Event',
            description: form.description || 'Created for demo',
            aiSummary: 'An AI-generated summary will appear here once integrated with watsonx.',
            category: form.category,
            source: 'official',
            date: form.date,
            startTime: form.startTime,
            endTime: form.endTime,
            location: form.location,
            tags,
            orgId: 'u-org-1',
            orgName: 'OUAB',
          })
          navigate('/feed')
        }}
      >
        Publish Event
      </Button>
      <p className="text-[11px] text-text-secondary">TODO: Write to Firestore events collection</p>
    </div>
  )
}

import { Card } from '@/components/ui/card'

export function OrgDashboardPage() {
  const bars = [25, 40, 65, 55, 80, 70]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Organization Dashboard</h2>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Card className="p-3">
          <p className="text-xs text-text-secondary">Total Events</p>
          <p className="text-xl font-bold text-scarlet">12</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-text-secondary">Total RSVPs</p>
          <p className="text-xl font-bold text-scarlet">847</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-text-secondary">Avg Attendance</p>
          <p className="text-xl font-bold text-scarlet">71</p>
        </Card>
      </div>

      <Card className="p-3">
        <p className="mb-2 text-sm font-semibold">RSVP Growth</p>
        <div className="flex h-28 items-end gap-2">
          {bars.map((height, index) => (
            <div key={index} className="w-full rounded-t bg-scarlet" style={{ height: `${height}%` }} />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-text-secondary">TODO: Replace with Firestore aggregated analytics</p>
      </Card>

      <Card className="overflow-hidden">
        <div className="bg-scarlet px-3 py-2 text-sm font-semibold text-white">AI Event Insights</div>
        <div className="space-y-2 p-3 text-sm text-text-secondary">
          <p>📊 Predicted attendance for next event: 142</p>
          <p>⏰ Best time to post: Tuesday 4–6PM</p>
          <p>🏷 Suggested tags: cultural, networking</p>
          <p>📍 High engagement location: Ohio Union</p>
          <p className="text-[11px]">TODO: Watsonx predictive attendance model</p>
        </div>
      </Card>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

export function OrgOnboardingPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Organization Setup</h2>
      <Input placeholder="Organization name" />
      <Input placeholder="Organization email" />
      <select className="h-10 w-full rounded-xl border border-borderlight px-3 text-sm">
        <option>Academic</option>
        <option>Cultural</option>
        <option>Professional</option>
      </select>
      <Textarea placeholder="Description" />
      <Input placeholder="Website" />
      <Input type="file" />
      <Card className="p-3 text-xs text-text-secondary">
        Verification checks are performed against registered OSU organizations before public promotion.
      </Card>
      <Button className="w-full" onClick={() => navigate('/feed')}>
        Continue
      </Button>
      <p className="text-xs text-text-secondary">TODO: Validate against OSU org registry • TODO: Write org profile to Firestore</p>
    </div>
  )
}

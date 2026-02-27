import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppContext } from '@/context/AppContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAppContext()

  const handleLogin = () => {
    login()
    navigate('/feed')
  }

  return (
    <div className="mx-auto mt-8 max-w-md">
      <div className="mb-6 h-1 w-full rounded-full bg-scarlet" />
      <h1 className="text-2xl font-bold text-text-primary">BuckeyeBoard</h1>
      <p className="mb-6 text-sm text-text-secondary">Discover what fits your life</p>

      <div className="space-y-3">
        <Input type="email" placeholder="osu.name@osu.edu" />
        <Input type="password" placeholder="Password" />
        <Button className="w-full" onClick={handleLogin}>
          Sign In
        </Button>
        <Button className="w-full" variant="outline" onClick={() => navigate('/select-role')}>
          Create Account
        </Button>
      </div>

      <p className="mt-8 text-center text-xs text-text-secondary">Powered by Ohio State SSO</p>
      <p className="mt-3 text-center text-xs text-text-secondary">“The Intelligent Campus Event Graph”</p>
    </div>
  )
}

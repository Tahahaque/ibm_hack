import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppContext } from '@/context/AppContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAppContext()

  const handleLogin = async () => {
    await login()
    navigate('/feed')
  }

  return (
    <div className="mx-auto flex min-h-[78vh] w-full max-w-md flex-col justify-center">
      <div className="mb-12 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
          Buckeye<span className="text-scarlet">Board</span>
        </h1>
        <p className="mt-2 text-sm text-text-secondary">Your campus event hub at Ohio State</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Email</label>
          <Input type="email" placeholder="buckeye.1@osu.edu" className="h-12 text-base" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Password</label>
          <Input type="password" placeholder="••••••••" className="h-12 text-base" />
        </div>
        <Button className="h-12 w-full text-xl" onClick={handleLogin}>
          Sign In
        </Button>
      </div>

      <p className="mt-10 text-center text-sm text-text-secondary">Demo mode — any credentials will work</p>
    </div>
  )
}

'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { loginUserAction } from '@/lib/actions' // Will add this action
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginForm() {
  const [state, formAction] = useFormState(loginUserAction, null)
  const { pending } = useFormStatus()

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-900 text-white border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl">Log In</CardTitle>
        <CardDescription className="text-gray-400">
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={pending}>
            {pending ? 'Logging In...' : 'Log In'}
          </Button>
          {state?.message && (
            <p className={`text-sm text-center ${state.success ? 'text-green-500' : 'text-red-500'}`}>
              {state.message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

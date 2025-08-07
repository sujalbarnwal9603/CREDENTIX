'use client'

import { useFormState, useFormStatus } from 'react-dom' // Import from 'react-dom' for form hooks
import { registerUserAction } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignUpForm() {
  // useFormState takes the action and an initial state
  const [state, formAction] = useFormState(registerUserAction, null)
  const { pending } = useFormStatus() // Get pending status for the form submission

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-900 text-white border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up for Free</CardTitle>
        <CardDescription className="text-gray-400">
          Enter your details below to create a free account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Use the formAction directly on the form's action prop */}
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="John Doe"
              required
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
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
            {pending ? 'Signing Up...' : 'Sign Up'}
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

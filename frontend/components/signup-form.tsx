'use client'

import { useState, useEffect } from 'react' // Import useState and useEffect
import { registerUserAction } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignUpForm() {
  const [formState, setFormState] = useState<{ success: boolean; message: string } | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault() // Prevent default form submission

    setIsPending(true)
    const formData = new FormData(event.currentTarget)
    const result = await registerUserAction(formData)
    setFormState(result)
    setIsPending(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-900 text-white border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up for Free</CardTitle>
        <CardDescription className="text-gray-400">
          Enter your details below to create a free account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4"> {/* Use onSubmit */}
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
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending}>
            {isPending ? 'Signing Up...' : 'Sign Up'}
          </Button>
          {formState?.message && (
            <p className={`text-sm text-center ${formState.success ? 'text-green-500' : 'text-red-500'}`}>
              {formState.message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

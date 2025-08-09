"use client"

import { useEffect, useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { createTenantAction } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

type Props = {
  isOpen: boolean
  onClose: () => void
  onTenantCreated: () => void
}

export function CreateTenantForm({ isOpen, onClose, onTenantCreated }: Props) {
  const [state, formAction] = useFormState(createTenantAction, null)
  const { pending } = useFormStatus()
  const { toast } = useToast()

  // Local state to derive slug from name
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")

  useEffect(() => {
    const s = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
    setSlug(s)
  }, [name])

  useEffect(() => {
    if (!state) return
    toast({
      title: state.success ? "Success" : "Action failed",
      description: state.message,
      variant: state.success ? "default" : "destructive",
    })
    if (state.success) {
      onTenantCreated()
      onClose()
      setName("")
      setSlug("")
    }
  }, [state, toast, onClose, onTenantCreated])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Create New Tenant</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter the details for the new tenant. You need admin permissions to create tenants.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Organization"
              required
              className="col-span-3 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="slug" className="text-right">
              Slug
            </Label>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-organization"
              required
              className="col-span-3 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          {state?.message && (
            <p className={`text-sm ${state.success ? "text-green-400" : "text-red-400"}`}>{state.message}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700 text-white">
              {pending ? "Creating..." : "Create Tenant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

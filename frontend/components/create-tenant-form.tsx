'use client'

import { useState, useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { createTenantAction } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast' // Assuming you have useToast from shadcn/ui setup

interface CreateTenantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onTenantCreated: () => void; // Callback to refresh tenant list
}

export function CreateTenantForm({ isOpen, onClose, onTenantCreated }: CreateTenantFormProps) {
  const [state, formAction] = useFormState(createTenantAction, null)
  const { pending } = useFormStatus()
  const { toast } = useToast()

  useEffect(() => {
    if (state) {
      toast({
        title: state.success ? "Success!" : "Error!",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      })
      if (state.success) {
        onTenantCreated(); // Trigger refresh
        onClose(); // Close dialog on success
      }
    }
  }, [state, toast, onTenantCreated, onClose])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Create New Tenant</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter the details for the new tenant. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="My Organization"
                required
                className="col-span-3 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">
                Slug
              </Label>
              <Input
                id="slug"
                name="slug"
                placeholder="my-org"
                required
                className="col-span-3 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700 text-white">
              {pending ? 'Creating...' : 'Create Tenant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

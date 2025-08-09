"use client"

import { useEffect, useState } from "react"
import { fetchTenants, fetchUserProfile } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateTenantForm } from "@/components/create-tenant-form"
import { PlusCircle, ShieldAlert } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type Tenant = {
  _id: string
  name: string
  slug: string
  createdAt: string
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [roleName, setRoleName] = useState<string>("")

  const canManageTenants = roleName?.toLowerCase() === "admin"

  const loadTenants = async () => {
    setLoading(true)
    setError(null)
    const { success, tenants: items, message } = await fetchTenants()
    if (success) {
      setTenants(items)
    } else {
      setError(message || "Failed to load tenants.")
    }
    setLoading(false)
  }

  useEffect(() => {
    ;(async () => {
      const prof = await fetchUserProfile()
      if (prof?.success && prof.user) {
        setRoleName(prof.user.role?.name || "")
      }
      await loadTenants()
    })()
  }, [])

  return (
    <div className="flex-1 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tenant Management</h2>
        {canManageTenants && (
          <Button onClick={() => setIsCreateFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Tenant
          </Button>
        )}
      </div>

      <Separator className="my-4" />

      {!canManageTenants && (
        <Card className="bg-gray-900 text-white border-gray-700 mb-4">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Limited Access
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            You don{"'"}t have permission to view or create tenants. Please contact an admin if you need access.
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-900 text-white border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">All Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : tenants.length === 0 ? (
            <p className="text-gray-400">No tenants found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-800">
                  <TableHead className="w-[140px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((t) => (
                  <TableRow key={t._id} className="hover:bg-gray-800">
                    <TableCell className="font-mono">{t._id.slice(0, 8)}...</TableCell>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{t.slug}</TableCell>
                    <TableCell className="text-right">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateTenantForm
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onTenantCreated={loadTenants}
      />
    </div>
  )
}

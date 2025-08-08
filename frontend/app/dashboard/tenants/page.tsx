'use client'

import { useState, useEffect } from 'react'
import { fetchTenants } from '@/lib/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CreateTenantForm } from '@/components/create-tenant-form'
import { PlusCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Tenant {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const loadTenants = async () => {
    setLoading(true);
    setError(null);
    const { success, tenants: fetchedTenants, message } = await fetchTenants();
    if (success) {
      setTenants(fetchedTenants);
    } else {
      setError(message || "Failed to load tenants.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTenants();
  }, []);

  return (
    <div className="flex-1 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tenant Management</h2>
        <Button onClick={() => setIsCreateFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Tenant
        </Button>
      </div>
      <Separator className="my-4" />

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
            <p className="text-gray-400">No tenants found. Create one to get started!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-800">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant._id} className="hover:bg-gray-800">
                    <TableCell className="font-medium">{tenant._id.substring(0, 8)}...</TableCell>
                    <TableCell>{tenant.name}</TableCell>
                    <TableCell>{tenant.slug}</TableCell>
                    <TableCell className="text-right">{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
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
        onTenantCreated={loadTenants} // Refresh list after creation
      />
    </div>
  );
}

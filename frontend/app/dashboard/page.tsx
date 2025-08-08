import { fetchUserProfile } from '@/lib/actions' // Import fetchUserProfile
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default async function DashboardPage() {
  const { success, user, message } = await fetchUserProfile();

  return (
    <div className="flex-1 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Separator className="my-4" />

      {success && user ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-gray-900 text-white border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-blue-400">Welcome, {user.fullName}!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>This is your personalized dashboard.</p>
              <p>Here you can find an overview of your account and quick access to key features.</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 text-white border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-blue-400">Your Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Tenant:</strong> {user.tenant.name}</p>
              <p><strong>Role:</strong> {user.role.name}</p>
            </CardContent>
          </Card>

          {/* Placeholder for more dashboard content */}
          <Card className="bg-gray-900 text-white border-gray-700 md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl text-blue-400">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">No recent activity to display.</p>
              {/* You can add a list of recent actions here */}
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-red-500 text-center">{message || "Failed to load dashboard content."}</p>
      )}
    </div>
  );
}

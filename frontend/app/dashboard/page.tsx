import { logoutUserAction, fetchUserProfile } from '@/lib/actions' // Import both actions
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const { success, user, message } = await fetchUserProfile();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to your Dashboard!</h1>
      <p className="text-gray-400 text-lg mb-8">You have successfully logged in.</p>

      {success && user ? (
        <Card className="w-full max-w-md mx-auto bg-gray-900 text-white border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-400">User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Full Name:</strong> {user.fullName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Tenant:</strong> {user.tenant.name}</p>
            <p><strong>Role:</strong> {user.role.name}</p>
          </CardContent>
        </Card>
      ) : (
        <p className="text-red-500 text-center mb-8">{message || "Failed to load user profile."}</p>
      )}

      {/* Logout Button */}
      <form action={logoutUserAction}>
        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
          Log Out
        </Button>
      </form>
    </div>
  );
}

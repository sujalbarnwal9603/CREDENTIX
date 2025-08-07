'use client' // This page needs to be a Client Component to use the logout button's onClick

import { logoutUserAction } from '@/lib/actions' // Import the logout action
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to your Dashboard!</h1>
      <p className="text-gray-400 text-lg mb-8">You have successfully logged in.</p>

      {/* Logout Button */}
      <form action={logoutUserAction}>
        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
          Log Out
        </Button>
      </form>
    </div>
  );
}

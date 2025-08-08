'use client'

import * as React from 'react'
import { Home, Settings, Users, BarChart, LogOut, ChevronDown, Plus, Building } from 'lucide-react' // Added Building icon

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { UserNav } from './user-nav'
import { fetchUserProfile } from '@/lib/actions'
import { Skeleton } from '@/components/ui/skeleton'

// Sample navigation data
const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Tenants', // New navigation item
    href: '/dashboard/tenants',
    icon: Building, // Using Building icon for tenants
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    icon: Users,
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function AppSidebar() {
  const { toggleSidebar, state } = useSidebar();
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const getUserProfile = async () => {
      setLoading(true);
      const { success, user: fetchedUser } = await fetchUserProfile();
      if (success && fetchedUser) {
        setUser(fetchedUser);
      }
      setLoading(false);
    };
    getUserProfile();
  }, []);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <img src="/placeholder.svg?height=24&width=24" alt="Logo" className="h-6 w-6" />
          <span className="text-lg font-semibold group-data-[state=collapsed]/sidebar-wrapper:hidden">Credentix</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={window.location.pathname.startsWith(item.href)}>
                    <a href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Plus />
                  <span>New Project</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        {loading ? (
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ) : user ? (
          <UserNav user={user} />
        ) : (
          <Button variant="ghost" className="w-full justify-start" onClick={() => window.location.href = '/'}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Login</span>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

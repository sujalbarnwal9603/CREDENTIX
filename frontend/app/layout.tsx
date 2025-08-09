// import type { Metadata } from "next"
// import { Inter } from 'next/font/google'
// import "./globals.css"
// import { ThemeProvider } from "@/components/theme-provider"
// import { cn } from "@/lib/utils"
// import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar" // Import SidebarProvider and SidebarInset
// import { AppSidebar } from "@/components/app-sidebar" // Import your new AppSidebar

// const inter = Inter({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "AaaS Authorization",
//   description: "Auth-as-a-Service by Credentix",
// }

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
//         <ThemeProvider
//           attribute="class"
//           defaultTheme="dark"
//           enableSystem
//           disableTransitionOnChange
//         >
//           <div className="bg-black text-white min-h-screen flex"> {/* Changed to flex for sidebar layout */}
//             <SidebarProvider>
//               <AppSidebar /> {/* Your new sidebar component */}
//               <SidebarInset> {/* Main content wrapper for inset sidebar */}
//                 {children}
//               </SidebarInset>
//             </SidebarProvider>
//           </div>
//         </ThemeProvider>
//       </body>
//     </html>
//   )
// }

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AaaS Authorization",
  description: "Auth-as-a-Service by Credentix",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="bg-black text-white min-h-screen">{children}</div>
          {/* Global toasts */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider" // Assuming you have this from shadcn/ui setup
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AaaS Authorization",
  description: "Auth-as-a-Service by Credentix",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Force dark theme
          enableSystem
          disableTransitionOnChange
        >
          <div className="bg-black text-white min-h-screen"> {/* Wrapper for black background */}
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

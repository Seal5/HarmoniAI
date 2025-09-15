import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { UserProvider } from "@/contexts/UserContext"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Harmoni AI - Your AI Therapist",
  description: "Your AI therapist, always here to listen.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}

import * as React from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 pb-16 md:pb-0">
      <main className="flex-1 space-y-4 p-4 md:p-8">
        {children}
      </main>
      {/* Bottom navigation will be implemented here for mobile */}
    </div>
  )
}

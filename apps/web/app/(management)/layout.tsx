import * as React from "react"

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        {/* Sidebar navigation will be implemented here */}
      </aside>
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b border-slate-200 bg-white px-6">
          {/* Top bar will be implemented here */}
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

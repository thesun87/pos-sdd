import * as React from "react"

export default function PosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <main className="grid flex-1 grid-cols-1 md:grid-cols-[1fr_380px] gap-2 p-2">
        {children}
      </main>
    </div>
  )
}

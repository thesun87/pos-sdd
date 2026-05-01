import * as React from "react"

export default function KdsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 p-4">
      <main className="grid flex-1 auto-rows-max grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
      </main>
    </div>
  )
}

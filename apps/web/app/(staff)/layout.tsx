export default function StaffLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <div className="mx-auto max-w-lg px-4 py-8">
        {children}
      </div>
    </div>
  )
}

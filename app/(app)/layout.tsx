import Nav from '@/components/Nav'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Nav />
      <main className="md:ml-[200px] min-h-[100dvh] pb-16 md:pb-0">
        {children}
      </main>
    </>
  )
}

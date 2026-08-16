import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full w-full overflow-x-hidden">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

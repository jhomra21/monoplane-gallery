import { Header } from '@/components/Header'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </div>
  ),
}) 
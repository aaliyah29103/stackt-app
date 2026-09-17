import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { AddIcon, HomeIcon, SettingsIcon } from '../assets/icons'
import AddMenu from './AddMenu'
import Logo from './Logo'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium ${
    isActive ? 'text-accent' : 'text-gray-400'
  }`

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white">
      <header className="flex items-center justify-center border-b border-gray-200 px-4 py-4">
        <h1>
          <Logo className="h-7 w-auto" />
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 items-center border-t border-gray-200 bg-white px-4">
        <NavLink to="/" end className={navLinkClass}>
          <HomeIcon className="h-5 w-5" />
          Home
        </NavLink>

        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Add"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg"
          >
            <AddIcon className="h-5 w-5" />
          </button>
        </div>

        <NavLink to="/settings" className={navLinkClass}>
          <SettingsIcon className="h-5 w-5" />
          Settings
        </NavLink>
      </nav>

      <AddMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}

export default Layout

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom"

import {
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

import { useAuth } from "@/features/auth/auth-context"

// ========================================
// NAVIGATION
// ========================================

const navigation = [
  {
    name: "Dashboard",
    href: "/resident/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "My Profile",
    href: "/resident/profile",
    icon: User,
  },
  {
    name: "My Certificates",
    href: "/resident/certificates",
    icon: FileText,
  },
  {
    name: "Announcements",
    href: "/resident/announcements",
    icon: Bell,
  },
]

// ========================================
// HELPERS
// ========================================

function getPageTitle(
  pathname: string
) {
  const currentItem =
    navigation.find(
      (item) =>
        pathname === item.href ||
        pathname.startsWith(
          `${item.href}/`
        )
    )

  return (
    currentItem?.name ??
    "Resident Portal"
  )
}

function getInitials(
  email?: string | null
) {
  if (!email) {
    return "R"
  }

  const localPart =
    email.split("@")[0] ??
    ""

  const parts =
    localPart
      .replace(
        /[._-]+/g,
        " "
      )
      .split(" ")
      .filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
  }

  return localPart
    .slice(0, 2)
    .toUpperCase()
}

// ========================================
// SIDEBAR NAVIGATION
// ========================================

function SidebarNavigation({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  return (
    <nav className="space-y-1 px-3">
      {navigation.map(
        (item) => {
          const Icon =
            item.icon

          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={
                onNavigate
              }
              className={({
                isActive,
              }) =>
                [
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-emerald-50/85 hover:bg-white/10 hover:text-white",
                ].join(" ")
              }
            >
              {({
                isActive,
              }) => (
                <>
                  <span
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-white/5 text-emerald-100 group-hover:bg-white/10",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  <span className="truncate">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          )
        }
      )}
    </nav>
  )
}

// ========================================
// RESIDENT LAYOUT
// ========================================

export function ResidentLayout() {
  const {
    user,
    signOut,
  } = useAuth()

  const navigate =
    useNavigate()

  const location =
    useLocation()

  const pageTitle =
    getPageTitle(
      location.pathname
    )

  const initials =
    getInitials(
      user?.email
    )

  const handleLogout =
    async () => {
      await signOut()

      navigate(
        "/login",
        {
          replace: true,
        }
      )
    }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ========================================
          DESKTOP SIDEBAR
      ======================================== */}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-emerald-950/20 bg-[#063c30] md:flex md:flex-col">
        {/* BRAND */}

        <div className="flex min-h-20 items-center border-b border-white/10 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-sm">
              <img
                src="/barangay-logo.png"
                alt="Laoac Barangay logo"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                Laoac Barangay
              </p>

              <p className="mt-0.5 text-xs text-emerald-100/75">
                Resident Portal
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-6 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/50">
            Resident Services
          </div>

          <SidebarNavigation />
        </div>

        {/* USER */}

        <div className="border-t border-white/10 p-3">
          <div className="rounded-xl bg-white/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-950">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {user?.email ??
                    "Resident"}
                </p>

                <p className="mt-0.5 text-xs text-emerald-100/65">
                  Resident
                </p>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="mt-2 h-10 w-full justify-start rounded-xl text-emerald-50 hover:bg-white/10 hover:text-white"
            onClick={
              handleLogout
            }
          >
            <LogOut className="mr-2 h-4 w-4" />

            Logout
          </Button>
        </div>
      </aside>

      {/* ========================================
          MAIN
      ======================================== */}

      <div className="md:pl-72">
        {/* HEADER */}

        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
          {/* MOBILE MENU */}

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mr-2 rounded-lg md:hidden"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-72 border-r-0 bg-[#063c30] p-0 text-white"
            >
              <div className="flex min-h-20 items-center border-b border-white/10 px-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-sm">
                    <img
                      src="/barangay-logo.png"
                      alt="Laoac Barangay logo"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      Laoac Barangay
                    </p>

                    <p className="mt-0.5 text-xs text-emerald-100/75">
                      Resident Portal
                    </p>
                  </div>
                </div>
              </div>

              <div className="py-4">
                <div className="px-6 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/50">
                  Resident Services
                </div>

                <SidebarNavigation />
              </div>

              <div className="absolute inset-x-0 bottom-0 border-t border-white/10 p-3">
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-950">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {user?.email ??
                          "Resident"}
                      </p>

                      <p className="mt-0.5 text-xs text-emerald-100/65">
                        Resident
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="mt-2 h-10 w-full justify-start rounded-xl text-emerald-50 hover:bg-white/10 hover:text-white"
                  onClick={
                    handleLogout
                  }
                >
                  <LogOut className="mr-2 h-4 w-4" />

                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* HEADER CONTENT */}

          <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Laoac Barangay
              </p>

              <h1 className="truncate text-base font-semibold text-slate-950">
                {pageTitle}
              </h1>
            </div>

            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden min-w-0 text-right sm:block">
                <p className="max-w-[260px] truncate text-sm font-medium text-slate-800">
                  {user?.email ??
                    "Resident"}
                </p>

                <p className="text-xs text-slate-500">
                  Resident
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-800">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}

        <main className="mx-auto w-full max-w-[1600px] p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

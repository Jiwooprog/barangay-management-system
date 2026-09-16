import {
  useMemo,
  useState,
} from "react"

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom"

import {
  BarChart3,
  Building2,
  FileClock,
  FileText,
  House,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Megaphone,
  Menu,
  Settings,
  ShieldAlert,
  UserCog,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

import { useAuth } from "@/features/auth/auth-context"

// ========================================
// TYPES
// ========================================

type NavigationSection =
  | "operations"
  | "administration"

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  section: NavigationSection
  superAdminOnly?: boolean
}

// ========================================
// NAVIGATION
// ========================================

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    section: "operations",
  },
  {
    name: "Residents",
    href: "/residents",
    icon: Users,
    section: "operations",
  },
  {
    name: "Households",
    href: "/households",
    icon: House,
    section: "operations",
  },
  {
    name: "Puroks",
    href: "/puroks",
    icon: MapPinned,
    section: "operations",
  },
  {
    name: "Officials",
    href: "/officials",
    icon: Building2,
    section: "operations",
  },
  {
    name: "Committees",
    href: "/committees",
    icon: UsersRound,
    section: "operations",
  },
  {
    name: "Certificates",
    href: "/certificates",
    icon: FileText,
    section: "operations",
  },
  {
    name: "Blotter",
    href: "/blotter",
    icon: ShieldAlert,
    section: "operations",
  },
  {
    name: "Announcements",
    href: "/announcements",
    icon: Megaphone,
    section: "operations",
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    section: "operations",
  },
  {
    name: "Users",
    href: "/users",
    icon: UserCog,
    section: "administration",
    superAdminOnly: true,
  },
  {
    name: "Activity Logs",
    href: "/activity-logs",
    icon: FileClock,
    section: "administration",
    superAdminOnly: true,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    section: "administration",
    superAdminOnly: true,
  },
]

// ========================================
// HELPERS
// ========================================

function formatRole(
  role?: string | null
) {
  if (!role) {
    return "User"
  }

  return role
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    )
}

function getInitials(
  email?: string | null
) {
  if (!email) {
    return "BMS"
  }

  const localPart =
    email.split("@")[0] ?? ""

  const parts =
    localPart
      .split(/[._-]/)
      .filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`
      .toUpperCase()
  }

  return localPart
    .slice(0, 2)
    .toUpperCase()
}

// ========================================
// SIDEBAR NAVIGATION
// ========================================

interface SidebarNavigationProps {
  role?: string | null
  onNavigate?: () => void
}

function SidebarNavigation({
  role,
  onNavigate,
}: SidebarNavigationProps) {
  const visibleNavigation =
    navigation.filter(
      (item) =>
        !item.superAdminOnly ||
        role === "super_admin"
    )

  const operations =
    visibleNavigation.filter(
      (item) =>
        item.section ===
        "operations"
    )

  const administration =
    visibleNavigation.filter(
      (item) =>
        item.section ===
        "administration"
    )

  const renderItem = (
    item: NavigationItem
  ) => {
    const Icon = item.icon

    return (
      <NavLink
        key={item.href}
        to={item.href}
        onClick={onNavigate}
        className={({
          isActive,
        }) =>
          [
            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
            isActive
              ? "bg-white text-emerald-950 shadow-sm"
              : "text-emerald-50/75 hover:bg-white/10 hover:text-white",
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

  return (
    <nav className="space-y-6 px-3">
      <div>
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100/45">
          Operations
        </p>

        <div className="space-y-1">
          {operations.map(
            renderItem
          )}
        </div>
      </div>

      {administration.length >
        0 && (
        <div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100/45">
            Administration
          </p>

          <div className="space-y-1">
            {administration.map(
              renderItem
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

// ========================================
// SIDEBAR BRAND
// ========================================

function SidebarBrand() {
  return (
    <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-sm">
        <img
          src="/barangay-logo.png"
          alt="Laoac Barangay Management System"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-bold tracking-tight text-white">
          Laoac Barangay
        </p>

        <p className="truncate text-xs text-emerald-100/60">
          Management System
        </p>
      </div>
    </div>
  )
}

// ========================================
// ADMIN LAYOUT
// ========================================

export function AdminLayout() {
  const {
    user,
    role,
    signOut,
  } = useAuth()

  const navigate =
    useNavigate()

  const location =
    useLocation()

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false)

  const currentPage =
    useMemo(() => {
      const match =
        navigation.find(
          (item) =>
            location.pathname ===
              item.href ||
            location.pathname.startsWith(
              `${item.href}/`
            )
        )

      return (
        match?.name ??
        "Barangay Management System"
      )
    }, [location.pathname])

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

  const initials =
    getInitials(
      user?.email
    )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {/* =================================
          DESKTOP SIDEBAR
      ================================= */}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col bg-gradient-to-b from-emerald-950 via-emerald-950 to-slate-950 shadow-xl md:flex">
        <SidebarBrand />

        <div className="flex-1 overflow-y-auto py-5">
          <SidebarNavigation
            role={role}
          />
        </div>

        {/* ACCOUNT */}

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.06] p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-sm font-bold text-emerald-950">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.email ??
                  "Signed in user"}
              </p>

              <p className="mt-0.5 text-xs text-emerald-100/55">
                {formatRole(
                  role
                )}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="h-10 w-full justify-start rounded-xl text-emerald-50/75 hover:bg-white/10 hover:text-white"
            onClick={
              handleLogout
            }
          >
            <LogOut className="mr-3 h-4 w-4" />

            Logout
          </Button>
        </div>
      </aside>

      {/* =================================
          MAIN CONTENT
      ================================= */}

      <div className="md:pl-72">
        {/* HEADER */}

        <header className="sticky top-0 z-20 flex h-18 min-h-[72px] items-center border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur md:px-7">
          {/* MOBILE SIDEBAR */}

          <Sheet
            open={mobileOpen}
            onOpenChange={
              setMobileOpen
            }
          >
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-3 rounded-lg md:hidden"
                  aria-label="Open navigation"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-72 border-0 bg-emerald-950 p-0 text-white"
            >
              <div className="flex h-full flex-col bg-gradient-to-b from-emerald-950 via-emerald-950 to-slate-950">
                <SidebarBrand />

                <div className="flex-1 overflow-y-auto py-5">
                  <SidebarNavigation
                    role={role}
                    onNavigate={() =>
                      setMobileOpen(
                        false
                      )
                    }
                  />
                </div>

                <div className="border-t border-white/10 p-4">
                  <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.06] p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-sm font-bold text-emerald-950">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {user?.email}
                      </p>

                      <p className="mt-0.5 text-xs text-emerald-100/55">
                        {formatRole(
                          role
                        )}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 w-full justify-start rounded-xl text-emerald-50/75 hover:bg-white/10 hover:text-white"
                    onClick={
                      handleLogout
                    }
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* HEADER CONTENT */}

          <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">
                Laoac Barangay
              </p>

              <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950">
                {currentPage}
              </h1>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="max-w-[230px] truncate text-sm font-medium text-slate-800">
                  {user?.email}
                </p>

                <p className="text-xs text-slate-500">
                  {formatRole(
                    role
                  )}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-sm font-bold text-emerald-800">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}

        <main className="min-h-[calc(100vh-72px)] p-4 sm:p-5 md:p-7">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

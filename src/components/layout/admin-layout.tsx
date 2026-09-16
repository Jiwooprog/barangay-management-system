import {
  NavLink,
  Outlet,
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
// NAVIGATION TYPE
// ========================================

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
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
  },
  {
    name: "Residents",
    href: "/residents",
    icon: Users,
  },
  {
    name: "Households",
    href: "/households",
    icon: House,
  },
  {
    name: "Puroks",
    href: "/puroks",
    icon: MapPinned,
  },
  {
    name: "Officials",
    href: "/officials",
    icon: Building2,
  },
  {
    name: "Committees",
    href: "/committees",
    icon: UsersRound,
  },
  {
    name: "Certificates",
    href: "/certificates",
    icon: FileText,
  },
  {
    name: "Blotter",
    href: "/blotter",
    icon: ShieldAlert,
  },
  {
    name: "Announcements",
    href: "/announcements",
    icon: Megaphone,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
  },

  // ========================================
  // SUPER ADMIN ONLY
  // ========================================

  {
    name: "Users",
    href: "/users",
    icon: UserCog,
    superAdminOnly: true,
  },
  {
    name: "Activity Logs",
    href: "/activity-logs",
    icon: FileClock,
    superAdminOnly: true,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    superAdminOnly: true,
  },
]

// ========================================
// SIDEBAR NAVIGATION
// ========================================

interface SidebarNavigationProps {
  role?: string | null
}

function SidebarNavigation({
  role,
}: SidebarNavigationProps) {
  const visibleNavigation =
    navigation.filter(
      (item) =>
        !item.superAdminOnly ||
        role === "super_admin"
    )

  return (
    <nav className="space-y-1 px-3">
      {visibleNavigation.map(
        (item) => {
          const Icon =
            item.icon

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({
                isActive,
              }) =>
                [
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")
              }
            >
              <Icon className="h-4 w-4" />

              {item.name}
            </NavLink>
          )
        }
      )}
    </nav>
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

  // ========================================
  // LOGOUT
  // ========================================

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
    <div className="min-h-screen bg-muted/30">
      {/* =================================
          DESKTOP SIDEBAR
      ================================= */}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background md:flex md:flex-col">
        {/* LOGO */}

        <div className="flex h-16 items-center border-b px-6">
          <div>
            <p className="font-bold">
              Barangay BMS
            </p>

            <p className="text-xs text-muted-foreground">
              Management System
            </p>
          </div>
        </div>

        {/* NAVIGATION */}

        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNavigation
            role={role}
          />
        </div>

        {/* USER */}

        <div className="border-t p-4">
          <p className="truncate text-sm font-medium">
            {user?.email}
          </p>

          <p className="mb-3 text-xs text-muted-foreground">
            {role}
          </p>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={
              handleLogout
            }
          >
            <LogOut className="mr-2 h-4 w-4" />

            Logout
          </Button>
        </div>
      </aside>

      {/* =================================
          MAIN CONTENT
      ================================= */}

      <div className="md:pl-64">
        {/* HEADER */}

        <header className="sticky top-0 z-20 flex h-16 items-center border-b bg-background px-4 md:px-6">
          {/* MOBILE SIDEBAR */}

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 md:hidden"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-64 p-0"
            >
              {/* MOBILE LOGO */}

              <div className="flex h-16 items-center border-b px-6">
                <div>
                  <p className="font-bold">
                    Barangay BMS
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Management System
                  </p>
                </div>
              </div>

              {/* MOBILE NAVIGATION */}

              <div className="py-4">
                <SidebarNavigation
                  role={role}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* HEADER CONTENT */}

          <div className="flex flex-1 items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Barangay Management
              System
            </p>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user?.email}
              </p>

              <p className="text-xs text-muted-foreground">
                {role}
              </p>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
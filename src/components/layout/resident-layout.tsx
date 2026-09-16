import {
  NavLink,
  Outlet,
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
// SIDEBAR NAVIGATION
// ========================================

function SidebarNavigation() {
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
// RESIDENT LAYOUT
// ========================================

export function ResidentLayout() {
  const {
    user,
    role,
    signOut,
  } = useAuth()

  const navigate =
    useNavigate()

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
      {/* DESKTOP SIDEBAR */}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background md:flex md:flex-col">
        {/* BRAND */}

        <div className="flex h-16 items-center border-b px-6">
          <div>
            <p className="font-bold">
              Barangay BMS
            </p>

            <p className="text-xs text-muted-foreground">
              Resident Portal
            </p>
          </div>
        </div>

        {/* NAVIGATION */}

        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNavigation />
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

      {/* MAIN */}

      <div className="md:pl-64">
        {/* HEADER */}

        <header className="sticky top-0 z-20 flex h-16 items-center border-b bg-background px-4 md:px-6">
          {/* MOBILE MENU */}

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
              <div className="flex h-16 items-center border-b px-6">
                <div>
                  <p className="font-bold">
                    Barangay BMS
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Resident Portal
                  </p>
                </div>
              </div>

              <div className="py-4">
                <SidebarNavigation />
              </div>
            </SheetContent>
          </Sheet>

          {/* HEADER CONTENT */}

          <div className="flex flex-1 items-center justify-between">
            <div>
              <p className="font-medium">
                Resident Portal
              </p>

              <p className="text-xs text-muted-foreground">
                Barangay Management
                System
              </p>
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user?.email}
              </p>

              <p className="text-xs text-muted-foreground">
                Resident
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
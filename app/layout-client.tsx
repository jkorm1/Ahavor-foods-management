"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { InvestorLogin } from "@/components/investor-login";
import { useAuth } from "@/contexts/auth-context";
import { LogoutButton } from "@/components/logout-button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Table,
  Users,
  ShoppingCart,
  Settings,
  LayoutDashboard,
  Package,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, userRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Redirect to appropriate dashboard based on role
    if (userRole === "investor" && pathname === "/sales-dashboard") {
      router.push("/");
    } else if (userRole === "sales" && pathname === "/") {
      router.push("/sales-dashboard");
    }
  }, [isAuthenticated, userRole, pathname, router]);

  if (!isAuthenticated) {
    return <InvestorLogin />;
  }

  return <>{children}</>;
}

const MobileNav = ({ closeMenu }: { closeMenu: () => void }) => {
  const { userRole } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="mb-6 px-2">
          <h2 className="text-lg font-semibold text-foreground">Menu</h2>
        </div>

        <div className="space-y-1">
          {userRole === "investor" && (
            <>
              <Link
                href="/"
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                  pathname === "/"
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70",
                )}
              >
                <Home className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/tables"
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                  pathname === "/tables"
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70",
                )}
              >
                <Table className="h-5 w-5" />
                Tables
              </Link>
              <Link
                href="/customers"
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                  pathname === "/customers"
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70",
                )}
              >
                <Users className="h-5 w-5" />
                Customers
              </Link>
              <Link
                href="/orders"
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                  pathname === "/orders"
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70",
                )}
              >
                <ShoppingCart className="h-5 w-5" />
                Orders
              </Link>
              <Link
                href="/setup"
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                  pathname === "/setup"
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70",
                )}
              >
                <Settings className="h-5 w-5" />
                Setup
              </Link>
            </>
          )}

          {userRole === "sales" && (
            <>
              <Link
                href="/sales-dashboard"
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                  pathname === "/sales-dashboard"
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70",
                )}
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/sales-entry"
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                  pathname === "/sales-entry"
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70",
                )}
              >
                <Package className="h-5 w-5" />
                Sales Entry
              </Link>
              <Link
                href="/sales-customers"
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                  pathname === "/sales-customers"
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70",
                )}
              >
                <Users className="h-5 w-5" />
                Customers
              </Link>
              <Link
                href="/sales-tables"
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                  pathname === "/sales-tables"
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70",
                )}
              >
                <Table className="h-5 w-5" />
                Sales Records
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all cursor-pointer">
          <LogOut className="h-5 w-5" />
          <LogoutButton />
        </div>
      </div>
    </div>
  );
};

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const { userRole, userName } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full sticky top-0 z-50">
        <nav className="px-4 h-14 w-full flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <div className="relative">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden bg-white shadow-md">
                  <img
                    src="/logo.png"
                    alt="Ahavor Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <span className="hidden font-bold sm:inline-block">
                Ahavor foods
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {userRole === "investor" && (
              <>
                <Link
                  href="/"
                  className={`transition-colors hover:text-foreground/80 hover:underline ${
                    pathname === "/"
                      ? "text-foreground border-b-2 border-primary"
                      : "text-foreground/60"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/tables"
                  className={`transition-colors hover:text-foreground/80 hover:underline ${
                    pathname === "/tables"
                      ? "text-foreground border-b-2 border-primary"
                      : "text-foreground/60"
                  }`}
                >
                  Tables
                </Link>
                <Link
                  href="/customers"
                  className={`transition-colors hover:text-foreground/80 hover:underline ${
                    pathname === "/customers"
                      ? "text-foreground border-b-2 border-primary"
                      : "text-foreground/60"
                  }`}
                >
                  Customers
                </Link>
                <Link
                  href="/orders"
                  className={`transition-colors hover:text-foreground/80 hover:underline ${
                    pathname === "/orders"
                      ? "text-foreground border-b-2 border-primary"
                      : "text-foreground/60"
                  }`}
                >
                  Orders
                </Link>
                <Link
                  href="/setup"
                  className={`transition-colors hover:text-foreground/80 hover:underline ${
                    pathname === "/setup"
                      ? "text-foreground border-b-2 border-primary"
                      : "text-foreground/60"
                  }`}
                >
                  Setup
                </Link>
              </>
            )}

            {userRole === "sales" && (
              <>
                <Link
                  href="/sales-dashboard"
                  className={`transition-colors hover:text-foreground/80 hover:underline ${
                    pathname === "/sales-dashboard"
                      ? "text-foreground border-b-2 border-primary"
                      : "text-foreground/60"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/sales-entry"
                  className={`transition-colors hover:text-foreground/80 hover:underline ${
                    pathname === "/sales-entry"
                      ? "text-foreground border-b-2 border-primary"
                      : "text-foreground/60"
                  }`}
                >
                  Sales Entry
                </Link>
                <Link
                  href="/sales-customers"
                  className={`transition-colors hover:text-foreground/80 hover:underline ${
                    pathname === "/sales-customers"
                      ? "text-foreground border-b-2 border-primary"
                      : "text-foreground/60"
                  }`}
                >
                  Customers
                </Link>
                <Link
                  href="/sales-tables"
                  className={`transition-colors hover:text-foreground/80 hover:underline ${
                    pathname === "/sales-tables"
                      ? "text-foreground border-b-2 border-primary"
                      : "text-foreground/60"
                  }`}
                >
                  Sales Records
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-[85vh]">
                <MobileNav closeMenu={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Logout Button */}
          <div className="hidden md:flex items-center">
            <LogoutButton />
          </div>
        </nav>
      </header>

      <main className="container mx-auto">
        <AuthGuard>{children}</AuthGuard>
      </main>
    </div>
  );
}

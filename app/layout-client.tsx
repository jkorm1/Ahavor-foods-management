"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { InvestorLogin } from "@/components/investor-login";
import { useAuth } from "@/contexts/auth-context";
import { LogoutButton } from "@/components/logout-button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

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

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const { userRole, userName } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
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

          <div className="flex items-center space-x-6 text-sm font-medium">
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

          <div className="flex items-center">
            <div className="mr-4 text-sm">
              <span>Welcome, {userName}</span>
            </div>
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

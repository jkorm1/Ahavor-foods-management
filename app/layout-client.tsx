"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { InvestorLogin } from "@/components/investor-login";
import { useAuth } from "@/contexts/auth-context";
import { LogoutButton } from "@/components/logout-button";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <InvestorLogin />;
  }

  return <>{children}</>;
}

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <NavigationMenu className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <NavigationMenuList className="container mx-auto px-4 h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <img src="/logo.png" alt="StarPops Logo" className="h-40 w-40" />
              <span className="hidden font-bold sm:inline-block">StarPops</span>
            </Link>
          </div>

          <div className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Dashboard
            </Link>
            <Link
              href="/tables"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Tables
            </Link>
            <Link
              href="/setup"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Setup
            </Link>
          </div>
        </NavigationMenuList>
        <LogoutButton />
      </NavigationMenu>
      <main className="container mx-auto">
        <AuthGuard>{children}</AuthGuard>
      </main>
    </div>
  );
}

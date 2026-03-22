"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: "investor" | "sales" | null;
  userName: string;
  login: (
    password: string,
    role: "investor" | "sales",
  ) => { success: boolean; name: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"investor" | "sales" | null>(null);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount
    const storedAuth = sessionStorage.getItem("auth");
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      setIsAuthenticated(true);
      setUserRole(authData.role);
      setUserName(authData.name);

      // Redirect to appropriate dashboard based on role
      if (authData.role === "investor") {
        router.push("/");
      } else if (authData.role === "sales") {
        router.push("/sales-dashboard");
      }
    }
  }, [router]);

  const login = (password: string, role: "investor" | "sales") => {
    // Check if password is empty
    if (!password || password.trim() === "") {
      return { success: false, name: "" };
    }

    // Validate password based on role
    let isValid = false;
    let name = "";

    if (role === "investor") {
      // Get investor passwords from environment variables
      const investorPasswords =
        process.env.NEXT_PUBLIC_INVESTOR_1_PASSWORD?.split(",") || [];

      // Check if the provided password matches any of the investor passwords
      const matchedPassword = investorPasswords.find(
        (p) => p.trim() === password,
      );

      if (matchedPassword) {
        isValid = true;
        // Use the password as the name for now, or you could have a separate mapping
        name = "Christian"; // You can customize this to map specific passwords to names
      }
    } else {
      // For sales, check against sales passwords
      const salesPasswords =
        process.env.NEXT_PUBLIC_SALES_1_PASSWORD?.split(",") || [];

      // Check if the provided password matches any of the sales passwords
      const matchedPassword = salesPasswords.find((p) => p.trim() === password);

      if (matchedPassword) {
        isValid = true;
        // Map passwords to sales executive names
        if (password === "josh123") {
          name = "Josephine";
        } else if (password === "peace123") {
          name = "Peace";
        } else {
          name = "Sales Executive";
        }
      }
    }

    if (isValid) {
      setIsAuthenticated(true);
      setUserRole(role);
      setUserName(name);
      sessionStorage.setItem("auth", JSON.stringify({ role, name }));

      // Redirect to appropriate dashboard based on role
      if (role === "investor") {
        router.push("/");
      } else if (role === "sales") {
        router.push("/sales-dashboard");
      }

      return { success: true, name };
    } else {
      return { success: false, name: "" };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName("");
    sessionStorage.removeItem("auth");
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        userName,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

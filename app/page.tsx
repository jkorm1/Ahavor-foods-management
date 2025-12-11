"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "@/components/dashboard";
import SalesForm from "@/components/sales-form";
import ExpensesForm from "@/components/expenses-form";
import WithdrawalsForm from "@/components/withdrawals-form";
import FinancialStatements from "@/components/financial-statements";
import { LossesForm } from "@/components/losses-form";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { investorName } = useAuth();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      const result = await response.json();

      // Fetch sales to get unique days
      const salesResponse = await fetch("/api/sales");
      const salesData = await salesResponse.json();
      const uniqueDays = salesData.uniqueDays || 0;

      // Fetch losses separately with error handling
      const lossesResponse = await fetch("/api/losses");
      let totalLosses = 0;
      try {
        const losses = await lossesResponse.json();
        if (Array.isArray(losses)) {
          totalLosses = losses.reduce(
            (sum, loss) => sum + (loss.potentialValue || 0),
            0
          );
        }
      } catch (error) {
        console.error("Error processing losses data:", error);
      }

      setData({ ...result, uniqueDays, totalLosses });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">
            Ahavor Foods Financial Dashboard
            {investorName && (
              <span className="ml-2 text-sm text-muted-foreground">
                (Welcome, {investorName})
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your popcorn business finances in real-time
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Quick Stats */}
        {data && (
          <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  GHS {data.totalSales || 0}
                </div>
                <p className="text-xs text-green-500 mt-1">
                  Sales made on {data.uniqueDays || 0} days
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  GHS {data.totalExpenses || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Running costs
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    data.totalSales - data.totalExpenses >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  GHS {(data.totalSales - data.totalExpenses).toFixed(2) || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sales minus expenses
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-muted border border-border rounded-lg p-1 mb-4">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-transparent border-0 bg-muted border border-border gap-1 auto-rows-min pd-3 mb-4">
              <TabsTrigger value="dashboard" className="text-xs md:text-sm">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="sales" className="text-xs md:text-sm">
                Sales
              </TabsTrigger>
              <TabsTrigger value="expenses" className="text-xs md:text-sm">
                Expenses
              </TabsTrigger>
              <TabsTrigger value="losses" className="text-xs md:text-sm">
                Losses
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="text-xs md:text-sm">
                Withdrawals
              </TabsTrigger>
              <TabsTrigger value="statements" className="text-xs md:text-sm">
                Statements
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="mt-6">
            <Dashboard data={data} onRefresh={fetchData} />
          </TabsContent>

          <TabsContent value="sales" className="mt-6">
            <SalesForm onSuccess={fetchData} />
          </TabsContent>

          <TabsContent value="expenses" className="mt-6">
            <ExpensesForm onSuccess={fetchData} />
          </TabsContent>

          <TabsContent value="losses" className="mt-6">
            <LossesForm onSuccess={fetchData} />
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-6">
            <WithdrawalsForm onSuccess={fetchData} />
          </TabsContent>

          <TabsContent value="statements" className="mt-6">
            <FinancialStatements data={data} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

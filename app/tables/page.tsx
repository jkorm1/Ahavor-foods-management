"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesTable from "@/components/sales-table";
import ExpensesTable from "@/components/expenses-table";
import EmployeeTable from "@/components/employee-table";
import InvestorTable from "@/components/investor-table";
import { LossesTable } from "@/components/losses-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TablesPage() {
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalExpenses: 0,
    totalProfit: 0,
    productionCost: 0,
    tithe: 0,
    founderPay: 0,
    businessSavings: 0,
    leadershipPayroll: 0,
    salesPayroll: 0,
    salesPayrollSavings: 0,
    packagingPayroll: 0,
    investorShare: 0,
    reinvestment: 0,
    totalLosses: 0,
  });
  const [loading, setLoading] = useState(true);

  // In app/tables/page.tsx
  // In app/tables/page.tsx
  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch data");
        }

        // Calculate total losses from losses data
        const totalLosses =
          result.losses?.reduce(
            (sum, loss) => sum + (Number(loss.potentialValue) || 0),
            0,
          ) || 0;

        // Calculate profit distribution
        const profitPerPiece = 12.0;
        const totalSales = result.totalSales || 0;
        const actualProfit = totalSales * (profitPerPiece / 25.0);

        setSummary({
          totalSales,
          totalExpenses: result.totalExpenses || 0,
          totalProfit: result.netProfit || 0,
          productionCost: totalSales - actualProfit,
          tithe: actualProfit * (1.2 / 12.0),
          founderPay: actualProfit * (1.5 / 12.0),
          businessSavings: actualProfit * (1.0 / 12.0),
          leadershipPayroll: actualProfit * (1.0 / 12.0),
          salesPayroll: actualProfit * (2.7 / 12.0),
          salesPayrollSavings: actualProfit * (0.3 / 12.0),
          packagingPayroll: actualProfit * (0.5 / 12.0),
          investorShare: actualProfit * (1.8 / 12.0),
          reinvestment: actualProfit * (2.0 / 12.0),
          totalLosses,
        });
      } catch (error) {
        console.error("Failed to load summary:", error);
        setSummary({
          totalSales: 0,
          totalExpenses: 0,
          totalProfit: 0,
          productionCost: 0,
          tithe: 0,
          founderPay: 0,
          businessSavings: 0,
          leadershipPayroll: 0,
          salesPayroll: 0,
          salesPayrollSavings: 0,
          packagingPayroll: 0,
          investorShare: 0,
          reinvestment: 0,
          totalLosses: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Tables</h1>
          <p className="text-muted-foreground">
            View and analyze your business data
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4">
          {[...Array(9)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                GHS {summary.totalSales.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                GHS {summary.totalExpenses.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Current Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${summary.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                GHS {summary.totalProfit.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Production Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                GHS {summary.productionCost.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                13.00 GHS per piece
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tithe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                GHS {summary.tithe.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                1.20 GHS per piece
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Founder Pay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                GHS {summary.founderPay.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                1.50 GHS per piece
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Business Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                GHS {summary.businessSavings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                1.00 GHS per piece
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Leadership Payroll
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                GHS {summary.leadershipPayroll.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                1.00 GHS per piece
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Sales Payroll
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                GHS {summary.salesPayroll.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                2.70 GHS per piece
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Sales Payroll Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                GHS {summary.salesPayrollSavings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                0.30 GHS per piece
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Packaging Payroll
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                GHS {summary.packagingPayroll.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                0.50 GHS per piece
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Investor Share
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                GHS {summary.investorShare.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                1.80 GHS per piece
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Reinvestment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                GHS {summary.reinvestment.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                2.00 GHS per piece
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="sales" className="space-y-4">
        <div className="bg-muted border border-border rounded-lg p-1 mb-4">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-muted border border-border auto-rows-min pd-3 mb-4">
            <TabsTrigger
              value="sales"
              className="flex items-center gap-2 text-xs md:text-sm"
            >
              Sales Records
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="flex items-center gap-2 text-xs md:text-sm"
            >
              Expenses
            </TabsTrigger>
            <TabsTrigger
              value="losses"
              className="flex items-center gap-2 text-xs md:text-sm"
            >
              Inventory Losses
            </TabsTrigger>
            <TabsTrigger
              value="employees"
              className="flex items-center gap-2 text-xs md:text-sm"
            >
              Employee Shares
            </TabsTrigger>
            <TabsTrigger
              value="investors"
              className="flex items-center gap-2 text-xs md:text-sm"
            >
              Investor Returns
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Transactions</CardTitle>
              <CardDescription>
                View all sales records and their financial breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Records</CardTitle>
              <CardDescription>
                Track and analyze all business expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpensesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="losses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Losses</CardTitle>
              <CardDescription>
                Track shared, spoiled, missing, or destroyed items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LossesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Share Summary</CardTitle>
              <CardDescription>
                Monthly breakdown of employee shares from sales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeeTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Investor Returns</CardTitle>
              <CardDescription>
                Monthly breakdown of investor returns from sales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvestorTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

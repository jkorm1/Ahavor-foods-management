"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  generateSalesCSV,
  generateExpensesCSV,
  downloadCSV,
} from "@/lib/csv-export";
import { getSales, getExpenses } from "@/lib/transaction-store";
import { useEffect, useState } from "react";
import InvestorProgress from "./investor-progress";

interface Sale {
  productionCost?: number;
  investorShare?: number;
  salesPayroll?: number;
  packagingPayroll?: number;
  savings?: number;
  reinvestment?: number;
  [key: string]: any;
}

export default function Dashboard({ data, onRefresh }) {
  const { toast } = useToast();
  const [salesData, setSalesData] = useState([]);
  const [expensesData, setExpensesData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sales, expenses] = await Promise.all([
          getSales(),
          getExpenses(),
        ]);
        setSalesData(sales);
        setExpensesData(expenses);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch data from Google Sheets",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast]);

  // Calculate employee shares from sales data
  const employeeShares = salesData.reduce((acc, sale) => {
    const employee = sale.employee;
    const existing = acc.find((e) => e.employee === employee);
    if (existing) {
      existing.totalShare += (sale.total * 6.944) / 100; // Sales + Packaging payroll
      existing.salesCount += 1;
    } else {
      acc.push({
        employee,
        totalShare: (sale.total * 6.944) / 100,
        salesCount: 1,
      });
    }
    return acc;
  }, []);

  <Card className="bg-card border-border">
    <CardHeader>
      <CardTitle className="text-base">Employee Shares</CardTitle>
      <CardDescription>Share distribution by employee</CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={employeeShares}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="employee" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
            }}
          />
          <Bar dataKey="totalShare" fill="#06b6d4" name="Total Share (GHS)" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>;

  const handleExportSales = async () => {
    try {
      if (!salesData || salesData.length === 0) {
        toast({
          title: "No Data",
          description: "No sales data available to export",
          variant: "destructive",
        });
        return;
      }

      const csv = generateSalesCSV(salesData);
      const filename = `sales_${new Date().toISOString().split("T")[0]}.csv`;

      // Create a blob and download link
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Sales report exported successfully",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Failed to export sales report",
        variant: "destructive",
      });
    }
  };

  const handleExportExpenses = async () => {
    try {
      const csv = generateExpensesCSV(expensesData);
      const filename = `expenses_${new Date().toISOString().split("T")[0]}.csv`;
      downloadCSV(csv, filename);
      toast({
        title: "Success",
        description: "Expenses report exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export expenses report",
        variant: "destructive",
      });
    }
  };

  // Transform salesData into monthly totals for charting
  const monthlyData = [...salesData, ...expensesData].reduce((acc, entry) => {
    const month = new Date(entry.date || entry.Date).toLocaleString("default", {
      month: "short",
    });
    const existing = acc.find((d) => d.month === month);
    if (existing) {
      if (entry.total) {
        // Sales data
        existing.sales += entry.total;
      }
      if (entry.amount) {
        // Expenses data
        existing.expenses += entry.amount;
      }
    } else {
      acc.push({
        month,
        sales: entry.total || 0,
        expenses: entry.amount || 0,
      });
    }
    return acc;
  }, []);

  // Transform expensesData to accumulate by category
  const expenseData = expensesData.reduce((acc, exp) => {
    const existing = acc.find((item) => item.name === exp.category);
    if (existing) {
      existing.value += exp.amount;
    } else {
      acc.push({ name: exp.category, value: exp.amount });
    }
    return acc;
  }, []);

  // Calculate fund totals from sales data instead of using props
  const fundTotals = salesData.reduce(
    (acc: Record<string, number>, sale: Sale) => {
      const total = sale.total || 0;
      // Always calculate from total, ignore stored values
      acc.productionCost += (total * 63) / 100;
      acc.investorShare += (total * 12) / 100; // Force recalculation
      acc.salesPayroll += (total * 6.944) / 100;
      acc.packagingPayroll += (total * 6.944) / 100;
      acc.savings += (total * 5.556) / 100;
      acc.reinvestment += (total * 5.556) / 100;
      return acc;
    },
    {
      productionCost: 0,
      investorShare: 0,
      salesPayroll: 0,
      packagingPayroll: 0,
      savings: 0,
      reinvestment: 0,
    },
  );

  const fundData = [
    {
      name: "Production Cost",
      value: fundTotals.productionCost.toFixed(2),
      fill: "#f59e0b",
    },
    {
      name: "Investor Share",
      value: fundTotals.investorShare.toFixed(2),
      fill: "#8b5cf6",
    },
    {
      name: "Sales Payroll",
      value: fundTotals.salesPayroll.toFixed(2),
      fill: "#06b6d4",
    },
    {
      name: "Packaging Payroll",
      value: fundTotals.packagingPayroll.toFixed(2),
      fill: "#06b6d4",
    },
    {
      name: "Savings",
      value: fundTotals.savings.toFixed(2),
      fill: "#10b981",
    },
    {
      name: "Reinvestment",
      value: fundTotals.reinvestment.toFixed(2),
      fill: "#10b981",
    },
  ];

  // Convert string values to numbers for the chart
  const numericFundData = fundData.map((item) => ({
    ...item,
    value: parseFloat(item.value),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-semibold text-foreground">
          Financial Overview
        </h2>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={onRefresh} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportSales} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Sales CSV
          </Button>
          <Button onClick={handleExportExpenses} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Expenses CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Sales vs Expenses */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Sales vs Expenses</CardTitle>
            <CardDescription>Monthly trend analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Sales"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Expenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Employee Shares */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Employee Shares</CardTitle>
            <CardDescription>Share distribution by employee</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeShares}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="employee" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                  }}
                />
                <Bar
                  dataKey="totalShare"
                  fill="#06b6d4"
                  name="Total Share (GHS)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Fund Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Fund Distribution</CardTitle>
            <CardDescription>Money split from sales</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={numericFundData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) =>
                    `${name}: GHS ${value.toFixed(2)}`
                  }
                  outerRadius={100}
                  dataKey="value"
                >
                  {numericFundData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <InvestorProgress salesData={salesData} />
        {/* Expense Breakdown */}
        <Card className="bg-card border-border col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Expense Breakdown</CardTitle>
            <CardDescription>Spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                  }}
                />
                <Bar dataKey="value" fill="#f59e0b" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

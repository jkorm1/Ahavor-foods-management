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
  const monthlyData = salesData.reduce((acc, sale) => {
    const month = new Date(sale.date).toLocaleString("default", {
      month: "short",
    });
    const existing = acc.find((d) => d.month === month);
    if (existing) {
      existing.sales += sale.total;
    } else {
      acc.push({ month, sales: sale.total, expenses: 0 });
    }
    return acc;
  }, []);

  // Map expensesData into chart‑friendly format
  const expenseData = expensesData.map((exp) => ({
    name: exp.category,
    value: exp.amount,
  }));

  const fundData = [
    {
      name: "Business Fund",
      value: (data?.businessFund || 0).toFixed(2),
      fill: "#f59e0b",
    },
    {
      name: "Employee Share",
      value: (data?.employeeShare || 0).toFixed(2),
      fill: "#06b6d4",
    },
    {
      name: "Investor Share",
      value: (data?.investorShare || 0).toFixed(2),
      fill: "#8b5cf6",
    },
    {
      name: "Savings",
      value: (data?.savings || 0).toFixed(2),
      fill: "#10b981",
    },
  ];

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
              <BarChart data={data?.employeeShares || []}>
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
                  data={fundData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: GHS ${value}`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {fundData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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

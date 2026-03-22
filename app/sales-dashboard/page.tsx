"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface SalesData {
  id: string;
  date: string;
  employee: string;
  product: string;
  quantity: number;
  price: number;
  total: number;
  event: string;
}

export default function SalesDashboardPage() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const { userName } = useAuth();

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await fetch("/api/sales");
      const data = await response.json();
      setSalesData(data);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate sales metrics
  const totalSales = salesData.reduce((sum, sale) => sum + sale.total, 0);
  const totalQuantity = salesData.reduce((sum, sale) => sum + sale.quantity, 0);

  // Get sales by employee
  const salesByEmployee = salesData.reduce(
    (acc, sale) => {
      if (!acc[sale.employee]) {
        acc[sale.employee] = { total: 0, quantity: 0, count: 0 };
      }
      acc[sale.employee].total += sale.total;
      acc[sale.employee].quantity += sale.quantity;
      acc[sale.employee].count += 1;
      return acc;
    },
    {} as Record<string, { total: number; quantity: number; count: number }>,
  );

  // Convert to array and sort by total sales
  const employeeSalesData = Object.entries(salesByEmployee)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total);

  // Prepare data for pie chart
  const pieChartData = employeeSalesData.map((employee) => ({
    name: employee.name,
    value: employee.total,
  }));

  // Colors for pie chart
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sales Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {userName}! Here's an overview of sales performance.
        </p>
      </div>

      {loading ? (
        <p>Loading sales data...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  GHS {totalSales.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Quantity Sold
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalQuantity}</div>
              </CardContent>
            </Card>
          </div>

          {/* Sales by Employee */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Employee</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `GHS ${value.toFixed(2)}`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Employee</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employeeSalesData.map((employee, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {employee.count} transactions
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          GHS {employee.total.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {employee.quantity} items
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

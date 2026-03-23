"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/auth-context";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
  BarChart,
  Bar,
} from "recharts";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
} from "date-fns";

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
      if (!response.ok) {
        throw new Error("Failed to fetch sales data");
      }
      const data = await response.json();
      console.log("Fetched sales data:", data); // Debug log
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

  // Define sales targets
  const SALES_TARGET = 500000; // GHS
  const UNITS_TARGET = 20000; // units

  // Calculate progress percentages
  const salesPercentage = Math.min((totalSales / SALES_TARGET) * 100, 100);
  const unitsPercentage = Math.min((totalQuantity / UNITS_TARGET) * 100, 100);

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

  // Colors for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  // Get sales by product
  const salesByProduct = salesData.reduce(
    (acc, sale) => {
      if (!acc[sale.product]) {
        acc[sale.product] = { total: 0, quantity: 0, count: 0 };
      }
      acc[sale.product].total += sale.total;
      acc[sale.product].quantity += sale.quantity;
      acc[sale.product].count += 1;
      return acc;
    },
    {} as Record<string, { total: number; quantity: number; count: number }>,
  );

  // Convert to array and sort by total sales
  const productSalesData = Object.entries(salesByProduct)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total);

  // Get today's date
  const today = new Date();

  // Get daily sales (today)
  const todayString = format(today, "yyyy-MM-dd");
  const dailySales = salesData
    .filter((sale) => sale.date === todayString)
    .reduce((sum, sale) => sum + sale.total, 0);

  const dailySalesByProduct = salesData
    .filter((sale) => sale.date === todayString)
    .reduce(
      (acc, sale) => {
        if (!acc[sale.product]) {
          acc[sale.product] = { total: 0, quantity: 0 };
        }
        acc[sale.product].total += sale.total;
        acc[sale.product].quantity += sale.quantity;
        return acc;
      },
      {} as Record<string, { total: number; quantity: number }>,
    );

  const dailyProductData = Object.entries(dailySalesByProduct)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total);

  // Get monthly sales (current month)
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);

  const monthlySales = salesData
    .filter((sale) => {
      const saleDate = parseISO(sale.date);
      return saleDate >= currentMonthStart && saleDate <= currentMonthEnd;
    })
    .reduce((sum, sale) => sum + sale.total, 0);

  const monthlySalesByProduct = salesData
    .filter((sale) => {
      const saleDate = parseISO(sale.date);
      return saleDate >= currentMonthStart && saleDate <= currentMonthEnd;
    })
    .reduce(
      (acc, sale) => {
        if (!acc[sale.product]) {
          acc[sale.product] = { total: 0, quantity: 0 };
        }
        acc[sale.product].total += sale.total;
        acc[sale.product].quantity += sale.quantity;
        return acc;
      },
      {} as Record<string, { total: number; quantity: number }>,
    );

  const monthlyProductData = Object.entries(monthlySalesByProduct)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total);

  // Find the earliest and latest sale dates to determine the chart range
  let earliestDate = new Date();
  let latestDate = new Date();

  if (salesData.length > 0) {
    const dates = salesData
      .map((sale) => parseISO(sale.date))
      .filter((date) => !isNaN(date.getTime()));
    if (dates.length > 0) {
      earliestDate = new Date(Math.min(...dates.map((date) => date.getTime())));
      latestDate = new Date(Math.max(...dates.map((date) => date.getTime())));
    }
  }

  // Get monthly performance data for the line chart
  const months = eachMonthOfInterval({
    start: startOfMonth(earliestDate),
    end: endOfMonth(latestDate),
  });

  const monthlyPerformanceData = months.map((month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    const monthSales = salesData
      .filter((sale) => {
        const saleDate = parseISO(sale.date);
        return saleDate >= monthStart && saleDate <= monthEnd;
      })
      .reduce((sum, sale) => sum + sale.total, 0);

    return {
      month: format(month, "MMM yyyy"),
      sales: monthSales,
    };
  });

  // Colors for line chart
  const LINE_COLORS = [
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today's Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  GHS {dailySales.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  This Month's Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  GHS {monthlySales.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Progress Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Annual Sales Target Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Target: GHS {SALES_TARGET.toLocaleString()}</span>
                    <span className="font-medium">
                      {salesPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={salesPercentage} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      Current: GHS{" "}
                      {totalSales.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span>
                      Remaining: GHS{" "}
                      {(SALES_TARGET - totalSales).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Annual Units Target Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Target: {UNITS_TARGET.toLocaleString()} units</span>
                    <span className="font-medium">
                      {unitsPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={unitsPercentage} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Current: {totalQuantity.toLocaleString()} units</span>
                    <span>
                      Remaining:{" "}
                      {(UNITS_TARGET - totalQuantity).toLocaleString()} units
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Performance Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyPerformanceData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorSales"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#0088FE"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#0088FE"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={{ stroke: "#e2e8f0" }}
                    />
                    <YAxis
                      tick={{ fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={{ stroke: "#e2e8f0" }}
                    />
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />
                    <Tooltip
                      formatter={(value) => `GHS ${value.toFixed(2)}`}
                      contentStyle={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#0088FE"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSales)"
                      activeDot={{
                        r: 8,
                        stroke: "#0088FE",
                        strokeWidth: 2,
                        fill: "#fff",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sales by Employee and Product */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Employee</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={employeeSalesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#64748b" }}
                        axisLine={{ stroke: "#e2e8f0" }}
                        tickLine={{ stroke: "#e2e8f0" }}
                      />
                      <YAxis
                        tick={{ fill: "#64748b" }}
                        axisLine={{ stroke: "#e2e8f0" }}
                        tickLine={{ stroke: "#e2e8f0" }}
                      />
                      <Tooltip
                        formatter={(value) => `GHS ${value.toFixed(2)}`}
                        contentStyle={{
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="total"
                        fill="#0088FE"
                        radius={[8, 8, 0, 0]}
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Product</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productSalesData.map((product) => ({
                          name: product.name,
                          value: product.total,
                        }))}
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
                        {productSalesData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `GHS ${value.toFixed(2)}`}
                        contentStyle={{
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily and Monthly Product Sales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Product Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dailyProductData.length > 0 ? (
                    dailyProductData.map((product, index) => (
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
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.quantity} items
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            GHS {product.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No sales today yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>This Month's Product Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyProductData.length > 0 ? (
                    monthlyProductData.map((product, index) => (
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
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.quantity} items
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            GHS {product.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      No sales this month yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

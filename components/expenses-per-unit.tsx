"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

interface Expense {
  category: string;
  amount: number;
  date: string;
  description: string;
}

interface Sale {
  id: string;
  date: string;
  employee: string;
  product: string;
  quantity: number;
  price: number;
  total: number;
  event: string;
}

interface ExpensesPerUnitProps {
  expensesData: Expense[];
  salesData: Sale[];
}

export default function ExpensesPerUnit({
  expensesData,
  salesData,
}: ExpensesPerUnitProps) {
  // Calculate total quantity of all popcorn sold
  const totalPopcornQuantity = salesData.reduce(
    (sum, sale) => sum + sale.quantity,
    0,
  );

  // Calculate expenses per unit of popcorn
  const expensesPerUnit = expensesData.reduce(
    (acc, expense) => {
      const category = expense.category;
      const amount = expense.amount;

      // First, aggregate expenses by category
      const existing = acc.find((item) => item.category === category);
      if (existing) {
        existing.totalAmount += amount;
      } else {
        acc.push({
          category,
          totalAmount: amount,
          costPerUnit: 0, // Will calculate after aggregation
        });
      }
      return acc;
    },
    [] as Array<{ category: string; totalAmount: number; costPerUnit: number }>,
  );

  // Now calculate cost per unit for each category after aggregation
  expensesPerUnit.forEach((expense) => {
    expense.costPerUnit =
      totalPopcornQuantity > 0 ? expense.totalAmount / totalPopcornQuantity : 0;
  });

  // Calculate total cost per unit by summing all expense categories
  const totalCostPerUnit = expensesPerUnit.reduce(
    (sum, expense) => sum + expense.costPerUnit,
    0,
  );

  // Calculate average selling price per unit
  const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total, 0);
  const averageSellingPrice =
    totalPopcornQuantity > 0 ? totalRevenue / totalPopcornQuantity : 0;

  // Calculate percentage of total cost relative to selling price
  const costPercentage =
    averageSellingPrice > 0
      ? (totalCostPerUnit / averageSellingPrice) * 100
      : 0;

  // Calculate profit per unit and profit margin
  const profitPerUnit = averageSellingPrice - totalCostPerUnit;
  const profitMargin =
    averageSellingPrice > 0 ? (profitPerUnit / averageSellingPrice) * 100 : 0;

  // Create chart data with expense categories and selling price
  const chartData = expensesPerUnit.map((expense) => ({
    category: expense.category,
    costPerUnit: expense.costPerUnit,
    sellingPrice: averageSellingPrice,
  }));

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base">Expenses vs. Price per Unit</CardTitle>
        <CardDescription>
          Cost breakdown compared to selling price
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="category" stroke="#9ca3af" />
            <YAxis
              stroke="#9ca3af"
              domain={[0, "dataMax + 1"]}
              tickFormatter={(value) => `GHS ${value.toFixed(2)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
              }}
              formatter={(value, name) => {
                if (name === "costPerUnit") {
                  return [`GHS ${value.toFixed(2)}`, "Cost per Unit"];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Bar
              dataKey="costPerUnit"
              fill="#ef4444"
              name="Cost per Unit (GHS)"
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Total Popcorn Sold: {totalPopcornQuantity} units
          </p>
          <p className="text-sm text-muted-foreground">
            Total Production Cost: GHS{" "}
            {expensesPerUnit
              .reduce((sum, expense) => sum + expense.totalAmount, 0)
              .toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            Total Cost per Unit: GHS {totalCostPerUnit.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            Average Selling Price: GHS {averageSellingPrice.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            Profit per Unit: GHS {profitPerUnit.toFixed(2)}
          </p>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">
            Cost Breakdown per Unit:
          </h4>
          <div className="space-y-1">
            {expensesPerUnit.map((expense) => (
              <div key={expense.category} className="flex items-center text-sm">
                <div className="flex-1 min-w-0">
                  <span>{expense.category}:</span>
                </div>
                <div className="flex items-center flex-1 min-w-0 px-2">
                  <div className="flex-grow border-t border-dashed border-gray-400"></div>
                  <span className="ml-2">
                    GHS {expense.costPerUnit.toFixed(2)} per unit
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <h4 className="text-base font-semibold">Total Cost per Unit:</h4>
            <span className="text-lg font-bold text-accent">
              GHS {totalCostPerUnit.toFixed(2)} per unit (
              {costPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <h4 className="text-base font-semibold">Average Selling Price:</h4>
            <span className="text-lg font-bold text-green-500">
              GHS {averageSellingPrice.toFixed(2)} per unit (100%)
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <h4 className="text-base font-semibold">Profit per Unit:</h4>
            <span className="text-lg font-bold text-blue-500">
              GHS {profitPerUnit.toFixed(2)} per unit ({profitMargin.toFixed(1)}
              %)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

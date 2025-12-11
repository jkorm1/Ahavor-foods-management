"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { validateExpense } from "@/lib/validation";

interface ExpenseItem {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: string;
}

const expenseCategories = [
  "Flour",
  "Milk",
  "Soya",
  "Package",
  "Flavour",
  "Cups",
  "Tissue",
  "Packaging",
  "Transport",
  "Electricity",
  "Stand",
  "Utilities",
  "Others",
];

const getCurrentDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ExpensesForm({ onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    {
      id: "1",
      date: getCurrentDate(),
      category: "Maize",
      description: "",
      amount: "",
    },
  ]);

  const addExpense = () => {
    setExpenses((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        date: getCurrentDate(),
        category: "Maize",
        description: "",
        amount: "",
      },
    ]);
  };

  const removeExpense = (id: string) => {
    if (expenses.length > 1) {
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    }
  };

  const updateExpense = (
    id: string,
    field: keyof ExpenseItem,
    value: string
  ) => {
    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === id ? { ...expense, [field]: value } : expense
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all expenses
    const validationErrors = expenses.flatMap((expense) => {
      // Ensure date is valid before validation
      const validExpense = {
        ...expense,
        date: expense.date || getCurrentDate(),
      };
      return validateExpense(validExpense);
    });

    if (validationErrors.length > 0) {
      const errorMap = validationErrors.reduce((acc, err) => {
        acc[`${err.field}-${err.id}`] = err.message;
        return acc;
      }, {} as Record<string, string>);
      setErrors(errorMap);
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Send each expense individually
      const promises = expenses.map(async (expense) => {
        const response = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expense),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to record expense: ${expense.description || "Unknown"}`
          );
        }
        return response.json();
      });

      await Promise.all(promises);

      toast({
        title: "Success",
        description: `Successfully recorded ${expenses.length} expense(s)`,
      });
      setExpenses([
        {
          id: "1",
          date: getCurrentDate(),
          category: "Maize",
          description: "",
          amount: "",
        },
      ]);
      setErrors({});
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to record expenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border max-w-2xl">
      <CardHeader>
        <CardTitle>Record Expenses</CardTitle>
        <CardDescription>Add one or multiple business expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {expenses.map((expense, index) => (
            <div key={expense.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Expense #{index + 1}</h3>
                {expenses.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeExpense(expense.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`date-${expense.id}`}>Date</Label>
                  <Input
                    id={`date-${expense.id}`}
                    type="date"
                    value={expense.date}
                    onChange={(e) =>
                      updateExpense(expense.id, "date", e.target.value)
                    }
                    className="bg-input border-border"
                    required
                  />
                  {errors[`date-${expense.id}`] && (
                    <p className="text-xs text-destructive">
                      {errors[`date-${expense.id}`]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`category-${expense.id}`}>Category</Label>
                  <select
                    id={`category-${expense.id}`}
                    value={expense.category}
                    onChange={(e) =>
                      updateExpense(expense.id, "category", e.target.value)
                    }
                    className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground"
                  >
                    {expenseCategories.map((cat) => (
                      <option key={cat} value={cat} className="bg-card">
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors[`category-${expense.id}`] && (
                    <p className="text-xs text-destructive">
                      {errors[`category-${expense.id}`]}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${expense.id}`}>Description</Label>
                <Input
                  id={`description-${expense.id}`}
                  type="text"
                  value={expense.description}
                  onChange={(e) =>
                    updateExpense(expense.id, "description", e.target.value)
                  }
                  placeholder="e.g., Weekly supplies"
                  className="bg-input border-border"
                />
                {errors[`description-${expense.id}`] && (
                  <p className="text-xs text-destructive">
                    {errors[`description-${expense.id}`]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`amount-${expense.id}`}>Amount (GHS)</Label>
                <Input
                  id={`amount-${expense.id}`}
                  type="number"
                  step="0.01"
                  value={expense.amount}
                  onChange={(e) =>
                    updateExpense(expense.id, "amount", e.target.value)
                  }
                  placeholder="0"
                  className={`bg-input border-border ${
                    errors[`amount-${expense.id}`] ? "border-destructive" : ""
                  }`}
                  required
                />
                {errors[`amount-${expense.id}`] && (
                  <p className="text-xs text-destructive">
                    {errors[`amount-${expense.id}`]}
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={addExpense}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Another Expense
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-accent hover:bg-accent/90"
            >
              {loading ? "Recording..." : "Record All Expenses"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

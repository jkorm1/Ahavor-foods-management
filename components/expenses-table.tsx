"use client";

import { useState, useEffect } from "react";
import { Expense } from "@/lib/financial-logic";
import { getExpenses } from "@/lib/transaction-store";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

// In components/expenses-table.tsx
// In components/expenses-table.tsx
// In components/expenses-table.tsx
export default function ExpensesTable() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/expenses");
        const result = await response.json();

        if (!response.ok) {
          throw new Error("Failed to fetch expenses");
        }

        // Ensure result is an array
        const expensesData = Array.isArray(result) ? result : [];
        setExpenses(expensesData);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  // Add filtered expenses logic
  const filteredExpenses = expenses.filter((expense) =>
    Object.values(expense).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  if (loading) {
    return <div className="text-center p-4">Loading expenses data...</div>;
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search expenses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  {format(new Date(expense.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>GHS {expense.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

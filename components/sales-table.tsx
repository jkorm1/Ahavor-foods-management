"use client";

import { useState, useEffect } from "react";
import { Sale } from "@/lib/financial-logic";
import { getSales } from "@/lib/transaction-store";
import { Button } from "@/components/ui/button";
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

export default function SalesTable() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Sale>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const loadSales = async () => {
      try {
        const salesData = await getSales();
        setSales(salesData);
      } catch (error) {
        console.error("Failed to load sales:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSales();
  }, []);

  const handleSort = (field: keyof Sale) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedSales = sales
    .filter((sale) =>
      Object.values(sale).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  if (loading) {
    return <div className="text-center p-4">Loading sales data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search sales..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("date")}
              >
                Date{" "}
                {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("employee")}
              >
                Employee{" "}
                {sortField === "employee" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("product")}
              >
                Product{" "}
                {sortField === "product" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("quantity")}
              >
                Quantity{" "}
                {sortField === "quantity" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("price")}
              >
                Price{" "}
                {sortField === "price" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("total")}
              >
                Total{" "}
                {sortField === "total" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>

              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("event")}
              >
                Event{" "}
                {sortField === "event" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>

              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("productionCost")}
              >
                Production Cost{" "}
                {sortField === "productionCost" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("investorShare")}
              >
                Investor Share{" "}
                {sortField === "investorShare" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("salesPayroll")}
              >
                Sales Payroll{" "}
                {sortField === "salesPayroll" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("packagingPayroll")}
              >
                Packaging Payroll{" "}
                {sortField === "packagingPayroll" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("savings")}
              >
                Savings{" "}
                {sortField === "savings" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("reinvestment")}
              >
                Reinvestment{" "}
                {sortField === "reinvestment" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedSales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  {format(new Date(sale.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>{sale.employee}</TableCell>
                <TableCell>{sale.product}</TableCell>
                <TableCell>{sale.quantity}</TableCell>
                <TableCell>GHS {sale.price.toFixed(2)}</TableCell>
                <TableCell>GHS {sale.total.toFixed(2)}</TableCell>
                <TableCell>{sale.event || "Normal"}</TableCell>
                <TableCell>
                  GHS{" "}
                  {sale.productionCost?.toFixed(2) ||
                    (sale.total * 0.63).toFixed(2)}
                </TableCell>
                <TableCell>
                  GHS{" "}
                  {sale.investorShare?.toFixed(2) ||
                    (sale.total * 0.12).toFixed(2)}
                </TableCell>
                <TableCell>
                  GHS{" "}
                  {sale.salesPayroll?.toFixed(2) ||
                    (sale.total * 0.06944).toFixed(2)}
                </TableCell>
                <TableCell>
                  GHS{" "}
                  {sale.packagingPayroll?.toFixed(2) ||
                    (sale.total * 0.06944).toFixed(2)}
                </TableCell>
                <TableCell>
                  GHS{" "}
                  {sale.savings?.toFixed(2) ||
                    (sale.total * 0.05556).toFixed(2)}
                </TableCell>
                <TableCell>
                  GHS{" "}
                  {sale.reinvestment?.toFixed(2) ||
                    (sale.total * 0.05556).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function SalesTablesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Sale>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sales");
      const data = await response.json();
      setSales(data);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sales Records</h1>
        <p className="text-muted-foreground">
          View all sales transactions and performance
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <p>Loading sales data...</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("date")}
                    >
                      Date{" "}
                      {sortField === "date" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
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
                      Unit Price{" "}
                      {sortField === "price" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("total")}
                    >
                      Total{" "}
                      {sortField === "total" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("event")}
                    >
                      Event{" "}
                      {sortField === "event" &&
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
                      <TableCell className="text-blue-600 font-medium">
                        {sale.quantity}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        GHS {sale.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-purple-600 font-semibold">
                        GHS {sale.total.toFixed(2)}
                      </TableCell>
                      <TableCell>{sale.event || "Normal"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
import { validateSale } from "@/lib/validation";

const employees = ["Joseph Korm", "Alvin", "Peter", "Sarah"];

export default function SalesForm({ onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    product: "Classic Popcorn",
    quantity: "",
    price: "",
    employee: employees[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calculate values before submission
    const total = Number(formData.quantity) * Number(formData.price);
    const businessFund = (total * 6) / 10;
    const employeeShare = (total * 1.5) / 10;
    const investorShare = (total * 1.5) / 10;
    const savings = (total * 1) / 10;

    const submissionData = {
      ...formData,
      total: Math.round(total * 100) / 100,
      businessFund: Math.round(businessFund * 100) / 100,
      employeeShare: Math.round(employeeShare * 100) / 100,
      investorShare: Math.round(investorShare * 100) / 100,
      savings: Math.round(savings * 100) / 100,
    };

    setLoading(true);
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Sale recorded successfully",
        });
        setFormData({
          date: new Date().toISOString().split("T")[0],
          product: "Classic Popcorn",
          quantity: "",
          price: "",
          employee: employees[0],
        });
        setErrors({});
        onSuccess();
      } else {
        toast({
          title: "Error",
          description: responseData.error || "Failed to record sale",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record sale",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalSales =
    formData.quantity && formData.price
      ? (
          Number.parseFloat(formData.quantity) *
          Number.parseFloat(formData.price)
        ).toFixed(2)
      : "0.00";

  const businessFund = totalSales
    ? ((Number(totalSales) * 6) / 10).toFixed(2)
    : "0.00";
  const employeeShare = totalSales
    ? ((Number(totalSales) * 1.5) / 10).toFixed(2)
    : "0.00";
  const investorShare = totalSales
    ? ((Number(totalSales) * 1.5) / 10).toFixed(2)
    : "0.00";
  const savings = totalSales
    ? ((Number(totalSales) * 1) / 10).toFixed(2)
    : "0.00";

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Record a Sale</CardTitle>
          <CardDescription>Add a new sales transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="bg-input border-border"
                required
              />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <select
                name="employee"
                value={formData.employee}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              >
                {employees.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Input
                id="product"
                name="product"
                type="text"
                value={formData.product}
                onChange={handleChange}
                className="bg-input border-border"
                required
              />
              {errors.product && (
                <p className="text-xs text-destructive">{errors.product}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                className={`bg-input border-border ${
                  errors.quantity ? "border-destructive" : ""
                }`}
                required
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Unit Price (GHS)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                className={`bg-input border-border ${
                  errors.price ? "border-destructive" : ""
                }`}
                required
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90"
            >
              {loading ? "Recording..." : "Record Sale"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Money Split</CardTitle>
          <CardDescription>Automatic allocation from this sale</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-2">Total Sales</p>
            <p className="text-2xl font-bold text-foreground">
              GHS {totalSales}
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
              <span className="text-sm text-foreground">
                Business Fund (6/10)
              </span>
              <span className="font-semibold text-accent">
                GHS {businessFund}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
              <span className="text-sm text-foreground">
                Employee Share (1.5/10)
              </span>
              <span className="font-semibold text-cyan-400">
                GHS {employeeShare}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
              <span className="text-sm text-foreground">
                Investor Share (1.5/10)
              </span>
              <span className="font-semibold text-purple-400">
                GHS {investorShare}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
              <span className="text-sm text-foreground">Savings (1/10)</span>
              <span className="font-semibold text-green-400">
                GHS {savings}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

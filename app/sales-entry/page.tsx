"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const employees = [
  "Christian Frimpong",
  "Joseph Korm",
  "Kofi Adu Jnr",
  "Taufik Yussif",
];

// Define products with their prices
const PRODUCTS = [
  {
    id: "ahavor-tombrown",
    name: "Ahavor Tombrown",
    price: 25,
  },
  {
    id: "ahavor-oats",
    name: "Ahavor Oats",
    price: 20,
  },
] as const;

export default function SalesEntryPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    productId: "ahavor-tombrown", // Default to first product
    quantity: "",
    employee: employees[0],
    event: "Normal",
    eventName: "",
  });
  const { salesName } = useAuth();

  // Set the employee name to the logged-in sales executive
  useEffect(() => {
    setFormData((prev) => ({ ...prev, employee: salesName }));
  }, [salesName]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductChange = (value: string) => {
    setFormData((prev) => ({ ...prev, productId: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const product = PRODUCTS.find((p) => p.id === formData.productId);
    if (!product) {
      toast({
        title: "Error!",
        description: "Please select a product",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const total = Number(formData.quantity) * product.price;
    const profitPerPiece = 12.0;
    const actualProfit = total * (profitPerPiece / 25.0);

    const submissionData = {
      date: formData.date,
      employee: formData.employee,
      product: product.name,
      price: product.price,
      quantity: formData.quantity,
      event:
        formData.event === "Normal" ? "Normal" : formData.eventName || "Normal",
      total: total,
      productionCost: total - actualProfit,
      tithe: actualProfit * (1.2 / 12.0),
      founderPay: actualProfit * (1.5 / 12.0),
      businessSavings: actualProfit * (1.0 / 12.0),
      leadershipPayroll: actualProfit * (1.0 / 12.0),
      salesPayroll: actualProfit * (2.7 / 12.0),
      salesPayrollSavings: actualProfit * (0.3 / 12.0),
      packagingPayroll: actualProfit * (0.5 / 12.0),
      investorShare: actualProfit * (1.8 / 12.0),
      reinvestment: actualProfit * (2.0 / 12.0),
    };

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your sale has been recorded successfully.",
          variant: "default",
        });
        setFormData({
          date: new Date().toISOString().split("T")[0],
          productId: "ahavor-tombrown",
          quantity: "",
          employee: salesName,
          event: "Normal",
          eventName: "",
        });
      } else {
        toast({
          title: "Error!",
          description:
            responseData.error ||
            "Failed to record your sale. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error!",
        description: "Failed to record your sale. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = PRODUCTS.find((p) => p.id === formData.productId);
  const totalPrice = selectedProduct
    ? selectedProduct.price * Number(formData.quantity)
    : 0;

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Record a Sale</CardTitle>
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
                <Select
                  value={formData.productId}
                  onValueChange={handleProductChange}
                  required
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCTS.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} (GHS {product.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  className="bg-input border-border"
                  required
                />
              </div>

              {selectedProduct && formData.quantity && (
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex justify-between">
                    <span>Price per unit:</span>
                    <span>GHS {selectedProduct.price}</span>
                  </div>
                  <div className="flex justify-between font-bold mt-2">
                    <span>Total:</span>
                    <span>GHS {totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="event">Event Type</Label>
                <select
                  name="event"
                  value={formData.event}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      event: value,
                      eventName: value === "Normal" ? "" : prev.eventName,
                    }));
                  }}
                  className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                >
                  <option value="Normal">Normal Day Sales</option>
                  <option value="Event">Event Sales</option>
                </select>
              </div>

              {formData.event === "Event" && (
                <div className="space-y-2">
                  <Label htmlFor="eventName">Event Name</Label>
                  <Input
                    id="eventName"
                    name="eventName"
                    type="text"
                    value={formData.eventName || ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        eventName: e.target.value,
                      }));
                    }}
                    className="bg-input border-border"
                    placeholder="Enter event name"
                  />
                </div>
              )}

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
      </div>
    </div>
  );
}

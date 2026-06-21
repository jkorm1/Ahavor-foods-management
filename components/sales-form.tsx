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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

const employees = [
  "Adu Owusu",
  "Adu Rockson",
  "Agbenyefia Bella",
  "Ahenkorah Kendra",
  "Amoah Lucy",
  "Ann Blessing",
  "Atibila Patience",
  "Agyekum Shirley",
  "Baafi Perfect Larbi",
  "Benjamin Opoku",
  "Bernice Jesuslina",
  "Boakye Augustine",
  "Boateng Chris",
  "Blankson Benedicta",
  "Clement ADU",
  "Carlin Serwaa",
  "Caroline Darkoa",
  "Christian Frimpong",
  "Darkwa Jireh",
  "Gabriella Alija Mohammed",
  "God'stime Victor",
  "Ibrahim Mohammed",
  "Isaac Boateng",
  "Jennifer Ewuresi",
  "Joseph Korm",
  "Josephine Dankwa",
  "Kofi Andoh",
  "Kwadwo Obeng",
  "Laura Makafui",
  "Marfo Emmanuel",
  "Mensah Bright",
  "Meshack Amponsah",
  "Mukarama Yunus",
  "Nancy Korankye",
  "Nathaniel Obeng",
  "Nyame Lydia",
  "Owusu Bernard",
  "Peace Mensah",
  "Robert Quaicoe",
  "Setordzi",
  "Taufik Yusif",
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

let itemCounter = 0;
function newItem() {
  itemCounter += 1;
  return {
    key: `item-${Date.now()}-${itemCounter}`,
    employee: employees[0],
    productId: "ahavor-tombrown",
    quantity: "",
  };
}

export default function SalesForm({ onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Shared across the whole batch
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [event, setEvent] = useState("Normal");
  const [eventName, setEventName] = useState("");

  // One or more line items, each its own employee/product/quantity
  const [items, setItems] = useState([newItem()]);

  const updateItem = (key: string, field: string, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, newItem()]);
  };

  const removeItem = (key: string) => {
    setItems((prev) =>
      prev.length === 1 ? prev : prev.filter((item) => item.key !== key),
    );
  };

  const calcLineTotal = (item: { productId: string; quantity: string }) => {
    const product = PRODUCTS.find((p) => p.id === item.productId);
    if (!product || !item.quantity) return 0;
    return Number.parseFloat(item.quantity) * product.price;
  };

  const grandTotal = items.reduce((sum, item) => sum + calcLineTotal(item), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate every line item has a product and a quantity > 0
    for (const item of items) {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      if (!product) {
        toast({
          title: "Error!",
          description: "Please select a product for every item.",
          variant: "destructive",
        });
        return;
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        toast({
          title: "Error!",
          description: "Please enter a quantity for every item.",
          variant: "destructive",
        });
        return;
      }
    }

    const eventValue = event === "Normal" ? "Normal" : eventName || "Normal";

    const sales = items.map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.productId)!;
      const total = Number(item.quantity) * product.price;
      const profitPerPiece = 12.0;
      const actualProfit = total * (profitPerPiece / 25.0);

      return {
        date,
        employee: item.employee,
        product: product.name,
        price: product.price,
        quantity: item.quantity,
        event: eventValue,
        total,
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
    });

    setLoading(true);
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sales }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description:
            sales.length > 1
              ? `${sales.length} sales recorded successfully.`
              : "Your sale has been recorded successfully.",
          variant: "default",
        });
        setDate(new Date().toISOString().split("T")[0]);
        setEvent("Normal");
        setEventName("");
        setItems([newItem()]);
        onSuccess();
      } else {
        toast({
          title: "Error!",
          description:
            responseData.error ||
            "Failed to record your sale(s). Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error!",
        description: "Failed to record your sale(s). Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Record Sales</CardTitle>
          <CardDescription>
            Add one or more sales transactions at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Shared fields for the whole batch */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-input border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event">Event Type</Label>
              <select
                name="event"
                value={event}
                onChange={(e) => {
                  setEvent(e.target.value);
                  if (e.target.value === "Normal") setEventName("");
                }}
                className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              >
                <option value="Normal">Normal Day Sales</option>
                <option value="Event">Event Sales</option>
              </select>
            </div>
            {event === "Event" && (
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  id="eventName"
                  name="eventName"
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="bg-input border-border"
                  placeholder="Enter event name"
                />
              </div>
            )}

            <div className="border-t border-border pt-4 space-y-4">
              {items.map((item, index) => {
                const lineTotal = calcLineTotal(item);
                return (
                  <div
                    key={item.key}
                    className="space-y-3 p-3 rounded-md border border-border bg-muted/30 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">
                        Item {index + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          className="text-destructive hover:opacity-70"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Employee</Label>
                      <select
                        value={item.employee}
                        onChange={(e) =>
                          updateItem(item.key, "employee", e.target.value)
                        }
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
                      <Label>Product</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(value) =>
                          updateItem(item.key, "productId", value)
                        }
                      >
                        <SelectTrigger>
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
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.key, "quantity", e.target.value)
                        }
                        placeholder="0"
                        className="bg-input border-border"
                        required
                      />
                    </div>

                    {item.quantity && (
                      <div className="text-sm text-muted-foreground text-right">
                        Line total: GHS {lineTotal.toFixed(2)}
                      </div>
                    )}
                  </div>
                );
              })}

              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Item
              </Button>
            </div>

            {grandTotal > 0 && (
              <div className="bg-muted p-3 rounded-md">
                <div className="flex justify-between font-bold">
                  <span>
                    Grand Total ({items.length} item
                    {items.length > 1 ? "s" : ""}):
                  </span>
                  <span>GHS {grandTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90"
            >
              {loading
                ? "Recording..."
                : items.length > 1
                  ? `Record ${items.length} Sales`
                  : "Record Sale"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Money Split Preview</CardTitle>
          <CardDescription>
            Combined allocation across all items in this batch
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-2">Total Sales</p>
            <p className="text-2xl font-bold text-foreground">
              GHS {grandTotal.toFixed(2)}
            </p>
          </div>
          {(() => {
            const profitPerPiece = 12.0;
            const actualProfit = grandTotal * (profitPerPiece / 25.0);
            const productionCost = (grandTotal - actualProfit).toFixed(2);
            const tithe = (actualProfit * (1.2 / 12.0)).toFixed(2);
            const founderPay = (actualProfit * (1.5 / 12.0)).toFixed(2);
            const businessSavings = (actualProfit * (1.0 / 12.0)).toFixed(2);
            const leadershipPayroll = (actualProfit * (1.0 / 12.0)).toFixed(2);
            const salesPayroll = (actualProfit * (2.7 / 12.0)).toFixed(2);
            const salesPayrollSavings = (actualProfit * (0.3 / 12.0)).toFixed(
              2,
            );
            const packagingPayroll = (actualProfit * (0.5 / 12.0)).toFixed(2);
            const investorShare = (actualProfit * (1.8 / 12.0)).toFixed(2);
            const reinvestment = (actualProfit * (2.0 / 12.0)).toFixed(2);

            return (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
                  <span className="text-sm text-foreground">
                    Production Cost
                  </span>
                  <span className="font-semibold text-accent">
                    GHS {productionCost}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
                  <span className="text-sm text-foreground">
                    Tithe (1.20 GHS/piece)
                  </span>
                  <span className="font-semibold text-red-400">
                    GHS {tithe}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
                  <span className="text-sm text-foreground">
                    Founder Pay (1.50 GHS/piece)
                  </span>
                  <span className="font-semibold text-purple-400">
                    GHS {founderPay}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
                  <span className="text-sm text-foreground">
                    Business Savings (1.00 GHS/piece)
                  </span>
                  <span className="font-semibold text-green-400">
                    GHS {businessSavings}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
                  <span className="text-sm text-foreground">
                    Leadership Payroll (1.00 GHS/piece)
                  </span>
                  <span className="font-semibold text-cyan-400">
                    GHS {leadershipPayroll}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
                  <span className="text-sm text-foreground">
                    Sales Payroll (2.70 GHS/piece)
                  </span>
                  <span className="font-semibold text-cyan-400">
                    GHS {salesPayroll}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
                  <span className="text-sm text-foreground">
                    Sales Payroll Savings (0.30 GHS/piece)
                  </span>
                  <span className="font-semibold text-green-400">
                    GHS {salesPayrollSavings}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
                  <span className="text-sm text-foreground">
                    Packaging Payroll (0.50 GHS/piece)
                  </span>
                  <span className="font-semibold text-cyan-400">
                    GHS {packagingPayroll}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
                  <span className="text-sm text-foreground">
                    Investor Share (1.80 GHS/piece)
                  </span>
                  <span className="font-semibold text-purple-400">
                    GHS {investorShare}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
                  <span className="text-sm text-foreground">
                    Reinvestment (2.00 GHS/piece)
                  </span>
                  <span className="font-semibold text-green-400">
                    GHS {reinvestment}
                  </span>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}

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
  "Clement Adu",
  "Carlin Serwaa",
  "Caroline Darkoa",
  "Christian Frimpong",
  "Darkwa Jireh",
  "David Room",
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
function newItem(defaultEmployee: string = employees[0]) {
  itemCounter += 1;
  return {
    key: `item-${Date.now()}-${itemCounter}`,
    employee: defaultEmployee,
    productId: "ahavor-tombrown" as string,
    quantity: "",
  };
}

export default function SalesEntryPage() {
  const { toast } = useToast();
  const { salesName } = useAuth();
  const [loading, setLoading] = useState(false);

  // Shared fields for the whole batch
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [event, setEvent] = useState("Normal");
  const [eventName, setEventName] = useState("");

  // Line items — each has its own employee, product and quantity
  const [items, setItems] = useState([newItem(salesName || employees[0])]);

  // 在组件内部，newItem函数后添加过滤函数
  const filterEmployees = (employees: string[], searchTerm: string) => {
    if (!searchTerm) return employees;
    return employees.filter((emp) =>
      emp.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  // 在updateItem函数后添加搜索状态管理
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const updateSearchTerm = (key: string, value: string) => {
    setSearchTerms((prev) => ({ ...prev, [key]: value }));
  };

  const updateItem = (key: string, field: string, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addItem = () => {
    // New items default to whatever employee is currently selected in the last row
    const lastEmployee =
      items[items.length - 1]?.employee || salesName || employees[0];
    setItems((prev) => [...prev, newItem(lastEmployee)]);
  };

  const removeItem = (key: string) => {
    setItems((prev) =>
      prev.length === 1 ? prev : prev.filter((item) => item.key !== key),
    );
  };

  const calcLineTotal = (item: { productId: string; quantity: string }) => {
    const product = PRODUCTS.find((p) => p.id === item.productId);
    if (!product || !item.quantity) return 0;
    return parseFloat(item.quantity) * product.price;
  };

  const grandTotal = items.reduce((sum, item) => sum + calcLineTotal(item), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate every line
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
          description: "Please enter a quantity greater than 0 for every item.",
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
        // Reset form
        setDate(new Date().toISOString().split("T")[0]);
        setEvent("Normal");
        setEventName("");
        setItems([newItem(salesName || employees[0])]);
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
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Record Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Shared: date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-input border-border"
                  required
                />
              </div>

              {/* Shared: event */}
              <div className="space-y-2">
                <Label>Event Type</Label>
                <select
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
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="bg-input border-border"
                    placeholder="Enter event name"
                  />
                </div>
              )}

              {/* Line items */}
              <div className="border-t border-border pt-4 space-y-4">
                {items.map((item, index) => {
                  const lineTotal = calcLineTotal(item);
                  return (
                    <div
                      key={item.key}
                      className="space-y-3 p-3 rounded-md border border-border bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
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
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="Search employee..."
                            value={searchTerms[item.key] ?? item.employee}
                            onChange={(e) => {
                              updateSearchTerm(item.key, e.target.value);
                              setOpenDropdown(item.key);
                            }}
                            onFocus={() => {
                              updateSearchTerm(item.key, "");
                              setOpenDropdown(item.key);
                            }}
                            onBlur={() => {
                              // slight delay so the click on a list item registers first
                              setTimeout(() => setOpenDropdown(null), 150);
                            }}
                            className="bg-input border-border"
                          />
                          {openDropdown === item.key && (
                            <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-md border border-border bg-popover shadow-md">
                              {filterEmployees(
                                employees,
                                searchTerms[item.key] || "",
                              ).map((emp) => (
                                <div
                                  key={emp}
                                  onMouseDown={(e) => {
                                    e.preventDefault(); // prevents blur firing before click
                                    updateItem(item.key, "employee", emp);
                                    updateSearchTerm(item.key, emp);
                                    setOpenDropdown(null);
                                  }}
                                  className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                >
                                  {emp}
                                </div>
                              ))}
                              {filterEmployees(
                                employees,
                                searchTerms[item.key] || "",
                              ).length === 0 && (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                  No matches
                                </div>
                              )}
                            </div>
                          )}
                        </div>
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
                  Add Another Sale
                </Button>
              </div>

              {/* Grand total summary */}
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
      </div>
    </div>
  );
}

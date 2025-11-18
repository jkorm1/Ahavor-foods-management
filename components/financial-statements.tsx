"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FinancialStatements({ data }) {
  const grossProfit = (data?.totalSales || 0) - (data?.costOfGoods || 0);
  const netProfit = grossProfit - (data?.totalExpenses || 0);
  const totalAssets = (data?.businessFund || 0) + (data?.cash || 0);
  const totalLiabilities = data?.ownerWithdrawals || 0;
  const ownerEquity = totalAssets - totalLiabilities;

  return (
    <Tabs defaultValue="income" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-muted border border-border">
        <TabsTrigger value="income" className="text-xs md:text-sm">
          Income Statement
        </TabsTrigger>
        <TabsTrigger value="balance" className="text-xs md:text-sm">
          Balance Sheet
        </TabsTrigger>
        <TabsTrigger value="cashflow" className="text-xs md:text-sm">
          Cash Flow
        </TabsTrigger>
        <TabsTrigger value="equity" className="text-xs md:text-sm">
          Owner Equity
        </TabsTrigger>
      </TabsList>

      <TabsContent value="income" className="mt-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Income Statement (Profit & Loss)</CardTitle>
            <CardDescription>For the current period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between p-3 border-b border-border">
                <span className="text-foreground">Total Sales</span>
                <span className="font-semibold text-accent">
                  GHS {data?.totalSales || 0}
                </span>
              </div>
              <div className="flex justify-between p-3 border-b border-border">
                <span className="text-foreground">Cost of Goods Sold</span>
                <span className="font-semibold text-destructive">
                  - GHS {data?.costOfGoods || 0}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-muted rounded font-semibold mb-4">
                <span className="text-foreground">Gross Profit</span>
                <span className="text-accent">GHS {grossProfit}</span>
              </div>
              <div className="flex justify-between p-3 border-b border-border">
                <span className="text-foreground">Total Expenses</span>
                <span className="font-semibold text-destructive">
                  - GHS {data?.totalExpenses || 0}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-accent/10 rounded border border-accent/50">
                <span className="text-foreground font-semibold">
                  Net Profit
                </span>
                <span
                  className={`font-bold text-lg ${
                    netProfit >= 0 ? "text-green-500" : "text-destructive"
                  }`}
                >
                  GHS {netProfit}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="balance" className="mt-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Balance Sheet</CardTitle>
            <CardDescription>Assets, Liabilities & Equity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-foreground mb-4 pb-2 border-b border-border">
                  Assets
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-2">
                    <span className="text-muted-foreground">Business Fund</span>
                    <span className="text-foreground">
                      GHS {data?.businessFund || 0}
                    </span>
                  </div>
                  <div className="flex justify-between p-2">
                    <span className="text-muted-foreground">Cash Balance</span>
                    <span className="text-foreground">
                      GHS {data?.cash || 0}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded font-semibold">
                    <span className="text-foreground">Total Assets</span>
                    <span className="text-accent">GHS {totalAssets}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-4 pb-2 border-b border-border">
                  Liabilities & Equity
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-2">
                    <span className="text-muted-foreground">
                      Owner's Withdrawals
                    </span>
                    <span className="text-destructive">
                      GHS {data?.ownerWithdrawals || 0}
                    </span>
                  </div>
                  <div className="flex justify-between p-2">
                    <span className="text-muted-foreground">Employee Fund</span>
                    <span className="text-foreground">
                      GHS {data?.employeeShare || 0}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-accent/10 rounded font-semibold">
                    <span className="text-foreground">Owner's Equity</span>
                    <span
                      className={
                        ownerEquity >= 0 ? "text-green-500" : "text-destructive"
                      }
                    >
                      GHS {ownerEquity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cashflow" className="mt-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Cash Flow Statement</CardTitle>
            <CardDescription>Cash movements during the period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded border border-border">
                <h4 className="font-semibold text-foreground mb-3">
                  Operating Activities
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Sales collected
                    </span>
                    <span className="text-accent">
                      + GHS {data?.totalSales || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expenses paid</span>
                    <span className="text-destructive">
                      - GHS {data?.totalExpenses || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded border border-border">
                <h4 className="font-semibold text-foreground mb-3">
                  Financing Activities
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Owner withdrawals
                    </span>
                    <span className="text-destructive">
                      - GHS {data?.ownerWithdrawals || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Owner repayments
                    </span>
                    <span className="text-green-500">+ GHS 0</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="equity" className="mt-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Statement of Owner's Equity</CardTitle>
            <CardDescription>Changes in owner's capital</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between p-3 border-b border-border">
                <span className="text-foreground">Opening Capital</span>
                <span className="font-semibold">GHS 0</span>
              </div>
              <div className="flex justify-between p-3 border-b border-border">
                <span className="text-foreground">Add: Net Profit</span>
                <span className="font-semibold text-green-500">
                  + GHS {netProfit > 0 ? netProfit : 0}
                </span>
              </div>
              <div className="flex justify-between p-3 border-b border-border">
                <span className="text-foreground">Less: Withdrawals</span>
                <span className="font-semibold text-destructive">
                  - GHS {data?.ownerWithdrawals || 0}
                </span>
              </div>
              <div className="flex justify-between p-3 border-b border-border">
                <span className="text-foreground">Add: Repayments</span>
                <span className="font-semibold text-green-500">+ GHS 0</span>
              </div>
              <div className="flex justify-between p-3 bg-accent/10 rounded border border-accent/50">
                <span className="text-foreground font-semibold">
                  Closing Capital
                </span>
                <span
                  className={`font-bold text-lg ${
                    ownerEquity >= 0 ? "text-green-500" : "text-destructive"
                  }`}
                >
                  GHS {ownerEquity}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";

const TARGET_AMOUNT = 15000;
const MONTHLY_TARGET = 2250;

export default function InvestorProgress({
  currentAmount,
}: {
  currentAmount: number;
}) {
  const { investorName } = useAuth();
  const [loading, setLoading] = useState(true);
  const percentage = Math.min((currentAmount / TARGET_AMOUNT) * 100, 100);
  const monthlyPercentage = Math.min(
    (currentAmount / MONTHLY_TARGET) * 100,
    100
  );

  useEffect(() => {
    setLoading(false);
  }, [currentAmount]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          Investment Progress
          {investorName && (
            <span className="ml-2 text-sm text-muted-foreground">
              ({investorName})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Investment</span>
                <span className="font-medium">
                  GHS {currentAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Target Amount</span>
                <span className="font-medium">
                  GHS {TARGET_AMOUNT.toFixed(2)}
                </span>
              </div>
              <Progress value={percentage} className="w-full" />
              <div className="text-sm text-muted-foreground">
                {percentage.toFixed(1)}% of target reached
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Target</span>
                <span className="font-medium">
                  GHS {MONTHLY_TARGET.toFixed(2)}
                </span>
              </div>
              <Progress value={monthlyPercentage} className="w-full" />
              <div className="text-sm text-muted-foreground">
                {monthlyPercentage.toFixed(1)}% of monthly target
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

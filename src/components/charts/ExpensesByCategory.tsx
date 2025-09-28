
import { useMemo } from "react";
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Reminder } from "@/components/cards/ReminderCard";

interface ExpensesByCategoryProps {
  reminders: Reminder[];
}

export function ExpensesByCategory({ reminders }: ExpensesByCategoryProps) {
  const chartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    reminders.forEach((reminder) => {
      // Annualize cost for monthly expenses
      const annualCost = 
        reminder.frequency === 'Monthly' 
          ? reminder.cost * 12 
          : reminder.cost;
          
      if (categoryTotals[reminder.category]) {
        categoryTotals[reminder.category] += annualCost;
      } else {
        categoryTotals[reminder.category] = annualCost;
      }
    });
    
    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total: parseFloat(total.toFixed(2))
    }));
  }, [reminders]);
  
  const chartConfig = {
    "Insurance": { color: "#8B5CF6" },
    "Internet & Streaming TV": { color: "#D946EF" },
    "Mobile Plan": { color: "#F97316" },
    "Vehicle MOT & Tax": { color: "#0EA5E9" },
    "Subscription": { color: "#1EAEDB" },
    "default": { color: "#9b87f5" }
  };

  // Format currency based on the first reminder's currency or fallback to £
  const currencySymbol = reminders[0]?.currency || '£';
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Annual Expenses by Category</CardTitle>
        <CardDescription>
          Breakdown of your annual expenses across all categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${currencySymbol}${value}`}
              />
              <Tooltip 
                content={({ active, payload }) => (
                  <ChartTooltipContent 
                    active={active}
                    payload={payload}
                    formatter={(value) => `${currencySymbol}${value}`}
                  />
                )}
              />
              <Bar dataKey="total" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

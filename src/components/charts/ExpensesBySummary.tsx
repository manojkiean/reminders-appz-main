import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Reminder } from "@/components/cards/ReminderCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { CategoryType } from "@/components/icons/CategoryIcon";

interface ExpensesSummaryProps {
  reminders: Reminder[];
}

export function ExpensesBySummary({ reminders }: ExpensesSummaryProps) {
  const [activeTab, setActiveTab] = useState("weekly");
  const [chartData, setChartData] = useState<any[]>([]);
  const { user } = useAuth();
  const [userCurrency, setUserCurrency] = useState("£");
  
  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata || {};
      const preferredCurrency = metadata.preferred_currency || "GBP";
      setUserCurrency(getCurrencySymbol(preferredCurrency));
    }
  }, [user]);
  
  const getCurrencySymbol = (currencyCode: string): string => {
    switch (currencyCode) {
      case "INR": return "₹";
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "JPY": return "¥";
      case "CAD": return "C$";
      case "AUD": return "A$";
      default: return "£";
    }
  };
  
  // Define consistent colors for categories
  const CATEGORY_COLORS: Record<string, string> = {
    "Mobile Plan": "#0088FE", // Blue
    "Insurance": "#00C49F", // Green
    "Energy Plan": "#FFBB28", // Yellow
    "Loan": "#FF8042", // Orange
    "Finance": "#9b87f5", // Purple
    "Vehicle MOT & Tax": "#D946EF", // Magenta
    "Licence": "#0EA5E9", // Sky Blue
    "Travel": "#F97316", // Bright Orange
    "Internet & Streaming TV": "#1EAEDB", // Bright Blue
    "Subscription": "#8B5CF6", // Vivid Purple
    "Pet": "#FEC6A1", // Soft Orange
    "Health": "#D3E4FD", // Soft Blue
    "Custom": "#8E9196", // Neutral Gray
  };
  
  useEffect(() => {
    // Only process active reminders
    const activeReminders = reminders.filter(r => r.active);
    
    // Transform frequency to comparable costs
    const transformedData = activeReminders.map(reminder => {
      let multiplier = 1;
      switch (reminder.frequency) {
        case "Monthly":
          multiplier = activeTab === "weekly" ? 0.25 : activeTab === "monthly" ? 1 : 12;
          break;
        case "Quartely":
          multiplier = activeTab === "weekly" ? 0.083 : activeTab === "monthly" ? 0.333 : 4;
          break;
        case "Half Yearly":
          multiplier = activeTab === "weekly" ? 0.042 : activeTab === "monthly" ? 0.167 : 2;
          break;
        case "Yearly":
          multiplier = activeTab === "weekly" ? 0.021 : activeTab === "monthly" ? 0.083 : 1;
          break;
      }
      return {
        ...reminder,
        adjustedCost: reminder.cost * multiplier,
      };
    });
    
    // Group by category and sum costs
    const costsByCategory = transformedData.reduce((acc, curr) => {
      if (!acc[curr.category]) {
        acc[curr.category] = 0;
      }
      acc[curr.category] += curr.adjustedCost;
      return acc;
    }, {} as Record<string, number>);
    
    // Format for chart
    const formattedChartData = Object.entries(costsByCategory).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      color: CATEGORY_COLORS[name] || "#8E9196" // Default to gray if category not found
    }));
    
    setChartData(formattedChartData);
  }, [reminders, activeTab]);
  
  const periodLabel = activeTab === 'weekly' ? 'Weekly' : activeTab === 'monthly' ? 'Monthly' : 'Yearly';

  // Improved legend renderer with better label display
  const renderCustomLegend = () => {
    return (
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mt-2 px-1 mx-auto max-h-[100px] overflow-y-auto">
        {chartData.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-1">
            <div 
              className="w-2 h-2 rounded-sm flex-shrink-0" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground text-[10px] whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]" title={entry.name}>
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>
          {periodLabel} expenses grouped by category
        </CardDescription>
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mt-2"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="40%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={false}
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${userCurrency}${value}`, 'Cost']}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Legend 
                  content={renderCustomLegend}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-muted-foreground">No expense data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
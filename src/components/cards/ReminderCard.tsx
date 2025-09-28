import { CategoryIcon, CategoryType } from "@/components/icons/CategoryIcon";
import { cn } from "@/lib/utils";
import { differenceInDays, format } from "date-fns";
import { AlertCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

export interface Reminder {
  id: string;
  category: CategoryType;
  subcategory: string;
  provider: string;
  description: string;
  cost: number;
  frequency: "Monthly" | "Quartely" | "Half Yearly" | "Yearly";
  expiryDate: Date;
  active: boolean;
  currency?: string;
}

interface ReminderCardProps {
  reminder: Reminder;
  className?: string;
  onClick?: (reminder: Reminder) => void;
  isClickable?: boolean;
}

export function ReminderCard({ reminder, className, onClick, isClickable = false }: ReminderCardProps) {
  const { user } = useAuth();
  const [displayCurrency, setDisplayCurrency] = useState(reminder.currency || "£");
  const daysToExpiry = differenceInDays(reminder.expiryDate, new Date());
  
  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata || {};
      const preferredCurrency = metadata.preferred_currency || "GBP";
      setDisplayCurrency(getCurrencySymbol(preferredCurrency));
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
  
  const getExpiryStatusColor = () => {
    if (daysToExpiry <= 0) return "bg-destructive text-destructive-foreground";
    if (daysToExpiry <= 7) return "bg-amber-500 text-white";
    if (daysToExpiry <= 30) return "bg-amber-400 text-white";
    return "bg-emerald-500 text-white";
  };
  
  return (
    <Card 
      className={cn(
        "overflow-hidden border transition-all hover:shadow-md", 
        className, 
        !reminder.active && "opacity-70",
        isClickable && "cursor-pointer hover:border-primary"
      )}
      onClick={() => isClickable && onClick && onClick(reminder)}
    >
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
        <div className="flex items-start gap-3">
          <CategoryIcon category={reminder.category} />
          <div>
            <h3 className="font-medium">{reminder.provider}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {reminder.category} - {reminder.subcategory}
            </p>
          </div>
        </div>
        
        <div className={cn(
          "flex flex-col items-center justify-center w-14 h-14 rounded-md border overflow-hidden",
          getExpiryStatusColor()
        )}>
          <div className="text-sm font-bold leading-none my-0.5">
            {daysToExpiry <= 0 ? (
              <div className="flex flex-col items-center gap-0.5">
                {daysToExpiry < 0 && <AlertCircle className="h-3.5 w-3.5" />}
                <span className="text-xs font-bold">DUE</span>
              </div>
            ) : daysToExpiry}
          </div>
          <div className="w-full text-center text-[10px]">
            {daysToExpiry <= 0 ? "NOW" : "Days"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="mt-2 space-y-3">
          {reminder.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {reminder.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Expires: {format(reminder.expiryDate, "dd MMM yyyy")}
              </span>
            </div>
            
            <div className="font-medium">
              {displayCurrency}{reminder.cost} {reminder.frequency}
            </div>
          </div>
          
          {!reminder.active && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Inactive</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
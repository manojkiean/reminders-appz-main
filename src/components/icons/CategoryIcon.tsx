
import { 
  Car, 
  CreditCard, 
  File, 
  FileText, 
  Heart, 
  HomeIcon, 
  Lightbulb, 
  LucideIcon, 
  Phone, 
  PiggyBank, 
  Plane, 
  Settings, 
  Tv, 
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

export type CategoryType = 
  | "Mobile Plan" 
  | "Insurance" 
  | "Energy Plan" 
  | "Loan" 
  | "Finance" 
  | "Vehicle MOT & Tax" 
  | "Licence" 
  | "Travel" 
  | "Internet & Streaming TV" 
  | "Subscription" 
  | "Pet" 
  | "Health" 
  | "Custom";

interface CategoryIconProps {
  category: CategoryType | string;
  className?: string;
  size?: number;
}

export function CategoryIcon({ category, className, size = 24 }: CategoryIconProps) {
  const iconMap: Record<string, LucideIcon> = {
    "Mobile Plan": Phone,
    "Insurance": FileText,
    "Energy Plan": Lightbulb,
    "Loan": PiggyBank,
    "Finance": CreditCard,
    "Vehicle MOT & Tax": Car,
    "Licence": File,
    "Travel": Plane,
    "Internet & Streaming TV": Tv,
    "Subscription": Settings,
    "Pet": Heart,
    "Health": User,
    "Custom": Settings,
    // Fallback for any other category
    "default": Settings
  };

  const Icon = iconMap[category] || iconMap["default"];
  
  return (
    <div className={cn(
      "flex items-center justify-center rounded-md bg-primary/10 p-2",
      className
    )}>
      <Icon size={size} className="text-primary" />
    </div>
  );
}

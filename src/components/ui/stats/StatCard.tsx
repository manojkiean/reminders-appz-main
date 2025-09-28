
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface StatCardProps {
  title: string;
  count: number;
  icon?: React.ReactNode;
  textColor?: string;
  bgColor?: string;
  href?: string;
}

export function StatCard({ 
  title, 
  count, 
  icon, 
  textColor = "text-foreground",
  bgColor = "bg-card",
  href
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden border", bgColor)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className={cn("text-sm font-medium uppercase", textColor)}>{title}</p>
            <h3 className={cn("text-3xl font-bold mt-2", textColor)}>{count}</h3>
          </div>
          {icon && (
            <div className={cn("rounded-full p-2", bgColor === "bg-card" ? "bg-primary/10" : "bg-white/20")}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
      {href && (
        <CardFooter className="p-2 pt-0">
          <Button asChild variant="ghost" size="sm" className="w-full justify-between">
            <Link to={href}>
              <span>View Details</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

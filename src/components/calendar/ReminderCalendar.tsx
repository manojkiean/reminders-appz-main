
import * as React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import type { Reminder } from "@/components/cards/ReminderCard";
import { AlertCircle, Calendar as CalendarIcon } from "lucide-react";

interface ReminderCalendarProps {
  reminders: Reminder[];
  className?: string;
  showFullMonth?: boolean;
}

export function ReminderCalendar({ reminders, className, showFullMonth = false }: ReminderCalendarProps) {
  const today = new Date();
  
  // Get category color based on reminder category
  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      "Mobile Plan": "bg-blue-500",
      "Insurance": "bg-green-500",
      "Energy Plan": "bg-yellow-500",
      "Loan": "bg-red-500",
      "Finance": "bg-purple-500",
      "Vehicle MOT & Tax": "bg-orange-500",
      "Licence": "bg-pink-500",
      "Travel": "bg-teal-500",
      "Internet & Streaming TV": "bg-indigo-500",
      "Subscription": "bg-cyan-500",
      "Pet": "bg-rose-500",
      "Health": "bg-emerald-500",
      "Custom": "bg-slate-500"
    };
    return colorMap[category] || "bg-gray-500";
  };
  
  // Custom day content renderer
  const DayContent = ({ date, ...props }: { date: Date }) => {
    const remindersOnDate = reminders.filter(
      (reminder) => format(reminder.expiryDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    const hasReminders = remindersOnDate.length > 0;
    
    if (!hasReminders) return <div {...props}>{date.getDate()}</div>;
    
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <div
            className={cn(
              "relative w-full h-full flex items-center justify-center",
              getCategoryColor(remindersOnDate[0].category),
              "text-white font-medium rounded-full cursor-pointer transition-colors"
            )}
            {...props}
          >
            {date.getDate()}
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-0" align="start">
          <div className="space-y-2 p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <p className="text-sm font-medium">
                {format(date, 'MMMM d, yyyy')}
              </p>
            </div>
            <div className="space-y-1">
              {remindersOnDate.map((reminder) => (
                <div 
                  key={reminder.id} 
                  className={cn(
                    "flex items-start gap-2 rounded-md p-2",
                    "hover:bg-muted transition-colors"
                  )}
                >
                  <div className="mt-0.5">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{reminder.provider}</p>
                    <p className="text-sm text-muted-foreground">
                      {reminder.description || `${reminder.category} - ${reminder.subcategory}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

  return ( <Calendar
      mode="single"
      selected={today}
      className={cn("rounded-md border", className)}
      classNames={{
        day_today: "bg-muted",
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          "hover:bg-muted hover:text-accent-foreground"
        ),
      }}
      components={{
        Day: DayContent
      }}
      showOutsideDays={showFullMonth}
      fixedWeeks
    />
  );
}

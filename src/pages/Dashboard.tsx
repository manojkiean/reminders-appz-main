import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/ui/stats/StatCard";
import { ReminderCard, Reminder } from "@/components/cards/ReminderCard";
import { ReminderCalendar } from "@/components/calendar/ReminderCalendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format, addDays, isWithinInterval } from "date-fns";
import { Link } from "react-router-dom";
import { ExpensesBySummary } from "@/components/charts/ExpensesBySummary";
import { useToast } from "@/hooks/use-toast";
import { CategoryType } from "@/components/icons/CategoryIcon";
import { useAuth } from "@/hooks/useAuth";
import { airtable } from "@/integrations/airtable/client";
import { MOCK_REMINDERS_DATA } from "@/integrations/airtable/mock-data";

export default function Dashboard() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const fetchReminders = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // This is a mock fetch call. Replace with your Airtable API logic.
      const data = airtable.getRecords("reminders", (r: any) => r.user_id === user.id);
      
      if (data) {
        const formattedData = data.map((item: any) => ({
          id: item.id,
          category: item.category as CategoryType,
          subcategory: item.subcategory,
          provider: item.provider,
          description: item.description || "",
          cost: Number(item.cost),
          frequency: item.frequency as "Monthly" | "Quartely" | "Half Yearly" | "Yearly",
          expiryDate: new Date(item.expiry_date),
          active: item.active,
          currency: item.currency || "£",
        }));
        
        setReminders(formattedData);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reminders. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [user]);
  
  const today = new Date();
  const weekEnd = addDays(today, 7);
  const monthEnd = addDays(today, 30);
  
  const expiringToday = reminders.filter(
    (r) => format(r.expiryDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd") && r.active
  );
  
  const expiringThisWeek = reminders.filter(
    (r) => 
      isWithinInterval(r.expiryDate, { start: today, end: weekEnd }) && 
      r.active
  );
  
  const expiringThisMonth = reminders.filter(
    (r) => 
      isWithinInterval(r.expiryDate, { start: today, end: monthEnd }) && 
      r.active
  );
  
  const filteredReminders = reminders.filter((reminder) =>
    reminder.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reminder.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reminder.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reminder.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <MainLayout title="Dashboard">
      <div className="space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Expiring Today"
            count={expiringToday.length}
            icon={<AlertCircle className="h-5 w-5 text-white" />}
            textColor="text-white"
            bgColor="bg-expiry-today"
            href="/reminders?filter=today"
          />
          <StatCard
            title="This Week"
            count={expiringThisWeek.length}
            icon={<Calendar className="h-5 w-5 text-white" />}
            textColor="text-white"
            bgColor="bg-expiry-week"
            href="/reminders?filter=week"
          />
          <StatCard
            title="This Month"
            count={expiringThisMonth.length}
            icon={<Clock className="h-5 w-5 text-white" />}
            textColor="text-white"
            bgColor="bg-expiry-month"
            href="/reminders?filter=month"
          />
        </div>
        
        {/* Chart and Calendar in same row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses by Summary Chart */}
          <ExpensesBySummary reminders={reminders} />
          
          {/* Calendar Section */}
          <Card>
            <CardHeader className="pb-3">
              <div>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>
                  View all your reminders in the calendar
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <p>Loading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ReminderCalendar 
                    reminders={reminders}
                    className="mx-auto"
                    showFullMonth={true}
                  />
                  {reminders.length === 0 && (
                    <p className="text-muted-foreground text-sm mt-4">
                      No reminders found.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* All Reminders Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Reminders</CardTitle>
                <CardDescription>
                  Manage all your reminders
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search reminders..."
                    className="w-full md:w-[200px] pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button asChild>
                  <Link to="/reminders/new">New Reminder</Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <p>Loading...</p>
              </div>
            ) : filteredReminders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredReminders.map((reminder) => (
                  <ReminderCard key={reminder.id} reminder={reminder} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  No reminders found. Try adjusting your search or add a new reminder.
                </p>
                <Button asChild>
                  <Link to="/reminders/new">Add Reminder</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
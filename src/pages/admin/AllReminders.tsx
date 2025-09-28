import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { airtable } from "@/integrations/airtable/client";
import { Reminder } from "@/integrations/airtable/types";

type ReminderWithUser = Reminder & { user_email: string; };

export default function AllReminders() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<ReminderWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin && !loading) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this page.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, loading, navigate, toast]);

  // Fetch all reminders
  const fetchReminders = async () => {
    try {
      // This is a mock fetch call. Replace with your Airtable API logic.
      const data = airtable.getRecords("reminders") as Reminder[];
      
      const remindersWithUsers = data.map((reminder) => ({
        ...reminder,
        user_email: reminder.user_id || 'Unknown',
      }));

      setReminders(remindersWithUsers);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      toast({
        title: "Failed to load reminders",
        description: "There was a problem loading the reminders list.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchReminders();
    }
  }, [isAdmin]);

  // Helper to determine expiry status
  const getExpiryStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: "Expired", variant: "destructive" as const };
    if (diffDays <= 7) return { label: "Expiring Soon", variant: "warning" as const };
    if (diffDays <= 30) return { label: "Upcoming", variant: "default" as const };
    return { label: "Active", variant: "outline" as const };
  };

  return (
    <MainLayout title="All Reminders">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">All User Reminders</h2>
            <p className="text-muted-foreground">
              View all reminders in the system across all users.
            </p>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reminders.map((reminder) => {
                  const status = getExpiryStatus(reminder.expiry_date);
                  return (
                    <TableRow key={reminder.id}>
                      <TableCell className="font-medium">{reminder.user_email}</TableCell>
                      <TableCell>{reminder.provider}</TableCell>
                      <TableCell>{reminder.category} / {reminder.subcategory}</TableCell>
                      <TableCell>{new Date(reminder.expiry_date).toLocaleDateString()}</TableCell>
                      <TableCell>£{reminder.cost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>{new Date(reminder.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })}
                {reminders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No reminders found in the system
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
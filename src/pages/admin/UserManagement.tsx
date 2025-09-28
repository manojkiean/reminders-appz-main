import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  TABLE_USER_PROFILES, 
  ROUTES, 
  APP_SUPPORT_EMAIL,
  MESSAGES
} from "@/constants";
import { airtable } from "@/integrations/airtable/client";
import { MOCK_USER_PROFILES_DATA } from "@/integrations/airtable/mock-data";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  is_active: boolean;
  is_admin: boolean;
};

export default function UserManagement() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    userId: string;
    action: "toggleAdmin" | "toggleActive";
    isAdmin?: boolean;
    isActive?: boolean;
  }>({
    isOpen: false,
    userId: "",
    action: "toggleAdmin",
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin && !loading) {
      toast({
        title: "Access Denied",
        description: MESSAGES.ACCESS_DENIED,
        variant: "destructive",
      });
      navigate(ROUTES.HOME);
    }
  }, [isAdmin, loading, navigate, toast]);

  // Fetch users with their profiles
  const fetchUsers = async () => {
    try {
      // This is a mock fetch call. Replace with your Airtable API logic.
      const userProfiles = airtable.getRecords("user_profiles");
      
      const usersWithProfiles = userProfiles?.map((profile: any) => ({
        id: profile.id,
        email: profile.email || "Email hidden",
        name: profile.name,
        created_at: profile.created_at,
        is_active: profile.is_active,
        is_admin: profile.is_admin,
      })) || [];

      setUsers(usersWithProfiles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: MESSAGES.FAILED_LOAD_USERS,
        description: MESSAGES.FAILED_LOAD_USERS_DESC,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    setConfirmDialog({
      isOpen: true,
      userId,
      action: "toggleAdmin",
      isAdmin: makeAdmin
    });
  };

  const handleToggleActive = async (userId: string, makeActive: boolean) => {
    setConfirmDialog({
      isOpen: true,
      userId,
      action: "toggleActive",
      isActive: makeActive
    });
  };

  const confirmAction = async () => {
    const { userId, action, isAdmin: makeAdmin, isActive: makeActive } = confirmDialog;
    setActionLoading(userId);

    try {
      if (action === "toggleAdmin") {
        // This is a mock update call. Replace with your Airtable API logic.
        airtable.updateRecord("user_profiles", userId, { is_admin: makeAdmin });
      } else if (action === "toggleActive") {
        // This is a mock update call. Replace with your Airtable API logic.
        airtable.updateRecord("user_profiles", userId, { is_active: makeActive });
      }

      // Update local state
      setUsers(users.map(u => {
        if (u.id === userId) {
          if (action === "toggleAdmin") {
            return { ...u, is_admin: !!makeAdmin };
          } else if (action === "toggleActive") {
            return { ...u, is_active: !!makeActive };
          }
        }
        return u;
      }));

      toast({
        title: "Success",
        description: `User ${action === "toggleAdmin" 
          ? (makeAdmin ? MESSAGES.USER_PROMOTED : MESSAGES.USER_DEMOTED) 
          : (makeActive ? MESSAGES.USER_ACTIVATED : MESSAGES.USER_DEACTIVATED)}.`,
      });
    } catch (error) {
      console.error(`Error ${action}:`, error);
      toast({
        title: MESSAGES.ACTION_FAILED,
        description: `Failed to ${action === "toggleAdmin" 
          ? (makeAdmin ? "promote user" : "remove admin role") 
          : (makeActive ? "activate user" : "deactivate user")}.`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, userId: "", action: "toggleAdmin" });
    }
  };

  return (
    <MainLayout title="User Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
            <p className="text-muted-foreground">
              View and manage all users in the system.
            </p>
          </div>
        </div>

        <div className="rounded-md border">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                   <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Admin Status</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Admin
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <XCircle className="h-4 w-4" />
                          Regular User
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          Disabled
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`admin-${user.id}`}
                            checked={user.is_admin}
                            onCheckedChange={(checked) => handleToggleAdmin(user.id, checked)}
                            disabled={actionLoading === user.id}
                          />
                          <span className="text-sm">Admin</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`active-${user.id}`}
                            checked={user.is_active}
                            onCheckedChange={(checked) => handleToggleActive(user.id, checked)}
                            disabled={actionLoading === user.id}
                          />
                          <span className="text-sm">Active</span>
                        </div>
                        {actionLoading === user.id && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(isOpen) => 
        !actionLoading && setConfirmDialog({...confirmDialog, isOpen})
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {confirmDialog.action === "toggleAdmin" 
                ? (confirmDialog.isAdmin 
                  ? "Are you sure you want to grant admin privileges to this user?" 
                  : "Are you sure you want to remove admin privileges from this user?")
                : (confirmDialog.isActive 
                  ? "Are you sure you want to activate this user account?" 
                  : "Are you sure you want to deactivate this user account?")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({...confirmDialog, isOpen: false})}
              disabled={actionLoading !== null}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmAction}
              disabled={actionLoading !== null}
              variant={confirmDialog.action === "toggleActive" && !confirmDialog.isActive ? "destructive" : "default"}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
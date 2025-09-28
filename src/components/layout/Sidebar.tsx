import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { 
  Bell, 
  Calendar,
  Home,
  Plus,
  Settings,
  ListPlus,
  Users,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { APP_NAME, ROUTES } from "@/constants";

interface SidebarProps {
  collapsed?: boolean;
}

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  collapsed?: boolean;
}

function NavItem({ href, icon: Icon, label, collapsed }: NavItemProps) {
  const { pathname } = useLocation();
  const isActive = pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className={cn("h-5 w-5", isActive && "text-sidebar-primary")} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const { isAdmin } = useAuth();
  
  useEffect(() => {
    if (isAdmin) {
      console.log("User has admin privileges, showing admin sections");
    } else {
      console.log("User does not have admin privileges, hiding admin sections");
    }
  }, [isAdmin]);
  
  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-20 flex flex-col bg-sidebar h-screen border-r border-sidebar-border transition-all",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="flex items-center border-b border-sidebar-border h-16 px-4">
        {!collapsed ? (
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-sidebar-primary mr-2" />
            <span className="font-bold text-sidebar-foreground text-xl">
              {APP_NAME}
            </span>
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <Bell className="h-6 w-6 text-sidebar-primary" />
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          <NavItem 
            href={ROUTES.HOME} 
            icon={Home} 
            label="Dashboard" 
            collapsed={collapsed} 
          />
          <NavItem 
            href={ROUTES.REMINDERS} 
            icon={Calendar} 
            label="Reminders" 
            collapsed={collapsed} 
          />
          <NavItem 
            href={ROUTES.REMINDERS_MANAGE} 
            icon={ListPlus} 
            label="Manage Reminders" 
            collapsed={collapsed} 
          />
          
          {isAdmin && (
            <>
              <div className={cn("px-2 py-1 mt-3", collapsed && "text-center")}>
                {!collapsed && <p className="text-xs font-semibold text-sidebar-foreground/60">ADMIN</p>}
                {collapsed && <div className="h-px bg-sidebar-border my-2"></div>}
              </div>
              <NavItem 
                href={ROUTES.ADMIN_USERS}
                icon={Users} 
                label="User Management" 
                collapsed={collapsed} 
              />
              <NavItem 
                href={ROUTES.ADMIN_REMINDERS}
                icon={ClipboardList} 
                label="All Reminders" 
                collapsed={collapsed} 
              />
            </>
          )}
          
          <NavItem 
            href={ROUTES.SETTINGS}
            icon={Settings} 
            label="Account Settings" 
            collapsed={collapsed} 
          />
        </nav>
      </div>
      
      <div className="border-t border-sidebar-border p-2">
        <Button 
          asChild 
          className={cn("w-full", collapsed ? "px-2" : "")}
        >
          <Link to={ROUTES.REMINDERS_NEW}>
            <Plus className="h-4 w-4 mr-2" />
            {!collapsed && "New Reminder"}
          </Link>
        </Button>
      </div>
    </aside>
  );
}
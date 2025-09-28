import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Reminder, ReminderCard } from "@/components/cards/ReminderCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { addDays, format, isWithinInterval, differenceInDays } from "date-fns";
import { AlertCircle, CalendarIcon, Search, SlidersHorizontal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryType } from "@/components/icons/CategoryIcon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ReminderForm } from "@/components/forms/ReminderForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { airtable } from "@/integrations/airtable/client";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MOCK_REMINDERS_DATA } from "@/integrations/airtable/mock-data";

const categories = [
  "All Categories",
  "Mobile Plan",
  "Insurance",
  "Energy Plan",
  "Loan",
  "Finance",
  "Vehicle MOT & Tax",
  "Licence",
  "Travel",
  "Internet & Streaming TV",
  "Subscription",
  "Pet",
  "Health",
  "Custom",
] as const;

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedFrequency, setSelectedFrequency] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [showNewForm, setShowNewForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userCurrency, setUserCurrency] = useState("£");
  const location = useLocation();
  const isManageMode = location.pathname === "/reminders/manage";
  
  const filterParam = searchParams.get("filter");
  const activeTab = filterParam || "all";
  
  useEffect(() => {
    if (isManageMode) {
      setSelectedStatus("All");
    }
  }, [isManageMode]);
  
  useEffect(() => {
    if (user) {
      const preferredCurrency = user.user_metadata?.preferred_currency || "GBP";
      setUserCurrency(getCurrencySymbol(preferredCurrency));
    }
  }, [user]);
  
  const getCurrencySymbol = (currencyCode: string): string => {
    switch (currencyCode) {
      case "INR": return "₹"
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "JPY": return "¥";
      case "CAD": return "C$";
      case "AUD": return "A$";
      default: return "£";
    }
  };
  
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
          currency: item.currency || userCurrency,
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
  }, [user, userCurrency]);
  
  const applyDateFilter = (reminder: Reminder): boolean => {
    if (!date) return true;
    
    const reminderDate = reminder.expiryDate;
    return format(reminderDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
  };
  
  const applyTabFilter = (reminder: Reminder): boolean => {
    const today = new Date();
    const weekEnd = addDays(today, 7);
    const monthEnd = addDays(today, 30);
    
    switch (activeTab) {
      case "today":
        return format(reminder.expiryDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
      case "week":
        return isWithinInterval(reminder.expiryDate, { start: today, end: weekEnd });
      case "month":
        return isWithinInterval(reminder.expiryDate, { start: today, end: monthEnd });
      default:
        return true;
    }
  };
  
  const applyFilters = (): Reminder[] => {
    return reminders.filter((reminder) => {
      const matchesSearch = 
        reminder.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reminder.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reminder.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reminder.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === "All Categories" || 
        reminder.category === selectedCategory;
      
      const matchesFrequency = 
        selectedFrequency === "All" || 
        reminder.frequency === selectedFrequency;
      
      const matchesStatus = 
        isManageMode ||
        selectedStatus === "All" || 
        (selectedStatus === "Active" && reminder.active) || 
        (selectedStatus === "Inactive" && !reminder.active);
      
      const matchesTab = isManageMode ? true : applyTabFilter(reminder);
      
      const matchesDate = applyDateFilter(reminder);
      
      return (
        matchesSearch &&
        matchesCategory &&
        matchesFrequency &&
        matchesStatus &&
        matchesTab &&
        matchesDate
      );
    });
  };
  
  const filteredReminders = applyFilters();
  
  const handleTabChange = (value: string) => {
    if (!isManageMode) {
      setSearchParams({ filter: value !== "all" ? value : "" });
    }
  };
  
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedFrequency("All");
    setSelectedStatus("All");
    setDate(undefined);
  };
  
  const handleEditReminder = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setShowNewForm(true);
  };
  
  const handleCreateReminder = async (data: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create reminders.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (selectedReminder) {
        // This is a mock update call. Replace with your Airtable API logic.
        airtable.updateRecord('reminders', selectedReminder.id, {
          category: data.category,
          subcategory: data.subcategory,
          provider: data.provider,
          description: data.description,
          cost: data.cost,
          frequency: data.frequency,
          expiry_date: data.expiryDate.toISOString(),
          active: data.active,
          currency: userCurrency,
        });
        
        toast({
          title: "Success",
          description: "Reminder updated successfully",
        });
      } else {
        const reminderData = {
          user_id: user.id,
          category: data.category,
          subcategory: data.subcategory,
          provider: data.provider,
          description: data.description,
          cost: data.cost,
          frequency: data.frequency,
          expiry_date: data.expiryDate.toISOString(),
          active: data.active,
          currency: userCurrency,
        };
        
        // This is a mock insert call. Replace with your Airtable API logic.
        airtable.createRecord('reminders', reminderData);
        
        toast({
          title: "Success",
          description: "Reminder created successfully",
        });
      }
      
      fetchReminders();
      setShowNewForm(false);
      setSelectedReminder(null);
    } catch (error) {
      console.error("Error with reminder:", error);
      toast({
        title: "Error",
        description: `Failed to ${selectedReminder ? 'update' : 'create'} reminder. Please try again.`,
        variant: "destructive",
      });
    }
  };
  
  const handleCancel = () => {
    setShowNewForm(false);
    setSelectedReminder(null);
    if (isManageMode && selectedReminder) {
      navigate("/reminders/manage");
    }
  };
  
  const renderManageView = () => {
    if (showNewForm) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{selectedReminder ? "Edit Reminder" : "Create New Reminder"}</CardTitle>
            <CardDescription>
              {selectedReminder 
                ? "Edit the reminder details below." 
                : "Fill in the details to create a new reminder."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReminderForm 
              initialData={selectedReminder || undefined}
              onSubmit={handleCreateReminder} 
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reminders..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedFrequency}
                onValueChange={setSelectedFrequency}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Frequencies</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={resetFilters} size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <p>Loading reminders...</p>
            </div>
          ) : filteredReminders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReminders.map((reminder) => (
                  <TableRow key={reminder.id}>
                    <TableCell className="font-medium">{reminder.provider}</TableCell>
                    <TableCell>{reminder.category} - {reminder.subcategory}</TableCell>
                    <TableCell>
                      {format(reminder.expiryDate, "dd MMM yyyy")}
                      {differenceInDays(reminder.expiryDate, new Date()) <= 0 && (
                        <span className="ml-2 text-destructive font-medium flex items-center text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" /> Overdue
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{reminder.currency}{reminder.cost} ({reminder.frequency})</TableCell>
                    <TableCell>
                      <Badge variant={reminder.active ? "default" : "outline"}>
                        {reminder.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditReminder(reminder)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                No reminders found with the current filters.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
                <Button onClick={() => setShowNewForm(true)}>
                  Add New Reminder
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <MainLayout title={isManageMode ? "Manage Reminders" : "Reminders"}>
      <div className="space-y-8">
        {isManageMode ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Manage Reminders</h2>
              <Button onClick={() => setShowNewForm(true)}>
                New Reminder
              </Button>
            </div>
            {renderManageView()}
          </div>
        ) : (
          <div>
            <Tabs 
              defaultValue={activeTab}
              value={activeTab}
              onValueChange={handleTabChange}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="week">This Week</TabsTrigger>
                  <TabsTrigger value="month">This Month</TabsTrigger>
                </TabsList>
                <Button onClick={() => setShowNewForm(true)}>
                  New Reminder
                </Button>
              </div>
              
              <TabsContent value="all" className="space-y-6">
                {showNewForm ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {selectedReminder ? "Edit Reminder" : "Create New Reminder"}
                      </CardTitle>
                      <CardDescription>
                        {selectedReminder 
                          ? "Edit the reminder details below." 
                          : "Fill in the details to create a new reminder."
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ReminderForm 
                        initialData={selectedReminder || undefined}
                        onSubmit={handleCreateReminder} 
                        onCancel={handleCancel}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search reminders..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={selectedFrequency}
                            onValueChange={setSelectedFrequency}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Frequencies</SelectItem>
                              <SelectItem value="Monthly">Monthly</SelectItem>
                              <SelectItem value="Yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Status</SelectItem>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[130px] justify-start text-left font-normal",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          
                          <Button variant="outline" onClick={resetFilters} size="icon">
                            <SlidersHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                          <p>Loading reminders...</p>
                        </div>
                      ) : filteredReminders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredReminders.map((reminder) => (
                            <ReminderCard 
                              key={reminder.id} 
                              reminder={reminder}
                              onClick={handleEditReminder}
                              isClickable={true}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                          <p className="text-muted-foreground mb-4">
                            No reminders found with the current filters.
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={resetFilters}>
                              Reset Filters
                            </Button>
                            <Button onClick={() => setShowNewForm(true)}>
                              Add New Reminder
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="today" className="space-y-6">
                {showNewForm ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {selectedReminder ? "Edit Reminder" : "Create New Reminder"}
                      </CardTitle>
                      <CardDescription>
                        {selectedReminder 
                          ? "Edit the reminder details below." 
                          : "Fill in the details to create a new reminder."
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ReminderForm 
                        initialData={selectedReminder || undefined}
                        onSubmit={handleCreateReminder} 
                        onCancel={handleCancel}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search reminders..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={selectedFrequency}
                            onValueChange={setSelectedFrequency}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Frequencies</SelectItem>
                              <SelectItem value="Monthly">Monthly</SelectItem>
                              <SelectItem value="Yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Status</SelectItem>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[130px] justify-start text-left font-normal",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          
                          <Button variant="outline" onClick={resetFilters} size="icon">
                            <SlidersHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                          <p>Loading reminders...</p>
                        </div>
                      ) : filteredReminders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredReminders.map((reminder) => (
                            <ReminderCard 
                              key={reminder.id} 
                              reminder={reminder}
                              onClick={handleEditReminder}
                              isClickable={true}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                          <p className="text-muted-foreground mb-4">
                            No reminders found with the current filters.
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={resetFilters}>
                              Reset Filters
                            </Button>
                            <Button onClick={() => setShowNewForm(true)}>
                              Add New Reminder
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="month" className="space-y-6">
                {showNewForm ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {selectedReminder ? "Edit Reminder" : "Create New Reminder"}
                      </CardTitle>
                      <CardDescription>
                        {selectedReminder 
                          ? "Edit the reminder details below." 
                          : "Fill in the details to create a new reminder."
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ReminderForm 
                        initialData={selectedReminder || undefined}
                        onSubmit={handleCreateReminder} 
                        onCancel={handleCancel}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search reminders..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={selectedFrequency}
                            onValueChange={setSelectedFrequency}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Frequencies</SelectItem>
                              <SelectItem value="Monthly">Monthly</SelectItem>
                              <SelectItem value="Yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Status</SelectItem>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[130px] justify-start text-left font-normal",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          
                          <Button variant="outline" onClick={resetFilters} size="icon">
                            <SlidersHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                          <p>Loading reminders...</p>
                        </div>
                      ) : filteredReminders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredReminders.map((reminder) => (
                            <ReminderCard 
                              key={reminder.id} 
                              reminder={reminder}
                              onClick={handleEditReminder}
                              isClickable={true}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                          <p className="text-muted-foreground mb-4">
                            No reminders found with the current filters.
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={resetFilters}>
                              Reset Filters
                            </Button>
                            <Button onClick={() => setShowNewForm(true)}>
                              Add New Reminder
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
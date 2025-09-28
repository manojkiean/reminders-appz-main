import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CategoryType } from "@/components/icons/CategoryIcon";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Reminder } from "../cards/ReminderCard";
import { useAuth } from "@/hooks/useAuth";

// Define subcategories for each main category
const subcategories: Record<CategoryType, string[]> = {
  "Mobile Plan": ["iPhone Plan", "Samsung Plan", "Other Android Plan", "SIM-only Prepaid"],
  "Insurance": ["Car Insurance", "Home Buildings + Contents", "Life Insurance", "Motorcycle Insurance"],
  "Energy Plan": ["Gas", "Electricity", "Duel Fuel"],
  "Loan": ["Personal Loan", "Car Loan", "0% Balance Transfer"],
  "Finance": ["Credit Card Annual Fee", "Fixed-rate Savings"],
  "Vehicle MOT & Tax": ["MOT Check", "Vehicle Tax (6 months)", "Vehicle Tax (12 months)"],
  "Licence": ["Car", "Truck", "Motorcycle", "Other"],
  "Travel": ["Passport", "Visa/ESTA", "Travel Insurance", "Book Next Holiday"],
  "Internet & Streaming TV": ["Internet", "Streaming TV"],
  "Subscription": ["Internet", "Streaming TV", "App", "Software", "Media", "Games"],
  "Pet": ["Insurance", "Vaccination", "Annual Checkup", "Grooming"],
  "Health": ["Checkup", "Insurance", "Vaccination", "Gym"],
  "Custom": ["Membership", "Other"],
};

const categories = Object.keys(subcategories) as CategoryType[];

// Updated schema to make subcategory required
const reminderSchema = z.object({
  category: z.string(),
  subcategory: z.string().min(1, { message: "Subcategory is required" }),
  provider: z.string().min(1, { message: "Provider is required" }),
  description: z.string().optional(),
  cost: z.coerce.number().min(0, { message: "Cost must be a positive number" }),
  frequency: z.enum(["Monthly","Quartely","Half Yearly", "Yearly"]),
  expiryDate: z.date({ required_error: "Expiry date is required" }),
  active: z.boolean().default(true),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

interface ReminderFormProps {
  initialData?: Reminder;
  onSubmit: (data: ReminderFormValues) => void;
  currency?: string;
  onCancel?: () => void;
}

export function ReminderForm({ initialData, onSubmit, currency = "£", onCancel }: ReminderFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(
    (initialData?.category as CategoryType) || categories[0]
  );
  const { user } = useAuth();
  const [userCurrency, setUserCurrency] = useState(currency);
  
  useEffect(() => {
    if (user) {
      const preferredCurrency = user.user_metadata?.preferred_currency || "GBP";
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
  
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: initialData || {
      category: categories[0],
      subcategory: subcategories[categories[0]][0],
      provider: "",
      description: "",
      cost: 0,
      frequency: "Monthly",
      expiryDate: new Date(),
      active: true,
    },
  });
  
  useEffect(() => {
    const categoryValue = form.watch("category");
    if (categoryValue && categoryValue in subcategories) {
      setSelectedCategory(categoryValue as CategoryType);
      
      const currentSubcategory = form.watch("subcategory");
      const availableSubcategories = subcategories[categoryValue as CategoryType];
      
      if (!availableSubcategories.includes(currentSubcategory)) {
        form.setValue("subcategory", availableSubcategories[0]);
      }
    }
  }, [form.watch("category")]);
  
  const handleFormSubmit = (data: ReminderFormValues) => {
    onSubmit(data);
  };
  
  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCategory(value as CategoryType);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub-category <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    required
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sub-category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subcategories[selectedCategory]?.map((subcategory) => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter provider name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter description or notes"
                      className="h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">{userCurrency}</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-7"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quartely">Quartely</SelectItem>
                        <SelectItem value="Half Yearly">Half Yearly</SelectItem>
                        <SelectItem value="Yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiry Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel>Active</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      This reminder is currently active and will trigger notifications.
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancelClick}
          >
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update Reminder" : "Create Reminder"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
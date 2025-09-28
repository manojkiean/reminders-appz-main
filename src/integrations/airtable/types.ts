// This file provides mock types for Airtable records.
// In a real application, you might use a tool like 'airtable-typegen' or manually
// define these types to match your Airtable schema.

// Mock User object, similar to what you'd get from a real auth service
export interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    preferred_currency: string;
    whatsapp_api_key?: string;
  };
}

// Mock User Profile record from Airtable
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  is_active: boolean;
  is_admin: boolean;
}

// Mock Reminder record from Airtable
export interface Reminder {
  id: string;
  user_id: string;
  category: string;
  subcategory: string;
  provider: string;
  description: string;
  cost: number;
  frequency: "Monthly" | "Quartely" | "Half Yearly" | "Yearly";
  expiry_date: string;
  active: boolean;
  currency?: string;
  created_at: string;
}
import { User } from "@/integrations/airtable/types";

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isActive: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};
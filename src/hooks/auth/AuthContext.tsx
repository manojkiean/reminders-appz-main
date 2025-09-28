import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserProfile, Reminder } from "@/integrations/airtable/types";
import { airtable } from "@/integrations/airtable/client";
import { useToast } from "../use-toast";
import { useNavigate } from "react-router-dom";
import { AuthContextType } from "./types";
import { MOCK_USER_PROFILES_DATA, MOCK_REMINDERS_DATA } from "@/integrations/airtable/mock-data";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // This is a simplified mock authentication system for Airtable.
  // In a real application, you would replace this logic with a dedicated
  // authentication service (e.g., Auth0, Firebase Auth) and API calls.
  useEffect(() => {
    // Simulate a user being logged in on app load.
    // Replace with actual session check if you implement a real auth flow.
    const mockUser: User = {
      id: "user123",
      email: "user@example.com",
      user_metadata: {
        full_name: "Regular User",
        preferred_currency: "GBP",
      }
    };
    
    // Simulate fetching user profile
    const mockUserProfile = MOCK_USER_PROFILES_DATA.find(p => p.id === mockUser.id);
    
    if (mockUserProfile) {
      setUser(mockUser);
      setIsAdmin(mockUserProfile.is_admin);
      setIsActive(mockUserProfile.is_active);
    }
    
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate sign-in
    const userProfile = MOCK_USER_PROFILES_DATA.find(p => p.email === email);
    
    if (userProfile && password === "password123") { // Hardcoded password for mock
      const mockUser: User = {
        id: userProfile.id,
        email: userProfile.email,
        user_metadata: {
          full_name: userProfile.name,
          preferred_currency: userProfile.preferred_currency,
        }
      };
      setUser(mockUser);
      setIsAdmin(userProfile.is_admin);
      setIsActive(userProfile.is_active);
      toast({
        title: "Login successful",
        description: "Welcome back! You are now logged in.",
      });
      navigate("/");
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const signOut = async () => {
    setUser(null);
    setIsAdmin(false);
    setIsActive(false);
    toast({
      title: "Signed out successfully",
      description: "You have been logged out.",
    });
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAdmin, 
      isActive,
      signIn, 
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
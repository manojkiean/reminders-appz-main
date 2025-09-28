import { MainLayout } from "@/components/layout/MainLayout";
import { AccountSettingsForm } from "@/components/forms/AccountSettingsForm";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { airtable } from "@/integrations/airtable/client";
import { MOCK_USER_PROFILES_DATA } from "@/integrations/airtable/mock-data";
import { UserProfile } from "@/integrations/airtable/types";

export default function AccountSettings() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    preferredCurrency: "GBP",
    whatsappApiKey: "",
  });
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isLoading && !user) {
      navigate("/auth");
      return;
    }

    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const userProfile = MOCK_USER_PROFILES_DATA.find(p => p.id === user.id);
        
        if (userProfile) {
          setUserData({
            fullName: userProfile.name || "Guest User",
            email: userProfile.email || "",
            preferredCurrency: userProfile.preferred_currency || "GBP",
            whatsappApiKey: userProfile.whatsapp_api_key || "",
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user settings",
          variant: "destructive",
        });
      }
    };

    loadUserData();
  }, [user, isLoading, navigate, toast]);
  
  const handleUpdateSettings = async (data: any) => {
    try {
      setIsUpdating(true);
      
      const userProfile = MOCK_USER_PROFILES_DATA.find(p => p.id === user?.id);

      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          name: data.fullName,
          preferred_currency: data.preferredCurrency,
          whatsapp_api_key: data.whatsappApiKey,
        };
        
        // This is a mock update call. Replace with your Airtable API update logic.
        airtable.updateRecord('user_profiles', userProfile.id, updatedProfile);
      }
      
      setUserData(data);
      
      toast({
        title: "Settings updated",
        description: "Your account settings have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
      console.error("Settings update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <MainLayout title="Account Settings">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
        <AccountSettingsForm 
          initialData={userData}
          onSubmit={handleUpdateSettings}
          isLoading={isUpdating}
        />
      </div>
    </MainLayout>
  );
}
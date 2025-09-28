import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // This page is a placeholder as Airtable does not have an auth callback.
    // It will simply redirect back to the home page if a user is logged in.
    if (!isLoading) {
      if (user) {
        toast({
          title: "Authentication successful",
          description: "You've been successfully logged in.",
        });
        navigate("/", { replace: true });
      } else {
        toast({
          title: "Authentication failed",
          description: "There was a problem with your authentication. Please try again.",
          variant: "destructive",
        });
        navigate("/auth", { replace: true });
      }
    }
  }, [user, isLoading, navigate, toast]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-lg font-medium">Processing authentication...</p>
      <p className="text-sm text-muted-foreground mt-2">Please wait, you will be redirected shortly.</p>
    </div>
  );
}

import { AuthProvider, useAuthContext } from "./auth/AuthContext";

// Re-export everything for backwards compatibility
export { AuthProvider };
export const useAuth = useAuthContext;

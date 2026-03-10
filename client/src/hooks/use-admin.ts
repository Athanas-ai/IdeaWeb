import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_ADMIN_PASSWORD } from "@shared/admin-auth";
import {
  clearStoredAdminPassword,
  getStoredAdminPassword,
  setStoredAdminPassword,
} from "@/lib/admin-auth";

export function useAdminAuth() {
  return useQuery({
    queryKey: [api.admin.checkAuth.path],
    queryFn: async () => {
      return { authenticated: getStoredAdminPassword() === DEFAULT_ADMIN_PASSWORD };
    },
    retry: false,
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (password: string) => {
      if (password !== DEFAULT_ADMIN_PASSWORD) {
        throw new Error("Invalid credentials");
      }
      setStoredAdminPassword(password);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.checkAuth.path] });
      toast({ title: "Authentication successful" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Access Denied", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async () => {
      clearStoredAdminPassword();
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.checkAuth.path] });
      queryClient.clear();
      toast({ title: "Logged out securely" });
    }
  });
}

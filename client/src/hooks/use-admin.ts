import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAdminAuth() {
  return useQuery({
    queryKey: [api.admin.checkAuth.path],
    queryFn: async () => {
      const res = await fetch(api.admin.checkAuth.path, { credentials: "include" });
      if (!res.ok) return { authenticated: false };
      return await res.json();
    },
    retry: false,
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (password: string) => {
      const res = await fetch(api.admin.login.path, {
        method: api.admin.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Invalid credentials");
      return await res.json();
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
      const res = await fetch(api.admin.logout.path, {
        method: api.admin.logout.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Logout failed");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.checkAuth.path] });
      queryClient.clear();
      toast({ title: "Logged out securely" });
    }
  });
}

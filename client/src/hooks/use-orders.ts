import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type OrderInput, type OrderStatusUpdate } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useOrders() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      return api.orders.list.responses[200].parse(data);
    },
  });
}

export function useCreateOrder() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: OrderInput) => {
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to submit request");
      }
      const result = await res.json();
      return api.orders.create.responses[201].parse(result);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string } & OrderStatusUpdate) => {
      const url = buildUrl(api.orders.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.orders.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to update status");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      toast({ title: "Order status updated" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error updating status", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.orders.delete.path, { id });
      const res = await fetch(url, { 
        method: api.orders.delete.method, 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete order");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      toast({ title: "Order deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error deleting order", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });
}

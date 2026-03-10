import { useState } from "react";
import { Layout } from "@/components/layout";
import { useAdminAuth, useAdminLogin, useAdminLogout } from "@/hooks/use-admin";
import { useOrders, useUpdateOrderStatus, useDeleteOrder } from "@/hooks/use-orders";
import { LogOut, Trash2, ShieldAlert } from "lucide-react";

export default function Admin() {
  const { data: auth, isLoading: authLoading } = useAdminAuth();
  const login = useAdminLogin();
  const logout = useAdminLogout();
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) login.mutate(password);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!auth?.authenticated) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center px-4">
          <form onSubmit={handleLogin} className="glass-panel p-10 rounded-3xl max-w-sm w-full space-y-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <ShieldAlert className="w-5 h-5 text-white/60" />
              </div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Admin Access</h2>
            </div>
            
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter passphrase"
              className="w-full glass-input rounded-xl px-5 py-4 text-center tracking-widest text-lg"
              autoFocus
            />
            
            <button
              type="submit"
              disabled={login.isLoading}
              className="w-full bg-white text-black font-semibold py-4 rounded-xl hover:bg-white/90 active:scale-95 transition-all duration-200"
            >
              {login.isLoading ? "Unlocking..." : "Enter Lab"}
            </button>
          </form>
        </div>
      </Layout>
    );
  }

  return <AdminDashboard onLogout={() => logout.mutate()} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const safeOrders = orders || [];
  const total = safeOrders.length;
  const pending = safeOrders.filter(o => o.status === "Pending").length;
  const completed = safeOrders.filter(o => o.status === "Completed").length;
  const earned = completed * 200;

  const stats = [
    { label: "Total Requests", value: total },
    { label: "Pending", value: pending },
    { label: "Completed", value: completed },
    { label: "Total Earned", value: `₹${earned}` },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto w-full px-4 py-8 md:py-12 space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Mission Control</h1>
            <p className="text-white/40 text-sm mt-1">Manage build requests and revenue.</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white/70 hover:text-white transition-colors border border-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" /> Terminate Session
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl flex flex-col justify-center">
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider mb-3">{stat.label}</span>
              <span className="text-4xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/[0.02] border-b border-white/[0.05]">
                <tr>
                  <th className="px-6 py-5 font-mono text-xs text-white/30 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-5 font-mono text-xs text-white/30 uppercase tracking-widest">Client Info</th>
                  <th className="px-6 py-5 font-mono text-xs text-white/30 uppercase tracking-widest">Idea Description</th>
                  <th className="px-6 py-5 font-mono text-xs text-white/30 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 font-mono text-xs text-white/30 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {safeOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-white/30 font-light">
                      No orders currently in the system.
                    </td>
                  </tr>
                ) : (
                  safeOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5 text-white/50 text-xs">
                        {new Date(order.created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-medium text-white mb-1">{order.name}</div>
                        <div className="text-white/40 text-xs font-mono">{order.phone}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="max-w-md truncate text-white/70 font-light" title={order.idea}>
                          {order.idea}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono tracking-widest border
                          ${order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            order.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            order.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            order.status === 'Approved' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            'bg-white/5 text-white/50 border-white/10'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value as any })}
                            className="bg-black/50 border border-white/10 hover:border-white/30 transition-colors rounded-lg text-white/80 text-xs px-3 py-1.5 outline-none [&>option]:bg-[#0f0f12] cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <button
                            onClick={() => {
                              if(confirm("Permanently delete this order? This cannot be undone.")) {
                                deleteOrder.mutate(order.id);
                              }
                            }}
                            className="p-2 text-white/30 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

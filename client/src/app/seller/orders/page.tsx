"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import Sidebar from "../../../components/Sidebar";
import Navbar from "@/components/Navbar";
import {
  Package,
  Clock,
  CheckCircle,
  DollarSign,
  CreditCard,
  Banknote,
  Ban,
  Receipt,
  LayoutDashboard,   // 🆕 Mobile nav icons
  ListOrdered,
  BarChart3,
  Settings
} from "lucide-react";
import { usePathname } from "next/navigation"; // 🆕 for active nav state
import Link from "next/link";                  // 🆕 for mobile nav links

export default function SellerOrdersPage() {
  const pathname = usePathname(); // 🆕 used by mobile bottom nav
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [shopId, setShopId] = useState("");
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.error("User not logged in");
        setLoading(false);
        return;
      }
      await fetchShop(user);
    });

    return () => unsub();
  }, []);

  const fetchShop = async (user: any) => {
    try {
      const token = await user.getIdToken(true);

      const res = await fetch(`${API_URL}/api/seller/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch shop");

      const data = await res.json();
      if (data.success && data.shop?._id) {
        setShopId(data.shop._id);
        await fetchOrders(data.shop._id, token);
      }
    } catch (err) {
      console.error("Shop fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (shopId: string, token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/shops/${shopId}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        // Sort orders by newest first
        const sortedOrders = data.orders.sort((a: any, b: any) => {
          const dateA = a.createdAt?.["$date"] || a.createdAt || 0;
          const dateB = b.createdAt?.["$date"] || b.createdAt || 0;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
        setOrders(sortedOrders);
      }
    } catch (err) {
      console.error("Orders fetch error:", err);
    }
  };

  const markAsPaid = async (orderId: string) => {
    if (!confirm("Confirm receipt of cash and mark this order as paid?")) return;

    try {
      const token = await auth.currentUser?.getIdToken(true);

      const res = await fetch(
        `${API_URL}/api/shops/orders/${orderId}/mark-paid`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        fetchOrders(shopId, token!);
      } else {
        alert("Failed to mark as paid");
      }
    } catch (err) {
      console.error("Mark paid error:", err);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;

    try {
      const token = await auth.currentUser?.getIdToken(true);

      const res = await fetch(
        `${API_URL}/api/shops/orders/${orderId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        fetchOrders(shopId, token!);
      } else {
        alert("Failed to cancel order. Make sure backend route exists.");
      }
    } catch (err) {
      console.error("Cancel order error:", err);
    }
  };

  // 🆕 Mobile bottom navigation items (exact copy from settings page)
  const mobileNavItems = [
    { name: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/seller/orders", icon: ListOrdered },
    { name: "Analytics", href: "/seller/analytics", icon: BarChart3 },
    { name: "Settings", href: "/seller/setup", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-[#FAFAFA] overflow-hidden">
        <div className="hidden md:block w-64 h-full flex-shrink-0 z-30">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <header className="h-[70px] bg-white border-b border-gray-100 flex-shrink-0 z-20">
            <Navbar />
          </header>
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin h-10 w-10 border-t-2 border-gray-900 rounded-full"></div>
          </main>
        </div>
      </div>
    );
  }

  // -----------------------------
  // 📈 ENTERPRISE METRICS CALCULATION
  // -----------------------------
  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.paymentStatus === filter);

  // Exclude cancelled orders from active revenue calculations
  const activeOrders = orders.filter(o => o.paymentStatus !== "cancelled");
  const totalRevenue = activeOrders.reduce((s, o) => s + o.totalAmount, 0);

  // Payment Breakdown
  const onlineOrders = activeOrders.filter(o => o.paymentMethod === "online");
  const cashOrders = activeOrders.filter(o => o.paymentMethod === "cash");

  const onlineRevenue = onlineOrders.reduce((s, o) => s + o.totalAmount, 0);
  const cashRevenue = cashOrders.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="flex h-screen bg-[#FAFAFA] overflow-hidden antialiased selection:bg-orange-500/20 selection:text-orange-700">

      {/* Mobile Hidden Sidebar */}
      <div className="hidden md:block w-64 h-full flex-shrink-0 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-gray-100">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <header className="h-[70px] bg-white/80 backdrop-blur-md border-b border-gray-100 flex-shrink-0 z-20 sticky top-0">
          <Navbar />
        </header>

        {/* 🆕 Added pb-24 to avoid overlap with mobile bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 pb-24 md:pb-10">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">Order Reconciliation</h1>
                <p className="text-gray-500 mt-1.5 text-sm font-medium tracking-wide">
                  Manage fulfillment, verify cash drops, and track digital payments.
                </p>
              </div>
            </div>

            {/* 🆕 ENTERPRISE FINANCIAL OVERVIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

              {/* Total Revenue Card */}
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.12)] text-white flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Gross Active Revenue</p>
                  <div className="p-2.5 bg-white/10 rounded-xl border border-white/5"><DollarSign className="w-5 h-5 text-gray-300" /></div>
                </div>
                <div className="relative z-10">
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                    ₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h2>
                  <p className="text-gray-400 text-xs font-medium tracking-wide mt-2">{activeOrders.length} successful transactions</p>
                </div>
              </div>

              {/* Payment Splits */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">

                {/* Online Split */}
                <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><CreditCard className="w-5 h-5" /></div>
                      <h3 className="font-bold text-gray-900 tracking-tight">Digital</h3>
                    </div>
                    <span className="text-[10px] font-bold px-3 py-1 bg-gray-50 text-gray-500 rounded-md border border-gray-100 uppercase tracking-widest">{onlineOrders.length} Orders</span>
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                      ₹{onlineRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4 overflow-hidden">
                      <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${totalRevenue ? (onlineRevenue / totalRevenue) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Cash Split */}
                <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Banknote className="w-5 h-5" /></div>
                      <h3 className="font-bold text-gray-900 tracking-tight">Counter</h3>
                    </div>
                    <span className="text-[10px] font-bold px-3 py-1 bg-gray-50 text-gray-500 rounded-md border border-gray-100 uppercase tracking-widest">{cashOrders.length} Orders</span>
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                      ₹{cashRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${totalRevenue ? (cashRevenue / totalRevenue) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs (iOS Segmented Control Style for Mobile) */}
            <div className="flex bg-gray-200/50 p-1.5 rounded-xl border border-gray-200/60 overflow-x-auto flex-nowrap w-full lg:w-max [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {["all", "pending", "paid", "cancelled"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 lg:flex-none min-w-[90px] px-4 py-2.5 text-xs font-bold rounded-lg capitalize transition-all duration-300 whitespace-nowrap ${filter === f
                      ? "bg-white text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
                      : "text-gray-500 hover:text-gray-800"
                    }`}
                >
                  {f} <span className="opacity-50 ml-1">{f === "all" ? orders.length : orders.filter(o => o.paymentStatus === f).length}</span>
                </button>
              ))}
            </div>

            {/* Orders Feed */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-12 md:p-16 text-center border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] min-h-[40vh] flex flex-col justify-center items-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
                    <Receipt className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-bold text-xl tracking-tight">No Transactions Found</p>
                  <p className="text-gray-500 text-sm mt-2 max-w-sm">The current filter criteria returned no results. Waiting for new orders to process.</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const orderDate = order.createdAt?.["$date"] || order.createdAt;
                  const formattedDate = orderDate ? new Date(orderDate).toLocaleString() : "Date Unavailable";

                  return (
                    <div key={order._id} className="bg-white rounded-[1.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 p-5 md:p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

                        {/* Order Identity & Status */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                            <h3 className="text-base md:text-lg font-black text-gray-900 font-mono tracking-tight shrink-0">
                              #{order._id.slice(-8).toUpperCase()}
                            </h3>
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md flex items-center gap-1 border shrink-0 ${order.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100/60" :
                                order.paymentStatus === "cancelled" ? "bg-rose-50 text-rose-700 border-rose-100/60" :
                                  "bg-amber-50 text-amber-700 border-amber-100/60"
                              }`}>
                              {order.paymentStatus === "paid" && <CheckCircle className="w-3 h-3" />}
                              {order.paymentStatus === "pending" && <Clock className="w-3 h-3" />}
                              {order.paymentStatus === "cancelled" && <Ban className="w-3 h-3" />}
                              {order.paymentStatus}
                            </span>
                            <span className="px-2.5 py-1 bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-md border border-gray-100 flex items-center gap-1 shrink-0">
                              {order.paymentMethod === 'online' ? <CreditCard className="w-3 h-3 text-blue-500" /> : <Banknote className="w-3 h-3 text-emerald-500" />}
                              {order.paymentMethod}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-gray-500">{formattedDate}</p>
                        </div>

                        {/* Order Items Summary */}
                        <div className="flex-1 bg-gray-50/50 rounded-xl p-4 border border-gray-100 w-full lg:w-auto">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-200/60 pb-1.5">Cart Payload</p>
                          <ul className="space-y-1.5">
                            {order.items.slice(0, 2).map((item: any, idx: number) => (
                              <li key={idx} className="text-xs font-medium text-gray-700 flex justify-between items-center">
                                <span className="truncate pr-4">{item.quantity}x {item.name}</span>
                                <span className="font-bold text-gray-900 whitespace-nowrap">₹{(item.price * item.quantity).toFixed(2)}</span>
                              </li>
                            ))}
                            {order.items.length > 2 && (
                              <li className="text-[10px] text-gray-500 font-bold pt-1 uppercase tracking-widest">
                                + {order.items.length - 2} Additional Items
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Financials & Actions */}
                        <div className="flex-shrink-0 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 min-w-[200px] w-full lg:w-auto border-t border-gray-100 lg:border-none pt-4 lg:pt-0">
                          <div className="text-left lg:text-right w-full lg:w-auto">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Grand Total</p>
                            <p className={`text-xl md:text-2xl font-black tracking-tight ${order.paymentStatus === 'cancelled' ? 'text-gray-300 line-through' : 'text-gray-900'}`}>
                              ₹{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0">
                            {order.paymentStatus === "pending" && (
                              <>
                                <button
                                  onClick={() => cancelOrder(order._id)}
                                  className="px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-gray-200 hover:border-rose-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                                >
                                  Cancel
                                </button>
                                {order.paymentMethod === "cash" && (
                                  <button
                                    onClick={() => markAsPaid(order._id)}
                                    className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center gap-2"
                                  >
                                    Verify Cash
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </main>
      </div>

      {/* 🆕 📱 MOBILE BOTTOM NAVIGATION (exact copy from SellerSetupPage) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-gray-200 z-[100] pb-safe">
        <div className="flex justify-around items-center h-full px-2">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center w-full h-full space-y-1 relative group"
              >
                <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-orange-50 text-orange-600' : 'text-gray-500 group-hover:text-gray-900'}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold tracking-wide transition-colors ${isActive ? 'text-orange-600' : 'text-gray-500 group-hover:text-gray-900'}`}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute top-0 w-8 h-1 bg-orange-500 rounded-b-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
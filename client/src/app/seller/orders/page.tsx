"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import Sidebar from "../../../components/Sidebar";
import Navbar from "@/components/Navbar";
import { Package, Clock, CheckCircle, DollarSign } from "lucide-react";

export default function SellerOrdersPage() {
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
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error("Orders fetch error:", err);
    }
  };

  const markAsPaid = async (orderId: string) => {
    if (!confirm("Mark this order as paid?")) return;

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
        alert("Order marked as paid");
        fetchOrders(shopId, token!);
      } else {
        alert("Failed to mark as paid");
      }
    } catch (err) {
      console.error("Mark paid error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-t-2 border-orange-500 rounded-full" />
      </div>
    );
  }

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.paymentStatus === filter);

  const stats = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: Package,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Pending",
      value: orders.filter((o) => o.paymentStatus === "pending").length,
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Paid",
      value: orders.filter((o) => o.paymentStatus === "paid").length,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Revenue",
      value: `₹${orders.reduce((s, o) => s + o.totalAmount, 0).toFixed(2)}`,
      icon: DollarSign,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Navbar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all your customer orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          {["all", "pending", "paid"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-lg font-medium transition ${
                filter === f
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No orders found</p>
              <p className="text-gray-500 text-sm mt-1">Orders will appear here once customers place them</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          Total: ₹{order.totalAmount}
                        </span>
                        <span>•</span>
                        <span>Payment: {order.paymentMethod.toUpperCase()}</span>
                        <span>•</span>
                        <span className={`font-medium ${
                          order.paymentStatus === "paid"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}>
                          {order.paymentStatus === "paid" ? "✓ Paid" : "○ Pending"}
                        </span>
                      </div>
                    </div>

                    {order.paymentMethod === "cash" &&
                      order.paymentStatus === "pending" && (
                        <button
                          onClick={() => markAsPaid(order._id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as Paid
                        </button>
                      )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Order Items:</p>
                    <ul className="space-y-1">
                      {order.items.map((item: any, idx: number) => (
                        <li key={idx} className="text-sm text-gray-600 flex justify-between">
                          <span>{item.name}</span>
                          <span className="font-medium">₹{item.price} × {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
}
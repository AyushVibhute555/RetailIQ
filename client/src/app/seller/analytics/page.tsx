"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import {
  Activity,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  AlertTriangle,
  Link as LinkIcon,
  Clock,
  CalendarDays,
  Zap,
  Package,
  LayoutDashboard,  // 🆕 mobile nav icons
  ListOrdered,
  BarChart3,
  Settings
} from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../../../lib/firebase";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation"; // 🆕 for active nav state
import Link from "next/link";                  // 🆕 for mobile nav links

export default function AnalyticsPage() {
  const pathname = usePathname(); // 🆕 used by mobile bottom nav
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [analytics, setAnalytics] = useState<any>({
    chart_data: [],
    prediction: 0,
    trend: "flat",
    suggestion: "",
    top_selling: [],
    cross_sell_rules: [],
    inventory_alerts: [],
    buying_patterns: {}
  });

  const [timeframe, setTimeframe] = useState("monthly");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:8000";

  // 🆕 Mobile bottom navigation items (exact copy from settings page)
  const mobileNavItems = [
    { name: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/seller/orders", icon: ListOrdered },
    { name: "Analytics", href: "/seller/analytics", icon: BarChart3 },
    { name: "Settings", href: "/seller/setup", icon: Settings },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(currentUser);
      const token = await currentUser.getIdToken();
      try {
        const res = await fetch(`${API_URL}/api/seller/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch shop");
        const data = await res.json();
        setShop(data.shop);

        if (data.shop?._id) {
          fetchAnalytics(data.shop._id, timeframe);
        }
      } catch (err) {
        console.error("Error fetching shop:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [API_URL, timeframe]);

  useEffect(() => {
    if (shop?._id) {
      fetchAnalytics(shop._id, timeframe);
    }
  }, [shop?._id, timeframe]);

  const fetchAnalytics = async (shopId: string, selectedTimeframe: string) => {
    try {
      const res = await fetch(`${ML_API_URL}/api/analytics/${shopId}?timeframe=${selectedTimeframe}&t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setAnalytics({
          ...data.data,
          top_selling: data.data.top_selling || [],
          cross_sell_rules: data.data.cross_sell_rules || [],
          inventory_alerts: data.data.inventory_alerts || [],
          chart_data: data.data.chart_data || [],
          buying_patterns: data.data.buying_patterns || {}
        });
      }
    } catch (err) {
      console.error("Error fetching ML analytics:", err);
    }
  };

  const maxTopSellingQty = Math.max(...(analytics?.top_selling?.map((i: any) => i.qty) || [1]));

  if (!isMounted) return null;

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

  return (
    <div className="flex h-screen bg-[#FAFAFA] overflow-hidden antialiased selection:bg-orange-500/20 selection:text-orange-700">

      {/* Sidebar - Hidden on mobile, handled by Navbar hamburger if implemented */}
      <div className="hidden md:block w-64 h-full flex-shrink-0 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <header className="h-[70px] bg-white/80 backdrop-blur-md border-b border-gray-100 flex-shrink-0 z-20 sticky top-0">
          <Navbar />
        </header>

        {/* 🆕 Added pb-24 to prevent overlap with mobile bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 pb-24 md:pb-10">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

            {/* HEADER & TIMEFRAME TOGGLES */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">AI Sales Intelligence</h1>
                <p className="text-gray-500 mt-1.5 text-sm font-medium tracking-wide">
                  Predictive analytics and algorithmic operational strategies.
                </p>
              </div>

              {/* iOS Style Segmented Control (Mobile Scrollable) */}
              <div className="flex bg-gray-200/50 p-1.5 rounded-xl border border-gray-200/60 overflow-x-auto flex-nowrap w-full lg:w-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {["daily", "weekly", "monthly", "quarterly", "yearly"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`flex-1 lg:flex-none min-w-[80px] px-4 py-2 text-xs font-bold rounded-lg capitalize transition-all duration-300 whitespace-nowrap ${timeframe === tf
                        ? "bg-white text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
                        : "text-gray-500 hover:text-gray-800"
                      }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {!analytics?.chart_data?.length ? (
              <div className="bg-white rounded-[2rem] p-10 md:p-16 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 text-center flex flex-col items-center justify-center min-h-[40vh]">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Awaiting Transaction Data</h3>
                <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
                  Process successful orders through your POS or storefront to initialize the Machine Learning models.
                </p>
              </div>
            ) : (
              <div className="space-y-6 md:space-y-8">

                {/* --- TOP TIER: HERO METRICS --- */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                  {/* Revenue Prediction Card (Ultra Premium Dark) */}
                  <div className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-black p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.12)] text-white flex flex-col justify-between group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                      <div className={`p-2.5 rounded-xl backdrop-blur-md bg-white/10 border border-white/5 ${analytics?.trend === "up" ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {analytics?.trend === "up" ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                      </div>
                      <span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full border ${analytics?.trend === "up" ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                        {analytics?.trend === "up" ? "Trending Up" : "Trending Down"}
                      </span>
                    </div>

                    <div className="relative z-10">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Projected {timeframe.replace('ly', '')} Sales</p>
                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter">
                        ₹{analytics?.prediction.toLocaleString()}
                      </h2>
                    </div>
                  </div>

                  {/* AI Strategy Copilot */}
                  <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-6 border-b border-gray-50 pb-5">
                      <div className="p-3 bg-orange-50 text-orange-600 rounded-xl border border-orange-100">
                        <Lightbulb className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">AI Strategy Copilot</h3>
                        <p className="text-xs md:text-sm text-gray-500 font-medium">Algorithmic action plan based on current velocity.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                      {analytics?.detailed_strategies?.map((strategy: any, idx: number) => (
                        <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors border border-gray-100">
                          <div className="shrink-0 mt-0.5">
                            {strategy.type === 'revenue' && <TrendingUp className="w-5 h-5 text-emerald-600" />}
                            {strategy.type === 'marketing' && <LinkIcon className="w-5 h-5 text-blue-600" />}
                            {strategy.type === 'inventory' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                            {strategy.type === 'behavior' && <Activity className="w-5 h-5 text-purple-600" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm mb-1.5">{strategy.title}</h4>
                            <p className="text-xs text-gray-600 leading-relaxed font-medium">{strategy.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* --- SECOND TIER: BEHAVIOR & BUNDLING --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Behavioral Analytics */}
                  {analytics?.buying_patterns?.busiest_day && (
                    <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] p-6 md:p-8 rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-200 h-full flex flex-col">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3 tracking-tight">
                        <Clock className="w-5 h-5 text-indigo-500" /> Behavioral Heatmap
                      </h3>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <CalendarDays className="w-3.5 h-3.5" /> Busiest Day
                          </p>
                          <p className="text-xl md:text-2xl font-black text-slate-900">{analytics.buying_patterns.busiest_day}</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" /> Peak Time
                          </p>
                          <p className="text-xl md:text-2xl font-black text-slate-900">{analytics.buying_patterns.peak_time}</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-start gap-3 shadow-sm mt-auto">
                        <Zap className="w-5 h-5 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
                        <span className="text-slate-700 text-sm font-medium leading-relaxed">{analytics.buying_patterns.insight}</span>
                      </div>
                    </div>
                  )}

                  {/* Smart Bundling (Apriori Rules) */}
                  {analytics?.cross_sell_rules?.length > 0 && (
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 h-full">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3 tracking-tight">
                        <LinkIcon className="w-5 h-5 text-blue-500" /> Algorithmic Bundling
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {analytics.cross_sell_rules.slice(0, 4).map((rule: any, idx: number) => (
                          <div key={idx} className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <span className="text-[10px] text-blue-700 font-black uppercase tracking-widest bg-blue-100/80 px-2.5 py-1 rounded-md inline-block mb-3">
                              {rule.confidence}% Link
                            </span>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 font-medium">When buying:</p>
                              <p className="text-sm text-gray-900 font-bold truncate">'{rule.trigger_item}'</p>
                              <p className="text-xs text-gray-500 font-medium mt-2">Recommend:</p>
                              <p className="text-sm text-blue-700 font-bold truncate">'{rule.recommendation}'</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* --- THIRD TIER: INVENTORY & CHART --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Top Performers & Surge Alerts */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3 tracking-tight">
                        <Package className="w-5 h-5 text-gray-400" /> Inventory Intelligence
                      </h3>

                      {/* Surge Alerts */}
                      {analytics?.inventory_alerts?.length > 0 && (
                        <div className="mb-8 space-y-3">
                          {analytics.inventory_alerts.slice(0, 2).map((item: any, idx: number) => (
                            <div key={idx} className={`p-4 rounded-xl border ${item.insight.includes('SURGE') ? 'bg-rose-50 border-rose-100' : 'bg-amber-50/50 border-amber-100'}`}>
                              <div className="flex justify-between items-start mb-1.5">
                                <span className="font-bold text-gray-900 text-sm truncate pr-2">{item.name}</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${item.insight.includes('SURGE') ? 'bg-rose-500 text-white' : 'bg-amber-200 text-amber-800'}`}>
                                  {item.velocity} / day
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 font-medium">{item.insight}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Top Sellers Progress */}
                      {analytics?.top_selling?.length > 0 && (
                        <div className="space-y-5">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Volume Leaders</p>
                          {analytics.top_selling.map((item: any, idx: number) => (
                            <div key={idx} className="group">
                              <div className="flex justify-between items-end mb-1.5">
                                <span className="font-semibold text-sm text-gray-800 truncate pr-4">{item.name}</span>
                                <span className="text-xs font-bold text-gray-900 whitespace-nowrap">{item.qty} sold</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-gray-900 h-1.5 rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${(item.qty / maxTopSellingQty) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Revenue Chart */}
                  <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 capitalize tracking-tight">{timeframe} Revenue Tracking</h3>
                        <p className="text-xs text-gray-500 font-medium mt-1">Historical performance visualization.</p>
                      </div>
                    </div>

                    <div className="h-[300px] md:h-[400px] w-full flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics?.chart_data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#111827" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }} dy={15} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }} tickFormatter={(value) => `₹${value}`} dx={-10} />
                          <Tooltip
                            cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }}
                            contentStyle={{ borderRadius: '12px', border: '1px solid #F1F5F9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)', padding: '12px 16px', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="sales" stroke="#111827" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 6, fill: '#111827', stroke: '#fff', strokeWidth: 2 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

              </div>
            )}
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
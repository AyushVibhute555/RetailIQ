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
  Zap
} from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../../../lib/firebase";
import Navbar from "@/components/Navbar";

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Safe default structure to prevent rendering crashes
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
  const ML_API_URL = process.env.NEXT_PUBLIC_ANALYTICS_URL || "http://localhost:8000";

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
  }, [shop._id, timeframe]);

  const fetchAnalytics = async (shopId: string, selectedTimeframe: string) => {
    try {
      const res = await fetch(`${ML_API_URL}/api/analytics/${shopId}?timeframe=${selectedTimeframe}`);
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

  // Calculate Max Qty for visual progress bars
  const maxTopSellingQty = Math.max(...(analytics?.top_selling?.map((i: any) => i.qty) || [1]));

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <div className="w-64 h-full flex-shrink-0 z-30">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <header className="h-[70px] bg-white border-b border-gray-100 flex-shrink-0 z-20">
            <Navbar />
          </header>
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin h-12 w-12 border-t-2 border-orange-500 rounded-full"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="w-64 h-full flex-shrink-0 z-30">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-[70px] bg-white border-b border-gray-100 flex-shrink-0 z-20">
          <Navbar />
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Sales Intelligence</h1>
                <p className="text-gray-500 mt-2 text-sm max-w-2xl">
                  Enterprise-grade predictive analytics, behavioral insights, and smart inventory recommendations.
                </p>
              </div>

              {/* Timeframe Toggles */}
              <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-gray-200 w-full md:w-auto overflow-x-auto">
                {["daily", "weekly", "monthly", "quarterly", "yearly"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-5 py-2 text-sm font-semibold rounded-lg capitalize transition-all whitespace-nowrap ${timeframe === tf
                      ? "bg-gray-900 text-white shadow-md"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {!analytics?.chart_data?.length ? (
              <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-200 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                  <Activity className="w-10 h-10 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Awaiting Data</h3>
                <p className="text-gray-500 max-w-md">
                  Process a few successful orders to generate your first comprehensive Machine Learning report.
                </p>
              </div>
            ) : (
              <div className="space-y-8">

                {/* 1. HERO METRICS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Revenue Prediction Card */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl shadow-lg border border-gray-700 text-white flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-8">
                      <div className={`p-3 rounded-xl backdrop-blur-md bg-white/10 ${analytics?.trend === "up" ? 'text-green-400' : 'text-red-400'}`}>
                        {analytics?.trend === "up" ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${analytics?.trend === "up" ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {analytics?.trend === "up" ? "Trending Up" : "Trending Down"}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Projected Sales ({timeframe.replace('ly', '')})</p>
                      <h2 className="text-5xl font-extrabold tracking-tight">₹{analytics?.prediction}</h2>
                    </div>
                  </div>

                  {/* AI Strategy Card */}
                  {/* AI Strategy Copilot - Advanced Details */}
                  <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col">
                    <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                      <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                        <Lightbulb className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">AI Strategy Copilot</h3>
                        <p className="text-sm text-gray-500">Data-driven action plan based on your recent performance</p>
                      </div>
                    </div>

                    <div className="space-y-4 flex-1">
                      {analytics?.detailed_strategies?.map((strategy: any, idx: number) => (
                        <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-100">
                          <div className="mt-1">
                            {strategy.type === 'revenue' && <TrendingUp className="w-5 h-5 text-green-600" />}
                            {strategy.type === 'marketing' && <LinkIcon className="w-5 h-5 text-blue-600" />}
                            {strategy.type === 'inventory' && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                            {strategy.type === 'behavior' && <Activity className="w-5 h-5 text-purple-600" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">{strategy.title}</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{strategy.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. CUSTOMER BEHAVIOR PATTERNS */}
                {analytics?.buying_patterns?.busiest_day && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-3xl shadow-sm border border-indigo-100">
                    <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-3">
                      <Clock className="w-6 h-6 text-indigo-600" /> Behavioral Analytics
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <CalendarDays className="w-5 h-5 text-indigo-500" />
                          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Busiest Day</p>
                        </div>
                        <p className="text-2xl font-extrabold text-gray-900">{analytics.buying_patterns.busiest_day}</p>
                      </div>

                      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="w-5 h-5 text-indigo-500" />
                          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Peak Time</p>
                        </div>
                        <p className="text-2xl font-extrabold text-gray-900">{analytics.buying_patterns.peak_time}</p>
                      </div>

                      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Activity className="w-5 h-5 text-indigo-500" />
                          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Avg. Basket Size</p>
                        </div>
                        <p className="text-2xl font-extrabold text-gray-900">{analytics.buying_patterns.avg_basket_size} <span className="text-lg text-gray-500 font-medium">items</span></p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-indigo-100 inline-flex items-center gap-3 shadow-sm">
                      <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-indigo-900 font-medium">{analytics.buying_patterns.insight}</span>
                    </div>
                  </div>
                )}

                {/* 3. SMART BUNDLING (Apriori Rules) */}
                {analytics?.cross_sell_rules?.length > 0 && (
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <LinkIcon className="w-6 h-6 text-blue-600" /> Smart Bundling Opportunities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {analytics.cross_sell_rules.map((rule: any, idx: number) => (
                        <div key={idx} className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                          <p className="text-xs text-blue-700 font-extrabold mb-3 uppercase tracking-widest bg-blue-100 inline-block px-3 py-1 rounded-full">
                            {rule.confidence}% Confidence
                          </p>
                          <p className="text-gray-600 mb-1">When buying:</p>
                          <p className="text-lg text-gray-900 font-bold mb-3">'{rule.trigger_item}'</p>
                          <p className="text-gray-600 mb-1">Recommend:</p>
                          <p className="text-lg text-blue-700 font-bold">'{rule.recommendation}'</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. INVENTORY INTELLIGENCE */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top Movers Visual List */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <ArrowUpCircle className="w-6 h-6 text-green-500" /> Top Performers
                    </h3>
                    {analytics?.top_selling?.length > 0 ? (
                      <div className="space-y-6">
                        {analytics.top_selling.map((item: any, idx: number) => (
                          <div key={idx}>
                            <div className="flex justify-between items-end mb-2">
                              <span className="font-bold text-gray-800">{item.name}</span>
                              <span className="text-sm font-bold text-gray-900">{item.qty} sold</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                              <div
                                className="bg-green-500 h-2.5 rounded-full transition-all duration-1000"
                                style={{ width: `${(item.qty / maxTopSellingQty) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-gray-500 italic">Not enough diverse data.</p>}
                  </div>

                  {/* Velocity Alerts */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-orange-500" /> Velocity & Surge Alerts
                    </h3>
                    {analytics?.inventory_alerts?.length > 0 ? (
                      <div className="space-y-4">
                        {analytics.inventory_alerts.map((item: any, idx: number) => (
                          <div key={idx} className={`p-5 rounded-2xl border ${item.insight.includes('SURGE') ? 'bg-red-50 border-red-100' : 'bg-orange-50/50 border-orange-100'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-gray-900 text-lg">{item.name}</span>
                              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${item.insight.includes('SURGE') ? 'bg-red-500 text-white' : 'bg-orange-200 text-orange-800'}`}>
                                {item.velocity} / day
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 font-medium leading-relaxed">{item.insight}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                        <Activity className="w-8 h-8 mb-2 opacity-50" />
                        <p>Stable inventory burn rates.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. REVENUE CHART */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-gray-900 capitalize">{timeframe} Revenue History</h3>
                  </div>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics?.chart_data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#111827" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }} dy={15} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }} tickFormatter={(value) => `₹${value}`} dx={-10} />
                        <Tooltip
                          cursor={{ stroke: '#111827', strokeWidth: 1, strokeDasharray: '4 4' }}
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px 20px', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#111827" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 8, fill: '#111827', stroke: '#fff', strokeWidth: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
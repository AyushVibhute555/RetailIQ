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
} from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../../../lib/firebase"; // Note the adjusted path for the deeper folder
import Navbar from "@/components/Navbar";


export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeframe, setTimeframe] = useState("monthly");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const ML_API_URL = "http://localhost:8000";

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
  }, []);

  useEffect(() => {
    if (shop?._id) {
      fetchAnalytics(shop._id, timeframe);
    }
  }, [timeframe]);

  const fetchAnalytics = async (shopId: string, selectedTimeframe: string) => {
    try {
      const res = await fetch(`${ML_API_URL}/api/analytics/${shopId}?timeframe=${selectedTimeframe}`);
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error("Error fetching ML analytics:", err);
    }
  };

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

        {/* 2. MAIN CONTAINER AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* 3. NAVBAR FIXED AT TOP */}
        <header className="h-[70px] bg-white border-b border-gray-100 flex-shrink-0 z-20">
          <Navbar />
        </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Sales Intelligence</h1>
          <p className="text-gray-600 mt-1">Predictive analytics and smart inventory recommendations.</p>
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            {/* Timeframe Toggles */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              {["daily", "weekly", "monthly", "quarterly", "yearly"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${timeframe === tf ? "bg-orange-100 text-orange-700" : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {!analytics || analytics.chart_data?.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900">Not Enough Data Yet</h3>
              <p className="text-gray-500">Process a few successful orders to generate your first Machine Learning report!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Insight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                      <Lightbulb className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">AI Strategy Insight</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{analytics.suggestion}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${analytics.trend === "up" ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {analytics.trend === "up" ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Projected Sales (Next {timeframe.replace('ly', '')})</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-gray-900">₹{analytics.prediction}</span>
                    <span className={`text-sm font-medium ml-2 ${analytics.trend === "up" ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics.trend === "up" ? "Trending Up" : "Trending Down"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inventory Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ArrowUpCircle className="w-5 h-5 text-green-600" /> Top Movers (Stock Up)
                  </h3>
                  {analytics.top_selling.length > 0 ? (
                    <ul className="space-y-3">
                      {analytics.top_selling.map((item: any, idx: number) => (
                        <li key={idx} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                          <span className="font-medium text-gray-800">{item.name}</span>
                          <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md">{item.qty} units sold</span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-gray-500">Not enough diverse sales data yet.</p>}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" /> Slow Movers (Action Needed)
                  </h3>
                  {analytics.action_needed.length > 0 ? (
                    <ul className="space-y-3">
                      {analytics.action_needed.map((item: any, idx: number) => (
                        <li key={idx} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                          <span className="font-medium text-gray-800">{item.name}</span>
                          <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md">Only {item.qty} sold</span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-gray-500">All products are moving at a healthy rate!</p>}
                </div>
              </div>

              {/* Recharts Area Graph */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6 capitalize">{timeframe} Revenue</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.chart_data}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} dx={-10} />
                      <Tooltip cursor={{ stroke: '#ea580c', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="sales" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 8, fill: '#ea580c', stroke: '#fff', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
    </div>
  );
}




// "use client";

// import Sidebar from "@/components/Sidebar";
// import Navbar from "@/components/Navbar"; // 🆕 Added Navbar import
// import { useEffect, useState } from "react";
// import {
//   Activity,
//   Lightbulb,
//   TrendingUp,
//   TrendingDown,
//   ArrowUpCircle,
//   AlertTriangle,
// } from "lucide-react";
// import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import app from "../../../lib/firebase";

// export default function AnalyticsPage() {
//   const [user, setUser] = useState<any>(null);
//   const [shop, setShop] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [analytics, setAnalytics] = useState<any>(null);
//   const [timeframe, setTimeframe] = useState("monthly");

//   const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
//   const ML_API_URL = "http://localhost:8000";

//   useEffect(() => {
//     const auth = getAuth(app);
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       if (!currentUser) {
//         setUser(null);
//         setLoading(false);
//         return;
//       }
//       setUser(currentUser);
//       const token = await currentUser.getIdToken();
//       try {
//         const res = await fetch(`${API_URL}/api/seller/profile`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!res.ok) throw new Error("Failed to fetch shop");
//         const data = await res.json();
//         setShop(data.shop);

//         if (data.shop?._id) {
//           fetchAnalytics(data.shop._id, timeframe);
//         }
//       } catch (err) {
//         console.error("Error fetching shop:", err);
//       } finally {
//         setLoading(false);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     if (shop?._id) {
//       fetchAnalytics(shop._id, timeframe);
//     }
//   }, [timeframe]);

//   const fetchAnalytics = async (shopId: string, selectedTimeframe: string) => {
//     try {
//       const res = await fetch(`${ML_API_URL}/api/analytics/${shopId}?timeframe=${selectedTimeframe}`);
//       const data = await res.json();
//       if (data.success) {
//         setAnalytics(data.data);
//       }
//     } catch (err) {
//       console.error("Error fetching ML analytics:", err);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex h-screen bg-gray-50 overflow-hidden">
//         <div className="w-64 h-full flex-shrink-0 z-30">
//           <Sidebar />
//         </div>
//         <div className="flex-1 flex flex-col min-w-0 h-full">
//           <header className="h-[70px] bg-white border-b border-gray-100 flex-shrink-0 z-20">
//             <Navbar />
//           </header>
//           <main className="flex-1 flex items-center justify-center">
//             <div className="animate-spin h-12 w-12 border-t-2 border-orange-500 rounded-full"></div>
//           </main>
//         </div>
//       </div>
//     );
//   }

//   return (
//     // 🔥 FIXED: Standardized Layout Structure with Navbar
//     <div className="flex h-screen bg-gray-50 overflow-hidden">
//       {/* 1. SIDEBAR FIXED */}
//       <div className="w-64 h-full flex-shrink-0 z-30">
//         <Sidebar />
//       </div>

//       {/* 2. MAIN CONTAINER AREA */}
//       <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
//         {/* 3. NAVBAR FIXED AT TOP */}
//         <header className="h-[70px] bg-white border-b border-gray-100 flex-shrink-0 z-20">
//           <Navbar />
//         </header>

//         {/* 4. CONTENT AREA SCROLLABLE */}
//         <main className="flex-1 overflow-y-auto p-8">
//           <div className="max-w-7xl mx-auto">
//             <div className="mb-8">
//               <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Sales Intelligence</h1>
//               <p className="text-gray-600 mt-1">Predictive analytics and smart inventory recommendations.</p>
//             </div>

//             <div className="mb-8">
//               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//                 {/* Timeframe Toggles */}
//                 <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
//                   {["daily", "weekly", "monthly", "quarterly", "yearly"].map((tf) => (
//                     <button
//                       key={tf}
//                       onClick={() => setTimeframe(tf)}
//                       className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
//                         timeframe === tf 
//                         ? "bg-orange-100 text-orange-700 shadow-sm" 
//                         : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
//                       }`}
//                     >
//                       {tf}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {!analytics || analytics.chart_data?.length === 0 ? (
//                 <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-200 text-center">
//                   <Activity className="w-16 h-16 text-gray-200 mx-auto mb-4" />
//                   <h3 className="text-xl font-bold text-gray-900">Not Enough Data Yet</h3>
//                   <p className="text-gray-500 max-w-sm mx-auto mt-2">
//                     Process a few successful orders to generate your first AI-powered Machine Learning report!
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-6">
//                   {/* Insight Cards */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
//                       <div className="flex items-center gap-3 mb-4">
//                         <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
//                           <Lightbulb className="w-6 h-6" />
//                         </div>
//                         <h3 className="text-lg font-bold text-gray-900">AI Strategy Insight</h3>
//                       </div>
//                       <p className="text-gray-600 leading-relaxed italic">"{analytics.suggestion}"</p>
//                     </div>

//                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
//                       <div className="flex items-center gap-3 mb-4">
//                         <div className={`p-3 rounded-xl ${analytics.trend === "up" ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
//                           {analytics.trend === "up" ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
//                         </div>
//                         <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Projected Sales</h3>
//                       </div>
//                       <div className="flex items-baseline gap-2">
//                         <span className="text-4xl font-black text-gray-900">₹{analytics.prediction}</span>
//                         <span className={`text-sm font-bold px-2 py-0.5 rounded-full ml-2 ${analytics.trend === "up" ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                           {analytics.trend === "up" ? "↑ Up" : "↓ Down"}
//                         </span>
//                       </div>
//                       <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest">Next {timeframe.replace('ly', '')} Projection</p>
//                     </div>
//                   </div>

//                   {/* Inventory Recommendations */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
//                       <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//                         <ArrowUpCircle className="w-5 h-5 text-green-600" /> Top Movers (Stock Up)
//                       </h3>
//                       {analytics.top_selling.length > 0 ? (
//                         <ul className="space-y-3">
//                           {analytics.top_selling.map((item: any, idx: number) => (
//                             <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
//                               <span className="font-bold text-gray-800">{item.name}</span>
//                               <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">{item.qty} units sold</span>
//                             </li>
//                           ))}
//                         </ul>
//                       ) : <p className="text-sm text-gray-400">Processing diverse data...</p>}
//                     </div>

//                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
//                       <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//                         <AlertTriangle className="w-5 h-5 text-red-500" /> Slow Movers (Take Action)
//                       </h3>
//                       {analytics.action_needed.length > 0 ? (
//                         <ul className="space-y-3">
//                           {analytics.action_needed.map((item: any, idx: number) => (
//                             <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
//                               <span className="font-bold text-gray-800">{item.name}</span>
//                               <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full">Only {item.qty} sold</span>
//                             </li>
//                           ))}
//                         </ul>
//                       ) : <p className="text-sm text-gray-400">All inventory moving well!</p>}
//                     </div>
//                   </div>

//                   {/* Area Chart Card */}
//                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
//                     <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-widest text-xs">{timeframe} Revenue Forecast</h3>
//                     <div className="h-[300px] w-full">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <AreaChart data={analytics.chart_data}>
//                           <defs>
//                             <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
//                               <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
//                               <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
//                             </linearGradient>
//                           </defs>
//                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                           <XAxis 
//                             dataKey="time" 
//                             axisLine={false} 
//                             tickLine={false} 
//                             tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} 
//                             dy={10} 
//                           />
//                           <YAxis 
//                             axisLine={false} 
//                             tickLine={false} 
//                             tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} 
//                             tickFormatter={(value) => `₹${value}`} 
//                             dx={-10} 
//                           />
//                           <Tooltip 
//                             cursor={{ stroke: '#ea580c', strokeWidth: 2, strokeDasharray: '5 5' }} 
//                             contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }} 
//                           />
//                           <Area 
//                             type="monotone" 
//                             dataKey="sales" 
//                             stroke="#ea580c" 
//                             strokeWidth={4} 
//                             fillOpacity={1} 
//                             fill="url(#colorSales)" 
//                             activeDot={{ r: 8, fill: '#ea580c', stroke: '#fff', strokeWidth: 3 }} 
//                           />
//                         </AreaChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
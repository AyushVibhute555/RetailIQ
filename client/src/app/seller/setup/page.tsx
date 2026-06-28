"use client";

import { useEffect, useState } from "react";
import {
  Store,
  Phone,
  FileText,
  Upload,
  MapPin,
  CreditCard,
  Check,
  Image as ImageIcon,
  Trash2,
  LayoutDashboard,
  ListOrdered,
  Settings,
  BarChart3 // 🆕 Added BarChart3 icon for Analytics
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getIdToken, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import Sidebar from "../../../components/Sidebar";
import Navbar from "@/components/Navbar";

export default function SellerSetupPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    shopName: "",
    ownerName: "",
    mobile: "",
    address: "",
    shopType: "",
    gstNumber: "",
    upiId: "",
    openingHours: "",
    description: "",
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) router.push("/login");
      else {
        setUser(u);
        await fetchShopProfile(u);
      }
    });
    return () => unsub();
  }, [router]);

  const fetchShopProfile = async (u: any) => {
    try {
      setFetching(true);
      const token = await getIdToken(u, true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/seller/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No existing shop found");
      const data = await res.json();
      if (data.success && data.shop) {
        const s = data.shop;
        setForm({
          shopName: s.name || "",
          ownerName: s.ownerName || "",
          mobile: s.mobile || "",
          address: s.address || "",
          shopType: s.type || "",
          gstNumber: s.gstNumber || "",
          upiId: s.upiId || "",
          openingHours: s.openingHours || `${s.openTime || ""} - ${s.closeTime || ""}`,
          description: s.description || "",
        });
        if (s.logo) {
          const imgUrl = s.logo.startsWith("http") ? s.logo : `${API_URL}${s.logo}`;
          setLogoPreview(imgUrl);
        }
      }
    } catch (err) {
      console.log("No existing shop profile, new setup required.");
    } finally {
      setFetching(false);
    }
  };

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large (max 5MB)");
      return;
    }
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!user) return router.push("/login");
    setError(null);
    setLoading(true);

    try {
      const token = await getIdToken(user, true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (logo) fd.append("logo", logo);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/seller/register`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save configuration");

      alert("Infrastructure settings updated successfully!");
      router.push("/seller/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
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

  // 🆕 ADDED: Analytics to Mobile Bottom Navigation Config
  const mobileNavItems = [
    { name: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/seller/orders", icon: ListOrdered },
    { name: "Analytics", href: "/seller/analytics", icon: BarChart3 },
    { name: "Settings", href: "/seller/setup", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#FAFAFA] overflow-hidden antialiased selection:bg-orange-500/20 selection:text-orange-700 relative">

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-full flex-shrink-0 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-gray-100">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <header className="h-[70px] bg-white/80 backdrop-blur-md border-b border-gray-100 flex-shrink-0 z-20 sticky top-0">
          <Navbar />
        </header>

        {/* Added pb-24 to account for mobile bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 pb-24 md:pb-10">
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">

            <div className="flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">Infrastructure Settings</h1>
              <p className="text-gray-500 text-sm font-medium tracking-wide">Configure your enterprise instance parameters.</p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                {error}
              </div>
            )}

            <div className="bg-white rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">

              {/* Premium Identity Banner */}
              <div className="bg-gradient-to-br from-[#071A54] to-[#081E60] p-8 md:p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                <h3 className="text-xl font-bold flex items-center gap-3 relative z-10 tracking-tight mb-8">
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/5 backdrop-blur-sm">
                    <Store className="w-5 h-5 text-blue-300" />
                  </div>
                  Store Identity
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-200/70 mb-2">Registered Name *</label>
                    <input
                      required
                      placeholder="e.g. Acme Corp"
                      value={form.shopName}
                      onChange={(e) => update("shopName", e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:bg-white/10 focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all outline-none placeholder:text-blue-100/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-200/70 mb-2">Classification *</label>
                    <select
                      required
                      value={form.shopType}
                      onChange={(e) => update("shopType", e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:bg-white/10 focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all outline-none appearance-none [&>option]:text-gray-900"
                    >
                      <option value="" disabled>Select domain</option>
                      <option>Grocery</option>
                      <option>Electronics</option>
                      <option>Clothing</option>
                      <option>Pharmacy</option>
                      <option>Stationery</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-200/70 mb-2">GST Identification (Optional)</label>
                    <input
                      placeholder="e.g. 22AAAAA0000A1Z5"
                      value={form.gstNumber}
                      onChange={(e) => update("gstNumber", e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:bg-white/10 focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all outline-none placeholder:text-blue-100/30 uppercase"
                    />
                  </div>

                  {/* High-End Image Uploader */}
                  <div className="md:row-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-200/70 mb-2">Brand Mark (Logo)</label>
                    {!logoPreview ? (
                      <div className="border-2 border-dashed border-white/20 hover:border-blue-400/50 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-6 h-32 flex flex-col items-center justify-center text-center cursor-pointer relative group backdrop-blur-sm">
                        <Upload className="w-6 h-6 text-blue-300/50 group-hover:text-blue-300 mb-2 transition-colors" />
                        <p className="text-[10px] font-bold text-blue-200/70 tracking-widest uppercase">Upload Asset</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-lg group h-32 bg-white flex items-center justify-center">
                        <img src={logoPreview} alt="Logo" className="max-h-full object-contain p-2" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <button
                            onClick={() => { setLogo(null); setLogoPreview(null); }}
                            className="px-4 py-2 bg-rose-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-10 space-y-10">
                {/* Communications & Financials */}
                <section>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3 mb-6 tracking-tight">
                    <div className="bg-gray-100 p-2.5 rounded-xl border border-gray-200">
                      <Phone className="w-4 h-4 text-gray-600" />
                    </div>
                    Communications & Payment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Primary Mobile *</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          required
                          placeholder="e.g. 9876543210"
                          value={form.mobile}
                          onChange={(e) => update("mobile", e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">UPI Routing Address</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          placeholder="e.g. merchant@bank"
                          value={form.upiId}
                          onChange={(e) => update("upiId", e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none lowercase"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Physical Node Address *</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                        <textarea
                          required
                          placeholder="Enter complete routing address..."
                          value={form.address}
                          onChange={(e) => update("address", e.target.value)}
                          rows={3}
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <div className="border-t border-gray-100"></div>

                {/* Operational Logistics */}
                <section>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3 mb-6 tracking-tight">
                    <div className="bg-gray-100 p-2.5 rounded-xl border border-gray-200">
                      <FileText className="w-4 h-4 text-gray-600" />
                    </div>
                    Operational Logistics
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">SLA Window (Hours)</label>
                      <input
                        placeholder="e.g. 09:00 AM - 09:00 PM"
                        value={form.openingHours}
                        onChange={(e) => update("openingHours", e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Public Manifesto (Description)</label>
                      <textarea
                        placeholder="Detail your operational philosophy for the storefront..."
                        value={form.description}
                        onChange={(e) => update("description", e.target.value)}
                        rows={4}
                        className="w-full p-3.5 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none resize-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Action Footer */}
                <div className="pt-8 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full md:w-auto px-10 py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-[0_4px_14px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <><Check className="w-4 h-4" /> Commit Configuration</>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 📱 MOBILE BOTTOM NAVIGATION (Hidden on Desktop) */}
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
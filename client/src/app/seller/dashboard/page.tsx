"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import {
  Store,
  Package,
  PlusCircle,
  QrCode,
  TrendingUp,
  ShoppingBag,
  MapPin,
  Phone,
  CreditCard,
  X,
  Image,
  Upload,
  Trash2,
  Edit3,
  Check,
  LayoutDashboard,
  ListOrdered,
  Settings,
  Tag,
  BarChart3, // 🆕 Added for mobile bottom nav
} from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { QRCodeCanvas } from "qrcode.react";
import app from "../../../lib/firebase";
import Navbar from "@/components/Navbar";

export default function SellerDashboard() {
  const pathname = usePathname(); // 🆕 For mobile nav active state
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState("dashboard");
  const [showQRModal, setShowQRModal] = useState(false);

  // Modal States
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "", price: "", description: "", category: "", stock: "", image: null as File | null,
  });

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Smart URL checker to handle both Cloudinary and local image paths
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  const routes = [
    { name: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
    { name: "Orders", icon: ListOrdered, id: "orders" },
    { name: "Settings", icon: Settings, id: "settings" },
  ];

  // 🆕 Mobile bottom navigation items (exact copy from settings page)
  const mobileNavItems = [
    { name: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/seller/orders", icon: ListOrdered },
    { name: "Analytics", href: "/seller/analytics", icon: BarChart3 },
    { name: "Settings", href: "/seller/setup", icon: Settings },
  ];

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
        await fetchProducts(token);
      } catch (err) {
        console.error("Error fetching shop:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchShopData = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/seller/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setShop(data.shop);
      await fetchProducts(token);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);

      if (isEdit) {
        setEditingProduct({ ...editingProduct, newImage: file });
      } else {
        setNewProduct({ ...newProduct, image: file });
      }
    }
  };

  const handleAddProduct = async () => {
    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      Object.entries(newProduct).forEach(([key, value]) => {
        if (value) formData.append(key, value as any);
      });

      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      setProducts([...products, data.product]);
      setShowAddProduct(false);
      setNewProduct({ name: "", price: "", description: "", category: "", stock: "", image: null });
      setImagePreview(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProduct = async () => {
    try {
      const token = await user.getIdToken();
      const formData = new FormData();

      formData.append("name", editingProduct.name);
      formData.append("price", editingProduct.price);
      formData.append("description", editingProduct.description);
      formData.append("category", editingProduct.category);
      formData.append("stock", editingProduct.stock);

      if (editingProduct.newImage) {
        formData.append("image", editingProduct.newImage);
      }

      const res = await fetch(`${API_URL}/api/products/${editingProduct._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setProducts(products.map(p => p._id === data.product._id ? data.product : p));
        setShowEditProduct(false);
        setEditingProduct(null);
        setImagePreview(null);
      }
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const token = await user.getIdToken();
      await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCoupon = async () => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/api/seller/coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: couponCode, discountPercent: Number(discountPercent) })
      });

      const data = await res.json();
      if (data.success) {
        setShop(data.shop);
        setCouponCode("");
        setDiscountPercent("");
        alert("Coupon created successfully!");
      } else {
        alert(data.message || "Failed to create coupon");
      }
    } catch (err) {
      console.error("Error creating coupon:", err);
    }
  };

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

  const stats = [
    { label: "Total Sales", value: `₹${products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0).toFixed(2)}`, icon: TrendingUp },
    { label: "Products", value: products.length, icon: Package },
    { label: "Total Stock", value: products.reduce((sum, p) => sum + (p.stock || 0), 0), icon: ShoppingBag },
  ];

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

        {/* 🆕 Added pb-24 to prevent overlap with mobile bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 pb-24 md:pb-10">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            {activeRoute === "dashboard" && (
              <>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">System Core</h1>
                    <p className="text-gray-500 mt-1.5 text-sm font-medium tracking-wide">Operational overview of your storefront.</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                          <p className="text-2xl md:text-3xl font-black text-gray-900 mt-2 tracking-tight">{stat.value}</p>
                        </div>
                        <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                          <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Premium Deep Navy Shop Info Card */}
                {shop && (
                  <div className="bg-gradient-to-br from-[#071A54] to-[#081E60] rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgba(7,26,84,0.15)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-inner">
                          <Store className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">{shop.name}</h2>
                          <p className="text-white/70 text-sm font-medium tracking-wide">{shop.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowQRModal(true)}
                        className="w-full md:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 transition-colors rounded-xl text-white font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(249,115,22,0.3)]"
                      >
                        <QrCode className="w-4 h-4" /> Generate QR Code
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-white/90 relative z-10 border-t border-white/10 pt-6">
                      <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-xl border border-white/5">
                        <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                        <span className="truncate font-medium">{shop.address}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-xl border border-white/5">
                        <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                        <span className="truncate font-medium">{shop.mobile}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-xl border border-white/5">
                        <CreditCard className="w-4 h-4 text-orange-400 shrink-0" />
                        <span className="truncate font-medium">{shop.upiId}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Marketing & Coupons */}
                <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2.5 mb-6 tracking-tight">
                    <Tag className="w-5 h-5 text-orange-500" /> Promotional Campaigns
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4 items-end mb-6">
                    <div className="flex-1 w-full sm:min-w-[200px]">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Coupon Code</label>
                      <input
                        type="text"
                        placeholder="e.g. SUMMER20"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full p-3.5 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 uppercase font-medium focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                      />
                    </div>
                    <div className="w-full sm:w-32">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Discount %</label>
                      <input
                        type="number"
                        placeholder="10"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                        max="100"
                        min="1"
                      />
                    </div>
                    <button
                      onClick={handleAddCoupon}
                      disabled={!couponCode || !discountPercent}
                      className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 hover:bg-black text-white font-bold text-sm tracking-wide uppercase rounded-xl disabled:bg-gray-300 disabled:text-gray-500 transition-colors shadow-sm"
                    >
                      Deploy
                    </button>
                  </div>

                  {shop?.coupons?.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-4 border-t border-gray-50">
                      {shop.coupons.map((c: any, i: number) => (
                        <span key={i} className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100/60 uppercase tracking-wide">
                          {c.code} <span className="opacity-50 mx-1">•</span> {c.discountPercent}% OFF
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Products Grid */}
                <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2.5 tracking-tight">
                      <Package className="w-5 h-5 text-gray-400" /> Inventory Architecture
                    </h2>
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setShowAddProduct(true);
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black rounded-xl text-white font-bold text-sm tracking-wide uppercase transition-colors shadow-sm"
                    >
                      <PlusCircle className="w-4 h-4" /> Add Item
                    </button>
                  </div>

                  {products.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                      {products.map((p) => (
                        <div key={p._id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
                          <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                            <img src={getImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-colors shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="p-5 flex flex-col flex-1">
                            <h3 className="font-bold text-gray-900 mb-1 leading-tight line-clamp-1">{p.name}</h3>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">{p.category}</p>

                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-end justify-between">
                              <div>
                                <p className="text-lg font-black text-gray-900">₹{p.price}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Stock: {p.stock}</p>
                              </div>
                              <button
                                onClick={() => {
                                  setEditingProduct({ ...p, newImage: null });
                                  setImagePreview(getImageUrl(p.image));
                                  setShowEditProduct(true);
                                }}
                                className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 px-4 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-900 font-bold text-lg">Empty Inventory</p>
                      <p className="text-gray-500 text-sm mt-1">Add your first product to generate the storefront.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Other Routes Placeholder */}
            {(activeRoute === "orders" || activeRoute === "settings") && (
              <div className="bg-white rounded-[2rem] p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">{activeRoute} Module</h2>
                <p className="text-gray-500">Infrastructure components initializing...</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- FLOATING QR MODAL --- */}
      {showQRModal && shop && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 inline-block mb-6">
                <QRCodeCanvas
                  id="shopQR"
                  value={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/shop/${shop._id}`}
                  size={200}
                  includeMargin
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Storefront Gateway</h3>
              <p className="text-xs text-gray-500 font-medium mb-6">Scan to access customer interface directly.</p>

              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 mb-6">
                <input
                  type="text"
                  readOnly
                  value={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/shop/${shop._id}`}
                  className="flex-1 bg-transparent text-gray-600 text-xs font-mono outline-none px-2 truncate"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/shop/${shop._id}`);
                    alert("Copied to clipboard");
                  }}
                  className="px-4 py-2 bg-gray-900 hover:bg-black rounded-lg text-xs font-bold text-white uppercase tracking-wider transition-colors"
                >
                  Copy
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const canvas = document.querySelector("#shopQR") as HTMLCanvasElement;
                    const link = document.createElement("a");
                    link.download = `${shop.name}_Gateway.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                  }}
                  className="flex-1 px-4 py-3.5 bg-orange-500 hover:bg-orange-600 transition-colors rounded-xl text-white font-bold text-xs uppercase tracking-widest shadow-sm"
                >
                  Download Asset
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="px-4 py-3.5 bg-gray-100 hover:bg-gray-200 transition-colors rounded-xl text-gray-700 font-bold text-xs uppercase tracking-widest"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT PRODUCT MODAL --- */}
      {(showAddProduct || showEditProduct) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl my-auto shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-300 flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="border-b border-gray-100 p-6 md:p-8 flex justify-between items-center shrink-0">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                {showEditProduct ? "Update Entity" : "Provision New Entity"}
              </h2>
              <button
                onClick={() => { setShowAddProduct(false); setShowEditProduct(false); }}
                className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                {/* Image Upload Area */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Asset Media *</label>
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-gray-200 hover:border-orange-300 bg-gray-50/50 hover:bg-orange-50/30 transition-colors rounded-2xl p-8 h-48 flex flex-col items-center justify-center text-center cursor-pointer relative group">
                      <Image className="w-8 h-8 text-gray-400 group-hover:text-orange-400 mb-3 transition-colors" />
                      <p className="text-xs font-bold text-gray-600 mb-1">Click or drag to upload</p>
                      <p className="text-[10px] font-medium text-gray-400">PNG, JPG up to 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, showEditProduct)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="imageUpload"
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button
                          onClick={() => {
                            setImagePreview(null);
                            showEditProduct ? setEditingProduct({ ...editingProduct, newImage: null }) : setNewProduct({ ...newProduct, image: null });
                          }}
                          className="px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                        >
                          <Trash2 className="w-3 h-3" /> Remove Asset
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Entity Identifier *</label>
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={showEditProduct ? editingProduct?.name : newProduct.name}
                      onChange={(e) => showEditProduct ? setEditingProduct({ ...editingProduct, name: e.target.value }) : setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Base Value (₹) *</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={showEditProduct ? editingProduct?.price : newProduct.price}
                        onChange={(e) => showEditProduct ? setEditingProduct({ ...editingProduct, price: e.target.value }) : setNewProduct({ ...newProduct, price: e.target.value })}
                        className="w-full p-3.5 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                        min="0" step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Unit Stock</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={showEditProduct ? editingProduct?.stock : newProduct.stock}
                        onChange={(e) => showEditProduct ? setEditingProduct({ ...editingProduct, stock: e.target.value }) : setNewProduct({ ...newProduct, stock: e.target.value })}
                        className="w-full p-3.5 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Classification Node</label>
                    <input
                      type="text"
                      placeholder="Category"
                      value={showEditProduct ? editingProduct?.category : newProduct.category}
                      onChange={(e) => showEditProduct ? setEditingProduct({ ...editingProduct, category: e.target.value }) : setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Detailed Specifications</label>
                <textarea
                  placeholder="Describe the item attributes..."
                  value={showEditProduct ? editingProduct?.description : newProduct.description}
                  onChange={(e) => showEditProduct ? setEditingProduct({ ...editingProduct, description: e.target.value }) : setNewProduct({ ...newProduct, description: e.target.value })}
                  rows={4}
                  className="w-full p-3.5 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 md:p-8 border-t border-gray-50 bg-gray-50/50 rounded-b-[2rem] flex flex-col sm:flex-row justify-end gap-3 shrink-0">
              <button
                onClick={() => { setShowAddProduct(false); setShowEditProduct(false); }}
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-bold text-xs tracking-widest uppercase transition-colors"
              >
                Abort
              </button>
              <button
                onClick={showEditProduct ? handleUpdateProduct : handleAddProduct}
                className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 hover:bg-black rounded-xl text-white font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                {showEditProduct ? "Commit Changes" : "Deploy Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 📱 MOBILE BOTTOM NAVIGATION (exact copy from settings page) */}
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
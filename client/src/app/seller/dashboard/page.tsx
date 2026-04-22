"use client";

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
} from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { QRCodeCanvas } from "qrcode.react";
import app from "../../../lib/firebase";
import Navbar from "@/components/Navbar";

export default function SellerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState("dashboard");
  const [showQRModal, setShowQRModal] = useState(false);

  // 🆕 Modal States
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "", price: "", description: "", category: "", stock: "", image: null as File | null,
  });

  // 🆕 Edit Product State
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 🆕 Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // 🛠️ THE FIX: Smart URL checker to handle both Cloudinary and local image paths
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.png"; // Fallback
    if (imagePath.startsWith("http")) return imagePath; // Cloudinary URLs
    return `${API_URL}${imagePath}`; // Old local uploads
  };

  const routes = [
    { name: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
    { name: "Orders", icon: ListOrdered, id: "orders" },
    { name: "Settings", icon: Settings, id: "settings" },
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin h-12 w-12 border-t-2 border-orange-500 rounded-full"></div>
      </div>
    );
  }

  const stats = [
    { label: "Total Sales", value: `₹${products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0).toFixed(2)}`, icon: TrendingUp },
    { label: "Products", value: products.length, icon: Package },
    { label: "Total Stock", value: products.reduce((sum, p) => sum + (p.stock || 0), 0), icon: ShoppingBag },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 h-full flex-shrink-0 z-30 bg-white border-r border-gray-100">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-[70px] bg-white border-b border-gray-100 flex-shrink-0 z-20">
          <Navbar />
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {activeRoute === "dashboard" && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">Welcome back, Seller</h1>
                  <p className="text-gray-600 mt-1">Here are today's stats from your shop!</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-600 text-sm">{stat.label}</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-xl">
                          <stat.icon className="w-6 h-6 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shop Info */}
                {shop && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-3 rounded-xl">
                          <Store className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">{shop.name}</h2>
                          <p className="text-gray-600 text-sm">{shop.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowQRModal(true)}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white flex items-center gap-2"
                      >
                        <QrCode className="w-4 h-4" />
                        QR Code
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                      <div className="flex gap-2">
                        <MapPin className="w-5 h-5 text-orange-600" />
                        <span>{shop.address}</span>
                      </div>
                      <div className="flex gap-2">
                        <Phone className="w-5 h-5 text-orange-600" />
                        <span>{shop.mobile}</span>
                      </div>
                      <div className="flex gap-2">
                        <CreditCard className="w-5 h-5 text-orange-600" />
                        <span>{shop.upiId}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🆕 COUPONS SECTION */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Tag className="w-6 h-6 text-orange-600" /> Marketing & Coupons
                  </h2>
                  <div className="flex flex-wrap gap-4 items-end mb-6">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                      <input
                        type="text"
                        placeholder="e.g. SUMMER20"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        // 🛠️ THE FIX: Added text-gray-900 here
                        className="w-full p-2.5 rounded-lg border border-gray-300 text-gray-900 uppercase focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                      <input
                        type="number"
                        placeholder="10"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        // 🛠️ THE FIX: Added text-gray-900 here
                        className="w-full p-2.5 rounded-lg border border-gray-300 text-gray-900 focus:ring-orange-500 focus:border-orange-500"
                        max="100"
                        min="1"
                      />
                    </div>
                    <button
                      onClick={handleAddCoupon}
                      disabled={!couponCode || !discountPercent}
                      className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg disabled:bg-gray-300 transition-colors"
                    >
                      Create
                    </button>
                  </div>

                  {/* Display existing coupons */}
                  {shop?.coupons?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {shop.coupons.map((c: any, i: number) => (
                        <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold border border-green-200">
                          {c.code} - {c.discountPercent}% OFF
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Products Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="w-6 h-6 text-orange-600" />
                      Your Products
                    </h2>
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setShowAddProduct(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white"
                    >
                      <PlusCircle className="w-5 h-5" />
                      Add Product
                    </button>
                  </div>

                  {products.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {products.map((p) => (
                        <div key={p._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative">
                            {/* 🛠️ THE FIX: Applied getImageUrl to the product display */}
                            <img src={getImageUrl(p.image)} alt={p.name} className="w-full h-40 object-cover" />
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-1">{p.name}</h3>
                            <p className="text-orange-600 font-bold mb-2">₹{p.price}</p>
                            <p className="text-gray-600 text-sm mb-3">{p.category}</p>

                            <div className="border-t border-gray-200 pt-3 flex items-center justify-between mt-2">
                              <span className="text-gray-700 text-sm">
                                Stock: <span className="font-semibold">{p.stock}</span>
                              </span>
                              <button
                                onClick={() => {
                                  setEditingProduct({ ...p, newImage: null });
                                  // 🛠️ THE FIX: Applied getImageUrl to the Edit Preview
                                  setImagePreview(getImageUrl(p.image));
                                  setShowEditProduct(true);
                                }}
                                className="text-orange-600 hover:text-orange-700 flex items-center gap-1 text-sm font-medium"
                              >
                                <Edit3 className="w-4 h-4" />
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">No products yet</p>
                  )}
                </div>
              </>
            )}

            {activeRoute === "orders" && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Orders</h2>
                <p className="text-gray-600">Orders functionality coming soon...</p>
              </div>
            )}

            {activeRoute === "settings" && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
                <p className="text-gray-600">Settings functionality coming soon...</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* QR Modal (Unchanged) */}
      {showQRModal && shop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <QRCodeCanvas
                id="shopQR"
                value={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/shop/${shop._id}`}
                size={256}
                includeMargin
              />
              <div className="mt-4">
                <p className="text-gray-700 text-sm mb-2">Shop Link:</p>
                <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                  <input
                    type="text"
                    readOnly
                    value={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/shop/${shop._id}`}
                    className="flex-1 bg-transparent text-gray-700 text-sm text-center"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/shop/${shop._id}`);
                      alert("Link copied!");
                    }}
                    className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm text-white"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    const canvas = document.querySelector("#shopQR") as HTMLCanvasElement;
                    const link = document.createElement("a");
                    link.download = `${shop.name}_QR.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                  }}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white"
                >
                  Download
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shared Form Modal for Adding AND Editing Products */}
      {(showAddProduct || showEditProduct) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8">
            <div className="border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {showEditProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => { setShowAddProduct(false); setShowEditProduct(false); }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Image *</label>
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                      <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, showEditProduct)}
                        className="hidden"
                        id="imageUpload"
                      />
                      <label htmlFor="imageUpload" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 cursor-pointer inline-flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Choose File
                      </label>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border-2 border-gray-300">
                      <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                      <button
                        onClick={() => {
                          setImagePreview(null);
                          showEditProduct ? setEditingProduct({ ...editingProduct, newImage: null }) : setNewProduct({ ...newProduct, image: null });
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-lg"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={showEditProduct ? editingProduct?.name : newProduct.name}
                      onChange={(e) => showEditProduct ? setEditingProduct({ ...editingProduct, name: e.target.value }) : setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full p-3 rounded-lg border border-gray-300 text-gray-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                      <input
                        type="number"
                        value={showEditProduct ? editingProduct?.price : newProduct.price}
                        onChange={(e) => showEditProduct ? setEditingProduct({ ...editingProduct, price: e.target.value }) : setNewProduct({ ...newProduct, price: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 text-gray-900"
                        min="0" step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                      <input
                        type="number"
                        value={showEditProduct ? editingProduct?.stock : newProduct.stock}
                        onChange={(e) => showEditProduct ? setEditingProduct({ ...editingProduct, stock: e.target.value }) : setNewProduct({ ...newProduct, stock: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 text-gray-900"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <input
                      type="text"
                      value={showEditProduct ? editingProduct?.category : newProduct.category}
                      onChange={(e) => showEditProduct ? setEditingProduct({ ...editingProduct, category: e.target.value }) : setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full p-3 rounded-lg border border-gray-300 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={showEditProduct ? editingProduct?.description : newProduct.description}
                  onChange={(e) => showEditProduct ? setEditingProduct({ ...editingProduct, description: e.target.value }) : setNewProduct({ ...newProduct, description: e.target.value })}
                  rows={4}
                  className="w-full p-3 rounded-lg border border-gray-300 text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => { setShowAddProduct(false); setShowEditProduct(false); }}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={showEditProduct ? handleUpdateProduct : handleAddProduct}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 rounded-lg text-white flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
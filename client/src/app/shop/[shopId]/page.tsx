"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart, Minus, Plus, Download, Store, Phone, MapPin, X, Package, CreditCard, CheckCircle, Tag, Receipt, MessageCircle, Send, Search } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ShopPage() {
  const { shopId } = useParams();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showPopup, setShowPopup] = useState<string | null>(null);

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");

  // 🆕 Search State
  const [searchQuery, setSearchQuery] = useState("");

  // 🆕 NEW: Placed Order State for the Receipt Bill Screen
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // --- 🆕 CHATBOT STATES ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTab, setChatTab] = useState<"ai" | "review">("ai");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string, text: string }[]>([
    { role: "bot", text: "Hi! How can I help you today?" }
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // 🛠️ THE FIX: Smart URL checker to handle both Cloudinary and local image paths
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.png"; // Fallback
    if (imagePath.startsWith("http")) return imagePath; // Cloudinary URLs
    return `${baseUrl}${imagePath}`; // Old local uploads
  };

  useEffect(() => {
    if (shopId) fetchShopData();
  }, [shopId]);

  const fetchShopData = async () => {
    try {
      const res = await fetch(
        `${baseUrl}/api/shops/${shopId}?t=${Date.now()}`,
        { cache: "no-store" }
      );

      const data = await res.json();

      if (data.success) {
        setShop(data.shop);
        setProducts(data.products || []);
      } else {
        alert("Shop not found");
      }
    } catch (err) {
      console.error("Error fetching shop:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCart((prev: any) => {
      const updatedCart: any = {};
      Object.keys(prev).forEach((id) => {
        const latestProduct = products.find((p) => p._id === id);
        if (latestProduct) {
          updatedCart[id] = {
            ...latestProduct,
            quantity: prev[id].quantity,
          };
        }
      });
      return updatedCart;
    });
  }, [products]);

  const addToCart = (product: any) => {
    setCart((prev: any) => {
      const existing = prev[product._id];
      setShowPopup(product.name);
      setTimeout(() => setShowPopup(null), 2000);
      return {
        ...prev,
        [product._id]: {
          ...product,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev: any) => {
      const updated = { ...prev };
      if (updated[id]) {
        const newQuantity = updated[id].quantity + delta;
        if (newQuantity <= 0) {
          delete updated[id];
        } else {
          updated[id] = { ...updated[id], quantity: newQuantity };
        }
      }
      return updated;
    });
  };

  const subTotal = Object.values(cart).reduce(
    (acc: number, item: any) => {
      const latest = products.find((p) => p._id === item._id);
      return acc + (latest?.price || item.price) * item.quantity;
    },
    0
  );

  const discountAmount = (subTotal * appliedDiscount) / 100;
  const totalAmount = subTotal - discountAmount;

  const totalItems = Object.values(cart).reduce(
    (acc: number, item: any) => acc + item.quantity,
    0
  );

  const handleApplyCoupon = () => {
    setCouponError("");
    if (!couponCode) return;

    const validCoupon = shop?.coupons?.find(
      (c: any) => c.code.toUpperCase() === couponCode.toUpperCase()
    );

    if (validCoupon) {
      setAppliedDiscount(validCoupon.discountPercent);
      setCouponCode("");
    } else {
      setCouponError("Invalid coupon code");
      setAppliedDiscount(0);
    }
  };

  // --- 🆕 CHATBOT LOGIC ---
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const userMsg = { role: "user", text: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);

    const query = chatMessage.toLowerCase();
    const foundProduct = products.find(p => query.includes(p.name.toLowerCase()));
    setChatMessage("");

    setTimeout(() => {
      let botResponse = "I'm not sure about that item. Try asking about our products!";
      if (foundProduct) {
        botResponse = `${foundProduct.name} is ₹${foundProduct.price}. ${foundProduct.description || ""}`;
      } else if (query.includes("hi") || query.includes("hello")) {
        botResponse = "Hello! I'm the RetailIQ Assistant. Ask me anything!";
      }
      setChatHistory(prev => [...prev, { role: "bot", text: botResponse }]);
    }, 800);
  };

  // 🆕 Filtered Products Logic
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 🆕 UPGRADED PDF GENERATOR
  const downloadOrderPDF = (orderData: any) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(234, 88, 12);
    doc.text(shop?.name || "RetailIQ Receipt", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Address: ${shop?.address || "N/A"}`, 105, 28, { align: "center" });
    doc.text(`Phone: ${shop?.mobile || "N/A"}`, 105, 34, { align: "center" });

    doc.setDrawColor(220, 220, 220);
    doc.line(14, 40, 196, 40);

    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(`Order ID: ${orderData._id}`, 14, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 56);
    doc.text(`Payment Method: ${orderData.paymentMethod.toUpperCase()}`, 14, 62);
    doc.text(`Status: ${orderData.paymentStatus.toUpperCase()}`, 14, 68);

    const tableData = orderData.items.map((item: any) => [
      item.name,
      item.quantity.toString(),
      `Rs. ${item.price.toFixed(2)}`,
      `Rs. ${(item.price * item.quantity).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 75,
      head: [["Product Item", "Qty", "Unit Price", "Total"]],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [234, 88, 12], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 6 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text(`Grand Total: Rs. ${orderData.totalAmount.toFixed(2)}`, 196, finalY, { align: "right" });
    doc.save(`Receipt_${orderData._id}.pdf`);
  };

  const handleCashPayment = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/shops/${shopId}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: Object.values(cart),
          totalAmount,
          paymentMethod: "cash",
        }),
      });
      const data = await res.json();

      if (data.success) {
        setPlacedOrder(data.order);
        setCart({});
        setShowCart(false);
        setAppliedDiscount(0);
        fetchShopData();
      } else {
        alert(data.message || "Failed to place order");
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("Error placing order");
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleOnlinePayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      const initRes = await fetch(`${baseUrl}/api/shops/${shopId}/init-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalAmount }),
      });

      const initData = await initRes.json();
      if (!initData.success) {
        alert("Failed to initialize payment");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: initData.amount,
        currency: initData.currency,
        name: shop.name,
        description: "Purchase from " + shop.name,
        order_id: initData.order_id,
        handler: async function (response: any) {
          const orderRes = await fetch(`${baseUrl}/api/shops/${shopId}/order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: Object.values(cart),
              totalAmount,
              paymentMethod: "online",
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const orderData = await orderRes.json();
          if (orderData.success) {
            setPlacedOrder(orderData.order);
            setCart({});
            setShowCart(false);
            setAppliedDiscount(0);
            fetchShopData();
          } else {
            alert(orderData.message || "Payment verification failed");
          }
        },
        theme: { color: "#ea580c" },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong during payment processing.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <div className="animate-spin h-12 w-12 border-t-2 border-orange-500 rounded-full"></div>
      </div>
    );

  if (!shop)
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Shop not found</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 relative">

      {/* 🆕 BILL / RECEIPT SCREEN */}
      {placedOrder && (
        <div className="fixed inset-0 bg-gray-50/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-6 md:p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Order Confirmed!</h2>
              <p className="text-gray-500 mt-1">Thank you for shopping at {shop?.name}</p>
            </div>

            <div className="border-t border-b border-gray-100 py-4 mb-6 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-800">{placedOrder._id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-medium text-gray-900 capitalize">{placedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Payment Status</span>
                <span className={`font-bold px-2 py-0.5 rounded-md ${placedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} capitalize`}>
                  {placedOrder.paymentStatus}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-gray-400" />
                Order Details
              </h3>
              <div className="space-y-3">
                {placedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.quantity}x {item.name}</span>
                    <span className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total Paid</span>
                <span className="font-bold text-xl text-gray-900">₹{placedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => downloadOrderPDF(placedOrder)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Download className="w-5 h-5" />
                Download PDF Receipt
              </button>
              <button
                onClick={() => setPlacedOrder(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-xl font-semibold transition-colors"
              >
                Back to Shop
              </button>
            </div>
          </div>
        </div>
      )}


      {/* SUCCESS POPUP */}
      {showPopup && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle className="text-green-400 w-5 h-5" />
          <span className="font-medium text-sm">{showPopup} added to cart!</span>
        </div>
      )}

      {/* --- 🆕 CHATBOT UI --- */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
        {isChatOpen && (
          <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            <div className="bg-gray-900 p-4">
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setChatTab("ai")}
                  className={`flex-1 py-1 text-xs font-bold rounded transition-colors ${chatTab === 'ai' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  AI Chat
                </button>
                <button
                  onClick={() => setChatTab("review")}
                  className={`flex-1 py-1 text-xs font-bold rounded transition-colors ${chatTab === 'review' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Reviews
                </button>
              </div>
            </div>

            <div className="h-80 overflow-y-auto p-4 bg-gray-50">
              {chatTab === "ai" ? (
                <div className="space-y-3">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-xl text-sm shadow-sm max-w-[85%] ${msg.role === 'user'
                          ? 'bg-orange-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                        }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <select className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none">
                    {products.map(p => <option key={p._id} className="text-gray-900">{p.name}</option>)}
                  </select>
                  <textarea
                    placeholder="Write a review..."
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm h-24 bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <button
                    onClick={() => { alert("Review submitted successfully!"); setChatTab("ai"); }}
                    className="w-full bg-gray-900 hover:bg-black text-white py-2 rounded-lg text-sm font-bold"
                  >
                    Submit Review
                  </button>
                </div>
              )}
            </div>

            {chatTab === "ai" && (
              <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
                <input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Ask something..."
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-orange-600 hover:bg-orange-700 p-2 rounded-lg text-white transition-colors flex items-center justify-center"
                >
                  <Send size={16} />
                </button>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          {isChatOpen ? <X size={24} /> : <MessageCircle size={28} />}
        </button>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {shop.logo ? (
                // 🛠️ THE FIX: Applied getImageUrl to the shop logo
                <img
                  src={getImageUrl(shop.logo)}
                  alt={shop.name}
                  className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Store className="w-6 h-6 text-orange-600" />
                </div>
              )}
              <div className="flex flex-col">
                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none transition-all group-hover:text-orange-600">
                  {shop.name}
                </h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="h-[2px] w-5 bg-orange-600 rounded-full" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] leading-none">
                    {shop.type || "Official Store"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCart(true)}
              className="relative bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Shop Info Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative -mt-6 z-10 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_15px_40px_rgba(0,0,0,0.04)] rounded-[2rem] p-2 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px] flex items-center gap-4 bg-white shadow-sm rounded-2xl px-5 py-3 border border-gray-50 transition-all hover:shadow-md group cursor-pointer">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-600 transition-colors duration-300">
                    <MapPin className="w-5 h-5 text-orange-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Store Locator</span>
                    <span className="text-[12px] font-bold text-gray-900 truncate max-w-[150px] tracking-tight">{shop.address}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-[200px] flex items-center gap-4 bg-white shadow-sm rounded-2xl px-5 py-3 border border-gray-50 transition-all hover:shadow-md group cursor-pointer">
                  <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center group-hover:bg-orange-600 transition-colors duration-300">
                    <Phone className="w-5 h-5 text-orange-500 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Direct Support</span>
                    <span className="text-[12px] font-black text-gray-900 tracking-widest">{shop.mobile}</span>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-4 px-6 py-2">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Stock Status</span>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-[10px] font-black text-gray-900 uppercase">Live & Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search Bar Section */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 outline-none shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
          <p className="text-gray-600 mt-1">{filteredProducts.length} items found</p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No products found matching your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const itemInCart = cart[p._id];

              return (
                <div
                  key={p._id}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow group flex flex-col"
                >
                  <div className="relative overflow-hidden bg-gray-100">
                    {p.image ? (
                      // 🛠️ THE FIX: Applied getImageUrl to the product display
                      <img
                        src={getImageUrl(p.image)}
                        alt={p.name}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-56 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    {p.stock <= 5 && p.stock > 0 && (
                      <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Only {p.stock} left
                      </span>
                    )}
                    {p.stock === 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {p.name}
                    </h3>
                    {p.category && (
                      <p className="text-xs text-gray-500 mb-2">{p.category}</p>
                    )}
                    {p.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {p.description}
                      </p>
                    )}

                    <div className="mt-auto">
                      <p className="text-2xl font-bold text-gray-900 mb-3">₹{p.price}</p>

                      {!itemInCart ? (
                        <button
                          onClick={() => addToCart(p)}
                          disabled={p.stock === 0}
                          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors"
                        >
                          {p.stock === 0 ? "Out of Stock" : "Add to Cart"}
                        </button>
                      ) : (
                        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-1 border border-gray-200">
                          <button
                            onClick={() => updateQuantity(p._id, -1)}
                            className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-lg active:scale-90 transition-transform"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="font-bold text-lg text-gray-800">{itemInCart.quantity}</span>
                          <button
                            onClick={() => updateQuantity(p._id, 1)}
                            disabled={itemInCart.quantity >= p.stock}
                            className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-lg active:scale-90 transition-transform disabled:bg-gray-400"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
                Your Cart ({totalItems})
              </h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {Object.keys(cart).length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.values(cart).map((item: any) => (
                    <div key={item._id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      {item.image ? (
                        // 🛠️ THE FIX: Applied getImageUrl to the cart images
                        <img src={getImageUrl(item.image)} className="w-20 h-20 object-cover rounded-lg" />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-orange-600 font-bold">₹{item.price}</p>
                      </div>
                      <div className="text-right font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {totalAmount > 0 && (
              <div className="p-6 bg-white border-t border-gray-200">
                <div className="mb-4">
                  <div className="flex gap-2 mb-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Promo Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        // 🛠️ THE FIX: Added text-gray-900 and focus states to the Promo Code input
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 uppercase focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                    <button onClick={handleApplyCoupon} className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium">Apply</button>
                  </div>
                  {couponError && <p className="text-red-500 text-xs">{couponError}</p>}
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg mt-2">
                      <span>{appliedDiscount}% OFF Applied!</span>
                      <button onClick={() => setAppliedDiscount(0)}><X className="w-4 h-4 text-green-700 hover:text-green-900" /></button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500 mb-2"><span>Subtotal</span><span>₹{subTotal.toFixed(2)}</span></div>
                {appliedDiscount > 0 && <div className="flex justify-between items-center text-sm text-green-600 mb-2 font-medium"><span>Discount</span><span>-₹{discountAmount.toFixed(2)}</span></div>}
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 mb-4 pt-3 border-t border-gray-100"><span>Total</span><span>₹{totalAmount.toFixed(2)}</span></div>

                <div className="space-y-3">
                  <button onClick={handleOnlinePayment} className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" /> Pay ₹{totalAmount.toFixed(2)} Online
                  </button>
                  <button onClick={handleCashPayment} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold">Pay Cash at Counter</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
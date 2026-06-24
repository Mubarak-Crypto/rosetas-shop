"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link"; 
import { 
  Package, 
  History, 
  Settings, 
  LogOut, 
  Download, 
  Truck, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  MapPin,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"tracking" | "history" | "profile">("tracking");
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingHouseNumber, setShippingHouseNumber] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingZip, setShippingZip] = useState("");
  const [shippingCountry, setShippingCountry] = useState("Germany");
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchCustomerOrders();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone_number || "");
      setShippingStreet(profile.shipping_street || "");
      setShippingHouseNumber(profile.shipping_house_number || "");
      setShippingCity(profile.shipping_city || "");
      setShippingZip(profile.shipping_postal_code || "");
      setShippingCountry(profile.shipping_country || "Germany");
    }
  }, [profile]);

  const fetchCustomerOrders = async () => {
    try {
      setOrdersLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      // Temporarily removed 'full_name' to bypass the schema cache error
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone_number: phone,
          shipping_street: shippingStreet,
          shipping_house_number: shippingHouseNumber,
          shipping_city: shippingCity,
          shipping_postal_code: shippingZip,
          shipping_country: shippingCountry,
          updated_at: new Date().toISOString()
        })
        .eq("id", user?.id);

      if (error) {
        console.error("Update Error:", error);
        alert("Error saving: " + error.message);
      } else {
        alert(language === "EN" ? "Shipping settings updated!" : "Versandeinstellungen aktualisiert!");
      }
    } catch (err) {
      console.error("Error saving address details:", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const getTrackingUrl = (carrierName: string, trackingNum: string) => {
    const nameLower = (carrierName || "").toLowerCase();
    if (nameLower.includes("hermes")) return `https://www.myhermes.de/empfangen/sendungsverfolgung/#/sendungsnummer/${trackingNum}`;
    if (nameLower.includes("dpd")) return `https://tracking.dpd.de/status/${language === "EN" ? "en_US" : "de_DE"}/parcel/${trackingNum}`;
    if (nameLower.includes("ups")) return `https://www.ups.com/track?track=yes&trackNums=${trackingNum}&loc={language === "EN" ? "en_US" : "de_DE"}`;
    return `https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=${trackingNum}`;
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F6EFE6] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C9A24D]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] p-4 md:p-12 font-medium select-none">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-[2rem] shadow-xl border border-black/5 flex flex-col justify-between h-auto lg:h-[70vh]">
          <div className="space-y-6">
            <div className="border-b border-black/5 pb-4 text-center lg:text-left">
              <p className="text-[10px] uppercase font-black tracking-widest text-[#1F1F1F]/40 mb-1">
                {language === "EN" ? "Welcome Member" : "Willkommen Mitglied"}
              </p>
              <h2 className="text-xl font-bold truncate text-[#1F1F1F]">
                {profile?.full_name || user.email?.split("@")[0]}
              </h2>
            </div>
            <nav className="space-y-2">
              <Link href="/">
                <div className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-[#1F1F1F]/70 hover:bg-[#F6EFE6]/60 hover:text-[#1F1F1F] transition-all mb-4 cursor-pointer border border-dashed border-black/5">
                  <ArrowRight size={18} className="rotate-180 text-[#C9A24D]" />
                  <span>{language === "EN" ? "Back to Shop" : "Zurück zum Shop"}</span>
                </div>
              </Link>
              <button
                onClick={() => setActiveTab("tracking")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === "tracking" ? "bg-[#C9A24D] text-white shadow-md" : "hover:bg-[#F6EFE6]/60 text-[#1F1F1F]/70"}`}
              >
                <Package size={18} />
                <span>{language === "EN" ? "Live Tracking" : "Live-Verfolgung"}</span>
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === "history" ? "bg-[#C9A24D] text-white shadow-md" : "hover:bg-[#F6EFE6]/60 text-[#1F1F1F]/70"}`}
              >
                <History size={18} />
                <span>{language === "EN" ? "Order Vault" : "Bestellhistorie"}</span>
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === "profile" ? "bg-[#C9A24D] text-white shadow-md" : "hover:bg-[#F6EFE6]/60 text-[#1F1F1F]/70"}`}
              >
                <Settings size={18} />
                <span>{language === "EN" ? "Express Profile" : "Express-Profil"}</span>
              </button>
              <a
                href="https://wa.me/4915565956604"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-emerald-600 bg-emerald-50/40 hover:bg-emerald-50 border border-emerald-100/40 transition-all mt-2 cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-500 shrink-0">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.057 5.321 5.381.0 12.008.0c3.211.0 6.231 1.251 8.503 3.522 2.272 2.271 3.52 5.291 3.518 8.503-.003 6.68-5.328 12.001-11.955 12.001-2.005.0-3.974-.5-5.729-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.0 9.86-4.37 9.863-9.748.002-2.607-1.012-5.059-2.859-6.908C16.58 2.1 14.135.917 11.538.917c-5.444.0-9.866 4.372-9.87 9.75-.002 1.792.483 3.548 1.407 5.102l-.999 3.648 3.734-.973zm11.066-5.45c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.321-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-1.72-.242-.105-.485-.09-.669-.091-.174.0-.373-.021-.573.198-.198.218-.756.739-.756 1.802.0 1.063.774 2.091.882 2.239.109.149 1.522 2.323 3.687 3.257.515.222.917.355 1.231.455.518.165.99.141 1.363.085.417-.061 1.758-.718 2.006-1.412.248-.695.248-1.29.173-1.412-.074-.122-.272-.198-.57-.347z"/>
                </svg>
                <span>{language === "EN" ? "Chat with Support" : "Support-Chat"}</span>
              </a>
            </nav>
          </div>
          <button
            onClick={() => signOut().then(() => router.push("/"))}
            className="w-full mt-6 flex items-center justify-center gap-2 border border-red-100 hover:bg-red-50 text-red-600 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
          >
            <LogOut size={14} />
            <span>{language === "EN" ? "Log Out" : "Abmelden"}</span>
          </button>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3 bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-black/5 min-h-[60vh]">
          {activeTab === "tracking" && (
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Truck className="text-[#C9A24D]" size={24} />
                {language === "EN" ? "Active Luxury Trackings" : "Aktive Bestellungen"}
              </h3>
              {ordersLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#C9A24D]" /></div>
              ) : orders.filter(o => o.status !== "delivered" && o.status !== "completed").length === 0 ? (
                <div className="text-center py-16 bg-[#F6EFE6]/30 rounded-2xl border border-dashed border-black/10">
                  <p className="text-sm text-[#1F1F1F]/40 font-bold">
                    {language === "EN" ? "No active creations in progress right now." : "Aktuell befinden sich keine Bestellungen in Handarbeit."}
                  </p>
                </div>
              ) : (
                orders.filter(o => o.status !== "delivered" && o.status !== "completed").map((order) => (
                  <div key={order.id} className="border border-black/5 bg-[#F6EFE6]/20 p-6 rounded-2xl mb-4">
                    <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-black/5 pb-4 mb-6 gap-4">
                      <div className="grid grid-cols-2 md:flex md:items-center gap-6">
                        <div>
                          <span className="text-[10px] uppercase font-black tracking-widest text-[#1F1F1F]/40 block">{language === "EN" ? "Reference Number" : "Referenznummer"}</span>
                          <span className="font-bold text-sm">ROSETAS-{String(order.id).padStart(5, "0")}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-black tracking-widest text-[#1F1F1F]/40 block">{language === "EN" ? "Expected Arrival" : "Erwartete Ankunft"}</span>
                          <span className="font-bold text-sm text-[#C9A24D]">{order.estimated_delivery || "10-14 Business Days"}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-6">
                        {order.tracking_number && (
                          <a href={getTrackingUrl(order.carrier, order.tracking_number)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-white hover:bg-[#C9A24D] hover:text-white border border-black/5 text-[#1F1F1F]/70 px-3 py-2 rounded-xl transition-all shadow-sm">
                            <span>{order.carrier || "DHL"} Track</span> <ExternalLink size={12} />
                          </a>
                        )}
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-black tracking-widest text-[#1F1F1F]/40 block">{language === "EN" ? "Total Value" : "Gesamtsumme"}</span>
                          <span className="font-bold text-[#C9A24D]">€{(order.total || order.total_amount || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 text-center relative pt-4">
                      <div className="absolute top-7 left-[16%] right-[16%] h-[2px] bg-black/5 z-0" />
                      <div className="flex flex-col items-center z-10">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center mb-2"><CheckCircle2 size={16} /></div>
                        <span className="text-xs font-bold">{language === "EN" ? "Paid" : "Bezahlt"}</span>
                      </div>
                      <div className="flex flex-col items-center z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${order.status === "handcrafting" || order.status === "shipped" ? "bg-green-500 text-white" : "bg-white border-2 border-black/10 text-black/30"}`}>
                          {order.status === "handcrafting" ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                        </div>
                        <span className="text-xs font-bold">{language === "EN" ? "Handcrafting" : "Handarbeit"}</span>
                      </div>
                      <div className="flex flex-col items-center z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${order.status === "shipped" ? "bg-[#C9A24D] text-white" : "bg-white border-2 border-black/10 text-black/30"}`}>
                          <Truck size={16} />
                        </div>
                        <span className="text-xs font-bold">{language === "EN" ? "Shipped" : "Versandt"}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {activeTab === "history" && (
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <History className="text-[#C9A24D]" size={24} />
                {language === "EN" ? "Your Historical Orders" : "Deine Bestellhistorie"}
              </h3>
              {ordersLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#C9A24D]" /></div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-[#F6EFE6]/30 rounded-2xl border border-dashed border-black/10">
                  <p className="text-sm text-[#1F1F1F]/40 font-bold">
                    {language === "EN" ? "No historical records linked to this email address." : "Noch keine abgeschlossenen Bestellungen vorhanden."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-[#F6EFE6]/30 rounded-xl border border-black/5 gap-4">
                      <div>
                        <p className="font-bold text-sm">ROSETAS-{String(order.id).padStart(5, "0")}</p>
                        <p className="text-xs text-[#1F1F1F]/50">{new Date(order.created_at).toLocaleDateString(language === "EN" ? "en-US" : "de-DE")}</p>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <span className="text-sm font-bold text-[#1F1F1F]">€{(order.total || order.total_amount || 0).toFixed(2)}</span>
                        <button className="flex items-center gap-2 bg-[#1F1F1F] hover:bg-[#C9A24D] text-white text-xs font-bold uppercase px-4 py-2.5 rounded-lg transition-colors shadow-sm">
                          <Download size={14} />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === "profile" && (
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="text-[#C9A24D]" size={24} />
                {language === "EN" ? "1-Click Express Checkout Profile" : "1-Click Express-Checkout Profil"}
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]/50 block mb-2">{language === "EN" ? "First Name" : "Vorname"}</label>
                    <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-[#F6EFE6]/50 border border-black/5 rounded-xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:border-[#C9A24D] transition-colors" placeholder="John" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]/50 block mb-2">{language === "EN" ? "Last Name" : "Nachname"}</label>
                    <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-[#F6EFE6]/50 border border-black/5 rounded-xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:border-[#C9A24D] transition-colors" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]/50 block mb-2">{language === "EN" ? "Phone Number" : "Telefonnummer"}</label>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#F6EFE6]/50 border border-black/5 rounded-xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:border-[#C9A24D] transition-colors" placeholder="+49 155 65956604" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]/50 block mb-2">{language === "EN" ? "Street Address" : "Straße"}</label>
                    <input type="text" required value={shippingStreet} onChange={(e) => setShippingStreet(e.target.value)} className="w-full bg-[#F6EFE6]/50 border border-black/5 rounded-xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:border-[#C9A24D] transition-colors" placeholder="Hauptstraße" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]/50 block mb-2">{language === "EN" ? "Nr." : "Nr."}</label>
                    <input type="text" required value={shippingHouseNumber} onChange={(e) => setShippingHouseNumber(e.target.value)} className="w-full bg-[#F6EFE6]/50 border border-black/5 rounded-xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:border-[#C9A24D] transition-colors text-center font-bold" placeholder="12" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]/50 block mb-2">{language === "EN" ? "City" : "Stadt"}</label>
                    <input type="text" required value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} className="w-full bg-[#F6EFE6]/50 border border-black/5 rounded-xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:border-[#C9A24D] transition-colors" placeholder="Berlin" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]/50 block mb-2">{language === "EN" ? "Postal Code" : "Postleitzahl"}</label>
                    <input type="text" required value={shippingZip} onChange={(e) => setShippingZip(e.target.value)} className="w-full bg-[#F6EFE6]/50 border border-black/5 rounded-xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:border-[#C9A24D] transition-colors" placeholder="10115" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]/50 block mb-2">{language === "EN" ? "Country" : "Land"}</label>
                  <select value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)} className="w-full bg-[#F6EFE6]/50 border border-black/5 rounded-xl py-3.5 px-4 text-sm font-bold focus:outline-none focus:border-[#C9A24D] transition-colors cursor-pointer appearance-none">
                    {["Albania", "Algeria", "Austria", "Belgium", "Bosnia & Herzegovina", "Bulgaria", "Chile", "China", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Egypt", "Fiji", "France", "French Polynesia", "Germany", "Greece", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Ireland", "Italy", "Japan", "Kenya", "Kosovo", "Kuwait", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malaysia", "Maldives", "Malta", "Moldova", "Monaco", "Morocco", "Netherlands", "Nigeria", "Norway", "Oman", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Saudi Arabia", "Senegal", "Singapore", "Slovakia", "Slovenia", "South Africa", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Taiwan", "Thailand", "Tunisia", "Turkey", "UAE", "Ukraine", "United States", "Vietnam"].map(country => <option key={country} value={country}>{country}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={updateLoading} className="bg-[#1F1F1F] hover:bg-[#C9A24D] text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2">
                  {updateLoading ? <Loader2 className="animate-spin text-white" size={14} /> : <span className="text-white font-bold" style={{ color: "white", opacity: 1 }}>{language === "EN" ? "Save Express Changes" : "Express-Änderungen Speichern"}</span>}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
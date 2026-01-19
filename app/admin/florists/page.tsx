"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { supabase } from "../../../lib/supabase";
import { Download, Loader2, Search, ExternalLink, Check, X, Users } from "lucide-react";

export default function FloristLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('florist_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLeads(data);
    }
    setIsLoading(false);
  };

  // ✨ Export to CSV Logic
  const handleExport = () => {
    const headers = ["Business Name", "Email", "Website", "Interested in Courses", "Date Joined"];
    
    const rows = leads.map(lead => [
      lead.business_name || "N/A",
      lead.email,
      lead.website || "N/A",
      lead.interested_in_courses ? "Yes" : "No",
      new Date(lead.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(item => `"${item}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `florist_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(lead => 
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.business_name && lead.business_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] flex font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-[#C9A24D] text-white p-3 rounded-xl shadow-lg">
                <Users size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-bold">Florist Community</h1>
                <p className="text-[#1F1F1F]/60 text-sm font-medium">Manage leads and potential course students.</p>
            </div>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-[#1F1F1F] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#C9A24D] transition-colors shadow-lg"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-black/5 mb-6 flex items-center gap-3 shadow-sm">
          <Search className="text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none text-sm font-medium placeholder:text-gray-300"
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex justify-center text-[#C9A24D]">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F6EFE6] text-[10px] font-black uppercase text-gray-400 border-b border-black/5">
                  <tr>
                    <th className="px-6 py-4">Business Name</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4 text-center">Courses?</th>
                    <th className="px-6 py-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm text-[#1F1F1F]">{lead.business_name || "N/A"}</p>
                        </td>
                        <td className="px-6 py-4 space-y-1">
                          <p className="text-xs font-bold text-[#1F1F1F]">{lead.email}</p>
                          {lead.website && (
                            <a 
                              href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[10px] font-bold text-[#C9A24D] hover:underline"
                            >
                              {lead.website} <ExternalLink size={10} />
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {lead.interested_in_courses ? (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-green-200">
                              <Check size={10} strokeWidth={4} /> Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-400 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-gray-200">
                              <X size={10} strokeWidth={4} /> No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-gray-400 font-medium">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-gray-400 font-bold text-sm">
                        No community members found yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
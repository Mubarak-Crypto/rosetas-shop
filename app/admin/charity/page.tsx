"use client";

import { useState, useEffect } from "react";
import { Upload, Save, Trash2, Loader2, Plus, X } from "lucide-react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { supabase } from "../../../lib/supabase";

type Project = {
  id: string;
  title: string;
  description: string;
  image_url: string;
};

export default function AdminCharityPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // New Project Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImage, setNewImage] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase.from('charity_projects').select('*').order('created_at', { ascending: false });
    if (data) setProjects(data);
    setIsLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const fileName = `charity-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('products') // Reusing products bucket for simplicity
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      setNewImage(publicUrl);
    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newImage) return alert("Title and Image are required");

    const { error } = await supabase.from('charity_projects').insert([{
      title: newTitle,
      description: newDesc,
      image_url: newImage
    }]);

    if (error) {
      alert(error.message);
    } else {
      setNewTitle("");
      setNewDesc("");
      setNewImage("");
      fetchProjects(); // Refresh list
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await supabase.from('charity_projects').delete().eq('id', id);
    fetchProjects();
  };

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] flex font-sans">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Charity Projects</h1>

          {/* --- ADD NEW FORM --- */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 mb-10">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Plus size={20} className="text-[#C9A24D]" /> Add New Project
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Image Upload */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400">Project Image</label>
                    <label className={`aspect-square rounded-xl border-2 border-dashed border-black/10 flex flex-col items-center justify-center cursor-pointer hover:border-[#C9A24D] transition-colors relative overflow-hidden bg-gray-50 ${isUploading ? "opacity-50" : ""}`}>
                        {newImage ? (
                            <>
                                <img src={newImage} className="w-full h-full object-cover" />
                                <button 
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); setNewImage(""); }}
                                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500"
                                >
                                    <X size={14} />
                                </button>
                            </>
                        ) : (
                            <div className="text-center text-gray-400">
                                {isUploading ? <Loader2 className="animate-spin mx-auto" /> : <Upload className="mx-auto mb-2" />}
                                <span className="text-[10px] font-bold uppercase">Upload</span>
                            </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                </div>

                {/* Text Inputs */}
                <div className="md:col-span-2 space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Title</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Water Well Project - 2025" 
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none font-bold"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Description</label>
                        <textarea 
                            rows={4}
                            placeholder="Tell the story..." 
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button 
                            type="submit" 
                            disabled={!newTitle || !newImage || isUploading}
                            className="bg-[#1F1F1F] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#C9A24D] transition-colors disabled:opacity-50"
                        >
                            Publish Project
                        </button>
                    </div>
                </div>
              </div>
            </form>
          </div>

          {/* --- EXISTING PROJECTS LIST --- */}
          <h2 className="font-bold text-xl mb-4">Active Projects</h2>
          {isLoading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#C9A24D]" /></div>
          ) : projects.length === 0 ? (
            <div className="text-center p-10 text-gray-400 italic bg-white rounded-2xl border border-dashed border-black/10">No projects yet. Add your first one above!</div>
          ) : (
            <div className="grid gap-4">
                {projects.map(project => (
                    <div key={project.id} className="bg-white p-4 rounded-2xl border border-black/5 flex items-center gap-6 shadow-sm">
                        <img src={project.image_url} alt={project.title} className="w-24 h-24 object-cover rounded-xl bg-gray-100" />
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">{project.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                        </div>
                        <button onClick={() => handleDelete(project.id)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
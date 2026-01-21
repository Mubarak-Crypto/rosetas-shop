"use client";

import { useState, useEffect } from "react";
import { Upload, Save, Trash2, Loader2, Plus, X, Layout, List, Hash, Globe } from "lucide-react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { supabase } from "../../../lib/supabase";

// Types
type Project = {
  id: string;
  title: string;
  title_de?: string;
  description: string;
  description_de?: string;
  image_url: string;
  created_at: string;
};

// Global Page Settings Type
type PageSettings = {
  // English
  hero_title: string;
  hero_subtitle: string;
  stat_1_value: string;
  stat_1_label: string;
  stat_2_value: string;
  stat_2_label: string;
  stat_3_value: string;
  stat_3_label: string;
  pledge_title: string;
  pledge_text: string;

  // German
  hero_title_de: string;
  hero_subtitle_de: string;
  stat_1_label_de: string;
  stat_2_label_de: string;
  stat_3_label_de: string;
  pledge_title_de: string;
  pledge_text_de: string;
};

export default function AdminCharityPage() {
  const [activeTab, setActiveTab] = useState<'content' | 'projects'>('content');
  const [langTab, setLangTab] = useState<'EN' | 'DE'>('EN'); // ✨ Language Toggle for Forms
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Content State
  const [settings, setSettings] = useState<PageSettings>({
    hero_title: "", hero_subtitle: "",
    stat_1_value: "", stat_1_label: "",
    stat_2_value: "", stat_2_label: "",
    stat_3_value: "", stat_3_label: "",
    pledge_title: "", pledge_text: "",
    
    hero_title_de: "", hero_subtitle_de: "",
    stat_1_label_de: "", stat_2_label_de: "",
    stat_3_label_de: "",
    pledge_title_de: "", pledge_text_de: ""
  });

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // New Project Form
  const [newTitle, setNewTitle] = useState("");
  const [newTitleDe, setNewTitleDe] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDescDe, setNewDescDe] = useState("");
  const [newImage, setNewImage] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    
    // 1. Fetch Global Settings
    const { data: contentData } = await supabase.from('charity_content').select('*').single();
    if (contentData) {
        setSettings({
            hero_title: contentData.hero_title || "",
            hero_subtitle: contentData.hero_subtitle || "",
            stat_1_value: contentData.stat_1_value || "05",
            stat_1_label: contentData.stat_1_label || "Wells Built",
            stat_2_value: contentData.stat_2_value || "150+",
            stat_2_label: contentData.stat_2_label || "Families",
            stat_3_value: contentData.stat_3_value || "10%",
            stat_3_label: contentData.stat_3_label || "Donated",
            pledge_title: contentData.pledge_title || "",
            pledge_text: contentData.pledge_text || "",

            hero_title_de: contentData.hero_title_de || "",
            hero_subtitle_de: contentData.hero_subtitle_de || "",
            stat_1_label_de: contentData.stat_1_label_de || "",
            stat_2_label_de: contentData.stat_2_label_de || "",
            stat_3_label_de: contentData.stat_3_label_de || "",
            pledge_title_de: contentData.pledge_title_de || "",
            pledge_text_de: contentData.pledge_text_de || ""
        });
    }

    // 2. Fetch Projects
    const { data: projectData } = await supabase.from('charity_projects').select('*').order('created_at', { ascending: false });
    if (projectData) setProjects(projectData);
    
    setIsLoading(false);
  };

  const handleSaveSettings = async () => {
      setIsSaving(true);
      const { error } = await supabase.from('charity_content').update(settings).eq('id', '00000000-0000-0000-0000-000000000000'); 
      if (error) alert("Error saving: " + error.message);
      else alert("Page content updated!");
      setIsSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const fileName = `charity-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
      setNewImage(publicUrl);
    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newImage) return alert("Title (EN) and Image are required");

    const { error } = await supabase.from('charity_projects').insert([{
      title: newTitle,
      title_de: newTitleDe,
      description: newDesc,
      description_de: newDescDe,
      image_url: newImage
    }]);

    if (error) {
      alert(error.message);
    } else {
      setNewTitle(""); setNewTitleDe("");
      setNewDesc(""); setNewDescDe("");
      setNewImage("");
      fetchAllData();
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await supabase.from('charity_projects').delete().eq('id', id);
    fetchAllData();
  };

  // Helper for input labels with language badge
  const LangLabel = ({ text }: { text: string }) => (
      <div className="flex justify-between mb-1">
          <label className="text-xs font-bold uppercase text-gray-400">{text}</label>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${langTab === 'EN' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
              {langTab}
          </span>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] flex font-sans">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h1 className="text-3xl font-bold">Impact & Charity Manager</h1>
              
              <div className="flex gap-4">
                  {/* Language Toggle */}
                  <div className="bg-white p-1 rounded-xl border border-black/5 flex shadow-sm h-fit">
                      <button onClick={() => setLangTab('EN')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${langTab === 'EN' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}>EN</button>
                      <button onClick={() => setLangTab('DE')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${langTab === 'DE' ? 'bg-yellow-50 text-yellow-600' : 'text-gray-400'}`}>DE</button>
                  </div>

                  {/* Section Tabs */}
                  <div className="flex bg-white p-1 rounded-xl border border-black/5 shadow-sm">
                      <button 
                        onClick={() => setActiveTab('content')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'content' ? 'bg-[#1F1F1F] text-white shadow-md' : 'text-gray-400 hover:text-[#1F1F1F]'}`}
                      >
                          <Layout size={16} /> Page Content
                      </button>
                      <button 
                        onClick={() => setActiveTab('projects')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'projects' ? 'bg-[#1F1F1F] text-white shadow-md' : 'text-gray-400 hover:text-[#1F1F1F]'}`}
                      >
                          <List size={16} /> Projects List
                      </button>
                  </div>
              </div>
          </div>

          {activeTab === 'content' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                  
                  {/* Hero Section */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 space-y-4">
                      <h2 className="font-bold text-lg border-b border-black/5 pb-2">Hero Section</h2>
                      <div className="grid gap-4">
                          {langTab === 'EN' ? (
                              <>
                                  <div>
                                      <LangLabel text="Main Headline" />
                                      <input value={settings.hero_title} onChange={e => setSettings({...settings, hero_title: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 font-bold" />
                                  </div>
                                  <div>
                                      <LangLabel text="Subtitle" />
                                      <textarea value={settings.hero_subtitle} onChange={e => setSettings({...settings, hero_subtitle: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm" rows={3} />
                                  </div>
                              </>
                          ) : (
                              <>
                                  <div>
                                      <LangLabel text="Hauptüberschrift" />
                                      <input value={settings.hero_title_de} onChange={e => setSettings({...settings, hero_title_de: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 font-bold" />
                                  </div>
                                  <div>
                                      <LangLabel text="Untertitel" />
                                      <textarea value={settings.hero_subtitle_de} onChange={e => setSettings({...settings, hero_subtitle_de: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm" rows={3} />
                                  </div>
                              </>
                          )}
                      </div>
                  </div>

                  {/* Stats Section */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 space-y-4">
                      <h2 className="font-bold text-lg border-b border-black/5 pb-2 flex items-center gap-2"><Hash size={18}/> Impact Stats</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Stat 1 */}
                          <div className="p-4 bg-gray-50 rounded-xl border border-black/5 space-y-2">
                              <p className="text-xs font-bold uppercase text-gray-400">Stat #1 (Value is shared)</p>
                              <input value={settings.stat_1_value} onChange={e => setSettings({...settings, stat_1_value: e.target.value})} className="w-full bg-white border border-black/5 rounded-lg px-3 py-2 font-bold text-center" placeholder="05" />
                              {langTab === 'EN' ? (
                                  <input value={settings.stat_1_label} onChange={e => setSettings({...settings, stat_1_label: e.target.value})} className="w-full bg-white border border-black/5 rounded-lg px-3 py-2 text-xs text-center" placeholder="Label EN" />
                              ) : (
                                  <input value={settings.stat_1_label_de} onChange={e => setSettings({...settings, stat_1_label_de: e.target.value})} className="w-full bg-white border border-black/5 rounded-lg px-3 py-2 text-xs text-center" placeholder="Label DE" />
                              )}
                          </div>
                          {/* Stat 2 */}
                          <div className="p-4 bg-gray-50 rounded-xl border border-black/5 space-y-2">
                              <p className="text-xs font-bold uppercase text-gray-400">Stat #2</p>
                              <input value={settings.stat_2_value} onChange={e => setSettings({...settings, stat_2_value: e.target.value})} className="w-full bg-white border border-black/5 rounded-lg px-3 py-2 font-bold text-center" placeholder="150+" />
                              {langTab === 'EN' ? (
                                  <input value={settings.stat_2_label} onChange={e => setSettings({...settings, stat_2_label: e.target.value})} className="w-full bg-white border border-black/5 rounded-lg px-3 py-2 text-xs text-center" placeholder="Label EN" />
                              ) : (
                                  <input value={settings.stat_2_label_de} onChange={e => setSettings({...settings, stat_2_label_de: e.target.value})} className="w-full bg-white border border-black/5 rounded-lg px-3 py-2 text-xs text-center" placeholder="Label DE" />
                              )}
                          </div>
                          {/* Stat 3 */}
                          <div className="p-4 bg-gray-50 rounded-xl border border-black/5 space-y-2">
                              <p className="text-xs font-bold uppercase text-gray-400">Stat #3</p>
                              <input value={settings.stat_3_value} onChange={e => setSettings({...settings, stat_3_value: e.target.value})} className="w-full bg-white border border-black/5 rounded-lg px-3 py-2 font-bold text-center" placeholder="10%" />
                              {langTab === 'EN' ? (
                                  <input value={settings.stat_3_label} onChange={e => setSettings({...settings, stat_3_label: e.target.value})} className="w-full bg-white border border-black/5 rounded-lg px-3 py-2 text-xs text-center" placeholder="Label EN" />
                              ) : (
                                  <input value={settings.stat_3_label_de} onChange={e => setSettings({...settings, stat_3_label_de: e.target.value})} className="w-full bg-white border border-black/5 rounded-lg px-3 py-2 text-xs text-center" placeholder="Label DE" />
                              )}
                          </div>
                      </div>
                  </div>

                  {/* Pledge / Bottom Section */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 space-y-4">
                      <h2 className="font-bold text-lg border-b border-black/5 pb-2">Bottom Pledge Section</h2>
                      <div className="grid gap-4">
                          {langTab === 'EN' ? (
                              <>
                                  <div><LangLabel text="Pledge Title" /><input value={settings.pledge_title} onChange={e => setSettings({...settings, pledge_title: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 font-bold" /></div>
                                  <div><LangLabel text="Pledge Text" /><textarea value={settings.pledge_text} onChange={e => setSettings({...settings, pledge_text: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm" rows={3} /></div>
                              </>
                          ) : (
                              <>
                                  <div><LangLabel text="Titel (DE)" /><input value={settings.pledge_title_de} onChange={e => setSettings({...settings, pledge_title_de: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 font-bold" /></div>
                                  <div><LangLabel text="Text (DE)" /><textarea value={settings.pledge_text_de} onChange={e => setSettings({...settings, pledge_text_de: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm" rows={3} /></div>
                              </>
                          )}
                      </div>
                  </div>

                  <div className="flex justify-end">
                      <button onClick={handleSaveSettings} disabled={isSaving} className="bg-[#C9A24D] text-white px-8 py-4 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-[#b08d45] transition-colors disabled:opacity-50">
                          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Page Content</>}
                      </button>
                  </div>
              </div>
          ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  {/* ADD NEW PROJECT FORM */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Plus size={20} className="text-[#C9A24D]" /> Add New Project
                    </h2>
                    <form onSubmit={handleSaveProject} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400">Project Image</label>
                            <label className={`aspect-square rounded-xl border-2 border-dashed border-black/10 flex flex-col items-center justify-center cursor-pointer hover:border-[#C9A24D] transition-colors relative overflow-hidden bg-gray-50 ${isUploading ? "opacity-50" : ""}`}>
                                {newImage ? (
                                    <><img src={newImage} className="w-full h-full object-cover" /><button type="button" onClick={(e) => { e.preventDefault(); setNewImage(""); }} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500"><X size={14} /></button></>
                                ) : (
                                    <div className="text-center text-gray-400">{isUploading ? <Loader2 className="animate-spin mx-auto" /> : <Upload className="mx-auto mb-2" />}<span className="text-[10px] font-bold uppercase">Upload</span></div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                            </label>
                        </div>

                        {/* Text Inputs (With Lang Toggle) */}
                        <div className="md:col-span-2 space-y-4">
                            {langTab === 'EN' ? (
                                <>
                                    <div><LangLabel text="Title (EN)" /><input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none font-bold" /></div>
                                    <div><LangLabel text="Description (EN)" /><textarea rows={4} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none" /></div>
                                </>
                            ) : (
                                <>
                                    <div><LangLabel text="Titel (DE)" /><input value={newTitleDe} onChange={(e) => setNewTitleDe(e.target.value)} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none font-bold" /></div>
                                    <div><LangLabel text="Beschreibung (DE)" /><textarea rows={4} value={newDescDe} onChange={(e) => setNewDescDe(e.target.value)} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none" /></div>
                                </>
                            )}
                            <div className="flex justify-end pt-2">
                                <button type="submit" disabled={!newTitle || !newImage || isUploading} className="bg-[#1F1F1F] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#C9A24D] transition-colors disabled:opacity-50">Publish Project</button>
                            </div>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* PROJECTS LIST */}
                  <div>
                      <h2 className="font-bold text-xl mb-4">Active Projects</h2>
                      {isLoading ? (
                        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#C9A24D]" /></div>
                      ) : projects.length === 0 ? (
                        <div className="text-center p-10 text-gray-400 italic bg-white rounded-2xl border border-dashed border-black/10">No projects yet.</div>
                      ) : (
                        <div className="grid gap-4">
                            {projects.map(project => (
                                <div key={project.id} className="bg-white p-4 rounded-2xl border border-black/5 flex items-center gap-6 shadow-sm">
                                    <img src={project.image_url} alt={project.title} className="w-24 h-24 object-cover rounded-xl bg-gray-100" />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{project.title}</h3>
                                        <p className="text-xs text-gray-400 mb-1">{project.title_de || "(No German Title)"}</p>
                                        <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                                    </div>
                                    <button onClick={() => handleDeleteProject(project.id)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                      )}
                  </div>
              </div>
          )}

        </div>
      </main>
    </div>
  );
}
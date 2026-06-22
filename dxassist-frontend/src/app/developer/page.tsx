"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import MedicalInput from "@/components/ui/MedicalInput";

export default function DeveloperPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    module_id: "",
    name: "",
    description: "",
    diagnostic_area: "",
    input_schema: '{\n  "image": "Angiography image in Base64"\n}',
    base_url: "http://module-service:8000"
  });

  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const parsedSchema = JSON.parse(formData.input_schema);
      
      const payload = {
        ...formData,
        input_schema: parsedSchema,
        type: "single"
      };

      await api.post("/diagnostics/modules/", payload);
      
      setStatus({ type: "success", msg: "Moduł został pomyślnie zarejestrowany w systemie." });
      setFormData({
        module_id: "",
        name: "",
        description: "",
        diagnostic_area: "",
        input_schema: '{\n  "image": "Angiography image in Base64"\n}',
        base_url: "http://module-service:8000"
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Błąd walidacji manifestu. Sprawdź format JSON.";
      setStatus({ type: "error", msg: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#0F172A] font-sans text-white">
      <header className="h-16 bg-[#1E293B] border-b border-white/5 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")} className="text-zinc-400 hover:text-white transition-colors text-sm font-bold">← POWRÓT</button>
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="font-black text-xs uppercase tracking-[0.3em] text-medical-blue">Developer Core</span>
        </div>
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            DxAssist Registry v1.0.4-alpha
        </div>
      </header>

      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-black tracking-tighter mb-2">Rejestracja Nowego Modułu</h1>
            <p className="text-zinc-400 text-sm">Dodaj niezależny mikroserwis diagnostyczny do orkiestratora Schedulera.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-[#1E293B] rounded-3xl p-8 border border-white/5 shadow-2xl space-y-6">
                <h3 className="text-[10px] font-black uppercase text-medical-blue tracking-widest">Metadane Modułu</h3>
                
                <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Unikalny ID (Kebab-case)</label>
                        <input 
                            className="bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-medical-blue text-sm font-mono"
                            placeholder="dxassist-new-model"
                            value={formData.module_id}
                            onChange={e => setFormData({...formData, module_id: e.target.value})}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Nazwa wyświetlana</label>
                        <input 
                            className="bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-medical-blue text-sm"
                            placeholder="Nowy Model Diagnostyczny"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">URL Usługi (Docker DNS)</label>
                        <input 
                            className="bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-medical-blue text-sm font-mono text-zinc-400"
                            value={formData.base_url}
                            onChange={e => setFormData({...formData, base_url: e.target.value})}
                            required
                        />
                    </div>
                </div>
              </div>

              <div className="bg-[#1E293B] rounded-3xl p-8 border border-white/5 shadow-2xl">
                <h3 className="text-[10px] font-black uppercase text-medical-blue tracking-widest mb-6">Opis Funkcjonalny</h3>
                <textarea 
                    className="w-full h-32 bg-[#0F172A] border border-white/10 rounded-xl p-4 outline-none focus:border-medical-blue text-sm text-zinc-300 resize-none"
                    placeholder="Opisz co analizuje ten moduł..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    required
                />
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-8 flex-1 flex flex-col shadow-inner">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Input Schema (JSON)</h3>
                    <span className="px-2 py-1 bg-medical-blue/20 text-medical-blue rounded text-[9px] font-bold">STRICT VALIDATION</span>
                </div>
                <textarea 
                    className="flex-1 w-full bg-transparent font-mono text-xs text-green-400 outline-none resize-none leading-relaxed"
                    spellCheck="false"
                    value={formData.input_schema}
                    onChange={e => setFormData({...formData, input_schema: e.target.value})}
                />
              </div>

              {status && (
                <div className={`p-4 rounded-2xl text-xs font-bold uppercase tracking-tighter border animate-in fade-in slide-in-from-bottom-2 ${
                  status.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}>
                  {status.msg}
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-medical-blue hover:bg-blue-600 text-white py-6 rounded-2xl font-black text-xs tracking-[0.3em] uppercase transition-all shadow-2xl shadow-blue-500/20 disabled:opacity-50"
              >
                {isSubmitting ? "WYSYŁANIE MANIFESTU..." : "ZAREJESTRUJ MODUŁ AI"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
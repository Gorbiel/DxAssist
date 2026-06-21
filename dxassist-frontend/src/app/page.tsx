"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { fileToBase64 } from "@/lib/utils";

export default function DiagnosticHub() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [models, setModels] = useState<any[]>([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isanalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        // Zmienione na "/diagnostics/models/" - baseURL ma już /api
        const res = await api.get("/diagnostics/models/");
        console.log("Pobrane modele:", res.data.models);
        setModels(res.data.models);
        if (res.data.models.length > 0) setSelectedModelId(res.data.models[0].id);
      } catch (err: any) {
        console.error("Błąd pobierania modeli:", err.response?.data || err.message);
        setError("Nie udało się pobrać listy modułów diagnostycznych.");
      }
    };

    if (user) fetchModels();
  }, [user]);

  const runAnalysis = async () => {
    if (!selectedModelId || files.length === 0) {
      setError("Wybierz model i załącz plik.");
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    try {
      const base64Data = await fileToBase64(files[0]);
      
      // Przygotowanie danych zgodnie z docsami backend integration
      const payload: any = { 
        model: selectedModelId, 
        data: {} 
      };

      if (selectedModelId === "dxassist-angiography") payload.data.image = base64Data;
      if (selectedModelId === "dxassist-screening") payload.data.blood_test = base64Data;
      if (selectedModelId === "dxassist-heartdisease") {
          payload.data.image = base64Data;
          payload.additional_data = { "dxassist-screening": { blood_test: "sample" } };
      }

      // UWAGA: tutaj też poprawiony URL na "/diagnostics/analyze/"
      const res = await api.post("/diagnostics/analyze/", payload);
      console.log("Wynik analizy:", res.data);
      alert("Analiza ukończona. Wynik w konsoli F12!");
    } catch (err: any) {
      console.error("Błąd analizy:", err.response?.data || err.message);
      setError(err.response?.data?.detail || "Błąd komunikacji ze Schedulerem.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-surface-bg font-sans">
      <header className="h-20 bg-white border-b border-zinc-200 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-medical-blue rounded flex items-center justify-center text-white font-bold text-xs">Dx</div>
          <span className="font-bold text-xl tracking-tighter">DxAssist Intelligence</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <span className="text-zinc-500 italic">Zalogowany: <b className="text-zinc-900 not-italic">{user.name}</b></span>
          <button onClick={logout} className="px-4 py-2 bg-zinc-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium">Wyloguj</button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-10">
            <h2 className="text-2xl font-bold text-zinc-900 mb-8 tracking-tight">Nowe badanie diagnostyczne</h2>
            
            <div className="space-y-8">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-3">1. Wybór obszaru analizy</label>
                <select 
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-4 focus:ring-medical-blue/5 focus:border-medical-blue transition-all"
                >
                  {models.length === 0 && <option>Ładowanie modeli...</option>}
                  {models.map(m => (
                    <option key={m.id} value={m.id}>{m.name} — {m.description}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-3">2. Materiał do analizy (Obraz / Tekst / PDF)</label>
                <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-12 flex flex-col items-center justify-center bg-zinc-50/50 hover:bg-zinc-50 transition-colors relative group">
                  <input 
                    type="file" 
                    onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                  <div className="text-3xl mb-2">📄</div>
                  <p className="text-zinc-900 font-medium">{files.length > 0 ? files[0].name : "Kliknij tutaj, aby dodać badanie"}</p>
                  <p className="text-zinc-400 text-xs mt-1">System automatycznie rozpozna format danych</p>
                </div>
              </div>

              <button 
                onClick={runAnalysis}
                disabled={isanalyzing || models.length === 0}
                className="w-full bg-medical-blue hover:bg-medical-dark text-white py-5 rounded-2xl font-bold transition-all shadow-lg shadow-medical-blue/20 disabled:opacity-30 disabled:grayscale"
              >
                {isanalyzing ? "PROCESOWANIE PRZEZ AI..." : "URUCHOM ANALIZĘ SYSTEMOWĄ"}
              </button>

              {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center text-sm font-medium">{error}</div>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
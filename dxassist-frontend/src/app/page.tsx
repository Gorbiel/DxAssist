"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { fileToBase64 } from "@/lib/utils";
import AnalysisResult from "@/components/AnalysisResult";

export default function DiagnosticHub() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const [models, setModels] = useState<any[]>([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [inputData, setInputData] = useState<Record<string, string>>({});
  const [additionalData, setAdditionalData] = useState<Record<string, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // 1. Sprawdzenie autoryzacji
  useEffect(() => {
    if (!loading && !user) {
        console.log("DEBUG: Brak usera, lecę do /login");
        router.push("/login");
    }
  }, [user, loading, router]);

  // 2. Pobieranie modeli
  useEffect(() => {
    const fetchModels = async () => {
      try {
        console.log("DEBUG: Pobieram modele z /diagnostics/models/...");
        const res = await api.get("/diagnostics/models/");
        console.log("DEBUG: Pobrano modele:", res.data.models);
        setModels(res.data.models || []);
        if (res.data.models?.length > 0) {
            setSelectedModelId(res.data.models[0].id);
        }
      } catch (err: any) {
        console.error("DEBUG: BŁĄD POBIERANIA MODELI:", err.response?.data || err.message);
        setError("Błąd połączenia. Sprawdź konsolę (F12).");
      }
    };
    if (user) fetchModels();
  }, [user]);

  // 3. Obsługa uploadu z logowaniem co się dzieje
  const handleFileUpload = async (key: string, file: File, isAdditional = false, modelKey?: string) => {
    try {
      console.log(`DEBUG: Konwertuję plik ${file.name} dla klucza ${key}...`);
      const base64 = await fileToBase64(file);
      
      if (isAdditional && modelKey) {
        setAdditionalData(prev => ({
          ...prev,
          [modelKey]: { ...prev[modelKey], [key]: base64 }
        }));
      } else {
        setInputData(prev => ({ ...prev, [key]: base64 }));
      }
      console.log("DEBUG: Plik gotowy (Base64 generated)");
    } catch (e) {
      console.error("DEBUG: Błąd konwersji pliku:", e);
      setError("Błąd pliku.");
    }
  };

  // 4. Wysyłka do analizy
  const runAnalysis = async () => {
    const currentModel = models.find(m => m.id === selectedModelId);
    if (!currentModel) return;

    setIsAnalyzing(true);
    setError(null);

    const payload = {
      model: selectedModelId,
      data: inputData,
      additional_data: additionalData
    };

    console.log("DEBUG: Wysyłam PAYLOAD do /diagnostics/analyze/:", payload);

    try {
      const res = await api.post("/diagnostics/analyze/", payload);
      console.log("DEBUG: ODPOWIEDŹ ZE SCHEDULERA:", res.data);
      setAnalysisResult(res.data);
    } catch (err: any) {
      console.error("DEBUG: BŁĄD ANALIZY:", err.response?.data || err.message);
      setError(err.response?.data?.detail || "Błąd Schedulera.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentModel = models.find((m) => m.id === selectedModelId);

  if (loading || !user) return <div className="p-10">Ładowanie systemu...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-sans text-zinc-900">
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center text-white text-xs">DX</div>
          DxAssist Intelligence
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-zinc-400">DR. {user.name.toUpperCase()}</span>
          <button onClick={logout} className="text-xs font-black text-red-500 hover:bg-red-50 p-2 rounded-md transition-all">LOGOUT</button>
        </div>
      </header>

      <main className="p-8 max-w-6xl mx-auto w-full">
        {/* JEŚLI NIE MA MODELI */}
        {models.length === 0 && !error && (
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl text-yellow-700 text-sm">
                Czekam na dane z backendu... Jeśli to trwa długo, sprawdź czy backend działa na porcie 8000.
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* KOLUMNA LEWA - WYBÓR */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">1. Moduł Diagnostyczny</h3>
              <div className="flex flex-col gap-2">
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                        console.log("DEBUG: Zmieniam model na:", m.id);
                        setSelectedModelId(m.id);
                        setInputData({}); // Reset przy zmianie
                        setAdditionalData({});
                    }}
                    className={`p-4 rounded-2xl text-left border transition-all ${
                      selectedModelId === m.id
                        ? "border-medical-blue bg-medical-blue text-white shadow-lg shadow-medical-blue/20"
                        : "border-zinc-100 bg-zinc-50 hover:border-zinc-300"
                    }`}
                  >
                    <p className="font-bold text-sm">{m.name}</p>
                    <p className={`text-[10px] uppercase mt-1 ${selectedModelId === m.id ? "text-white/60" : "text-zinc-400"}`}>{m.type}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* KOLUMNA PRAWA - INPUTY */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-10 shadow-sm min-h-[400px] flex flex-col">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-8 text-center">2. Dane wejściowe dla {currentModel?.name || "..."}</h3>
              
              <div className="flex-1 space-y-10">
                {/* DYNAMICZNE INPUTY GŁÓWNE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentModel?.input_schema && Object.entries(currentModel.input_schema).map(([key, desc]: any) => (
                    <div key={key} className="space-y-2 text-center">
                      <label className="text-[10px] font-black text-zinc-400 uppercase">{key}</label>
                      <div className="relative border-2 border-dashed border-zinc-200 rounded-3xl p-8 hover:bg-zinc-50 transition-all cursor-pointer">
                        <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={(e) => e.target.files && handleFileUpload(key, e.target.files[0])}
                        />
                        <div className="text-2xl mb-2">{inputData[key] ? "✅" : "➕"}</div>
                        <p className="text-[11px] font-bold text-zinc-600 uppercase">{inputData[key] ? "Gotowe" : "Dodaj plik"}</p>
                        <p className="text-[9px] text-zinc-400 mt-2 leading-tight">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* DYNAMICZNE INPUTY DODATKOWE (Combined) */}
                {currentModel?.additional_data_schema && (
                    <div className="pt-8 border-t border-zinc-100">
                        <p className="text-[10px] font-black text-medical-blue uppercase text-center mb-6 tracking-widest">Wymagane dane wspierające (Multi-Model Fusion)</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(currentModel.additional_data_schema).map(([modelKey, schema]: any) => (
                                Object.entries(schema).map(([key, desc]: any) => (
                                    <div key={`${modelKey}-${key}`} className="space-y-2 text-center">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase">{modelKey} / {key}</label>
                                        <div className="relative border-2 border-dashed border-medical-blue/20 rounded-3xl p-8 hover:bg-medical-blue/5 transition-all cursor-pointer">
                                            <input 
                                                type="file" 
                                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                                onChange={(e) => e.target.files && handleFileUpload(key, e.target.files[0], true, modelKey)}
                                            />
                                            <div className="text-2xl mb-2">{additionalData[modelKey]?.[key] ? "✅" : "🔬"}</div>
                                            <p className="text-[11px] font-bold text-medical-blue uppercase">Dodaj badanie</p>
                                            <p className="text-[9px] text-zinc-400 mt-2 leading-tight">{desc}</p>
                                        </div>
                                    </div>
                                ))
                            ))}
                        </div>
                    </div>
                )}
              </div>

              {error && <div className="mt-6 p-4 bg-red-50 text-red-600 text-[10px] font-bold rounded-xl text-center uppercase tracking-tighter border border-red-100">{error}</div>}

              <button
                onClick={runAnalysis}
                disabled={isAnalyzing || !currentModel}
                className="w-full mt-10 bg-zinc-900 hover:bg-black text-white py-6 rounded-2xl font-black text-xs tracking-[0.2em] transition-all shadow-xl disabled:opacity-10 uppercase"
              >
                {isAnalyzing ? "PROCESOWANIE..." : "URUCHOM DIAGNOSTYKĘ"}
              </button>
            </div>
          </div>
        </div>
      </main>
    {analysisResult && (
    <AnalysisResult 
        data={analysisResult} 
        onClose={() => setAnalysisResult(null)} 
    />
    )}
    </div>
  );
}
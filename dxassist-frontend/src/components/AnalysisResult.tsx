"use client";

import React from "react";
import type {
  AggregatedDiagnosticResult,
  DiagnosticAnalysisResponse,
  DiagnosticResult,
} from "@/lib/diagnosticTypes";

interface AnalysisResultProps {
  data: DiagnosticAnalysisResponse;
  onClose: () => void;
}

const isAggregatedResult = (result: DiagnosticResult): result is AggregatedDiagnosticResult => {
  return "aggregated" in result;
};

export default function AnalysisResult({ data, onClose }: AnalysisResultProps) {
  const result = data.result;
  const isAggregated = isAggregatedResult(result);
  const mainScore = isAggregated 
    ? result.aggregated.coronary_disease_probability 
    : Object.values(result).find(v => typeof v === 'number') || 0;

  const renderRiskBar = (label: string, value: number, color = "bg-medical-blue") => (
    <div key={label} className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{label.replace(/_/g, ' ')}</span>
        <span className="text-sm font-bold text-zinc-900">{value}%</span>
      </div>
      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out rounded-full`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-zinc-950/40 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="p-8 border-b border-zinc-100 flex justify-between items-start bg-white">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Raport Wygenerowany Pomyślnie</span>
            </div>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tighter">Analiza Systemowa AI</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-4 bg-zinc-50 hover:bg-zinc-100 rounded-2xl text-zinc-400 transition-colors font-bold text-xs"
          >
            ZAMKNIJ RAPORT
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-10 bg-medical-blue/5 rounded-[2rem] border border-medical-blue/10 relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-4xl italic tracking-tighter text-medical-blue italic select-none">DxScore</div>
              <p className="text-[10px] font-black text-medical-blue uppercase tracking-widest mb-2">Prawdopodobieństwo</p>
              <div className="text-7xl font-black text-medical-blue tracking-tighter mb-2">
                {mainScore as number}%
              </div>
              <p className="text-xs font-medium text-zinc-500 max-w-[180px]">Ogólny wskaźnik pewności predykcji modelu głównego</p>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest border-l-4 border-medical-blue pl-4">Kluczowe Parametry Ryzyka</h3>
              <div className="space-y-6">
                {isAggregated ? (
                  Object.entries(result.aggregated).map(([k, v]) => renderRiskBar(k, v))
                ) : (
                  Object.entries(result).map(([k, v]) => typeof v === 'number' && renderRiskBar(k, v))
                )}
              </div>
            </div>
          </div>

          {isAggregated && (
            <div className="space-y-6 pt-6 border-t border-zinc-100">
              <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Szczegóły Fuzji Modułów (Weights)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(result.details).map(([modName, modRes]) => (
                  <div key={modName} className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 group hover:border-medical-blue/30 transition-all">
                    <p className="text-[10px] font-black text-zinc-400 uppercase mb-4 truncate">{modName}</p>
                    <div className="space-y-4">
                      {Object.entries(modRes).map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500 lowercase">{k}:</span>
                          <span className="font-bold text-zinc-900 uppercase">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                    {result.weights[modName] && (
                      <div className="mt-4 pt-4 border-t border-zinc-200/50 flex justify-between items-center">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase">Waga w fuzji:</span>
                        <span className="text-[10px] font-black text-medical-blue">{(result.weights[modName] * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-zinc-900 p-8 rounded-[2rem] text-white flex items-start gap-6 shadow-xl shadow-zinc-200">
            <div className="text-3xl">⚠️</div>
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Zalecenie Systemowe</p>
              <p className="text-sm text-white/90 leading-relaxed font-light">
                Wyniki analizy wskazują na potrzebę dalszej weryfikacji klinicznej. Rekomenduje się zestawienie powyższych danych z pełnym wywiadem lekarskim i historią choroby pacjenta przed podjęciem ostatecznej decyzji terapeutycznej.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import MedicalInput from "@/components/ui/MedicalInput";

interface LoginErrorResponse {
  non_field_errors?: string[];
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login/", { email, password });
      const { access, refresh, user } = res.data;
      login(access, refresh, user);
      router.push("/");
    } catch (err: unknown) {
      setError(
        axios.isAxiosError<LoginErrorResponse>(err)
          ? err.response?.data?.non_field_errors?.[0] || "Błąd autoryzacji."
          : "Błąd autoryzacji."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-bg font-sans">
      <div className="hidden lg:flex w-1/2 bg-medical-blue relative items-center justify-center p-12 overflow-hidden">
        <div className="relative z-10 text-white max-w-md">
          <div className="w-16 h-1 bg-white mb-8" />
          <h1 className="text-5xl font-bold leading-tight mb-6 tracking-tight">DxAssist Intelligence</h1>
          <p className="text-xl text-white/80 leading-relaxed font-light">Zaawansowane wspomaganie decyzji klinicznych.</p>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-medical-blue rounded-lg flex items-center justify-center text-white font-bold text-xl">Dx</div>
            <span className="text-2xl font-bold tracking-tighter text-zinc-900">DxAssist</span>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <MedicalInput label="Adres E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <MedicalInput label="Hasło" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
            <button type="submit" disabled={isLoading} className="w-full bg-zinc-900 hover:bg-black text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50">
              {isLoading ? "Autoryzacja..." : "Zaloguj do systemu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

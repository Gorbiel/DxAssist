"use client";

import React from "react";

interface MedicalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function MedicalInput({ label, ...props }: MedicalInputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:border-medical-blue focus:ring-4 focus:ring-medical-blue/10 transition-all text-zinc-800 placeholder:text-zinc-400 shadow-sm"
      />
    </div>
  );
}
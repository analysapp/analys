import { useEffect, useState } from "react";

interface Props {
  etapa: number; // valor entre 0 e 6
}

export default function BarraProgresso({ etapa }: Props) {
  const percentual = (etapa / 6) * 100;

  return (
    <div className="relative w-full h-6 rounded-full overflow-hidden bg-gray-200 shadow-inner border border-gray-300">
      {/* Camada líquida */}
      <div
        className="absolute inset-0 bg-black transition-all duration-700 ease-out"
        style={{ width: `${percentual}%`, borderRadius: "9999px" }}
      />

      {/* Onda líquida (simples) */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        style={{ transform: `translateX(-${100 - percentual}%)`, transition: "transform 0.7s ease-out" }}
      >
        <path
          d="M0 10 Q 25 0 50 10 T 100 10 V 20 H 0 Z"
          fill="rgba(255, 255, 255, 0.1)"
        />
      </svg>

      {/* Texto percentual */}
      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
        {Math.round(percentual)}%
      </div>
    </div>
  );
}

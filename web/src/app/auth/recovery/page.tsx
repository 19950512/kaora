"use client";
import { useState } from "react";

export default function RecoveryPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setTimeout(() => {
      setLoading(false);
      setMessage("Se o e-mail estiver cadastrado, enviaremos instruções de recuperação.");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-200 via-yellow-100 to-yellow-300 font-sans">
      <div className="bg-white/80 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-yellow-300 relative z-10">
        <div className="flex flex-col items-center mb-6">
          <img src="/globe.svg" alt="Logo" className="w-14 h-14 mb-2" />
          <h1 className="text-2xl font-bold text-yellow-900 mb-1">Recuperar Senha</h1>
          <p className="text-yellow-700 text-sm">Informe seu e-mail para recuperar o acesso.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="px-4 py-3 rounded-lg border border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-white text-yellow-900 placeholder-yellow-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-300 text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-700 mb-2"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Recuperar Senha"}
          </button>
          {error && <div className="text-red-600 text-center font-semibold animate-pulse">{error}</div>}
          {message && <div className="text-yellow-600 text-center font-semibold animate-pulse">{message}</div>}
        </form>
        <div className="mt-6 text-center">
          <a href="/auth/login" className="text-yellow-700 hover:underline font-semibold">Voltar ao login</a>
        </div>
      </div>
    </div>
  );
}

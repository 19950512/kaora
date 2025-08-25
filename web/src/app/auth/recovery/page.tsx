"use client";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Recovery() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!email) {
      setLoading(false);
      setError("Preencha o e-mail.");
      toast.error("Preencha o e-mail.");
      return;
    }
    // Simulação de envio
    setTimeout(() => {
      setLoading(false);
      toast.success("Se o e-mail existir, enviaremos instruções de recuperação!");
      setSuccess("Se o e-mail existir, enviaremos instruções de recuperação!");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1B3A2B] via-[#4F772D] to-[#A7C957] font-inter relative overflow-hidden">
      {/* SVG folha de palmeira no canto inferior esquerdo */}
      <svg className="absolute left-0 bottom-0 w-[28rem] h-[28rem] opacity-25 pointer-events-none" viewBox="0 0 448 448" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M224 420 Q210 350 120 340 Q80 330 140 300 Q200 270 120 220 Q60 180 160 180 Q260 180 200 120 Q140 60 224 60 Q308 60 248 120 Q188 180 288 180 Q388 180 328 220 Q268 270 328 300 Q388 330 328 340 Q238 350 224 420 Z" fill="#43AA8B"/>
        <path d="M224 420 Q230 370 280 360 Q320 350 270 320 Q220 290 280 250 Q340 210 240 210 Q140 210 200 250 Q260 290 200 320 Q140 350 200 360 Q250 370 224 420 Z" fill="#A7C957"/>
      </svg>
      {/* SVG tucano estilizado no canto superior direito */}
      <svg className="absolute right-16 top-12 w-52 h-52 opacity-40 pointer-events-none" viewBox="0 0 208 208" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="104" cy="160" rx="60" ry="28" fill="#F9DC5C"/>
        <ellipse cx="104" cy="104" rx="40" ry="28" fill="#1B3A2B"/>
        <ellipse cx="144" cy="90" rx="16" ry="10" fill="#F95738"/>
        <ellipse cx="64" cy="90" rx="16" ry="10" fill="#43AA8B"/>
        <circle cx="132" cy="98" r="5" fill="#fff"/>
        <circle cx="76" cy="98" r="5" fill="#fff"/>
        <rect x="120" y="80" width="32" height="8" rx="4" fill="#F9DC5C"/>
        <rect x="56" y="80" width="32" height="8" rx="4" fill="#F9DC5C"/>
        <path d="M104 104 Q120 120 144 140" stroke="#F95738" strokeWidth="6" strokeLinecap="round"/>
        <path d="M104 104 Q88 120 64 140" stroke="#43AA8B" strokeWidth="6" strokeLinecap="round"/>
      </svg>
      <Toaster position="top-right" />
      <div className="bg-[#F7F8FA]/90 rounded-2xl shadow-2xl p-10 w-full max-w-lg border border-[#A7C957] relative z-10">
        <h2 className="text-3xl font-extrabold text-center text-[#1B3A2B] mb-8 drop-shadow font-inter flex items-center justify-center gap-2">
          Recuperar Senha
        </h2>
        <form onSubmit={handleSubmit} className="space-y-8 font-inter">
          <div>
            <label className="block text-[#1B3A2B] font-semibold mb-2">E-mail</label>
            <input
              type={showEmail ? "text" : "email"}
              placeholder="Digite seu e-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-[#A7C957] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F772D] bg-white text-[#1B3A2B] placeholder-[#A0AEC0] pr-12 font-inter"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-10 text-[#A0AEC0] hover:text-[#4F772D]"
              tabIndex={-1}
              onClick={() => setShowEmail(v => !v)}
            >
              {showEmail ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#1B3A2B] via-[#4F772D] to-[#A7C957] text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-[#4F772D] font-inter"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Recuperar Senha"}
          </button>
          {error && <div className="text-[#B22222] text-center font-semibold animate-pulse font-inter">{error}</div>}
          {success && <div className="text-[#228B22] text-center font-semibold animate-pulse font-inter">{success}</div>}
        </form>
        <div className="mt-8 text-center">
          <a href="/auth/login" className="text-[#4F772D] hover:underline font-semibold font-inter">Voltar ao login</a>
        </div>
      </div>
    </div>
  );
}

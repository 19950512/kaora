"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PublicRoute } from "@/components/auth/ProtectedRoute";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (!email || !password) {
      setLoading(false);
      setError("Preencha todos os campos.");
      return;
    }
    
    if (password.length < 8) {
      setLoading(false);
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    
    // Aqui você pode integrar com sua API de autenticação local
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setError("E-mail ou senha inválidos.");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      setError("Erro ao fazer login com Google.");
    }
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 via-green-100 to-green-300 font-sans">
      <div className="bg-white/80 rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-green-300 relative z-10">
        <div className="flex flex-col items-center mb-6">
          <img src="/globe.svg" alt="Logo" className="w-14 h-14 mb-2" />
          <h1 className="text-2xl font-bold text-green-900 mb-1">Entrar na Kaora</h1>
          <p className="text-green-700 text-sm">Bem-vindo de volta! Faça login para continuar.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="E-mail" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="px-4 py-3 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 bg-white text-green-900 placeholder-green-400" 
            required 
          />
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Senha" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="px-4 py-3 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 bg-white text-green-900 placeholder-green-400 pr-12 w-full" 
              required 
              minLength={8} 
            />
            <button 
              type="button" 
              className="absolute right-3 top-3 text-green-400 hover:text-green-700" 
              tabIndex={-1} 
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-green-700 via-green-500 to-green-300 text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-green-700 mb-2" 
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
          
          <button 
            type="button" 
            className="w-full flex items-center justify-center gap-3 bg-white border border-green-300 text-green-900 py-3 rounded-lg font-bold text-lg shadow hover:bg-green-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-300" 
            onClick={handleGoogleSignIn}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g>
                <path d="M21.6 12.227c0-.818-.073-1.604-.209-2.364H12v4.482h5.37a4.597 4.597 0 0 1-1.993 3.017v2.497h3.22c1.89-1.744 2.983-4.314 2.983-7.632z" fill="#4285F4"/>
                <path d="M12 22c2.7 0 4.97-.893 6.627-2.423l-3.22-2.497c-.894.6-2.037.956-3.407.956-2.62 0-4.837-1.77-5.633-4.15H3.013v2.607A9.997 9.997 0 0 0 12 22z" fill="#34A853"/>
                <path d="M6.367 13.886a5.996 5.996 0 0 1 0-3.772V7.507H3.013a9.997 9.997 0 0 0 0 8.986l3.354-2.607z" fill="#FBBC05"/>
                <path d="M12 6.545c1.47 0 2.786.506 3.825 1.497l2.868-2.868C16.97 3.893 14.7 3 12 3A9.997 9.997 0 0 0 3.013 7.507l3.354 2.607C7.163 8.315 9.38 6.545 12 6.545z" fill="#EA4335"/>
              </g>
            </svg>
            Continuar com Google
          </button>
          
          <div className="mt-2 text-center">
            <p className="text-sm text-green-600 bg-green-50 p-2 rounded-lg">
              💡 Com Google: Entre rapidamente e configure apenas os dados da empresa
            </p>
          </div>
          
          {error && <div className="text-red-600 text-center font-semibold animate-pulse">{error}</div>}
        </form>
        
        <div className="mt-6 text-center">
          <a href="/auth/recovery" className="text-green-700 hover:underline font-semibold">Esqueceu a senha?</a>
        </div>
        <div className="mt-2 text-center">
          <a href="/auth/create" className="text-green-700 hover:underline font-semibold">Não tem conta? Cadastre-se</a>
        </div>
      </div>
    </div>
    </PublicRoute>
  );
}

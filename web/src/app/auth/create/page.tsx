"use client";
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function CreateAccount() {
  const [businessName, setBusinessName] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [responsibleEmail, setResponsibleEmail] = useState('');
  const [responsiblePassword, setResponsiblePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (responsiblePassword.length < 8) {
      setLoading(false);
      setError('A senha deve ter pelo menos 8 caracteres.');
      toast.error('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (responsiblePassword !== confirmPassword) {
      setLoading(false);
      setError('As senhas não coincidem.');
      toast.error('As senhas não coincidem.');
      return;
    }
    try {
      const res = await fetch('/api/business/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          responsibleName,
          responsibleEmail,
          responsiblePassword
        })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || 'Erro ao criar empresa.');
        toast.error(data.error || 'Erro ao criar empresa.');
        return;
      }
      toast.success(data.message || 'Conta criada com sucesso!');
      setSuccess(data.message || 'Conta criada com sucesso!');
    } catch (err) {
      setLoading(false);
      setError('Erro de conexão.');
      toast.error('Erro de conexão.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1B3A2B] via-[#4F772D] to-[#A7C957] font-inter relative overflow-hidden">
      {/* SVG decorativo de folhas no canto inferior esquerdo */}
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
  <div className="bg-[#F7F8FA]/90 rounded-2xl shadow-2xl p-10 w-full max-w-2xl border border-[#A7C957] relative z-10">
        <h2 className="text-4xl font-extrabold text-center text-[#1B3A2B] mb-8 drop-shadow font-inter flex items-center justify-center gap-2">
          <span>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#A7C957"/>
              <path d="M10 22C12 18 20 18 22 22" stroke="#1B3A2B" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 14C12 12 14 10 16 10C18 10 20 12 20 14" stroke="#4F772D" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          Criar Conta Kaora
        </h2>
        <form onSubmit={handleSubmit} className="space-y-8 font-inter">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#4F772D]/20 rounded-xl p-6 border border-[#A7C957] shadow-md">
              <h3 className="text-lg font-bold text-[#1B3A2B] mb-4 flex items-center gap-2">
                <span className="inline-block w-6 h-6 bg-[#A7C957] rounded-full mr-1"></span>
                Informações da Empresa
              </h3>
              <label className="block text-[#1B3A2B] font-semibold mb-2">Nome da Empresa</label>
              <input
                type="text"
                placeholder="Digite o nome da empresa"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="w-full px-4 py-3 border border-[#A7C957] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F772D] bg-white text-[#1B3A2B] placeholder-[#A0AEC0] font-inter"
                required
              />
            </div>
            <div className="bg-[#A7C957]/20 rounded-xl p-6 border border-[#4F772D] shadow-md">
              <h3 className="text-lg font-bold text-[#1B3A2B] mb-4 flex items-center gap-2">
                <span className="inline-block w-6 h-6 bg-[#4F772D] rounded-full mr-1"></span>
                Informações do Usuário
              </h3>
              <label className="block text-[#1B3A2B] font-semibold mb-2">Nome Completo</label>
              <input
                type="text"
                placeholder="Digite o nome completo"
                value={responsibleName}
                onChange={e => setResponsibleName(e.target.value)}
                className="w-full px-4 py-3 border border-[#4F772D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A7C957] bg-white text-[#1B3A2B] placeholder-[#A0AEC0] font-inter"
                required
              />
              <label className="block text-[#1B3A2B] font-semibold mt-4 mb-2">E-mail</label>
              <input
                type="email"
                placeholder="Digite o e-mail"
                value={responsibleEmail}
                onChange={e => setResponsibleEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#4F772D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A7C957] bg-white text-[#1B3A2B] placeholder-[#A0AEC0] font-inter"
                required
              />
              <div className="relative mt-4">
                <label className="block text-[#1B3A2B] font-semibold mb-2">Senha</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Crie uma senha forte"
                  value={responsiblePassword}
                  onChange={e => setResponsiblePassword(e.target.value)}
                  className="w-full px-4 py-3 border border-[#4F772D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A7C957] bg-white text-[#1B3A2B] placeholder-[#A0AEC0] pr-12 font-inter"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-10 text-[#A0AEC0] hover:text-[#4F772D]"
                  tabIndex={-1}
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
              <div className="relative mt-4">
                <label className="block text-[#1B3A2B] font-semibold mb-2">Confirme a Senha</label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-[#4F772D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A7C957] bg-white text-[#1B3A2B] placeholder-[#A0AEC0] pr-12 font-inter"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-10 text-[#A0AEC0] hover:text-[#4F772D]"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(v => !v)}
                >
                  {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#1B3A2B] via-[#4F772D] to-[#A7C957] text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-[#4F772D] font-inter mb-4"
            disabled={loading}
          >
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white border border-[#A7C957] text-[#1B3A2B] py-3 rounded-lg font-bold text-lg shadow hover:bg-[#A7C957]/10 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#A7C957] font-inter"
            onClick={() => toast('Funcionalidade Google em breve!')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g>
                <path d="M21.6 12.227c0-.818-.073-1.604-.209-2.364H12v4.482h5.37a4.597 4.597 0 0 1-1.993 3.017v2.497h3.22c1.89-1.744 2.983-4.314 2.983-7.632z" fill="#4285F4"/>
                <path d="M12 22c2.7 0 4.97-.893 6.627-2.423l-3.22-2.497c-.894.6-2.037.956-3.407.956-2.62 0-4.837-1.77-5.633-4.15H3.013v2.607A9.997 9.997 0 0 0 12 22z" fill="#34A853"/>
                <path d="M6.367 13.886a5.996 5.996 0 0 1 0-3.772V7.507H3.013a9.997 9.997 0 0 0 0 8.986l3.354-2.607z" fill="#FBBC05"/>
                <path d="M12 6.545c1.47 0 2.786.506 3.825 1.497l2.868-2.868C16.97 3.893 14.7 3 12 3A9.997 9.997 0 0 0 3.013 7.507l3.354 2.607C7.163 8.315 9.38 6.545 12 6.545z" fill="#EA4335"/>
              </g>
            </svg>
            Criar com Google
          </button>
          {error && <div className="text-[#B22222] text-center font-semibold animate-pulse font-inter">{error}</div>}
          {success && <div className="text-[#228B22] text-center font-semibold animate-pulse font-inter">{success}</div>}
        </form>
        <div className="mt-8 text-center">
          <a href="/auth/login" className="text-[#4F772D] hover:underline font-semibold font-inter">Já tem uma conta? Faça login</a>
        </div>
      </div>
    </div>
  );
}

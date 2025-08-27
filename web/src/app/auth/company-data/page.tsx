"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, FileText, MapPin, Phone, Globe, User, Mail, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

export default function CompanyDataPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: "",
    businessDocument: "",
    businessType: "",
    businessAddress: "",
    businessPhone: "",
    businessWebsite: "",
    businessDescription: ""
  });
  const [loading, setLoading] = useState(false);
  const [checkingExistingCompany, setCheckingExistingCompany] = useState(true);

  // Verificar se usuário já tem empresa cadastrada
  useEffect(() => {
    const checkExistingCompany = async () => {
      if (status === "loading" || !session?.user?.email) return;
      
      try {
        const response = await fetch(`/api/business/check-user-business?email=${encodeURIComponent(session.user.email)}`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.hasCompany) {
            // Usuário já tem empresa, redirecionar para a página principal
            console.log('✅ Usuário já possui empresa cadastrada, redirecionando...');
            router.push("/");
            return;
          }
        }
      } catch (error) {
        console.error('Erro ao verificar empresa existente:', error);
        // Em caso de erro, permitir que o usuário continue com o formulário
      } finally {
        setCheckingExistingCompany(false);
      }
    };

    checkExistingCompany();
  }, [session, status, router]);

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/business/create-from-google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Dados da empresa
          businessName: formData.businessName,
          businessDocument: formData.businessDocument,
          businessPhone: formData.businessPhone,
          // Dados do usuário (já autenticado via Google)
          responsibleName: session?.user?.name,
          responsibleEmail: session?.user?.email,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Empresa criada com sucesso! Redirecionando...');
        // Redirecionar para a página principal após sucesso
        router.push("/");
      } else {
        alert(`Erro: ${result.error || 'Erro ao criar empresa. Tente novamente.'}`);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao criar empresa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (status === "loading" || checkingExistingCompany) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-white/20 border-t-white mx-auto mb-6"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-white/80 text-lg font-medium">
            {checkingExistingCompany ? "Verificando dados da empresa..." : "Carregando..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)] pointer-events-none"></div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/25">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Dados da <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Empresa</span>
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
              Olá, <span className="text-emerald-400 font-semibold">{session?.user?.name}</span>! 
              Agora vamos configurar os dados da sua empresa para criar sua conta completa.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Card principal com dados da empresa */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Informações da Empresa</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Nome da empresa */}
                <div className="lg:col-span-2">
                  <label className="block text-white/90 font-medium mb-3 text-sm uppercase tracking-wide">
                    Nome da Empresa *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all backdrop-blur-sm text-lg"
                      placeholder="Ex: Kaora Tecnologia Ltda"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 rounded-2xl pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity"></div>
                  </div>
                </div>

                {/* CNPJ */}
                <div>
                  <label className="block text-white/90 font-medium mb-3 text-sm uppercase tracking-wide">
                    CNPJ *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="businessDocument"
                      value={formData.businessDocument}
                      onChange={handleInputChange}
                      required
                      className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="00.000.000/0000-00"
                    />
                    <FileText className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/30" />
                  </div>
                </div>

                {/* Tipo de negócio */}
                <div>
                  <label className="block text-white/90 font-medium mb-3 text-sm uppercase tracking-wide">
                    Tipo de Negócio *
                  </label>
                  <div className="relative">
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all backdrop-blur-sm appearance-none"
                    >
                      <option value="" className="bg-gray-800">Selecione o tipo</option>
                      <option value="retail" className="bg-gray-800">🛍️ Varejo</option>
                      <option value="services" className="bg-gray-800">🔧 Serviços</option>
                      <option value="technology" className="bg-gray-800">💻 Tecnologia</option>
                      <option value="manufacturing" className="bg-gray-800">🏭 Indústria</option>
                      <option value="consulting" className="bg-gray-800">💼 Consultoria</option>
                      <option value="other" className="bg-gray-800">✨ Outro</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ArrowRight className="w-5 h-5 text-white/30 rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-white/90 font-medium mb-3 text-sm uppercase tracking-wide">
                    Telefone
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="businessPhone"
                      value={formData.businessPhone}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 pl-14 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="(11) 99999-9999"
                    />
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-white/90 font-medium mb-3 text-sm uppercase tracking-wide">
                    Website
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="businessWebsite"
                      value={formData.businessWebsite}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 pl-14 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="https://www.suaempresa.com.br"
                    />
                    <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  </div>
                </div>

                {/* Endereço */}
                <div className="lg:col-span-2">
                  <label className="block text-white/90 font-medium mb-3 text-sm uppercase tracking-wide">
                    Endereço
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 pl-14 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="Rua, número, bairro, cidade - Estado"
                    />
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  </div>
                </div>

                {/* Descrição */}
                <div className="lg:col-span-2">
                  <label className="block text-white/90 font-medium mb-3 text-sm uppercase tracking-wide">
                    Descrição da Empresa
                  </label>
                  <div className="relative">
                    <textarea
                      name="businessDescription"
                      value={formData.businessDescription}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-6 py-4 pl-14 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all backdrop-blur-sm resize-none"
                      placeholder="Descreva brevemente o que sua empresa faz..."
                    />
                    <FileText className="absolute left-4 top-6 w-5 h-5 text-white/40" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card com dados do usuário (Google) */}
            <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/30 shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Dados do Responsável</h3>
                  <p className="text-emerald-300 text-sm">Autenticado via Google</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-400 ml-auto" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-emerald-200 font-medium mb-3 text-sm uppercase tracking-wide">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={session?.user?.name || ""}
                      disabled
                      className="w-full px-6 py-4 pl-14 bg-white/10 border border-emerald-400/30 rounded-2xl text-white"
                    />
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-emerald-200 font-medium mb-3 text-sm uppercase tracking-wide">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={session?.user?.email || ""}
                      disabled
                      className="w-full px-6 py-4 pl-14 bg-white/10 border border-emerald-400/30 rounded-2xl text-white"
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de submit */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className="group relative px-12 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 focus:ring-4 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 text-lg"
              >
                <div className="flex items-center space-x-3">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white"></div>
                      <span>Criando empresa...</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-6 h-6" />
                      <span>Criar Empresa</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
                
                {/* Efeito de brilho no hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

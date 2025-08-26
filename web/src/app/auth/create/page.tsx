"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Building2, User, Sparkles, ArrowRight, Check } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function CreateAccountPage() {
  const [showFullForm, setShowFullForm] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessDocument, setBusinessDocument] = useState("");
  const [responsibleName, setResponsibleName] = useState("");
  const [responsibleEmail, setResponsibleEmail] = useState("");
  const [responsiblePassword, setResponsiblePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [responsibleDocument, setResponsibleDocument] = useState("");
  const [responsiblePhone, setResponsiblePhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const { data: session, status } = useSession();

  // Função para validar campos em tempo real
  const validateField = (name: string, value: string) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'E-mail inválido';
        } else {
          delete errors.email;
        }
        break;
      case 'password':
        if (value && value.length < 8) {
          errors.password = 'Senha deve ter pelo menos 8 caracteres';
        } else {
          delete errors.password;
        }
        if (confirmPassword && value !== confirmPassword) {
          errors.confirmPassword = 'Senhas não coincidem';
        } else if (confirmPassword && value === confirmPassword) {
          delete errors.confirmPassword;
        }
        break;
      case 'confirmPassword':
        if (value && value !== responsiblePassword) {
          errors.confirmPassword = 'Senhas não coincidem';
        } else {
          delete errors.confirmPassword;
        }
        break;
      case 'businessDocument':
        if (value && value.replace(/\D/g, '').length !== 14) {
          errors.businessDocument = 'CNPJ deve ter 14 dígitos';
        } else {
          delete errors.businessDocument;
        }
        break;
      case 'responsibleDocument':
        if (value && value.replace(/\D/g, '').length !== 11) {
          errors.responsibleDocument = 'CPF deve ter 11 dígitos';
        } else {
          delete errors.responsibleDocument;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  useEffect(() => {
    if (session) {
      // Se o usuário está autenticado via Google, redirecionar para company-data
      window.location.href = "/auth/company-data";
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    if (!businessName || !responsibleName || !responsibleEmail || !responsiblePassword || !businessDocument || !responsibleDocument) {
      setLoading(false);
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    
    if (responsiblePassword.length < 8) {
      setLoading(false);
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    
    if (responsiblePassword !== confirmPassword) {
      setLoading(false);
      setError("As senhas não coincidem.");
      return;
    }
    
    try {
      const response = await fetch("/api/business/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName,
          businessDocument,
          responsibleName,
          responsibleEmail,
          responsiblePassword,
          responsibleDocument,
          responsiblePhone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const successMessage = "Conta criada com sucesso! Redirecionando...";
        setSuccess(successMessage);
        
        // Toast de sucesso
        toast.success("🎉 Empresa cadastrada com sucesso!", {
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            borderLeft: '4px solid #10b981'
          }
        });
        
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2000);
      } else {
        // Melhor tratamento de erros baseado na resposta da API
        const errorMessage = data.error || data.message || "Erro ao criar conta.";
        setError(errorMessage);
        
        // Toast para feedback imediato
        if (errorMessage.includes("empresa cadastrada")) {
          toast.error("Esta empresa já está cadastrada! Tente fazer login.", {
            duration: 6000,
            style: {
              background: '#1f2937',
              color: '#f3f4f6',
              borderLeft: '4px solid #ef4444'
            }
          });
        } else {
          toast.error(errorMessage, {
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f3f4f6',
              borderLeft: '4px solid #ef4444'
            }
          });
        }
        
        // Log detalhado para debug
        console.error("Erro na criação da conta:", {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          message: data.message,
          fullResponse: data
        });
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      const connectionError = "Erro de conexão. Verifique sua internet e tente novamente.";
      setError(connectionError);
      toast.error(connectionError, {
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#f3f4f6',
          borderLeft: '4px solid #ef4444'
        }
      });
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google");
    } catch (error) {
      const googleError = "Erro ao fazer login com Google.";
      setError(googleError);
      toast.error(googleError, {
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#f3f4f6',
          borderLeft: '4px solid #ef4444'
        }
      });
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 min-h-screen w-full">
          {/* Left Side - Hero Content */}
          <div className="flex flex-col justify-center px-8 xl:px-12 2xl:px-16">
            <div className="w-full max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-8 shadow-2xl">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
                Bem-vindo à Kaora
              </h1>
              <p className="text-gray-300 text-xl mb-8 leading-relaxed">
                Transforme seu negócio com nossa plataforma moderna e intuitiva. 
                Gestão completa em suas mãos.
              </p>
              
              {/* Features List */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-lg">Gestão financeira completa</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-lg">Controle de estoque inteligente</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-lg">Relatórios em tempo real</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex items-center justify-center p-4 xl:p-8 2xl:p-12">
            <div className="w-full max-w-2xl">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 xl:p-12 2xl:p-16 shadow-2xl border border-white/20">
                {!showFullForm ? (
                  <div className="space-y-6">
                    {/* Google Option - Primary */}
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-medium">
                        <Sparkles className="w-4 h-4" />
                        Recomendado
                      </div>
                      <h2 className="text-2xl font-bold text-white">
                        Comece em segundos
                      </h2>
                      <p className="text-gray-300">
                        Use sua conta Google e configure apenas os dados da empresa
                      </p>
                    </div>

                    <button 
                      type="button" 
                      className="w-full group relative bg-white hover:bg-gray-50 text-gray-900 py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                      onClick={handleGoogleSignIn}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g>
                            <path d="M21.6 12.227c0-.818-.073-1.604-.209-2.364H12v4.482h5.37a4.597 4.597 0 0 1-1.993 3.017v2.497h3.22c1.89-1.744 2.983-4.314 2.983-7.632z" fill="#4285F4"/>
                            <path d="M12 22c2.7 0 4.97-.893 6.627-2.423l-3.22-2.497c-.894.6-2.037.956-3.407.956-2.62 0-4.837-1.77-5.633-4.15H3.013v2.607A9.997 9.997 0 0 0 12 22z" fill="#34A853"/>
                            <path d="M6.367 13.886a5.996 5.996 0 0 1 0-3.772V7.507H3.013a9.997 9.997 0 0 0 0 8.986l3.354-2.607z" fill="#FBBC05"/>
                            <path d="M12 6.545c1.47 0 2.786.506 3.825 1.497l2.868-2.868C16.97 3.893 14.7 3 12 3A9.997 9.997 0 0 0 3.013 7.507l3.354 2.607C7.163 8.315 9.38 6.545 12 6.545z" fill="#EA4335"/>
                          </g>
                        </svg>
                        Continuar com Google
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    {/* Benefits */}
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-4 border border-green-500/20">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-300">
                          <Check className="w-4 h-4" />
                          <span className="text-sm">Login instantâneo</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-300">
                          <Check className="w-4 h-4" />
                          <span className="text-sm">Dados pessoais preenchidos automaticamente</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-300">
                          <Check className="w-4 h-4" />
                          <span className="text-sm">Próximo passo: apenas dados da empresa</span>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/20"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-gradient-to-r from-purple-900 to-blue-900 text-gray-300">ou</span>
                      </div>
                    </div>

                    {/* Alternative option */}
                    <button
                      type="button"
                      onClick={() => setShowFullForm(true)}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/20 text-white py-3 px-6 rounded-2xl font-medium transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <User className="w-5 h-5" />
                        Preencher formulário completo
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    {/* Login link */}
                    <div className="text-center pt-4">
                      <a 
                        href="/auth/login" 
                        className="text-purple-300 hover:text-purple-200 font-medium transition-colors"
                      >
                        Já tem conta? Entre aqui
                      </a>
                    </div>
                  </div>
                ) : (
                  /* Desktop Full Form */
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white">Cadastro Completo</h2>
                        <p className="text-gray-300 text-sm">Preencha todos os dados abaixo</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowFullForm(false)}
                        className="text-purple-300 hover:text-purple-200 text-sm underline transition-colors"
                      >
                        ← Voltar
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Company Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-white">
                          <Building2 className="w-5 h-5 text-purple-400" />
                          <h3 className="font-semibold">Dados da Empresa</h3>
                        </div>
                        
                        <div className="space-y-3">
                          <input 
                            type="text" 
                            placeholder="Nome da empresa *" 
                            value={businessName} 
                            onChange={e => setBusinessName(e.target.value)} 
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm" 
                            required 
                          />
                          <input 
                            type="text" 
                            placeholder="CNPJ *" 
                            value={businessDocument} 
                            onChange={e => setBusinessDocument(e.target.value)} 
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm" 
                            required 
                          />
                        </div>
                      </div>

                      {/* User Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-white">
                          <User className="w-5 h-5 text-blue-400" />
                          <h3 className="font-semibold">Dados do Responsável</h3>
                        </div>
                        
                        <div className="space-y-3">
                          <input 
                            type="text" 
                            placeholder="Nome completo *" 
                            value={responsibleName} 
                            onChange={e => setResponsibleName(e.target.value)} 
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm" 
                            required 
                          />
                          <input 
                            type="email" 
                            placeholder="Email *" 
                            value={responsibleEmail} 
                            onChange={e => setResponsibleEmail(e.target.value)} 
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm" 
                            required 
                          />
                          <input 
                            type="text" 
                            placeholder="CPF *" 
                            value={responsibleDocument} 
                            onChange={e => setResponsibleDocument(e.target.value)} 
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm" 
                            required 
                          />
                          
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Senha (mín. 8 caracteres) *" 
                              value={responsiblePassword} 
                              onChange={e => setResponsiblePassword(e.target.value)} 
                              className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm" 
                              required 
                              minLength={8} 
                            />
                            <button 
                              type="button" 
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors" 
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                          
                          <div className="relative">
                            <input 
                              type={showConfirmPassword ? "text" : "password"} 
                              placeholder="Confirmar senha *" 
                              value={confirmPassword} 
                              onChange={e => setConfirmPassword(e.target.value)} 
                              className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm" 
                              required 
                              minLength={8} 
                            />
                            <button 
                              type="button" 
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors" 
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Criando conta...
                          </div>
                        ) : (
                          "Criar Conta"
                        )}
                      </button>

                      {/* Messages */}
                      {error && (
                        <div className="bg-red-500/10 border-l-4 border-red-500 text-red-300 px-6 py-4 rounded-xl backdrop-blur-sm">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-red-200 font-medium mb-1">Ops! Algo deu errado</h4>
                              <p className="text-red-300 text-sm leading-relaxed">{error}</p>
                              {error.includes("empresa cadastrada") && (
                                <p className="text-red-200 text-xs mt-2 opacity-75">
                                  💡 Dica: Tente fazer login ou use um e-mail diferente
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      {success && (
                        <div className="bg-green-500/10 border-l-4 border-green-500 text-green-300 px-6 py-4 rounded-xl backdrop-blur-sm">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-green-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-green-200 font-medium mb-1">Sucesso!</h4>
                              <p className="text-green-300 text-sm">{success}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex items-center justify-center min-h-screen p-4">
          <div className="w-full">
            {/* Mobile Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 shadow-2xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Bem-vindo à Kaora
              </h1>
              <p className="text-gray-300 text-lg">
                Transforme seu negócio com nossa plataforma
              </p>
            </div>

            {/* Mobile Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 xl:p-12 shadow-2xl border border-white/20">
              {!showFullForm ? (
                <div className="space-y-6">
                  {/* Google Option - Primary */}
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-medium">
                      <Sparkles className="w-4 h-4" />
                      Recomendado
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      Comece em segundos
                    </h2>
                    <p className="text-gray-300">
                      Use sua conta Google e configure apenas os dados da empresa
                    </p>
                  </div>

                  <button 
                    type="button" 
                    className="w-full group relative bg-white hover:bg-gray-50 text-gray-900 py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                    onClick={handleGoogleSignIn}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g>
                          <path d="M21.6 12.227c0-.818-.073-1.604-.209-2.364H12v4.482h5.37a4.597 4.597 0 0 1-1.993 3.017v2.497h3.22c1.89-1.744 2.983-4.314 2.983-7.632z" fill="#4285F4"/>
                          <path d="M12 22c2.7 0 4.97-.893 6.627-2.423l-3.22-2.497c-.894.6-2.037.956-3.407.956-2.62 0-4.837-1.77-5.633-4.15H3.013v2.607A9.997 9.997 0 0 0 12 22z" fill="#34A853"/>
                          <path d="M6.367 13.886a5.996 5.996 0 0 1 0-3.772V7.507H3.013a9.997 9.997 0 0 0 0 8.986l3.354-2.607z" fill="#FBBC05"/>
                          <path d="M12 6.545c1.47 0 2.786.506 3.825 1.497l2.868-2.868C16.97 3.893 14.7 3 12 3A9.997 9.997 0 0 0 3.013 7.507l3.354 2.607C7.163 8.315 9.38 6.545 12 6.545z" fill="#EA4335"/>
                        </g>
                      </svg>
                      Continuar com Google
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  {/* Benefits */}
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-4 border border-green-500/20">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-300">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Login instantâneo</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-300">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Dados pessoais preenchidos automaticamente</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-300">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Próximo passo: apenas dados da empresa</span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gradient-to-r from-purple-900 to-blue-900 text-gray-300">ou</span>
                    </div>
                  </div>

                  {/* Alternative option */}
                  <button
                    type="button"
                    onClick={() => setShowFullForm(true)}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/20 text-white py-3 px-6 rounded-2xl font-medium transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <User className="w-5 h-5" />
                      Preencher formulário completo
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  {/* Login link */}
                  <div className="text-center pt-4">
                    <a 
                      href="/auth/login" 
                      className="text-purple-300 hover:text-purple-200 font-medium transition-colors"
                    >
                      Já tem conta? Entre aqui
                    </a>
                  </div>
                </div>
              ) : (
                /* Mobile Full Form */
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Cadastro Completo</h2>
                      <p className="text-gray-300 text-sm">Preencha todos os dados abaixo</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFullForm(false)}
                      className="text-purple-300 hover:text-purple-200 text-sm underline transition-colors"
                    >
                      ← Voltar
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Company Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-white">
                        <Building2 className="w-5 h-5 text-purple-400" />
                        <h3 className="font-semibold">Dados da Empresa</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="Nome da empresa *" 
                          value={businessName} 
                          onChange={e => setBusinessName(e.target.value)} 
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm" 
                          required 
                        />
                        <input 
                          type="text" 
                          placeholder="CNPJ *" 
                          value={businessDocument} 
                          onChange={e => setBusinessDocument(e.target.value)} 
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm" 
                          required 
                        />
                      </div>
                    </div>

                    {/* User Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-white">
                        <User className="w-5 h-5 text-blue-400" />
                        <h3 className="font-semibold">Dados do Responsável</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="Nome completo *" 
                          value={responsibleName} 
                          onChange={e => setResponsibleName(e.target.value)} 
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm" 
                          required 
                        />
                        <input 
                          type="email" 
                          placeholder="Email *" 
                          value={responsibleEmail} 
                          onChange={e => setResponsibleEmail(e.target.value)} 
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm" 
                          required 
                        />
                        <input 
                          type="text" 
                          placeholder="CPF *" 
                          value={responsibleDocument} 
                          onChange={e => setResponsibleDocument(e.target.value)} 
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm" 
                          required 
                        />
                        
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Senha (mín. 8 caracteres) *" 
                            value={responsiblePassword} 
                            onChange={e => setResponsiblePassword(e.target.value)} 
                            className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm" 
                            required 
                            minLength={8} 
                          />
                          <button 
                            type="button" 
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors" 
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        
                        <div className="relative">
                          <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="Confirmar senha *" 
                            value={confirmPassword} 
                            onChange={e => setConfirmPassword(e.target.value)} 
                            className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm" 
                            required 
                            minLength={8} 
                          />
                          <button 
                            type="button" 
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors" 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Criando conta...
                        </div>
                      ) : (
                        "Criar Conta"
                      )}
                    </button>

                    {/* Messages */}
                    {error && (
                      <div className="bg-red-500/10 border-l-4 border-red-500 text-red-300 px-6 py-4 rounded-xl backdrop-blur-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-red-200 font-medium mb-1">Ops! Algo deu errado</h4>
                            <p className="text-red-300 text-sm leading-relaxed">{error}</p>
                            {error.includes("empresa cadastrada") && (
                              <p className="text-red-200 text-xs mt-2 opacity-75">
                                💡 Dica: Tente fazer login ou use um e-mail diferente
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {success && (
                      <div className="bg-green-500/10 border-l-4 border-green-500 text-green-300 px-6 py-4 rounded-xl backdrop-blur-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-green-200 font-medium mb-1">Sucesso!</h4>
                            <p className="text-green-300 text-sm">{success}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

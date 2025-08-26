
"use client";
import { useSession, signOut } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 via-green-100 to-green-300 p-4 md:p-8">
        <div className="bg-white/80 rounded-2xl shadow-2xl p-8 md:p-12 w-full border border-green-300 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-green-900 mb-4">Bem-vindo à Kaora</h1>
          <p className="text-green-700 mb-6 text-lg">Faça login para acessar a plataforma.</p>
          <div className="space-y-4 max-w-md mx-auto">
            <a 
              href="/auth/login" 
              className="block w-full bg-gradient-to-r from-green-700 via-green-500 to-green-300 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:scale-105 transition-transform duration-150"
            >
              Entrar
            </a>
            <a 
              href="/auth/create" 
              className="block w-full bg-white border border-green-300 text-green-900 py-4 rounded-lg font-bold text-lg shadow hover:bg-green-100 transition-colors duration-150"
            >
              Criar Conta
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-green-100 to-green-300 p-4 md:p-8">
      <div className="w-full">
        <header className="bg-white/80 rounded-2xl shadow-2xl p-6 mb-8 border border-green-300">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-900">Dashboard Kaora</h1>
              <p className="text-green-700">Bem-vindo, {session.user?.name || session.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Sair
            </button>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          <div className="bg-white/80 rounded-xl shadow-lg p-6 border border-green-200">
            <h2 className="text-xl font-bold text-green-900 mb-4">Empresas</h2>
            <p className="text-green-700">Gerencie suas empresas e dados corporativos.</p>
          </div>
          
          <div className="bg-white/80 rounded-xl shadow-lg p-6 border border-green-200">
            <h2 className="text-xl font-bold text-green-900 mb-4">Usuários</h2>
            <p className="text-green-700">Administre usuários e permissões do sistema.</p>
          </div>
          
          <div className="bg-white/80 rounded-xl shadow-lg p-6 border border-green-200">
            <h2 className="text-xl font-bold text-green-900 mb-4">Relatórios</h2>
            <p className="text-green-700">Visualize relatórios e métricas importantes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

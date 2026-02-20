'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';
import { CreateChatForm } from '@/components/forms/create-chat-form';
import { ChatsList } from '@/components/chats/chats-list';

export default function PainelPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshChats, setRefreshChats] = useState(0);

  useEffect(() => {
    const email = authService.getCurrentUserEmail();
    if (!email) {
      router.push('/login');
      return;
    }
    setUserEmail(email);
    setIsLoading(false);
  }, [router]);

  const handleChatCreated = () => {
    setRefreshChats(prev => prev + 1);
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <header className="bg-gray-900 border-b border-gray-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Fullstack Chat</h1>
              <p className="text-sm text-gray-400">Bem-vindo, {userEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Formulário de criar chat */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <CreateChatForm onSuccess={handleChatCreated} />
            </div>
          </div>

          {/* Lista de chats */}
          <div className="w-full">
            <ChatsList refreshTrigger={refreshChats} />
          </div>
        </div>
      </main>
    </div>
  );
}

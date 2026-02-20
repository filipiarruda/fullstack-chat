'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { chatService } from '@/services/chat.service';
import { authService } from '@/services/auth.service';
import { ChatListItem } from '@/types/chat.types';

interface ChatsListProps {
  refreshTrigger?: number;
}

export const ChatsList = ({ refreshTrigger }: ChatsListProps) => {
  const router = useRouter();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = authService.getCurrentUserId();
    setUserId(id);
  }, []);

  const fetchChats = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const chatsList = await chatService.getUserChats(userId);
      setChats(chatsList);
    } catch (err) {
      // Verificar se é erro de autenticação (token inválido/expirado)
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase();
          if (errorMessage.includes('401') || 
            errorMessage.includes('unauthorized') || 
            errorMessage.includes('invalid or missing token') || 
            errorMessage.includes('invalid') && errorMessage.includes('token') || 
            errorMessage.includes('expired')) {
          // Token inválido - redirecionar para login
          authService.logout();
          router.push('/login');
          return;
        }
      }
      
      const message = err instanceof Error ? err.message : 'Erro ao carregar chats';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    if (userId) {
      fetchChats();
    }
  }, [userId, fetchChats]);

  useEffect(() => {
    if (refreshTrigger && userId) {
      fetchChats();
    }
  }, [refreshTrigger, userId, fetchChats]);

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Minhas salas</h2>
        <div className="text-center text-gray-400">Carregando salas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Minhas salas</h2>
        <div className="text-center">
          <div className="mb-4 bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
            {error}
          </div>
          <button
            onClick={fetchChats}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Minhas salas</h2>
        <button
          onClick={fetchChats}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg transition duration-200 text-sm"
        >
          Atualizar
        </button>
      </div>

      {chats.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <p className="mb-2">Você não possui nenhum chat ativo.</p>
          <p className="text-sm text-gray-500">Crie uma nova sala acima para começar!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Sala</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Criado por</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Participantes</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Entrou em</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {chats.map((chat) => (
                <tr
                  key={chat.id}
                  className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="text-white font-medium">
                      Sala #{chat.id.slice(-8)}
                    </div>
                    <div className="text-sm text-gray-400">
                      Criado em {formatDate(chat.createdAt)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white">{chat.createdBy.name}</div>
                    <div className="text-sm text-gray-400">{chat.createdBy.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full text-sm">
                      {chat.participantCount} {chat.participantCount === 1 ? 'pessoa' : 'pessoas'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm">
                    {formatDate(chat.joinedAt)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleChatClick(chat.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm transition duration-200"
                    >
                      Entrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
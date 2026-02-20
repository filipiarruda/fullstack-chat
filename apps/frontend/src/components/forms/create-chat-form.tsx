'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { chatService } from '@/services/chat.service';
import { authService } from '@/services/auth.service';

interface CreateChatFormProps {
  onSuccess?: () => void;
}

export const CreateChatForm = ({ onSuccess }: CreateChatFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = authService.getCurrentUserId();
    setUserId(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const response = await chatService.createChat({ userId });

      setSuccess(true);
      
      if (onSuccess) {
        // Chama callback para atualizar lista e não redireciona
        onSuccess();
        // Limpa o estado de sucesso após 3 segundos
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        // Redirecionar para a página do chat criado após 1 segundo
        setTimeout(() => {
          router.push(`/chat/${response.id}`);
        }, 1000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao criar sala';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-8">
      <h2 className="text-2xl font-bold text-white text-center mb-6">Criar Nova Sala de Chat</h2>

      {error && (
        <div className="mb-4 bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-900/30 border border-green-700 rounded-lg p-3 text-green-300 text-sm">
          Sala de chat criada com sucesso! Redirecionando...
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !userId}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition duration-200 cursor-pointer disabled:cursor-not-allowed"
      >
        {loading ? 'Criando...' : 'Criar Sala'}
      </button>
    </form>
  );
};

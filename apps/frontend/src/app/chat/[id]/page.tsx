'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { getSocketService } from '@/lib/socket';
import { chatService } from '@/services/chat.service';
import { Message, GetMessagesResponse } from '@/types/chat.types';

export default function ChatPage() {
  const { id: chatId } = useParams<{ id: string }>();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketServiceRef = useRef<ReturnType<typeof getSocketService> | null>(null);
  const messageIdsRef = useRef<Set<string>>(new Set());

  const userId = authService.getCurrentUserId();
  const token = authService.getToken();

  // ✅ Auto-scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  // 🔄 Fetch initial messages
  useEffect(() => {
    if (!chatId || !token) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const response: GetMessagesResponse = await chatService.getMessages(chatId);
        setMessages(response.messages);

        // Track message IDs to avoid duplicates
        response.messages.forEach((msg) => messageIdsRef.current.add(msg.id));

        setError(null);
        scrollToBottom();
      } catch (err: any) {
        console.error('Erro ao carregar mensagens:', err);
        if (err.response?.status === 401 || err.message?.includes('401')) {
          router.push('/login');
        }
        setError('Falha ao carregar mensagens');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [chatId, token, router, scrollToBottom]);

  // 🔌 Setup WebSocket connection and listeners
  useEffect(() => {
    if (!chatId || !userId || !token) return;

    const setupWebSocket = async () => {
      try {
        const socketService = getSocketService(token);
        socketServiceRef.current = socketService;

        // Connect to WebSocket
        console.log('🔗 Conectando ao WebSocket...');
        await socketService.connect();
        console.log('✅ WebSocket conectado');
        setSocketConnected(true);

        // Join chat room
        console.log(`📍 Fazendo join no chat ${chatId}...`);
        await socketService.joinChat(chatId);
        console.log(`✅ Joined chat ${chatId}`);

        // Setup message listener
        socketService.onNewMessage((message: Message) => {
          console.log('📨 Mensagem recebida:', message);

          // Skip if already in messages (deduplication)
          if (messageIdsRef.current.has(message.id)) {
            console.log('⏭️ Mensagem duplicada, ignorando:', message.id);
            return;
          }

          // Add to messages
          messageIdsRef.current.add(message.id);
          setMessages((prevMessages) => [...prevMessages, message]);
          scrollToBottom();
        });

        // Setup connection state listener
        const unsubscribe = socketService.onConnectionStateChange((connected: boolean) => {
          console.log('🔗 Estado de conexão:', connected ? 'conectado' : 'desconectado');
          setSocketConnected(connected);
        });

        // Cleanup
        return () => {
          unsubscribe();
          console.log(`🔌 Deixando chat ${chatId}...`);
          socketService.leaveChat(chatId);
          socketService.offNewMessage();
        };
      } catch (err: any) {
        console.error(
          '❌ Erro ao configurar WebSocket:',
          err?.message || err,
        );
        setSocketConnected(false);
      }
    };

    const cleanup = setupWebSocket().then(c => c);
    
    return () => {
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
  }, [chatId, userId, token, scrollToBottom]);

  // 🔤 Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !chatId) return;

    try {
      setSendingMessage(true);
      const response = await chatService.sendMessage(
        chatId,
        userId,
        newMessage,
      );

      // Add sent message to state immediately (via REST response, not WebSocket)
      if (!messageIdsRef.current.has(response.id)) {
        messageIdsRef.current.add(response.id);
        setMessages((prevMessages) => [...prevMessages, response]);
      }

      setNewMessage('');
      scrollToBottom();
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err);
      if (err.response?.status === 401) {
        router.push('/login');
      }
      setError('Falha ao enviar mensagem');
    } finally {
      setSendingMessage(false);
    }
  };

  if (!userId || !token) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <p className="text-gray-400">Autenticando...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Chat</h1>
          <button
            onClick={() => router.push('/painel')}
            className="text-gray-400 hover:text-white"
          >
            ← Voltar
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              socketConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span
            className={`text-sm ${
              socketConnected ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {socketConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
              <p className="text-gray-400">Carregando mensagens...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Nenhuma mensagem ainda</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === userId ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.senderId === userId
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <p className="text-sm font-semibold">
                  {message.sender?.name || 'Anônimo'}
                </p>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.createdAt).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 bg-gray-800 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Digite uma mensagem..."
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sendingMessage}
          />
          <button
            onClick={handleSendMessage}
            disabled={sendingMessage || !newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            {sendingMessage ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}

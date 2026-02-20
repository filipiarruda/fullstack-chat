import { io, Socket } from 'socket.io-client';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  sender: {
    id: string;
    name: string;
  };
  createdAt: string;
}

class SocketService {
  private socket: Socket | null = null;
  private token: string;
  private messageCallbacks: Set<(message: Message) => void> = new Set();
  private connectionStateCallbacks: Set<(connected: boolean) => void> =
    new Set();

  constructor(token: string) {
    this.token = token;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io('http://localhost:3002', {
          auth: { token: this.token },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        // ✅ Connection success handler
        this.socket.on('connect', () => {
          console.log('✅ Socket conectado ao servidor WebSocket');
          this.notifyConnectionStateChange(true);
          resolve();
        });

        // ❌ Connection error handler
        this.socket.on('connect_error', (error: any) => {
          console.error(
            '❌ Socket erro de conexão:',
            error?.message || error,
          );
          this.notifyConnectionStateChange(false);
          reject(error);
        });

        // Disconnect handler
        this.socket.on('disconnect', (reason: string) => {
          console.log('📴 Socket desconectado:', reason);
          this.notifyConnectionStateChange(false);
        });

        // ❌ Authentication error
        this.socket.on('error', (error: any) => {
          console.error('❌ Socket erro:', error?.message || error);
          this.notifyConnectionStateChange(false);
          reject(error);
        });

        // Detalhes de conexão
        this.socket.on('connect_details', (data: any) => {
          console.log('📊 Detalhes de conexão:', data);
        });
      } catch (error) {
        console.error('❌ Erro ao criar socket:', error);
        reject(error);
      }
    });
  }

  joinChat(chatId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        console.error(
          '❌ joinChat: Socket não conectado. Status:',
          this.socket?.connected,
        );
        reject(new Error('Socket não está conectado'));
        return;
      }

      console.log(`📍 Emitindo joinChat para chat ${chatId}`);

      // Setup handler para joinedChat event
      const joinedHandler = (data: any) => {
        console.log('✅ joinedChat recebido:', data);
        this.socket?.off('joinedChat', joinedHandler);
        this.socket?.off('error', errorHandler);
        resolve();
      };

      const errorHandler = (error: any) => {
        console.error('❌ Erro ao fazer join:', error?.message || error);
        this.socket?.off('joinedChat', joinedHandler);
        this.socket?.off('error', errorHandler);
        reject(error);
      };

      this.socket.once('joinedChat', joinedHandler);
      this.socket.once('error', errorHandler);

      // Emit joinChat
      this.socket.emit('joinChat', { chatId });

      // Timeout de segurança
      setTimeout(() => {
        this.socket?.off('joinedChat', joinedHandler);
        this.socket?.off('error', errorHandler);
        console.warn('⚠️ joinChat timeout - nenhuma resposta do servidor');
        reject(new Error('joinChat timeout'));
      }, 5000);
    });
  }

  leaveChat(chatId: string): void {
    if (!this.socket) return;
    console.log(`📍 Emitindo leaveChat para chat ${chatId}`);
    this.socket.emit('leaveChat', { chatId });
  }

  onNewMessage(callback: (message: Message) => void): void {
    this.messageCallbacks.add(callback);
    if (!this.socket) return;

    // Remove o handler anterior se existir
    this.socket.off('newMessage');

    // Configura novo handler
    this.socket.on('newMessage', (message: any) => {
      console.log('📨 Nova mensagem recebida via WebSocket:', message);
      // Executar todos os callbacks registrados
      this.messageCallbacks.forEach((cb) => {
        try {
          cb(message);
        } catch (error) {
          console.error('Erro ao executar callback de mensagem:', error);
        }
      });
    });
  }

  offNewMessage(): void {
    this.messageCallbacks.clear();
    if (!this.socket) return;
    this.socket.off('newMessage');
    console.log('🔕 Removidos listeners de newMessage');
  }

  onConnectionStateChange(
    callback: (connected: boolean) => void,
  ): () => void {
    this.connectionStateCallbacks.add(callback);

    // Retornar função para remover o callback
    return () => {
      this.connectionStateCallbacks.delete(callback);
    };
  }

  private notifyConnectionStateChange(connected: boolean): void {
    this.connectionStateCallbacks.forEach((callback) => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Erro ao notificar mudança de conexão:', error);
      }
    });
  }

  disconnect(): void {
    if (!this.socket) return;
    console.log('🔌 Desconectando socket...');
    this.socket.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

let socketServiceInstance: SocketService | null = null;

export function getSocketService(token: string): SocketService {
  if (!socketServiceInstance) {
    socketServiceInstance = new SocketService(token);
  }
  return socketServiceInstance;
}

export function resetSocketService(): void {
  if (socketServiceInstance) {
    socketServiceInstance.disconnect();
    socketServiceInstance = null;
  }
}

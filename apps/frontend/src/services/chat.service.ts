import { apiClient } from '@/lib/api';
import { CreateChatPayload, CreateChatResponse, GetMessagesResponse, Message, ChatListItem } from '@/types/chat.types';

export const chatService = {
  async createChat(payload: CreateChatPayload): Promise<CreateChatResponse> {
    return apiClient.post<CreateChatResponse>('/chats', payload);
  },

  async joinChat(chatId: string, userId: string): Promise<{ success: boolean; participants: number }> {
    return apiClient.post(`/chats/${chatId}/join`, { userId });
  },

  async getMessages(chatId: string): Promise<GetMessagesResponse> {
    return apiClient.get<GetMessagesResponse>(`/messages/chat/${chatId}`);
  },

  async sendMessage(chatId: string, senderId: string, content: string): Promise<Message> {
    return apiClient.post<Message>('/messages', {
      chatId,
      senderId,
      content,
    });
  },

  async getUserChats(userId: string): Promise<ChatListItem[]> {
    return apiClient.get<ChatListItem[]>(`/chats?userId=${userId}`);
  },
};

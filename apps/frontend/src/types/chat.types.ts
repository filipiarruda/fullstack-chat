export interface CreateChatPayload {
  userId: string;
}

export interface CreateChatResponse {
  id: string;
  createLink: string;
  joinLink: string;
}

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
  updatedAt: string;
}

export interface GetMessagesResponse {
  messages: Message[];
  total: number;
  isEmpty: boolean;
}

export interface Chat {
  id: string;
  createdBy: string;
  participants: string[];
  createdAt: string;
}

export interface ChatListItem {
  id: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  participantCount: number;
  joinedAt: string;
}

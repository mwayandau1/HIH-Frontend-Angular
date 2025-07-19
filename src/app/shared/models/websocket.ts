/* eslint-disable @typescript-eslint/no-explicit-any */
export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName?: string;
  roomId: string;
  content?: string;
  type: 'TEXT' | 'VOICE' | 'SYSTEM' | 'IMAGE' | 'FILE';
  voiceMessageUrl?: string;
  duration?: string;
  threadId?: string;
  createdAt: string;
  readBy: string[];
  threadCount?: number;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  s3Key?: string;
}

export interface Room {
  id: string;
  active: boolean;
  participants: Participant[];
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
  type: 'direct' | 'group';
}
export interface Participant {
  userId: string;
  active: boolean;
  userName: string;
  role: 'member' | 'admin';
  joinedAt: string;
}

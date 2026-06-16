export type FolderType = 'Inbox' | 'Sent' | 'Drafts' | 'Archive' | 'Trash';

export interface Email {
  id: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  timestamp: string;
  dateStr: string;
  folder: FolderType;
  read: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: string; // format "YYYY-MM-DD"
  color: 'blue' | 'green' | 'beige' | string;
}

export type CalendarView = 'Month' | 'Week' | 'Day';

export interface ChatSettings {
  model: string;
  apiProvider: 'cloud' | 'ollama' | 'local_openai';
  customBaseUrl?: string;
  customModelName?: string;
  temperature: number;
  systemInstruction: string;
  useStreaming: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  recommended: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  modelUsed?: string;
}


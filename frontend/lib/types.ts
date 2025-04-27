export interface Message {
  role: string;
  content: string;
  timestamp?: string;
  file?: File;
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}

const VENA_AI_BASE_URL = 'https://ai-modal.repla-projects.com';
const VENA_AI_API_KEY = 'm8QYIGiVfmuEFBdeCfIuTdpTGk';

export interface VenaAISession {
  chatId: string;
  sessionId: string;
  clinicId: number | null;
  patientId: string;
  userInfo: {
    name?: string;
    age?: number;
    gender?: string;
    language?: string;
  };
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessageAt: string | null;
  lastMessageRole: 'user' | 'assistant' | null;
  lastMessage: string | null;
}

export interface VenaAISessionsResponse {
  total: number;
  sessions: VenaAISession[];
}

export interface VenaAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  createdAt?: string;
}

export interface VenaAISessionDetail {
  chatId: string;
  sessionId?: string;
  patientId?: string;
  createdAt?: string;
  updatedAt?: string;
  messages: VenaAIMessage[];
}

class VenaAIService {
  private baseUrl = VENA_AI_BASE_URL;
  private apiKey = VENA_AI_API_KEY;

  private get jsonHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    };
  }

  async getPatientSessions(patientId: string | number): Promise<VenaAISessionsResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/venaai/chat/sessions?patientId=${encodeURIComponent(String(patientId))}`,
      { headers: this.jsonHeaders },
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error ?? `Sessions fetch failed: ${response.status}`);
    }
    return response.json();
  }

  async getSessionChat(chatId: string): Promise<VenaAISessionDetail> {
    const response = await fetch(
      `${this.baseUrl}/api/venaai/chat/sessions/${encodeURIComponent(chatId)}`,
      { headers: this.jsonHeaders },
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error ?? `Chat fetch failed: ${response.status}`);
    }
    const data = await response.json();
    const messages: VenaAIMessage[] = Array.isArray(data?.messages)
      ? data.messages
      : Array.isArray(data?.chat?.messages)
      ? data.chat.messages
      : Array.isArray(data)
      ? data
      : [];
    return {
      chatId: data?.chatId ?? chatId,
      sessionId: data?.sessionId,
      patientId: data?.patientId,
      createdAt: data?.createdAt,
      updatedAt: data?.updatedAt,
      messages,
    };
  }
}

export const venaAIService = new VenaAIService();

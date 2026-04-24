import { RecommandImage } from '@assets/images';
import { Service } from '../../types/chat.types';

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

export interface VenaAIServiceItem {
  id: number | string;
  name?: string;
  clinicName?: string;
  priceDisplay?: string;
  feeDisplay?: string;
  image?: string | null;
  description?: string;
  procedure?: string;
  duration?: number;
  serviceType?: string;
  group?: {
    id?: number;
    name?: string;
    serviceType?: string;
  };
  loyality?: boolean;
  bonusLoyalityPoints?: string;
  totalLoyalityPoints?: string | number;
}

export interface VenaAISuggestions {
  services: VenaAIServiceItem[];
  doctors: any[];
  devices: VenaAIServiceItem[];
  meta?: { showCards?: boolean };
}

export interface VenaAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  createdAt?: string;
  suggestions?: Service[];
  imageMeta?: {
    originalName?: string;
    mimeType?: string;
    size?: number;
  } | null;
  imageDataUrl?: string | null;
}

interface VenaAIRawMessage {
  role?: string;
  message?: string;
  content?: string;
  text?: string;
  createdAt?: string;
  timestamp?: string;
  details?: string;
  suggestions?: VenaAISuggestions | null;
  imageMeta?: any;
  imageDataUrl?: string | null;
}

export function mapVenaItemsToSuggestions(
  items: VenaAIServiceItem[] = [],
  category: 'service' | 'device' = 'service',
): Service[] {
  return items.map(s => ({
    id: String(s.id),
    image: s.image ? { uri: s.image } : RecommandImage,
    type: s.serviceType ?? s.group?.serviceType ?? '',
    serviceGroup: s.group?.name ?? '',
    serviceName: s.name ?? '',
    price: s.priceDisplay ?? s.feeDisplay ?? '',
    duration: s.duration ? String(s.duration) : '',
    description: s.description ?? '',
    procedure: s.procedure ?? '',
    clinicName: s.clinicName ?? '',
    loyality: s.loyality,
    bonusLoyalityPoints: s.bonusLoyalityPoints,
    totalLoyalityPoints: s.totalLoyalityPoints,
    category,
  }));
}

function extractSuggestions(raw: VenaAIRawMessage): Service[] | undefined {
  const s = raw.suggestions;
  if (!s || s.meta?.showCards === false) return undefined;
  const services = mapVenaItemsToSuggestions(s.services ?? [], 'service');
  const devices = mapVenaItemsToSuggestions(s.devices ?? [], 'device');
  const combined = [...services, ...devices];
  return combined.length ? combined : undefined;
}

function normalizeMessage(raw: VenaAIRawMessage): VenaAIMessage {
  const role = raw.role === 'assistant' || raw.role === 'system' ? raw.role : 'user';
  const content = raw.message ?? raw.content ?? raw.text ?? '';
  return {
    role,
    content,
    createdAt: raw.createdAt,
    timestamp: raw.timestamp ?? raw.createdAt,
    suggestions: extractSuggestions(raw),
    imageMeta: raw.imageMeta ?? null,
    imageDataUrl: raw.imageDataUrl ?? null,
  };
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
    const rawMessages: VenaAIRawMessage[] = Array.isArray(data?.messages)
      ? data.messages
      : Array.isArray(data?.chat?.messages)
      ? data.chat.messages
      : Array.isArray(data)
      ? data
      : [];
    console.log("message Raw",data)
    const messages: VenaAIMessage[] = rawMessages.map(normalizeMessage);
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

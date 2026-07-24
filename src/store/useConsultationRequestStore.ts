import { create } from 'zustand';
import { ConsultationRequest } from '../components/molecules/Organisms/ConsultationRequestModal';

interface ConsultationRequestStore {
  requests: ConsultationRequest[];
  addRequest: (request: ConsultationRequest) => void;
  removeRequest: (requestId: string) => void;
  clearAll: () => void;
}

export const useConsultationRequestStore = create<ConsultationRequestStore>((set, get) => ({
  requests: [],

  addRequest: (request: ConsultationRequest) => {
    const currentRequests = get().requests;
    // Check if request already exists
    if (!currentRequests.find(req => req.id === request.id)) {
      set({ requests: [...currentRequests, request] });
    }
  },

  removeRequest: (requestId: string) => {
    set({ requests: get().requests.filter(req => req.id !== requestId) });
  },

  clearAll: () => {
    set({ requests: [] });
  },
}));

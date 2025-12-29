import { create } from 'zustand';
import { getDashboardStats, getRecentConsultations, getAllConsultations } from '../services/api/dashboardService';

export interface Consultation {
    id: string;
    patientName: string;
    patientImage?: any;
    sevviceName: string;
    date: string;
    time: string;
    duration: string;
    type: 'chat' | 'video' | 'audio';
    amount: string;
    gender: string;
}

export interface DashboardStats {
    totalConsultations: number;
    thisMonth: number;
}


interface DashboardStore {
    stats: DashboardStats | null;
    recentConsultations: Consultation[];
    allConsultations: Consultation[];
    isLoading: boolean;
    fetchDashboardData: () => Promise<void>;
    fetchAllConsultations: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
    stats: null,
    recentConsultations: [],
    allConsultations: [],
    isLoading: false,

    fetchDashboardData: async () => {
        set({ isLoading: true });
        try {
            const [statsRes, recentRes] = await Promise.all([
                getDashboardStats(),
                getRecentConsultations(),
            ]);

            set({
                stats: statsRes.data || statsRes,
                recentConsultations: recentRes.data || recentRes,
                isLoading: false
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            set({ isLoading: false });
        }
    },

    fetchAllConsultations: async () => {
        set({ isLoading: true });
        try {
            const response = await getAllConsultations();
            set({
                allConsultations: response.data || response,
                isLoading: false
            });
        } catch (error) {
            console.error('Failed to fetch all consultations:', error);
            set({ isLoading: false });
        }
    },
}));

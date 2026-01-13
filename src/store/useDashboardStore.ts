import { create } from 'zustand';
import { getDashboardStats, getRecentConsultations, getAllConsultations } from '../services/api/dashboardService';

export interface Consultation {
    id: string;
    code?: string;
    patientID?: string | number;
    patientName?: string;
    patientImage?: any;
    sevviceName?: string;
    date?: string;
    time?: string;
    duration?: string;
    type: 'chat' | 'video' | 'audio';
    amount?: string;
    gender?: string;
    age?: string;
    status?: string;
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

            // Transform recent consultations data
            const recentData = recentRes.data || recentRes;
            const consultationsList = Array.isArray(recentData) ? recentData : (recentData?.data || []);
            
            const transformedRecentConsultations: Consultation[] = consultationsList.map((item: any) => {
                const createdAt = item.created_at ? new Date(item.created_at) : null;
                const consultationDate = item.date || (createdAt ? createdAt.toLocaleDateString('en-GB') : '');
                const consultationTime = createdAt ? createdAt.toLocaleTimeString('en-GB', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                }) : '';

                return {
                    id: String(item.id || ''),
                    code: item.code || '',
                    patientID: item.patientID || item.patient?.id,
                    patientName: item.patient?.name || 'Unknown Patient',
                    patientImage: item.patient?.image ? { uri: item.patient.image } : undefined,
                    sevviceName: item.service?.name || 'Unknown Service',
                    date: consultationDate,
                    time: consultationTime,
                    duration: item.duration ? `${item.duration} min` : '0 min',
                    type: (item.type?.toLowerCase() || 'chat') as 'chat' | 'video' | 'audio',
                    amount: item.price ? `SAR ${item.price}` : 'SAR 0.00',
                    gender: item.patient?.gender || '',
                    age: item.patient?.age || '',
                    status: item.status || '',
                };
            });

            set({
                stats: statsRes.data || statsRes,
                recentConsultations: transformedRecentConsultations,
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
            const rawData = response.data || response;
            
            // Transform API response to match Consultation interface
            const consultationsList = Array.isArray(rawData) ? rawData : (rawData?.data || []);
            
            const transformedConsultations: Consultation[] = consultationsList.map((item: any) => {
                const createdAt = item.created_at ? new Date(item.created_at) : null;
                const consultationDate = item.date || (createdAt ? createdAt.toLocaleDateString('en-GB') : '');
                const consultationTime = createdAt ? createdAt.toLocaleTimeString('en-GB', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                }) : '';

                return {
                    id: String(item.id || ''),
                    code: item.code || '',
                    patientID: item.patientID || item.patient?.id,
                    patientName: item.patient?.name || 'Unknown Patient',
                    patientImage: item.patient?.image ? { uri: item.patient.image } : undefined,
                    sevviceName: item.service?.name || 'Unknown Service',
                    date: consultationDate,
                    time: consultationTime,
                    duration: item.service?.duration ? `${item.service.duration} min` : '0 min',
                    type: (item.type?.toLowerCase() || 'chat') as 'chat' | 'video' | 'audio',
                    amount: item.price ? `SAR ${item.price}` : 'SAR 0.00',
                    gender: item.patient?.gender || '',
                    age: item.patient?.age || '',
                    status: item.status || '',
                };
            });
            
            set({
                allConsultations: transformedConsultations,
                isLoading: false
            });
        } catch (error) {
            console.error('Failed to fetch all consultations:', error);
            set({ isLoading: false });
        }
    },
}));

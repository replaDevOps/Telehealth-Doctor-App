import { create } from 'zustand';
import { apiClient } from '../services/api/apiClient';
import { API } from '../services/api/endpoints';

export interface WorkingHour {
  id: number;
  doctorID: number;
  day: string;
  fromTime: string | null;
  toTime: string | null;
  status: number;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessSetting {
  id?: number;
  clinicID?: number;
  logo?: string;
  coverImage?: string;
  businessName?: string;
  businessEmail?: string;
  businessNumber?: string;
  city?: string;
  district?: string;
  website?: string;
  address?: string;
  lat?: string;
  long?: string;
  about?: string;
  chatConsultation?: boolean;
  chatConsultationPrice?: string;
  voiceConsultation?: boolean;
  voiceConsultationPrice?: string;
  videoConsultation?: boolean;
  videoConsultationPrice?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Clinic {
  id?: number;
  code?: string;
  name?: string;
  email?: string;
  clinicName?: string;
  businessType?: string;
  business_setting?: BusinessSetting;
}

export interface ProfileData {
  id?: number;
  code?: string;
  name?: string;
  email?: string;
  image?: string;
  phoneNo?: string;
  age?: string;
  gender?: string;
  city?: string | null;
  nationalID?: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  signature?: string;
  status?: string;
  online_status?: boolean;
  working_hours?: WorkingHour[];
  clinic?: Clinic;
  [key: string]: any;
}


interface ProfileStore {
  profileData: ProfileData | null;
  isLoading: boolean;
  lastFetched: number | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => void;
  clearProfile: () => void;
  refreshProfile: () => Promise<void>;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profileData: null,
  isLoading: false,
  lastFetched: null,

  fetchProfile: async () => {
    const state = get();

    // Check if we have cached data that's still valid
    if (state.profileData && state.lastFetched) {
      const now = Date.now();
      if (now - state.lastFetched < CACHE_DURATION) {
        // Use cached data
        return;
      }
    }

    // Fetch new data
    set({ isLoading: true });

    try {
      const response = await apiClient.get(API.SETTINGS.VIEW_PROFILE);
      console.log('response', response);
      // Extract profile data from response
      // API response structure might be: { data: { ... } } or { ... } directly
      const data = response.data?.data || response.data || response;

      set({
        profileData: data,
        isLoading: false,
        lastFetched: Date.now(),
      });
    } catch (error: any) {
      console.error('Failed to fetch profile data:', error);
      set({ isLoading: false });
    }
  },

  updateProfile: (data: Partial<ProfileData>) => {
    const currentData = get().profileData;
    set({
      profileData: currentData ? { ...currentData, ...data } : data as ProfileData,
    });
  },

  clearProfile: () => {
    set({
      profileData: null,
      lastFetched: null,
    });
  },

  refreshProfile: async () => {
    // Force refresh by clearing cache and setting loading state
    set({ lastFetched: null, isLoading: true });
    await get().fetchProfile();
  },
}));


import { create } from 'zustand';

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  experience: number;
  rating: number;
  avatar?: string;
  phone?: string;
  bio?: string;
  availability?: string[];
  consultationFee: number;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  bloodGroup?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  medicalHistory?: string[];
  allergies?: string[];
}

interface UserState {
  patients: Doctor[];
  patients: Patient[];
  selectedDoctor: Doctor | null;
  selectedPatient: Patient | null;
  isLoading: boolean;

  // Actions
  setDoctors: (patients: Doctor[]) => void;
  setPatients: (patients: Patient[]) => void;
  selectDoctor: (patient: Doctor | null) => void;
  selectPatient: (patient: Patient | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>(set => ({
  patients: [],
  patients: [],
  selectedDoctor: null,
  selectedPatient: null,
  isLoading: false,

  setDoctors: patients => set({ patients }),
  setPatients: patients => set({ patients }),
  selectDoctor: patient => set({ selectedDoctor: patient }),
  selectPatient: patient => set({ selectedPatient: patient }),
  setLoading: loading => set({ isLoading: loading }),
}));

import { create } from 'zustand';

interface PrescriptionState {
  writePrescription: boolean;
  prescriptionData: any; 
  setWritePrescription: (value: boolean) => void;
  setPrescriptionData: (data: any) => void;
  resetPrescription: () => void;
}

const usePrescriptionStore = create<PrescriptionState>((set) => ({
  writePrescription: false,
  prescriptionData: null,

  setWritePrescription: (value) => set({ writePrescription: value }),
  setPrescriptionData: (data) => set({ prescriptionData: data }),
  resetPrescription: () => set({
    writePrescription: false,
    prescriptionData: null,
  }),
}));

export default usePrescriptionStore;

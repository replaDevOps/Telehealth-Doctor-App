export type ConsultationType = 'chat' | 'video' | 'audio';

export interface ConsultationRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientImage?: any;
  patientAge: number;
  patientGender: 'Male' | 'Female';
  consultationType: ConsultationType;
  treatmentType?: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface ConsultationSession {
  id: string;
  requestId: string;
  doctortId: string;
  patientId: string;
  type: ConsultationType;
  status: 'active' | 'completed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  notes?: string;
  prescription?: string;
}

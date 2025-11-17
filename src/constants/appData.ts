import {
  PipsImage,
  doctor,
  onboarding1,
  onboarding2,
  patient,
  pimples,
} from '@assets/images';
import {
  Message,
  PatientInfo,
} from '../types/chat.types';

export const ONBOARDING_STEPS = [
  {
    title: 'Connect with Your Patients',
    imgSrc: onboarding1,
    content: 'Connect with your patients through chat, audio, or video.',
  },
  {
    title: 'Manage Your Consultations',
    imgSrc: onboarding2,
    content: 'You can manage all consultations easily in one app.',
  },
];


export const DEFAULT_PATIENT_INFO: PatientInfo = {
  id: 'patient_1',
  name: 'Patient Name',
  avatar: patient,
  serviceName: '',
};


export const CONSULTATION_DURATION = 30 * 60; // 30 minutes in seconds

export function getCurrentTimestamp(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
}

// Add this function to your constants/appData.ts file

export function getAIChatHistory(): Message[] {
  const timestamp = getCurrentTimestamp();

  return [
    {
      id: 'ai-10',
      type: 'user',
      text: "Hello !",
      timestamp,
    },
    {
      id: 'ai-11',
      type: 'bot',
      text: "Hello, how can I assist you today? ",
      timestamp,
    },
    {
      id: 'ai-1',
      type: 'user',
      text: "I've uploaded a photo. I have some redness and itching on my face.",
      timestamp,
      images: [pimples, pimples], // Your imported images
    },
    {
      id: 'ai-2',
      type: 'bot',
      text: "It seems like mild skin irritation. Based on your clinic's services, I'd recommend:",
      timestamp,
      suggestions: [
        {
          id: 's1',
          image: PipsImage,
          type: 'Service',
          serviceGroup: 'Acne Treatment',
          serviceName: 'Advanced Facial',
          price: '350 SAR',
          duration: '45 min',
          description: 'A multi-step facial treatment.',
          procedure: 'Uses patented device.',
        },
        {
          id: 's2',
          image: PipsImage,
          type: 'Device',
          serviceGroup: 'Wood lamp',
          serviceName: 'Diagnostic',
          price: '600 SAR',
          duration: '1 hr',
          description: 'Advanced diagnostic.',
          procedure: 'Device for skin analysis.',
        },
      ],
    },
  ];
}

// Update your existing getInitialMessages function to handle both scenarios better
export function getInitialMessages(
  chatType: 'ai' | 'patient',
  patientInfo: PatientInfo,
): Message[] {
  const timestamp = getCurrentTimestamp();

  if (chatType === 'patient') {
    // Doctor-Patient chat messages
    return [
      {
        id: '1',
        type: 'user',
        text: 'Hello',
        timestamp,
        user: { name: patientInfo.name, avatar: patient },
      },
      {
        id: '2',
        type: 'doctor',
        text: "Hi !",
        timestamp,
        user: { name: 'Doctor Name', avatar: doctor },
      },
      {
        id: '3',
        type: 'user',
        text: 'Ive been having some redness and small bumps on my cheeks for past few days.',
        timestamp,
        user: { name: patientInfo.name, avatar: patient },
      },
      {
        id: '4',
        type: 'doctor',
        text: 'I recommend using a gentle cleanser and applying a hydrating cream twice daily...',
        timestamp,
        user: { name: patientInfo.name, avatar: doctor },
        suggestions: [
          {
            id: '1',
            image: PipsImage,
            type: 'Service',
            serviceGroup: 'Acne Treatment',
            serviceName: 'Advanced Facial',
            price: '350 SAR',
            duration: '45 min',
            description: 'A multi-step facial treatment.',
            procedure: 'Uses patented device.',
          },
          {
            id: '2',
            image: PipsImage,
            type: 'Device',
            serviceGroup: 'Wood lamp',
            serviceName: 'Diagnostic',
            price: '600 SAR',
            duration: '1 hr',
            description: 'Advanced diagnostic.',
            procedure: 'Device for skin analysis.',
          },
        ],
      },
    ];
  }
  // AI Chat (when doctor opens AI chat directly)
  return [
    { id: '1', type: 'user', text: 'Hi!', timestamp },
    {
      id: '2',
      type: 'bot',
      text: 'Welcome! You can ask me anything or upload a photo to get suggestions.',
      timestamp,
    },
  ];
}

export const CONSULTATION_REQUESTS = [
  {
    id: '#8E8E8E',
    patientName: 'Patient 1',
    patientImage: patient,
    ServiceName: 'Acne Treatment',
    gender: 'Male',
    date: '8/30/2024 11:35 am',
    time: '30 mins',
    duration: '1hr',
    type: 'chat' as const,
    amount: 'SAR 20',
    age: '25',
    status: 'pending',
  },
  {
    id: '#E9EDF7',
    patientName: 'Patient 2',
    patientImage: patient,
    ServiceName: 'Acne Treatment',
    gender: 'Female',
    date: '8/30/2024 11:35 am',
    time: '21 mins',
    duration: '2 mins',
    type: 'video' as const,
    amount: 'SAR 20',
    age: '24',
    status: 'complete',
  },
  {
    id: '#090987',
    patientName: 'Patient 3',
    patientImage: patient,
    ServiceName: 'Rutine Checkup',
    gender: 'Male',
    date: '3/31/2024 11:35 am',
    time: '18 mins',
    duration: '1 mins',
    type: 'audio' as const,
    amount: 'SAR 20',
    age: '24',
    status: 'complete',
  },
];



export const PERSONAL_DATA = [
  { label: 'Full Name:', value: 'Ali Abdul Aziz' },
  { label: 'Phone Number:', value: '+966 324 464 232' },
  { label: 'Email Address:', value: 'abc@gmail.com' },
  { label: 'Specialization:', value: 'MBBS' },
  { label: 'Year of Experience:', value: '10 Years' },
];
export const WORKING_HOURS_DATA = [
  { label: 'Monday:', value: '9:00 PM - 6:00 PM' },
  { label: 'Tuesday:', value: '9:00 PM - 6:00 PM' },
  { label: 'Wednesday:', value: '9:00 PM - 6:00 PM' },
  { label: 'Thursday:', value: '9:00 PM - 6:00 PM' },
  { label: 'Friday:', value: '9:00 PM - 6:00 PM' },
  { label: 'Saturday:', value: 'Day Off', isDayOff: true },
  { label: 'Sunday:', value: 'Day Off', isDayOff: true },
];


export const PATIENT_DATA = [
  { label: 'Patient Name:', value: 'Ali Abdul Aziz' },
  { label: 'Age:', value: '39' },
  { label: 'Gender:', value: 'Male' },
  { label: 'Date:', value: '02/02/2023' },
];

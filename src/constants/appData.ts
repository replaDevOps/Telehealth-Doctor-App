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
    title: 'onboarding_title_1',
    imgSrc: onboarding1,
    content: 'onboarding_content_1',
  },
  {
    title: 'onboarding_title_2',
    imgSrc: onboarding2,
    content: 'onboarding_content_2',
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
    time: '30',
    unitOfTime:'mins',
    duration: '1',
    unitOfDuration:'hr',
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
    time: '5',
    unitOfTime:'mins',
    duration: '8',
    unitOfDuration:'hr',
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
    time: '10',
    unitOfTime:'mins',
    duration: '3',
    unitOfDuration:'hr',
    type: 'audio' as const,
    amount: 'SAR 20',
    age: '24',
    status: 'complete',
  },
];



export const PERSONAL_DATA = [
  { label: 'full_name', value: 'Ali Abdul Aziz' },
  { label: 'phone_number', value: '+966 324 464 232' },
  { label: 'email_address', value: 'abc@gmail.com' },
  { label: 'specialization', value: 'MBBS' },
  { label: 'year_of_experience', value: '10 Years' },
];
export const WORKING_HOURS_DATA = [
  { label: 'monday', value: '9:00 PM - 6:00 PM' },
  { label: 'tuesday', value: '9:00 PM - 6:00 PM' },
  { label: 'wednesday', value: '9:00 PM - 6:00 PM' },
  { label: 'thursday', value: '9:00 PM - 6:00 PM' },
  { label: 'friday', value: '9:00 PM - 6:00 PM' },
  { label: 'saturday', value: 'day_off', isDayOff: true },
  { label: 'sunday', value: 'day_off', isDayOff: true },
];


export const PATIENT_DATA = [
  { label: 'patient_name', value: 'Ali Abdul Aziz' },
  { label: 'age', value: '39' },
  { label: 'gender', value: 'Male' },
  { label: 'date', value: '02/02/2023' },
];

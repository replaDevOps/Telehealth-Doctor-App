import { apiClient } from './apiClient';
import { API } from './endpoints';
import { BASE_URL } from '../../constants/api';
import { useAuthStore } from '../../store';

export interface ChatMessage {
  id?: number;
  consultationID?: number;
  senderID?: number;
  recipientID?: number;
  patientID?: number;
  doctorID?: number;
  message?: string;
  file?: string;
  fileType?: string;
  dateTime?: string;
  seen?: boolean;
  created_at?: string;
  updated_at?: string;
  sender?: {
    id: number;
    name: string;
    image?: string;
    type: 'patient' | 'doctor';
  };
  recipient?: {
    id: number;
    name: string;
    image?: string;
    type: 'patient' | 'doctor';
  };
  [key: string]: any;
}

export interface Prescription {
  id?: number;
  consultationID?: number;
  name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface PrescriptionRequest {
  consultationID: string | number;
  prescriptions: Array<{
    name: string;
    description: string;
  }>;
}

export interface SendMessageRequest {
  recipientID: number | string; // Patient ID (when sending from doctor app)
  consultationID: number | string;
  message: string;
  file?: {
    uri: string;
    type?: string;
    name?: string;
  };
}

export interface AcceptConsultationRequest {
  id: string | number;
}

export interface ConsultationMessagesResponse {
  success?: boolean;
  status?: boolean;
  data?: ChatMessage[] | any; // Can be messages array or consultation object
  messages?: ChatMessage[]; // Messages array in the response
  consultation?: any; // Consultation data object (contains patient, service, type, code, etc.)
  message?: string;
}

export interface PrescriptionsResponse {
  success?: boolean;
  status?: boolean;
  data?: Prescription[] | any; // Can be prescriptions array or consultation object
  prescriptions?: Prescription[]; // Prescriptions array in the response
  message?: string;
}

export interface MessageResponse {
  success?: boolean;
  status?: boolean;
  data?: ChatMessage;
  message?: string;
}

/**
 * Get all messages for a consultation
 * @param consultationId - The consultation ID
 * @returns Promise with list of messages
 */
export const getConsultationMessages = async (
  consultationId: number | string,
): Promise<ConsultationMessagesResponse> => {
  try {
    const response = await apiClient.get<ConsultationMessagesResponse>(
      `${API.CHAT_CONSULTATIONS.CONSULTATION_MESSAGES}/${consultationId}`,
    );
    console.log('Get Consultation Messages:', response.data);

    // Handle different response structures
    // API returns: { success: true, data: {...consultation}, messages: [...] }
    // Messages are in response.data.messages (top-level in the response)
    const responseData = response.data as any;
    const messagesData = responseData?.messages || responseData?.data || [];
    const messagesArray = Array.isArray(messagesData) ? messagesData : [];
    
    // Extract consultation data (if data is an object, not an array)
    const consultationData = !Array.isArray(responseData?.data) && responseData?.data ? responseData.data : null;

    return {
      success: responseData?.success ?? true,
      status: responseData?.status ?? true,
      data: messagesArray,
      messages: messagesArray,
      consultation: consultationData, // Include consultation data (has patientID)
      message: responseData?.message,
    };
  } catch (error: any) {
    console.error('Get Consultation Messages Error:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch consultation messages';
    throw new Error(errorMessage);
  }
};

/**
 * Get prescriptions for a consultation
 * @param consultationId - The consultation ID
 * @returns Promise with list of prescriptions
 */
export const viewPrescriptions = async (
  consultationId: number | string,
): Promise<PrescriptionsResponse> => {
  try {
    const response = await apiClient.get<PrescriptionsResponse>(
      `${API.CHAT_CONSULTATIONS.VIEW_PRESCRIPTIONS}/${consultationId}`,
    );
    console.log('View Prescriptions:', response.data);

    // Handle different response structures
    // API returns: { success: true, data: {...consultation}, prescriptions: [...] }
    // Or when empty: { success: true, status: true, data: [] }
    const responseData = response.data as any;
    
    // Return the full response structure so PrescriptionDetail can access both data and prescriptions
    return {
      success: responseData?.success ?? true,
      status: responseData?.status ?? true,
      data: responseData?.data || {},
      prescriptions: responseData?.prescriptions || [],
      message: responseData?.message,
    };
  } catch (error: any) {
    console.error('View Prescriptions Error:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch prescriptions';
    throw new Error(errorMessage);
  }
};

/**
 * Add prescription to a consultation
 * @param prescriptionData - Prescription data
 * @returns Promise with response
 */
export const addPrescription = async (
  prescriptionData: PrescriptionRequest,
): Promise<MessageResponse> => {
  try {
    const response = await apiClient.post<MessageResponse>(
      API.CHAT_CONSULTATIONS.ADD_PRESCRIPTION,
      prescriptionData,
    );
    console.log('Add Prescription:', response.data);

    // Handle different response structures
    const responseData = response.data?.data || response.data || response;

    return responseData;
  } catch (error: any) {
    console.error('Add Prescription Error:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to add prescription';
    throw new Error(errorMessage);
  }
};

/**
 * Send a message in a consultation (using fetch for FormData)
 * @param messageData - Message data including optional file
 * @returns Promise with sent message
 */
export const sendMessage = async (
  messageData: SendMessageRequest,
): Promise<MessageResponse> => {
  try {
    const token = useAuthStore.getState().token;
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Create FormData
    // Note: recipientID is the patient ID (when sending from doctor app)
    const formData = new FormData();
    formData.append('recipientID', String(messageData.recipientID)); // Patient ID
    formData.append('consultationID', String(messageData.consultationID));
    formData.append('message', messageData.message);

    // Add file if provided
    if (messageData.file) {
      formData.append('file', {
        uri: messageData.file.uri,
        type: messageData.file.type || 'image/jpeg',
        name: messageData.file.name || 'image.jpg',
      } as any);
    }

    // Use fetch instead of axios for FormData
    const response = await fetch(
      `${BASE_URL}${API.CHAT_CONSULTATIONS.SEND_MESSAGE}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let fetch set it with boundary
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.message ||
          errorData?.data?.message ||
          `HTTP error! status: ${response.status}`,
      );
    }

    const responseData: MessageResponse = await response.json();
    console.log('Send Message:', responseData);

    // Handle different response structures
    const finalData = responseData?.data || responseData;

    return finalData;
  } catch (error: any) {
    console.error('Send Message Error:', error);
    const errorMessage =
      error?.message || 'Failed to send message';
    throw new Error(errorMessage);
  }
};

/**
 * Delete a message
 * @param messageId - The message ID to delete
 * @returns Promise with delete response
 */
export const deleteMessage = async (
  messageId: number | string,
): Promise<MessageResponse> => {
  try {
    const response = await apiClient.delete<MessageResponse>(
      `${API.CHAT_CONSULTATIONS.DELETE_MESSAGE}/${messageId}`,
    );
    console.log('Delete Message:', response.data);

    // Handle different response structures
    const responseData = response.data?.data || response.data || response;

    return responseData;
  } catch (error: any) {
    console.error('Delete Message Error:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to delete message';
    throw new Error(errorMessage);
  }
};

/**
 * Accept a consultation request
 * @param consultationData - Consultation data with ID
 * @returns Promise with accept response
 */
export const acceptConsultation = async (
  consultationData: AcceptConsultationRequest,
): Promise<MessageResponse> => {
  try {
    const response = await apiClient.post<MessageResponse>(
      API.CHAT_CONSULTATIONS.ACCEPT_CONSULTATION,
      consultationData,
    );
    console.log('Accept Consultation:', response.data);

    // Handle different response structures
    const responseData = response.data?.data || response.data || response;

    return responseData;
  } catch (error: any) {
    console.error('Accept Consultation Error:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to accept consultation';
    throw new Error(errorMessage);
  }
};


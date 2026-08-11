import { apiClient } from './apiClient';
import { API } from './endpoints';
import { Platform } from 'react-native';
import { BASE_URL } from '../../constants/api';
import { useAuthStore } from '../../store';
import { handleUnauthenticated } from './sessionManager';

export const changePassword = async (data: any) => {
    try {
        const response = await apiClient.post(API.SETTINGS.CHANGE_PASSWORD, data);
        console.log('changePassword response:', response.data);
        // Some APIs return 200 with success: false. Treat that as an error so callers can handle it.
        if (response?.data && response.data.success === false) {
            const message = response.data.message || 'Failed to change password';
            const err: any = new Error(message);
            err.response = response;
            throw err;
        }

        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateSignature = async (imageUri: string) => {
    const token = useAuthStore.getState().token;
    const formData = new FormData();

    formData.append('signature', {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        type: 'image/jpeg',
        name: 'signature.jpg',
    } as any);

    try {
        const response = await fetch(`${BASE_URL}${API.SETTINGS.UPDATE_SIGNATURE}`, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        // fetch bypasses the apiClient interceptor, so handle 401 here too
        if (response.status === 401) {
            handleUnauthenticated();
        }

        const result = await response.json();
        if (!response.ok) {
            throw result;
        }
        return result;
    } catch (error) {
        console.error('updateSignature fetch error:', error);
        throw error;
    }
};

export const updateProfileImage = async (imageUri: string) => {
    const token = useAuthStore.getState().token;
    const formData = new FormData();

    formData.append('image', {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
    } as any);

    try {
        const response = await fetch(`${BASE_URL}${API.SETTINGS.UPDATE_PROFILE_IMAGE}`, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        // fetch bypasses the apiClient interceptor, so handle 401 here too
        if (response.status === 401) {
            handleUnauthenticated();
        }

        const result = await response.json();
        if (!response.ok) {
            throw result;
        }
        return result;
    } catch (error) {
        console.error('updateProfileImage fetch error:', error);
        throw error;
    }
};


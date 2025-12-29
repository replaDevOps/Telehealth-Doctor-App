import { apiClient } from './apiClient';
import { API } from './endpoints';

export const getDashboardStats = async () => {
    try {
        const response = await apiClient.get(API.DASHBOARD.STATS);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getRecentConsultations = async () => {
    try {
        const response = await apiClient.get(API.DASHBOARD.RECENT_CONSULTATIONS);
        console.log('Recent Consultations:', response.data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllConsultations = async () => {
    try {
        const response = await apiClient.get(API.DASHBOARD.ALL_CONSULTATIONS);
        console.log('All Consultations:', response.data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

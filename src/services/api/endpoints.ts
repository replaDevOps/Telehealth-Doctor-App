export const API = {
  AUTH: {
    // LOGIN
    LOGIN: '/doctor-auth/login',
    // REFRESH TOKEN
    REFRESH_TOKEN: '/doctor-auth/refreshToken',
    // LOGOUT
    LOGOUT: '/doctor-auth/logout',
  },
  SETTINGS: {
    // VIEW PROFILE
    VIEW_PROFILE: '/doctor-setting/viewProfile',
    // UPDATE PROFILE
    UPDATE_PROFILE: '/doctor-setting/updateProfile',
    // CHANGE PASSWORD
    CHANGE_PASSWORD: '/doctor-setting/changePassword',
    // UPDATE SIGNATURE
    UPDATE_SIGNATURE: '/doctor-setting/updateSignature',
    // UPDATE PROFILE IMAGE
    UPDATE_PROFILE_IMAGE: '/doctor-setting/updateProfileImage',
  },
  DASHBOARD: {
    STATS: '/doctor-dashboard/stats',
    RECENT_CONSULTATIONS: '/doctor-dashboard/recentConsultations',
    ALL_CONSULTATIONS: '/doctor-dashboard/allConsultations',
    UPDATE_ONLINE_STATUS: '/doctor-dashboard/updateOnlineStatus',
  },
  NOTIFICATIONS: {
    VIEW_ALL: '/doctor-notifications/viewAll',
    DELETE: '/doctor-notifications/delete',
    CLEAR_ALL: '/doctor-notifications/clearAll',
  },
  CHAT_CONSULTATIONS: {
    CONSULTATION_MESSAGES: '/chat-consultations/consultationsMessages',
    VIEW_PRESCRIPTIONS: '/chat-consultations/viewPrescriptions',
    ADD_PRESCRIPTION: '/chat-consultations/addPrescription',
    SEND_MESSAGE: '/chat-consultations/sendMessage',
    DELETE_MESSAGE: '/chat-consultations/deleteMessage',
    ACCEPT_CONSULTATION: '/chat-consultations/acceptConsultation',
  },
};




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
  },
};




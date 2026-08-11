// services/api/sessionManager.ts
import { Toast } from 'toastify-react-native';
import i18n from '../../locales/i18n';
import { useAuthStore } from '../../store/useAuthStore';
import { resetToSignIn } from '../../navigation/navigationRef';

/**
 * Tears the session down after the backend rejects it (HTTP 401
 * "Unauthenticated"): clears auth + profile state and sends the user back to
 * sign-in.
 *
 * Safe to call from anywhere, any number of times. The token is cleared
 * synchronously on the first call, so the burst of parallel 401s you get when
 * several requests are in flight all no-op after that. It also no-ops when
 * nobody is signed in, which is what makes a failed login attempt (also a 401)
 * harmless here.
 */
export const handleUnauthenticated = () => {
  if (!useAuthStore.getState().token) {
    return;
  }

  useAuthStore.getState().logout();

  // Required lazily: useProfileStore imports apiClient, which imports this
  // module, so a static import would close a cycle.
  try {
    const {
      useProfileStore,
    } = require('../../store/useProfileStore') as typeof import('../../store/useProfileStore');
    useProfileStore.getState().clearProfile();
  } catch (error) {
    console.log('Failed to clear profile on forced logout:', error);
  }

  resetToSignIn();

  try {
    Toast.error(i18n.t('common.sessionExpired'));
  } catch (error) {
    console.log('Toast error (non-critical):', error);
  }
};

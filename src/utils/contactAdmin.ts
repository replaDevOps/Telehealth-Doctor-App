import { Alert, Linking } from 'react-native';
import i18n from '../locales/i18n';

export const SUPPORT_EMAIL = 'Info@vena-app.com';

/**
 * Opens the device mail composer addressed to support.
 *
 * `Linking.openURL` REJECTS when iOS has no configured mail client (a simulator, or a
 * device where the Mail app was removed). Both call sites used to fire it bare, so the
 * rejection surfaced as an "Uncaught (in promise) Unable to open URL" red box instead of
 * anything the user could act on. Here the failure falls back to showing the address so
 * support is still reachable.
 */
export async function contactAdmin(): Promise<void> {
  const url = `mailto:${SUPPORT_EMAIL}`;

  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      i18n.t('settings.contactAdmin'),
      i18n.t('common.noMailAppMessage', { email: SUPPORT_EMAIL }),
      [{ text: i18n.t('common.ok') }],
    );
  }
}

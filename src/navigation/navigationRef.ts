// navigation/navigationRef.ts
import {
  createNavigationContainerRef,
  CommonActions,
} from '@react-navigation/native';

/**
 * Navigation handle usable from outside the React tree (API interceptors,
 * services, stores).
 *
 * Deliberately does not import `./types` — that module pulls in the navigators
 * and therefore every screen and service, which would make this a circular
 * import for the API layer. The route names below are still typed, via the
 * global `ReactNavigation.RootParamList` declared in `./types`.
 */
export const navigationRef = createNavigationContainerRef();

/**
 * Drops the whole navigation stack and sends the user back to sign-in, so
 * there is no authenticated screen left behind to go "back" to.
 */
export const resetToSignIn = () => {
  if (!navigationRef.isReady()) {
    return;
  }

  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Auth', params: { screen: 'SignIn' } }],
    }),
  );
};

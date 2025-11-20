import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/root-navigation';
import { colors } from './src/styles/colors';
import { setGlobalFont } from './src/utils/overrideText';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './src/config/i18n';
import { Provider as PaperProvider } from 'react-native-paper'; // ← Import here

setGlobalFont();

const App = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        {/* ← Wrap everything once here */}
        <StatusBar
          backgroundColor="transparent"
          translucent={false}
          barStyle="dark-content"
        />
        <GestureHandlerRootView style={styles.rootView}>
          {/* <SafeAreaView style={styles.safeArea}> */}
          <AppNavigator />
          {/* </SafeAreaView> */}
        </GestureHandlerRootView>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

export default App;

import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/root-navigation';
import { colors } from './src/styles/colors';
import { setGlobalFont } from './src/utils/overrideText';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

setGlobalFont();

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor="transparent"
        translucent={false}
        barStyle="dark-content"
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* <SafeAreaView style={styles.safeArea}> */}
        <AppNavigator />
        {/* </SafeAreaView> */}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

export default App;

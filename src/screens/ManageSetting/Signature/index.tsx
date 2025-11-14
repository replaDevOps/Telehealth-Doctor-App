import React from 'react';
import { Header2 } from '../../../components/common/Header2';
import { SafeAreaView } from 'react-native-safe-area-context';
import style from './style';

export default function SignatureScreen() {
  return (
    <SafeAreaView style={style.container}>
      <Header2 title="My Signature" />
    </SafeAreaView>
  );
}

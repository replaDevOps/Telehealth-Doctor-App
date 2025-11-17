import React from 'react';
import { Header2 } from '../../../components/common/Header2';
import { SafeAreaView } from 'react-native-safe-area-context';
import style from './style';
import { Image, View } from 'react-native';
import { Signature } from '@assets/images';

export default function SignatureScreen() {
  return (
    <SafeAreaView style={style.container}>
      <Header2 title="My Signature" />
      <View style={style.content}>
        <Image source={Signature} style={style.signatureImage} />
      </View>
    </SafeAreaView>
  );
}

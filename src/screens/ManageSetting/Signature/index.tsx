import React from 'react';
import { Header2 } from '../../../components/common/Header2';
import { SafeAreaView } from 'react-native-safe-area-context';
import style from './style';
import { Image, View } from 'react-native';
import { Signature } from '@assets/images';
import { useTranslation } from 'react-i18next';

export default function SignatureScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={style.container}>
      <Header2 title={t('my_signature')} />
      <View style={style.content}>
        <Image source={Signature} style={style.signatureImage} />
      </View>
    </SafeAreaView>
  );
}

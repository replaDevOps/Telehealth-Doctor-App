import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Header2 } from '../../../components/common/Header2';
import { colors } from '../../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './style';
import { mvs } from '@config/metrices';


export const ProfileSetting = ({ navigation }: { navigation: any }) => {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header2 title={t('settings.title')} />

      <View style={[styles.container, { marginTop: mvs(20) }]}>
        {/* My Signature */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('SignatureScreen')}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="pencil-outline" size={22} color={colors.black} />
            <Text style={[styles.menuItemText, { marginLeft: 15 }]}>{t('settings.signature')}</Text>
          </View>
          <AntDesign name="right" size={20} color="#9CA3AF" />
        </TouchableOpacity>


      </View>
    </SafeAreaView>
  );
};


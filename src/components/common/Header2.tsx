import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mvs } from '../../config/metrices';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackSvg, ShopingCartSvg, SingleLogo } from '../../assets/icons';
import { colors } from '../../styles/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';

type RootStackParamList = {
  [key: string]: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Header2Props {
  title: string;
  showEdit?: boolean;
  onEditPress?: () => void;
  showNotification?: boolean;
  back?: boolean;
  useCancel?: boolean;
  useDownload?: boolean;
  useSave?: boolean;
  useSkip?: boolean;
  handleSkip?: () => void;
  showLanguage?: boolean;
  showCart?: boolean;
  cartCount?: number;
  notificationCount?: number;
  handleNotification?: () => void;
  handleDownload?: () => void;
  handleSave?: () => void;
  saveDisabled?: boolean;
  saveLoading?: boolean;
  logo?: boolean;
  handleBackPress?: () => void;
}

const Header2: React.FC<Header2Props> = ({
  title,
  showEdit = false,
  onEditPress,
  showNotification = false,
  back = true,
  useCancel = false,
  useDownload = false,
  useSave = false,
  useSkip = false,
  showLanguage = false,
  showCart = false,
  cartCount = 0,
  notificationCount = 0,
  handleNotification = () => { },
  handleDownload = () => { },
  handleSave = () => { },
  saveDisabled = false,
  saveLoading = false,
  handleBackPress,
  handleSkip,
  logo = false,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { language } = useLanguage();

  const { t } = useTranslation();

  const onBackPress = () => {
    if (handleBackPress) {
      handleBackPress();
    } else {
      navigation.goBack();
    }
  };

  const handleLanguagePress = () => {
    console.log('Opening language selection. Current language:', language);
    navigation.navigate('LanguageSelection');
  };

  // Get language display text - Arabic shows 'العربية', English shows 'English'
  const languageText = language === 'ar' ? 'العربية' : 'English';

  console.log('Header2 rendering with language:', language, '- Display:', languageText);

  return (
    <View style={styles.container}>
      {back && (
        <TouchableOpacity style={styles.headerButton} onPress={onBackPress}>
          {useCancel ? (
            <Text style={styles.cancelText}>{t('common.cancel')}</Text>
          ) : (
            <BackSvg />
          )}
        </TouchableOpacity>
      )}

      <View style={styles.textc}>
        {logo ? (
          <SingleLogo width={30} height={30} />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </View>

      {useSave ? (
        <TouchableOpacity
          style={[styles.icon, (saveDisabled || saveLoading) && { opacity: 0.5 }]}
          onPress={() => handleSave()}
          disabled={saveDisabled || saveLoading}
        >
          {saveLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.saveText, saveDisabled && { color: 'gray' }]}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      ) : useSkip && handleSkip ? (
        <TouchableOpacity style={styles.icon} onPress={handleSkip}>
          <Text style={styles.skipText}>{t('common.skip')}</Text>
        </TouchableOpacity>
      ) : showCart ? (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleNotification}
        >
          <View style={styles.cartContainer}>
            <ShopingCartSvg />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : showLanguage ? (
        <TouchableOpacity style={styles.icon} onPress={handleLanguagePress}>
          <Ionicons name="globe" size={18} color={colors.black} />
          <Text style={styles.languageText}>{languageText}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.black} />
        </TouchableOpacity>
      ) : showEdit ? (
        <TouchableOpacity style={styles.icon} onPress={onEditPress}>
          <Ionicons name="create" size={25} color={colors.black} />
        </TouchableOpacity>
      ) : showNotification ? (
        <TouchableOpacity style={styles.headerButton} onPress={handleNotification}>
          <View style={styles.cartContainer}>
            <Ionicons name="notifications" size={25} color={colors.black} />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptySpace} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: mvs(15),
    paddingVertical: mvs(10),
  },
  icon: {
    flexDirection: 'row',
    gap: mvs(2),
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  textc: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    color: colors.black,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelText: {
    fontSize: mvs(16),
    color: 'gray',
  },
  saveText: {
    fontSize: mvs(16),
    color: colors.primary,
    fontWeight: 'bold',
  },
  skipText: {
    fontSize: mvs(16),
    color: colors.primary,
    fontWeight: 'bold',
  },
  cartContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  languageText: {
    fontSize: mvs(14),
    color: colors.black,
    marginLeft: 5,
  },
  emptySpace: {
    width: 45,
  },
});

export { Header2 };

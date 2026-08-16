import { useNavigation } from '@react-navigation/native';
import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Modal, Dimensions } from 'react-native';
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
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langButtonRef = useRef<View>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0, width: mvs(120) });

  const data = [
    { label: t('language.english'), value: 'en' as const },
    { label: t('language.arabic'), value: 'ar' as const },
  ];

  const onBackPress = () => {
    if (handleBackPress) {
      handleBackPress();
    } else {
      navigation.goBack();
    }
  };

  const handleLanguageChange = async (item: { label: string; value: 'en' | 'ar' }) => {
    await setLanguage(item.value);
    setIsLangMenuOpen(false);
  };

  const handleOpenLangMenu = () => {
    if (langButtonRef.current) {
      langButtonRef.current.measureInWindow((x, y, width, height) => {
        const screenWidth = Dimensions.get('window').width;
        const top = y + height + 4;
        const right = screenWidth - (x + width);

        setMenuPos({
          top: top > 0 ? top : mvs(50),
          right: Math.max(right, mvs(10)),
          width: Math.max(width, mvs(120)),
        });
        setIsLangMenuOpen(true);
      });
    } else {
      setIsLangMenuOpen(true);
    }
  };

  // Get language display text
  const languageText = language === 'ar' ? t('language.arabic') : t('language.english');

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
        <View style={styles.rightHeaderControls}>
          <TouchableOpacity
            ref={langButtonRef}
            activeOpacity={0.8}
            style={styles.langPillButton}
            onPress={handleOpenLangMenu}
          >
            <Ionicons
              name="globe-outline"
              size={mvs(16)}
              color={colors.black}
              style={{ marginRight: mvs(4) }}
            />
            <Text style={styles.langPillText}>{languageText}</Text>
            <Ionicons
              name={isLangMenuOpen ? 'chevron-up' : 'chevron-down'}
              size={mvs(14)}
              color={colors.black}
              style={{ marginLeft: mvs(4) }}
            />
          </TouchableOpacity>

          <Modal
            transparent
            visible={isLangMenuOpen}
            animationType="fade"
            statusBarTranslucent
            onRequestClose={() => setIsLangMenuOpen(false)}
          >
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setIsLangMenuOpen(false)}
            >
              <View
                style={[
                  styles.langDropdownCard,
                  {
                    top: menuPos.top,
                    right: menuPos.right,
                    width: menuPos.width,
                  },
                ]}
              >
                {data.map((item, idx) => {
                  const isSelected = language === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      activeOpacity={0.7}
                      style={[
                        styles.langOptionItem,
                        idx < data.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: '#F0F0F5',
                        },
                        isSelected && {
                          backgroundColor: '#F5F3FF',
                        },
                      ]}
                      onPress={() => handleLanguageChange(item)}
                    >
                      <Text
                        style={[
                          styles.langOptionText,
                          {
                            color: isSelected ? '#7625D7' : colors.black,
                            fontWeight: isSelected ? '600' : '400',
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={mvs(16)}
                          color="#7625D7"
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
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
    // Matches headerButton so the centred title is actually centred.
    width: 40,
  },
  rightHeaderControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: mvs(36),
    paddingHorizontal: mvs(10),
    borderRadius: mvs(18),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  langPillText: {
    fontSize: mvs(13),
    color: colors.black,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  langDropdownCard: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: mvs(12),
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: mvs(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 12,
  },
  langOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: mvs(10),
    paddingHorizontal: mvs(14),
  },
  langOptionText: {
    fontSize: mvs(14),
  },
});

export { Header2 };

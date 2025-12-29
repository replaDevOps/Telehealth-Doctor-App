import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import { mvs } from '../../config/metrices';
import { colors } from '../../styles/colors';
import { EditSvg } from '../../assets/icons';

import { updateProfileImage } from '../../services/api';
import { useProfileStore } from '../../store';

interface UserProfileProps {
  profileImage?: string;
  onImageSelected?: (uri: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  profileImage: initialProfileImage = '',
  onImageSelected,
}) => {
  const { refreshProfile } = useProfileStore();
  const [profileImage, setProfileImage] = useState(initialProfileImage);
  const [isUploading, setIsUploading] = useState(false);

  // Sync with prop changes
  React.useEffect(() => {
    if (initialProfileImage) {
      setProfileImage(initialProfileImage);
    }
  }, [initialProfileImage]);

  const openImagePicker = useCallback(() => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.8,
    };

    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }
      if (response.errorCode) {
        console.log('ImagePicker Error:', response.errorMessage);
        Alert.alert('Error', response.errorMessage ?? 'Unknown error');
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (!uri) return;

      setIsUploading(true);
      try {
        await updateProfileImage(uri);
        setProfileImage(uri);
        onImageSelected?.(uri);
        await refreshProfile();
      } catch (e: any) {
        console.error('Upload failed', e);
        Alert.alert('Upload failed', e?.response?.data?.message || e?.message || 'Please try again.');
      } finally {
        setIsUploading(false);
      }
    });
  }, [onImageSelected, refreshProfile]);


  const imageSource = profileImage
    ? { uri: profileImage }
    : require('../../assets/images/image.png');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileImageContainer}
        onPress={openImagePicker}
        activeOpacity={0.8}
        disabled={isUploading}
      >
        <Image source={imageSource} style={[styles.profileImage]} />

        {/* Edit / Loading overlay */}
        {isUploading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.white} />
          </View>
        ) : (
          <View style={styles.iconOverlay}>
            <EditSvg style={styles.editIcon} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

/* --------------------------------------------------------------------- *
 *  Styles (unchanged)
 * --------------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: mvs(15),
  },
  profileImageContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: mvs(100),
    height: mvs(100),
    borderRadius: mvs(50),
    borderWidth: 2,
    borderColor: colors.primary,
  },
  iconOverlay: {
    position: 'absolute',
    bottom: mvs(5),
    right: mvs(0),
    width: mvs(28),
    height: mvs(28),
    backgroundColor: colors.primary,
    borderRadius: mvs(14),
    borderWidth: 1,
    borderColor: colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: mvs(5),
    right: mvs(5),
    width: mvs(28),
    height: mvs(28),
    backgroundColor: colors.red,
    borderRadius: mvs(14),
    borderWidth: 1,
    borderColor: colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    width: mvs(16),
    height: mvs(16),
    tintColor: colors.white,
  },
});

export default UserProfile;

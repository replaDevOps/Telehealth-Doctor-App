import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header2 } from '../../../components/common/Header2';
import { colors } from '../../../styles/colors';
import { styles } from './styles';
import { useProfileStore } from '../../../store';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { updateSignature } from '../../../services/api';

export const SignatureScreen = () => {
    const { profileData, refreshProfile } = useProfileStore();
    const [signatureImage, setSignatureImage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (profileData?.signature) {
            setSignatureImage(profileData.signature);
        }
    }, [profileData]);

    const handleUpdateSignature = () => {
        const options: ImageLibraryOptions = {
            mediaType: 'photo',
            quality: 0.8,
        };

        launchImageLibrary(options, async response => {
            if (response.didCancel) return;
            if (response.errorCode) {
                Alert.alert('Error', response.errorMessage ?? 'Unknown error');
                return;
            }

            const uri = response.assets?.[0]?.uri;
            if (!uri) return;

            try {
                setIsLoading(true);
                await updateSignature(uri);
                setSignatureImage(uri);
                // Refresh profile to get updated signature URL from server
                await refreshProfile();
                Alert.alert('Success', 'Signature updated successfully');
            } catch (error: any) {
                console.error('Update signature error:', error);
                Alert.alert('Error', error?.response?.data?.message || error?.message || 'Failed to update signature');
            } finally {
                setIsLoading(false);
            }
        });
    };



    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
            <Header2 title="My Signature" />

            <View style={styles.container}>
                <Text style={styles.label}>Current Signature</Text>

                <View style={styles.signatureContainer}>
                    {signatureImage ? (
                        <Image
                            source={{ uri: signatureImage }}
                            style={styles.signatureImage}
                            resizeMode="contain"
                        />
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <Ionicons name="pencil-outline" size={40} color="#9CA3AF" />
                            <Text style={styles.placeholderText}>No signature added yet</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.updateButton, isLoading && { opacity: 0.7 }]}
                    onPress={handleUpdateSignature}
                    activeOpacity={0.8}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <>
                            <Ionicons name="cloud-upload-outline" size={20} color={colors.white} />
                            <Text style={styles.updateButtonText}>Update Signature</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

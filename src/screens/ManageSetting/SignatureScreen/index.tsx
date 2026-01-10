import React, { useState, useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header2 } from '../../../components/common/Header2';
import { colors } from '../../../styles/colors';
import { styles } from './styles';
import { useProfileStore } from '../../../store';
import Ionicons from 'react-native-vector-icons/Ionicons';

export const SignatureScreen = () => {
    const { profileData } = useProfileStore();
    const [signatureImage, setSignatureImage] = useState<string>('');

    useEffect(() => {
        if (profileData?.signature) {
            setSignatureImage(profileData.signature);
        }
    }, [profileData]);



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
            </View>
        </SafeAreaView>
    );
};

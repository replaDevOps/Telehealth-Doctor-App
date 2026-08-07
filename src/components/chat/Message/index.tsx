import React, { useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Modal, Pressable } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import Avatar from '../../common/Avatar';
import { Suggestion } from '../Suggestion';
import { Message as MessageType, Service } from '../../../types/chat.types';
import { styles } from './style';
import { formatTimestampToLocal } from '../../../constants/appData';

interface MessageProps {
  msg: MessageType;
  showAvatar: boolean;
  handleServicePress: (service: Service) => void;
}

const renderBoldText = (text: string, baseStyle: any) => {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return <Text style={baseStyle}>{text}</Text>;
  return (
    <Text style={baseStyle}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Text key={i} style={{ fontWeight: 'bold' }}>{part}</Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
};

export const Message: React.FC<MessageProps> = ({
  msg,
  showAvatar,
  handleServicePress,
}) => {
  const [loadingImages, setLoadingImages] = useState<{ [key: number]: boolean }>({});
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const isUser = msg.type === 'user';
  const hasText = msg.text && msg.text.trim().length > 0;
  const hasImages = msg.images && msg.images.length > 0;
  const formattedTime = formatTimestampToLocal(msg.timestamp);
  return (
    <View style={styles.messageContainer}>
      {/* Bot Message */}
      {!isUser && (
        <View style={showAvatar && styles.botMessageWithAvatar}>
          {showAvatar && msg.user && (
            <Avatar
              name={msg.user.name}
              source={msg.user.avatar}
              size={32}
              fontSize={13}
              style={styles.avatar}
            />
          )}
          <View style={styles.botMessageContent}>
            {showAvatar && msg.user && (
              <View style={styles.messageHeader}>
                <Text style={styles.senderName}>{msg.user.name}</Text>
                <Text style={styles.timestamp}>{formattedTime}</Text>
              </View>
            )}
            {(hasText || hasImages) && (
              <View style={styles.botMessage}>
                {hasText && renderBoldText(msg.text, styles.botMessageText)}
                {hasImages && (
                  <View style={styles.botImagesRow}>
                    {msg.images?.map((img, i) => {
                      const imageUri = typeof img === 'string' ? img : img?.uri;
                      const isUploading = typeof img === 'object' && img?.isUploading;
                      const isLoading = loadingImages[i] || false;
                      
                      // If URI doesn't start with http or file://, prepend BASE_URL
                      const fullImageUri = imageUri && !imageUri.startsWith('http') && !imageUri.startsWith('file://')
                        ? `https://telehealth.repla-projects.com/${imageUri}`
                        : imageUri;

                      const handleLoadStart = () => {
                        setLoadingImages(prev => ({ ...prev, [i]: true }));
                      };

                      const handleLoadEnd = () => {
                        setLoadingImages(prev => ({ ...prev, [i]: false }));
                      };
                      return (
                        <TouchableOpacity 
                          key={`img-${i}`} 
                          style={styles.imageContainer}
                          onPress={() => setFullScreenImage(fullImageUri)}
                          activeOpacity={0.8}
                        >
                          <FastImage
                            source={{ uri: fullImageUri }}
                            style={styles.uploadedImage}
                            resizeMode={FastImage.resizeMode.cover}
                            onLoadStart={handleLoadStart}
                            onLoadEnd={handleLoadEnd}
                            onError={handleLoadEnd}
                          />
                          {(isUploading || isLoading) && (
                            <View style={styles.uploadingOverlay}>
                              <ActivityIndicator size="small" color="#fff" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
            {msg.suggestions && (
              <Suggestion
                suggestions={msg.suggestions}
                handleServicePress={handleServicePress}
              />
            )}
          </View>
        </View>
      )}

      {/* User Message */}
      {isUser && (
        <View style={styles.userMessageWrapper}>
          {showAvatar && msg.user && (
            <View style={styles.userMessageHeader}>
              <Text style={styles.timestamp}>{formattedTime}</Text>
              <Text style={styles.senderName}>{msg.user.name}</Text>
              <Avatar
                name={msg.user.name}
                source={msg.user.avatar}
                size={32}
                fontSize={13}
                style={styles.avatar}
              />
            </View>
          )}

          {(hasText || hasImages) && (
            <View style={styles.userMessage}>
              {hasText && (
                <Text style={styles.userMessageText}>{msg.text}</Text>
              )}
              {hasImages && (
                <View style={styles.imagesRow}>
                  {msg.images?.map((img, i) => {
                    const imageUri = typeof img === 'string' ? img : img?.uri;
                    const isUploading = typeof img === 'object' && img?.isUploading;
                    const isLoading = loadingImages[i] || false;
                    
                    // If URI doesn't start with http or file://, prepend BASE_URL
                    const fullImageUri = imageUri && !imageUri.startsWith('http') && !imageUri.startsWith('file://')
                      ? `https://telehealth.repla-projects.com/${imageUri}`
                      : imageUri;

                    const handleLoadStart = () => {
                      setLoadingImages(prev => ({ ...prev, [i]: true }));
                    };

                    const handleLoadEnd = () => {
                      setLoadingImages(prev => ({ ...prev, [i]: false }));
                    };
                    return (
                      <TouchableOpacity 
                        key={`img-${i}`} 
                        style={styles.imageContainer}
                        onPress={() => setFullScreenImage(fullImageUri)}
                        activeOpacity={0.8}
                      >
                        <FastImage
                          source={{ uri: fullImageUri }}
                          style={styles.uploadedImage}
                          resizeMode={FastImage.resizeMode.cover}
                          onLoadStart={handleLoadStart}
                          onLoadEnd={handleLoadEnd}
                          onError={handleLoadEnd}
                        />
                        {(isUploading || isLoading) && (
                          <View style={styles.uploadingOverlay}>
                            <ActivityIndicator size="small" color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Full Screen Image Modal */}
      <Modal
        visible={!!fullScreenImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <Pressable 
          style={styles.fullScreenModal}
          onPress={() => setFullScreenImage(null)}
        >
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setFullScreenImage(null)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          {fullScreenImage && (
            <FastImage
              source={{ uri: fullScreenImage }}
              style={styles.fullScreenImage}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
        </Pressable>
      </Modal>
    </View>
  );
};

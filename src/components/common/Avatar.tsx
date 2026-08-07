import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../../styles/colors';
import { BASE_URL } from '../../constants/api';

/** Media is served from the API host root, not from the /api prefix. */
const MEDIA_BASE_URL = BASE_URL.replace(/\/api\/?$/, '');

const INITIALS_BACKGROUND = '#E8D5F7';

export type AvatarSource = ImageSourcePropType | string | null | undefined;

/**
 * First and last initial of a name: "Sultan Ahmed Khan" -> "SK", "Sultan" -> "S".
 * Common titles are stripped so "Dr. Sultan Khan" stays "SK".
 */
export const getInitials = (name?: string | null): string => {
  if (!name) return '';
  const parts = String(name)
    .replace(/^\s*(dr|mr|mrs|ms|miss|prof)\.?\s+/i, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Normalises a raw avatar value (relative path, absolute url, `{ uri }` or a
 * `require()`d asset) into an Image source. Returns null when there is no image,
 * so callers can fall back to initials.
 */
export const resolveAvatarSource = (
  source: AvatarSource,
): ImageSourcePropType | null => {
  if (!source) return null;
  if (typeof source === 'number') return source;
  if (typeof source === 'string') {
    const uri = source.trim();
    if (!uri) return null;
    const isAbsolute = /^(https?:|file:|data:|content:|asset:)/i.test(uri);
    return {
      uri: isAbsolute ? uri : `${MEDIA_BASE_URL}/${uri.replace(/^\/+/, '')}`,
    };
  }
  if (Array.isArray(source)) return source.length > 0 ? source : null;
  if (typeof source === 'object' && 'uri' in source) {
    return resolveAvatarSource((source as { uri?: string }).uri);
  }
  return null;
};

interface AvatarProps {
  /** Used to build the initials shown when there is no image. */
  name?: string | null;
  source?: AvatarSource;
  size?: number;
  /** Defaults to a circle. */
  borderRadius?: number;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

/**
 * Profile picture with an initials fallback. Never renders a stock/dummy photo:
 * when the image is missing or fails to load it shows the person's initials.
 */
const Avatar: React.FC<AvatarProps> = ({
  name,
  source,
  size = 40,
  borderRadius,
  backgroundColor = INITIALS_BACKGROUND,
  textColor = colors.primary,
  fontSize,
  style,
  textStyle,
  resizeMode = 'cover',
}) => {
  const imageSource = useMemo(() => resolveAvatarSource(source), [source]);
  const sourceKey =
    typeof imageSource === 'number'
      ? String(imageSource)
      : (imageSource as { uri?: string } | null)?.uri ?? '';

  const [hasFailed, setHasFailed] = useState(false);
  useEffect(() => {
    setHasFailed(false);
  }, [sourceKey]);

  const shape: ViewStyle = {
    width: size,
    height: size,
    borderRadius: borderRadius ?? size / 2,
  };

  if (imageSource && !hasFailed) {
    return (
      <Image
        source={imageSource}
        // Callers pass a shared style used for both branches; sizing/radius/border
        // are valid on an Image too.
        style={[shape, style] as StyleProp<ImageStyle>}
        resizeMode={resizeMode}
        onError={() => setHasFailed(true)}
      />
    );
  }

  return (
    <View style={[shape, styles.initialsContainer, { backgroundColor }, style]}>
      <Text
        style={[
          styles.initialsText,
          { fontSize: fontSize ?? Math.round(size * 0.4), color: textColor },
          textStyle,
        ]}
        allowFontScaling={false}
        numberOfLines={1}
      >
        {getInitials(name) || '?'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  initialsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initialsText: {
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default Avatar;
export { Avatar };

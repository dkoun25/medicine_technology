import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ActivityIndicator, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: Spacing.xs,
    };

    // Size
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = Spacing.xs;
        baseStyle.paddingHorizontal = Spacing.sm;
        break;
      case 'large':
        baseStyle.paddingVertical = Spacing.md;
        baseStyle.paddingHorizontal = Spacing.lg;
        break;
      default:
        baseStyle.paddingVertical = Spacing.sm + 2;
        baseStyle.paddingHorizontal = Spacing.md;
    }

    // Variant
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = colors.primary;
        break;
      case 'secondary':
        baseStyle.backgroundColor = colors.border;
        break;
      case 'danger':
        baseStyle.backgroundColor = colors.danger;
        break;
      case 'success':
        baseStyle.backgroundColor = colors.success;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.primary;
        break;
    }

    if (disabled) {
      baseStyle.opacity = 0.5;
    }

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
    };

    switch (size) {
      case 'small':
        baseStyle.fontSize = FontSizes.sm;
        break;
      case 'large':
        baseStyle.fontSize = FontSizes.lg;
        break;
      default:
        baseStyle.fontSize = FontSizes.md;
    }

    if (variant === 'outline') {
      baseStyle.color = colors.primary;
    } else if (variant === 'secondary') {
      baseStyle.color = colors.text;
    } else {
      baseStyle.color = '#ffffff';
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyle(), style]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : '#ffffff'} size="small" />
      ) : (
        <>
          {icon && <Text style={{ fontSize: 18 }}>{icon}</Text>}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
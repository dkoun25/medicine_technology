import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, View, ViewProps } from 'react-native';

type CardProps = ViewProps & {
  padding?: number;
  shadow?: boolean;
};

export function Card({ children, padding = Spacing.md, shadow = true, style, ...props }: CardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundCard,
          borderColor: colors.border,
          padding,
        },
        shadow && Shadows.md,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
});
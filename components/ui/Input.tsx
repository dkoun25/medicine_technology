import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  icon?: string;
  containerStyle?: any;
};

export function Input({ label, error, icon, containerStyle, style, ...props }: InputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isMultiline = Boolean(props.multiline);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.background,
            borderColor: error ? colors.danger : colors.border,
            alignItems: isMultiline ? 'flex-start' : 'center',
            paddingVertical: isMultiline ? Spacing.sm : 0,
          },
          isMultiline && styles.multilineContainer,
        ]}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={[styles.input, { color: colors.text }, isMultiline && styles.multilineInput, style]}
          placeholderTextColor={colors.textSecondary}
          {...props}
        />
      </View>
      {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    minHeight: 44,
  },
  icon: {
    fontSize: 18,
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    paddingVertical: 0,
  },
  multilineContainer: {
    width: '100%',
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  error: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
});
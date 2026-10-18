// ==============================================================================
// UTSAVHUB CUSTOM INPUT COMPONENT
// ==============================================================================

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  containerStyle?: ViewStyle;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  icon,
  rightIcon,
  ...textInputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          error ? styles.inputError : null,
          textInputProps.multiline ? styles.multilineContainer : null,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          placeholderTextColor={COLORS.textMuted}
          style={[styles.input, textInputProps.multiline ? styles.multilineInput : null]}
          {...textInputProps}
        />
        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  iconContainer: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
    fontWeight: '500',
  },
});

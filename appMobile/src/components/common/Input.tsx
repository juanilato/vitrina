import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from 'react-native';
import { colors, fontSizes, spacing, borderRadius, fontWeights } from '../../theme';
import { normalize } from '../../utils/responsive';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    containerStyle,
    style,
    ...props
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    error && styles.inputError,
                    props.editable === false && styles.disabled,
                    style,
                ]}
                placeholderTextColor={colors.textTertiary}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.sm,
    },
    label: {
        fontSize: fontSizes.sm,
        fontWeight: fontWeights.medium,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        marginLeft: spacing.xs,
    },
    input: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: fontSizes.base,
        color: colors.text,
    },
    inputError: {
        borderColor: colors.error,
    },
    disabled: {
        backgroundColor: colors.background,
        color: colors.textTertiary,
    },
    errorText: {
        fontSize: fontSizes.xs,
        color: colors.error,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    },
});

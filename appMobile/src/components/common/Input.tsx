import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../theme';
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
                placeholderTextColor={COLORS.textTertiary}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SIZES.md,
    },
    label: {
        fontSize: SIZES.fontSm,
        fontWeight: SIZES.fontWeightSemibold,
        color: COLORS.textSecondary,
        marginBottom: SIZES.xs,
        marginLeft: SIZES.xs,
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radiusInput,
        paddingHorizontal: SIZES.base,
        paddingVertical: SIZES.md,
        fontSize: SIZES.fontBase,
        color: COLORS.textPrimary,
        height: SIZES.inputHeight,
        ...SHADOWS.sm,
    },
    inputError: {
        borderColor: COLORS.error,
        borderWidth: 1.5,
    },
    disabled: {
        backgroundColor: COLORS.gray100,
        color: COLORS.textLight,
    },
    errorText: {
        fontSize: SIZES.fontXs,
        color: COLORS.error,
        marginTop: SIZES.xs,
        marginLeft: SIZES.xs,
        fontWeight: SIZES.fontWeightMedium,
    },
});

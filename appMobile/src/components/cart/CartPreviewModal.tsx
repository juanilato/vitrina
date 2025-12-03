/**
 * CartPreviewModal
 * Modal to preview cart items and proceed to checkout
 */

import React, { useMemo, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    TouchableOpacity,
    Image,
    Animated,
    Dimensions,
    Platform,
    UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { colors as themeColors, spacing, borderRadius, textStyles } from '../../theme';
import { formatPrice } from '../../utils/formatPrice';
import { RenderIngredientIcon } from '../../utils/ingredientIcons';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CartPreviewModalProps {
    visible: boolean;
    onClose: () => void;
    companyId: string;
    companyName: string;
    buttonColor?: string;
}

export const CartPreviewModal: React.FC<CartPreviewModalProps> = ({
    visible,
    onClose,
    companyId,
    companyName,
    buttonColor,
}) => {
    const router = useRouter();
    const { cart, updateQuantity, removeItem } = useCart();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
    const finalButtonColor = buttonColor || colors.primary;

    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    // Filter items for this company
    const companyItems = useMemo(() => {
        return cart.items.filter((item) => item.companyId === companyId);
    }, [cart.items, companyId]);

    // Calculate totals
    const { subtotal, total, totalDiscount } = useMemo(() => {
        let sub = 0;
        let disc = 0;

        companyItems.forEach((item) => {
            const priceRaw = item.product.precio || item.product.price || 0;
            const price = typeof priceRaw === 'string' ? parseFloat(priceRaw) : priceRaw;

            const agregadosPrice = item.agregados?.reduce(
                (sum, agg) => sum + (typeof agg.precio === 'string' ? parseFloat(agg.precio) : agg.precio),
                0
            ) || 0;

            const extrasPrice = item.ingredientesExtras?.reduce(
                (sum, extra) => {
                    const pExtra = extra.productoIngrediente.precioExtra;
                    return sum + (typeof pExtra === 'string' ? parseFloat(pExtra) : (pExtra || 0)) * extra.cantidad;
                },
                0
            ) || 0;

            const itemSubtotal = (price + agregadosPrice + extrasPrice) * item.quantity;
            sub += itemSubtotal;
            disc += item.discount || 0;
        });

        return {
            subtotal: sub,
            totalDiscount: disc,
            total: Math.max(0, sub - disc),
        };
    }, [companyItems]);

    const handleCheckout = () => {
        onClose();
        router.push({
            pathname: '/checkout',
            params: { companyId },
        });
    };

    if (!visible && companyItems.length === 0) return null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />


                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [
                                {
                                    translateY: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [600, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.dragHandle} />
                        <View style={styles.headerContent}>
                            <Text style={styles.headerTitle}>Tu pedido</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.companyName}>{companyName}</Text>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {companyItems.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="cart-outline" size={64} color={colors.textTertiary} />
                                <Text style={styles.emptyText}>Tu carrito está vacío</Text>
                            </View>
                        ) : (
                            <View style={styles.itemsList}>
                                {companyItems.map((item, index) => {
                                    const priceRaw = item.product.precio || item.product.price || 0;
                                    const price = typeof priceRaw === 'string' ? parseFloat(priceRaw) : priceRaw;

                                    // Calculate unit price with extras
                                    const agregadosPrice = item.agregados?.reduce(
                                        (sum, agg) => sum + (typeof agg.precio === 'string' ? parseFloat(agg.precio) : agg.precio),
                                        0
                                    ) || 0;

                                    const extrasPrice = item.ingredientesExtras?.reduce(
                                        (sum, extra) => {
                                            const pExtra = extra.productoIngrediente.precioExtra;
                                            return sum + (typeof pExtra === 'string' ? parseFloat(pExtra) : (pExtra || 0)) * extra.cantidad;
                                        },
                                        0
                                    ) || 0;

                                    const unitPrice = price + agregadosPrice + extrasPrice;

                                    return (
                                        <View key={`${item.product.id}-${index}`} style={styles.itemCard}>
                                            {/* Product Image */}
                                            <View style={styles.itemImageContainer}>
                                                {item.product.fotoUrl ? (
                                                    <Image source={{ uri: item.product.fotoUrl }} style={styles.itemImage} />
                                                ) : (
                                                    <View style={[styles.itemImage, styles.placeholderImage]}>
                                                        <Text style={styles.placeholderText}>{item.product.nombre.charAt(0)}</Text>
                                                    </View>
                                                )}
                                            </View>

                                            {/* Product Info */}
                                            <View style={styles.itemInfo}>
                                                <View style={styles.itemHeader}>
                                                    <Text style={styles.itemName} numberOfLines={1}>
                                                        {item.product.nombre}
                                                    </Text>
                                                    <Text style={styles.itemPrice}>
                                                        ${formatPrice(unitPrice * item.quantity)}
                                                    </Text>
                                                </View>

                                                {/* Extras & Notes */}
                                                {(item.agregados?.length > 0 || item.ingredientesExtras?.length > 0 || item.notes) && (
                                                    <View style={styles.extrasContainer}>
                                                        {item.agregados?.map((agg, i) => (
                                                            <Text key={`agg-${i}`} style={styles.extraText}>
                                                                + {agg.nombre}
                                                            </Text>
                                                        ))}
                                                        {item.ingredientesExtras?.map((extra, i) => (
                                                            <Text key={`extra-${i}`} style={styles.extraText}>
                                                                + {extra.cantidad}x {extra.productoIngrediente.ingrediente.nombre}
                                                            </Text>
                                                        ))}
                                                        {item.notes && (
                                                            <Text style={[styles.extraText, styles.noteText]} numberOfLines={1}>
                                                                📝 {item.notes}
                                                            </Text>
                                                        )}
                                                    </View>
                                                )}

                                                {/* Promotion Badge */}
                                                {item.appliedPromotion && (
                                                    <View style={styles.promoBadge}>
                                                        <Ionicons name="pricetag" size={12} color={colors.white} />
                                                        <Text style={styles.promoText}>{item.appliedPromotion}</Text>
                                                    </View>
                                                )}

                                                {/* Quantity Controls */}
                                                <View style={styles.quantityControls}>
                                                    <TouchableOpacity
                                                        style={[styles.qtyButton, { borderColor: colors.border }]}
                                                        onPress={() => {
                                                            if (item.quantity > 1) {
                                                                updateQuantity(item.product.id, item.quantity - 1);
                                                            } else {
                                                                removeItem(item.product.id);
                                                            }
                                                        }}
                                                    >
                                                        <Ionicons
                                                            name={item.quantity === 1 ? "trash-outline" : "remove"}
                                                            size={16}
                                                            color={item.quantity === 1 ? colors.error : colors.text}
                                                        />
                                                    </TouchableOpacity>

                                                    <Text style={styles.qtyText}>{item.quantity}</Text>

                                                    <TouchableOpacity
                                                        style={[styles.qtyButton, { borderColor: finalButtonColor, backgroundColor: `${finalButtonColor}10` }]}
                                                        onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    >
                                                        <Ionicons name="add" size={16} color={finalButtonColor} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    {companyItems.length > 0 && (
                        <View style={styles.footer}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal</Text>
                                <Text style={styles.summaryValue}>${formatPrice(subtotal)}</Text>
                            </View>
                            {totalDiscount > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={[styles.summaryLabel, { color: colors.success }]}>Descuentos</Text>
                                    <Text style={[styles.summaryValue, { color: colors.success }]}>
                                        -${formatPrice(totalDiscount)}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.divider} />

                            <View style={[styles.summaryRow, { marginBottom: spacing.lg }]}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalValue}>${formatPrice(total)}</Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.checkoutButton, { backgroundColor: finalButtonColor }]}
                                onPress={handleCheckout}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.checkoutButtonText}>Ir a pagar</Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 20,
    },
    header: {
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? colors.gray200 : colors.border,
        alignItems: 'center',
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.gray300,
        marginBottom: spacing.md,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
    },
    closeButton: {
        padding: 4,
        backgroundColor: isDark ? colors.gray100 : colors.gray100,
        borderRadius: 20,
    },
    companyName: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: 100,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: spacing.md,
        fontSize: 16,
        color: colors.textSecondary,
    },
    itemsList: {
        gap: spacing.lg,
    },
    itemCard: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    itemImageContainer: {
        width: 70,
        height: 70,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        backgroundColor: isDark ? colors.gray100 : colors.gray100,
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textTertiary,
    },
    itemInfo: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    itemName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginRight: spacing.sm,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    extrasContainer: {
        marginBottom: spacing.sm,
    },
    extraText: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    noteText: {
        fontStyle: 'italic',
        color: colors.textTertiary,
    },
    promoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.success,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: spacing.sm,
        gap: 4,
    },
    promoText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginTop: spacing.xs,
    },
    qtyButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        minWidth: 20,
        textAlign: 'center',
    },
    footer: {
        padding: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
        borderTopWidth: 1,
        borderTopColor: isDark ? colors.gray200 : colors.border,
        backgroundColor: colors.card,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    summaryLabel: {
        fontSize: 15,
        color: colors.textSecondary,
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: isDark ? colors.gray200 : colors.border,
        marginVertical: spacing.md,
    },
    totalLabel: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text,
    },
    checkoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.xl,
        gap: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    checkoutButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
});

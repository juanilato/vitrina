/**
 * Checkout Screen
 * Pantalla de checkout con selección de delivery/retiro, ubicación, y pago
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCart } from '../src/contexts/CartContext';
import { Button } from '../src/components/common/Button';
import { SimpleLocationPicker } from '../src/components/common/SimpleLocationPicker';
import { orderService } from '../src/services/order.service';
import { shippingService } from '../src/services/shipping.service';
import { colors } from '../src/theme/colors';
import { spacing } from '../src/theme/spacing';
import { textStyles as typography } from '../src/theme/typography';
import type { DeliveryType, PaymentMethod } from '../src/types/cart';
import type { DeliveryLocation, ShippingPriceResponse } from '../src/types/order';

export default function CheckoutScreen() {
  const router = useRouter();
  const {
    cart,
    checkoutData,
    setDeliveryType,
    setDeliveryAddress,
    setPaymentMethod,
    setTransferReceipt,
    setCheckoutNotes,
    setDeliveryFee,
    clearCart,
    clearCheckoutData,
  } = useCart();

  const [deliveryType, setDeliveryTypeLocal] = useState<DeliveryType>(
    checkoutData?.deliveryType || 'delivery'
  );
  const [paymentMethod, setPaymentMethodLocal] = useState<PaymentMethod>(
    checkoutData?.paymentMethod || 'efectivo'
  );
  const [address, setAddress] = useState(checkoutData?.deliveryAddress?.address || '');
  const [reference, setReference] = useState(checkoutData?.deliveryAddress?.reference || '');
  const [notes, setNotes] = useState(checkoutData?.notes || '');
  const [receiptImage, setReceiptImage] = useState<string | null>(
    checkoutData?.transferReceipt || null
  );
  const [loading, setLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [shippingPrice, setShippingPrice] = useState<ShippingPriceResponse | null>(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  // Calculate delivery fee based on location and company settings
  const calculateDeliveryFee = async (location?: DeliveryLocation) => {
    if (deliveryType === 'pickup') {
      setShippingPrice({ price: 0, isEstimated: false, message: 'Retiro en local' });
      setDeliveryFee(0);
      return 0;
    }

    const locationToUse = location || deliveryLocation;

    if (!locationToUse || !cart.companyId) {
      // Si no hay ubicación, usar un precio estimado
      const defaultFee = 500;
      setShippingPrice({
        price: defaultFee,
        isEstimated: true,
        message: 'Precio estimado. Selecciona tu ubicación para el precio exacto.'
      });
      setDeliveryFee(defaultFee);
      return defaultFee;
    }

    setCalculatingShipping(true);
    try {
      // Obtener ubicaciones de la empresa
      const company = await orderService.getCompanyDetails(cart.companyId);

      if (!company.ubicaciones || company.ubicaciones.length === 0) {
        throw new Error('La empresa no tiene ubicaciones configuradas');
      }

      // Encontrar la ubicación más cercana
      const closestLocation = shippingService.findClosestLocation(
        locationToUse,
        company.ubicaciones.map(u => ({
          id: u.id,
          lat: u.lat,
          lng: u.lng,
          direccion: u.direccion,
        }))
      );

      if (!closestLocation) {
        throw new Error('No se pudo encontrar una ubicación cercana');
      }

      // Calcular precio de envío
      const result = await shippingService.calculateShippingPrice(cart.companyId, {
        clienteLat: locationToUse.lat,
        clienteLng: locationToUse.lng,
        ubicacionId: parseInt(closestLocation.id),
      });

      setShippingPrice(result);
      const fee = result.price || 500; // Fallback a precio estimado
      setDeliveryFee(fee);
      return fee;
    } catch (error) {
      console.error('Error calculating shipping fee:', error);
      const defaultFee = 500;
      setShippingPrice({
        price: defaultFee,
        isEstimated: true,
        message: 'No se pudo calcular el precio exacto. El vendedor te contactará.'
      });
      setDeliveryFee(defaultFee);
      return defaultFee;
    } finally {
      setCalculatingShipping(false);
    }
  };

  const handleDeliveryTypeChange = async (type: DeliveryType) => {
    setDeliveryTypeLocal(type);
    setDeliveryType(type);

    if (type === 'pickup') {
      setDeliveryFee(0);
      setShippingPrice({ price: 0, isEstimated: false, message: 'Retiro en local' });
    } else {
      // Solo calcular si hay ubicación
      if (deliveryLocation) {
        await calculateDeliveryFee(deliveryLocation);
      } else {
        const defaultFee = 500;
        setDeliveryFee(defaultFee);
        setShippingPrice({
          price: defaultFee,
          isEstimated: true,
          message: 'Precio estimado. Selecciona tu ubicación para el precio exacto.'
        });
      }
    }
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethodLocal(method);
    setPaymentMethod(method);
    if (method === 'efectivo') {
      setReceiptImage(null);
      setTransferReceipt('');
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permiso para acceder a tus fotos');
      return;
    }

    // FIX: Usar launchImageLibraryAsync en lugar de launchImagePickerAsync
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setReceiptImage(base64Image);
      setTransferReceipt(base64Image);
    }
  };

  const handleSelectLocation = () => {
    setShowLocationPicker(true);
  };

  const handleLocationSelected = async (location: { lat: number; lng: number; address: string }) => {
    const newLocation: DeliveryLocation = {
      direccion: location.address,
      lat: location.lat,
      lng: location.lng,
    };

    setDeliveryLocation(newLocation);
    setAddress(location.address);
    setDeliveryAddress({
      address: location.address,
      reference: reference,
    });

    // Calcular precio de envío automáticamente
    await calculateDeliveryFee(newLocation);
  };

  const validateForm = (): boolean => {
    if (deliveryType === 'delivery' && !address.trim()) {
      Alert.alert('Error', 'Por favor ingresa una dirección de entrega');
      return false;
    }

    if (paymentMethod === 'transferencia' && !receiptImage) {
      Alert.alert('Error', 'Por favor sube el comprobante de transferencia');
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Prepare order data
      const orderData: any = {
        empresaId: cart.companyId!,
        items: cart.items.map((item) => ({
          productoId: item.product.id,
          cantidad: Number(item.quantity), // Asegurar que sea número
          precio: Number(item.product.price || item.product.precio), // Asegurar que sea número
        })),
        tipoEntrega: deliveryType,
        formaPago: paymentMethod,
      };

      // Solo agregar transferenciaFoto si existe
      if (paymentMethod === 'transferencia' && receiptImage) {
        orderData.transferenciaFoto = receiptImage;
      }

      // Agregar deliveryLocation solo si hay ubicación seleccionada
      if (deliveryType === 'delivery' && deliveryLocation) {
        orderData.deliveryLocation = {
          direccion: String(deliveryLocation.direccion),
          lat: Number(deliveryLocation.lat),
          lng: Number(deliveryLocation.lng),
        };
      }

      // Agregar shippingPrice solo si se calculó
      if (shippingPrice) {
        orderData.shippingPrice = {
          price: shippingPrice.price !== null ? Number(shippingPrice.price) : null,
          isEstimated: Boolean(shippingPrice.isEstimated),
          message: String(shippingPrice.message),
        };
      }

      console.log('📦 Enviando pedido:', JSON.stringify(orderData, null, 2));

      // Create order
      const order = await orderService.createOrder(orderData);

      // Clear cart and checkout data
      clearCart();
      clearCheckoutData();

      Alert.alert(
        'Pedido realizado',
        `Tu pedido #${order.id} ha sido creado exitosamente`,
        [
          {
            text: 'Ver pedido',
            onPress: () => router.replace('/(tabs)/orders'),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Error creating order:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);

      let errorMessage = 'No se pudo crear el pedido. Por favor intenta nuevamente.';

      if (error.response?.data) {
        // Si hay mensaje de validación específico
        if (error.response.data.message) {
          if (Array.isArray(error.response.data.message)) {
            errorMessage = error.response.data.message.join('\n');
          } else {
            errorMessage = error.response.data.message;
          }
        }
        console.error('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.gray900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={80} color={colors.gray300} />
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Button
            title="Volver al inicio"
            onPress={() => router.replace('/(tabs)')}
            style={styles.emptyButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de entrega</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                deliveryType === 'delivery' && styles.optionCardActive,
              ]}
              onPress={() => handleDeliveryTypeChange('delivery')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="bicycle"
                size={32}
                color={deliveryType === 'delivery' ? colors.accent : colors.gray400}
              />
              <Text
                style={[
                  styles.optionTitle,
                  deliveryType === 'delivery' && styles.optionTitleActive,
                ]}
              >
                Delivery
              </Text>
              <Text style={styles.optionSubtitle}>
                ${(cart.deliveryFee || 500).toLocaleString('es-AR')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                deliveryType === 'pickup' && styles.optionCardActive,
              ]}
              onPress={() => handleDeliveryTypeChange('pickup')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="bag-handle"
                size={32}
                color={deliveryType === 'pickup' ? colors.accent : colors.gray400}
              />
              <Text
                style={[
                  styles.optionTitle,
                  deliveryType === 'pickup' && styles.optionTitleActive,
                ]}
              >
                Retiro
              </Text>
              <Text style={styles.optionSubtitle}>Gratis</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery Address */}
        {deliveryType === 'delivery' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dirección de entrega</Text>

            <TouchableOpacity
              style={styles.mapButton}
              onPress={handleSelectLocation}
              activeOpacity={0.7}
            >
              <Ionicons name="map" size={20} color={colors.accent} />
              <Text style={styles.mapButtonText}>Seleccionar en el mapa</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Dirección completa"
              value={address}
              onChangeText={setAddress}
              placeholderTextColor={colors.gray400}
            />

            <TextInput
              style={styles.input}
              placeholder="Referencia (opcional)"
              value={reference}
              onChangeText={setReference}
              placeholderTextColor={colors.gray400}
            />
          </View>
        )}

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Forma de pago</Text>
          <View style={styles.optionsColumn}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'efectivo' && styles.paymentOptionActive,
              ]}
              onPress={() => handlePaymentMethodChange('efectivo')}
              activeOpacity={0.7}
            >
              <View style={styles.paymentOptionLeft}>
                <Ionicons
                  name="cash"
                  size={24}
                  color={paymentMethod === 'efectivo' ? colors.accent : colors.gray600}
                />
                <Text
                  style={[
                    styles.paymentOptionText,
                    paymentMethod === 'efectivo' && styles.paymentOptionTextActive,
                  ]}
                >
                  Efectivo
                </Text>
              </View>
              {paymentMethod === 'efectivo' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'transferencia' && styles.paymentOptionActive,
              ]}
              onPress={() => handlePaymentMethodChange('transferencia')}
              activeOpacity={0.7}
            >
              <View style={styles.paymentOptionLeft}>
                <Ionicons
                  name="card"
                  size={24}
                  color={paymentMethod === 'transferencia' ? colors.accent : colors.gray600}
                />
                <Text
                  style={[
                    styles.paymentOptionText,
                    paymentMethod === 'transferencia' && styles.paymentOptionTextActive,
                  ]}
                >
                  Transferencia
                </Text>
              </View>
              {paymentMethod === 'transferencia' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Transfer Receipt Upload */}
        {paymentMethod === 'transferencia' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comprobante de transferencia</Text>
            <Text style={styles.sectionSubtitle}>
              Por favor sube una foto del comprobante de transferencia
            </Text>

            {receiptImage ? (
              <View style={styles.receiptContainer}>
                <Image source={{ uri: receiptImage }} style={styles.receiptImage} />
                <TouchableOpacity
                  style={styles.removeReceiptButton}
                  onPress={() => {
                    setReceiptImage(null);
                    setTransferReceipt('');
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={32} color={colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handlePickImage}
                activeOpacity={0.7}
              >
                <Ionicons name="cloud-upload-outline" size={48} color={colors.gray400} />
                <Text style={styles.uploadButtonText}>Subir comprobante</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas adicionales (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ej: Tocar timbre, horario preferido..."
            value={notes}
            onChangeText={(text) => {
              setNotes(text);
              setCheckoutNotes(text);
            }}
            multiline
            numberOfLines={4}
            maxLength={500}
            placeholderTextColor={colors.gray400}
            textAlignVertical="top"
          />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del pedido</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ${cart.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>Envío</Text>
                {shippingPrice?.isEstimated && shippingPrice.message && (
                  <Text style={styles.estimatedLabel}>{shippingPrice.message}</Text>
                )}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.summaryValue}>
                  {calculatingShipping
                    ? 'Calculando...'
                    : cart.deliveryFee === 0
                    ? 'Gratis'
                    : `$${cart.deliveryFee.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                </Text>
                {shippingPrice?.isEstimated && (
                  <Text style={styles.estimatedBadge}>Estimado</Text>
                )}
              </View>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${cart.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <Button
          title={loading ? 'Procesando...' : 'Confirmar pedido'}
          onPress={handleSubmitOrder}
          disabled={loading}
          icon={loading ? undefined : 'checkmark-circle'}
        />
        {loading && <ActivityIndicator style={styles.loader} color={colors.white} />}
      </View>

      {/* Location Picker Modal */}
      <SimpleLocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={handleLocationSelected}
        initialLocation={deliveryLocation ? { lat: deliveryLocation.lat, lng: deliveryLocation.lng } : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  headerTitle: {
    ...typography.h2,
    color: colors.gray900,
    fontWeight: '700',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },

  section: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.gray900,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.gray600,
    marginBottom: spacing.md,
  },

  optionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  optionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray200,
  },

  optionCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '10',
  },

  optionTitle: {
    ...typography.bodyLarge,
    color: colors.gray700,
    fontWeight: '600',
    marginTop: spacing.sm,
  },

  optionTitleActive: {
    color: colors.accent,
  },

  optionSubtitle: {
    ...typography.bodySmall,
    color: colors.gray600,
    marginTop: spacing.xs,
  },

  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent + '15',
    borderRadius: 8,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },

  mapButtonText: {
    ...typography.bodyMedium,
    color: colors.accent,
    fontWeight: '600',
  },

  input: {
    ...typography.bodyMedium,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    color: colors.gray900,
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  optionsColumn: {
    gap: spacing.md,
  },

  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.gray200,
  },

  paymentOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '10',
  },

  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  paymentOptionText: {
    ...typography.bodyLarge,
    color: colors.gray700,
    fontWeight: '600',
  },

  paymentOptionTextActive: {
    color: colors.accent,
  },

  uploadButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray300,
    borderStyle: 'dashed',
  },

  uploadButtonText: {
    ...typography.bodyMedium,
    color: colors.gray600,
    marginTop: spacing.sm,
  },

  receiptContainer: {
    position: 'relative',
    alignItems: 'center',
  },

  receiptImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'contain',
    backgroundColor: colors.gray100,
  },

  removeReceiptButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 16,
  },

  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  summaryLabel: {
    ...typography.bodyMedium,
    color: colors.gray600,
  },

  summaryValue: {
    ...typography.bodyMedium,
    color: colors.gray900,
    fontWeight: '600',
  },

  totalRow: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    marginTop: spacing.sm,
    marginBottom: 0,
  },

  totalLabel: {
    ...typography.bodyLarge,
    color: colors.gray900,
    fontWeight: '700',
  },

  totalValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },

  bottomContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    position: 'relative',
  },

  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -12,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },

  emptyTitle: {
    ...typography.h3,
    color: colors.gray900,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },

  emptyButton: {
    paddingHorizontal: spacing.xl,
  },

  estimatedLabel: {
    ...typography.caption,
    color: colors.gray500,
    marginTop: 2,
    fontSize: 11,
  },

  estimatedBadge: {
    ...typography.caption,
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});

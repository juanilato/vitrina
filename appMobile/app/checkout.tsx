/**
 * Checkout Screen
 * Pantalla de checkout con selección de delivery/retiro, ubicación, y pago
 */

import React, { useState, useMemo, useEffect } from 'react';
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCart } from '../src/contexts/CartContext';
import { useLocation } from '../src/contexts/LocationContext';
import { Button } from '../src/components/common/Button';
import { SimpleLocationPicker } from '../src/components/common/SimpleLocationPicker';
import { orderService } from '../src/services/order.service';
import { shippingService } from '../src/services/shipping.service';
import { locationService, SavedLocation } from '../src/services/location.service';
import { spacing } from '../src/theme/spacing';
import { textStyles as typography } from '../src/theme/typography';
import { useTheme } from '../src/contexts/ThemeContext';
import type { DeliveryType, PaymentMethod, DeliveryTimeEstimation } from '../src/types/cart';
import type { DeliveryLocation, ShippingPriceResponse } from '../src/types/order';
import type { Company, HorarioAtencion, DayOfWeek } from '../src/types/company';

export default function CheckoutScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
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

  const { selectedLocation, locations } = useLocation();

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
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [selectedSavedLocation, setSelectedSavedLocation] = useState<SavedLocation | null>(selectedLocation);
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [shippingPrice, setShippingPrice] = useState<ShippingPriceResponse | null>(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [deliveryTimeEstimation, setDeliveryTimeEstimation] = useState<DeliveryTimeEstimation | null>(null);

  // Estado para la empresa y sus preferencias
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [deliveryUnavailableReason, setDeliveryUnavailableReason] = useState<string>('');

  // Estado para selección de hora de retiro
  const [pickupTimeMode, setPickupTimeMode] = useState<'asap' | 'scheduled'>('asap');
  const [selectedPickupTime, setSelectedPickupTime] = useState<string | null>(null);
  const [showPickupTimePicker, setShowPickupTimePicker] = useState(false);
  const [availablePickupSlots, setAvailablePickupSlots] = useState<{ time: string; label: string }[]>([]);

  // Estado para verificar si la tienda está abierta
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [storeClosedMessage, setStoreClosedMessage] = useState<string>('');

  // Cache del último precio calculado para evitar recálculos
  const [lastCalculatedLocation, setLastCalculatedLocation] = useState<string | null>(null);

  // Cargar datos de la empresa al montar el componente
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!cart.companyId) {
        setLoadingCompany(false);
        return;
      }

      try {
        const company = await orderService.getCompanyDetails(cart.companyId);
        setCompanyData(company as Company);

        // Debug: ver qué devuelve el backend
        console.log('📦 [CHECKOUT] Company data:', {
          id: company.id,
          name: company.name,
          preferenciasWeb: company.preferenciasWeb,
          envioDomicilio: company.preferenciasWeb?.envioDomicilio,
        });

        // Verificar si la empresa hace delivery
        const hacenEnvio = company.preferenciasWeb?.envioDomicilio ?? false;
        console.log('📦 [CHECKOUT] hacenEnvio:', hacenEnvio);
        if (!hacenEnvio) {
          setDeliveryAvailable(false);
          setDeliveryUnavailableReason('Esta empresa no realiza envíos a domicilio');
          // Si no hace delivery, forzar retiro
          if (deliveryType === 'delivery') {
            setDeliveryTypeLocal('retiro');
            setDeliveryType('retiro');
          }
        }

        // Calcular slots de horario disponibles para retiro
        if (company.preferenciasWeb?.horarios) {
          calculatePickupSlots(company.preferenciasWeb.horarios);
          // Verificar si la tienda está abierta
          checkIfStoreIsOpen(company.preferenciasWeb.horarios);
        }
      } catch (error) {
        console.error('Error loading company data:', error);
      } finally {
        setLoadingCompany(false);
      }
    };

    loadCompanyData();
  }, [cart.companyId]);

  // Verificar si la tienda está abierta
  const checkIfStoreIsOpen = (horarios: HorarioAtencion[]) => {
    const currentDay = getCurrentDayOfWeek();
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Filtrar horarios del día actual que no estén cerrados
    const todayHorarios = horarios.filter(
      (h) => h.day === currentDay && !h.cerrado
    );

    if (todayHorarios.length === 0) {
      setIsStoreOpen(false);
      setStoreClosedMessage('La tienda está cerrada hoy');
      return;
    }

    // Verificar si estamos dentro de algún horario de atención
    const isOpen = todayHorarios.some(
      (h) => currentMinutes >= h.abreMin && currentMinutes < h.cierraMin
    );

    if (!isOpen) {
      // Buscar próximo horario de apertura
      const nextSlot = todayHorarios.find((h) => currentMinutes < h.abreMin);
      if (nextSlot) {
        setStoreClosedMessage(`Abre a las ${formatMinutesToTime(nextSlot.abreMin)}`);
      } else {
        setStoreClosedMessage('La tienda está cerrada por hoy');
      }
    }

    setIsStoreOpen(isOpen);
  };

  // Función para obtener el día actual en formato DayOfWeek
  const getCurrentDayOfWeek = (): string => {
    const days = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
    return days[new Date().getDay()];
  };

  // Función para formatear minutos a hora legible
  const formatMinutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Calcular slots de horario disponibles para retiro
  const calculatePickupSlots = (horarios: HorarioAtencion[]) => {
    const currentDay = getCurrentDayOfWeek();
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const preparationTime = deliveryTimeEstimation?.preparacionMinutos || 15;

    // Filtrar horarios del día actual que no estén cerrados
    const todayHorarios = horarios.filter(
      (h) => h.day === currentDay && !h.cerrado
    );

    const slots: { time: string; label: string }[] = [];

    // Agregar slots cada 15 minutos dentro de los horarios de atención
    todayHorarios.forEach((horario) => {
      // El primer slot disponible es después del tiempo de preparación
      const minAvailableTime = Math.max(
        horario.abreMin,
        currentMinutes + preparationTime
      );

      // Generar slots cada 15 minutos
      for (let mins = minAvailableTime; mins < horario.cierraMin - 15; mins += 15) {
        // Redondear al siguiente múltiplo de 15
        const roundedMins = Math.ceil(mins / 15) * 15;
        if (roundedMins < horario.cierraMin) {
          const timeStr = formatMinutesToTime(roundedMins);
          slots.push({
            time: timeStr,
            label: timeStr,
          });
        }
      }
    });

    // Eliminar duplicados y ordenar
    const uniqueSlots = slots.filter(
      (slot, index, self) =>
        index === self.findIndex((s) => s.time === slot.time)
    );

    setAvailablePickupSlots(uniqueSlots);
  };

  // Recalcular slots cuando cambie el tiempo de preparación
  useEffect(() => {
    if (companyData?.preferenciasWeb?.horarios && deliveryType === 'retiro') {
      calculatePickupSlots(companyData.preferenciasWeb.horarios);
    }
  }, [deliveryTimeEstimation, deliveryType, companyData]);

  // Calcular precio automáticamente si hay ubicación seleccionada del dashboard
  React.useEffect(() => {
    if (selectedLocation && deliveryType === 'delivery') {
      const location: DeliveryLocation = {
        direccion: selectedLocation.direccion,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
      };
      setDeliveryLocation(location);
      setAddress(selectedLocation.direccion);
      setReference(selectedLocation.referencia || '');
      calculateDeliveryFee(location);
      calculateEstimatedTime(location);
    }
  }, [selectedLocation]);

  // Recalcular tiempo estimado cuando cambie el tipo de entrega
  React.useEffect(() => {
    if (deliveryType === 'retiro') {
      calculateEstimatedTime();
    } else if (deliveryLocation) {
      calculateEstimatedTime(deliveryLocation);
    }
  }, [deliveryType, cart.totalItems]);

  // Calculate delivery fee based on location and company settings
  const calculateDeliveryFee = async (location?: DeliveryLocation) => {
    if (deliveryType === 'retiro') {
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

      // Verificar si el precio es null (excede rango máximo)
      if (result.price === null) {
        setDeliveryAvailable(false);
        setDeliveryUnavailableReason(result.message || 'Tu ubicación está fuera del rango de entrega');
        setDeliveryFee(0);
        // Cambiar a retiro automáticamente
        setDeliveryTypeLocal('retiro');
        setDeliveryType('retiro');
        return 0;
      }

      // Delivery disponible
      setDeliveryAvailable(true);
      setDeliveryUnavailableReason('');
      const fee = result.price || 500;
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

  // Calcular tiempo estimado de entrega
  const calculateEstimatedTime = (location?: DeliveryLocation) => {
    if (!cart.companyId) {
      return;
    }

    try {
      // Calcular distancia si hay ubicación
      let distanciaKm: number | undefined;
      if (location && deliveryLocation) {
        distanciaKm = shippingService.calculateDistance(
          location.lat,
          location.lng,
          deliveryLocation.lat,
          deliveryLocation.lng
        );
      }

      // Usar estimación local para feedback inmediato
      const estimation = shippingService.estimateDeliveryTimeLocal(
        deliveryType,
        distanciaKm,
        cart.totalItems
      );

      setDeliveryTimeEstimation(estimation);
    } catch (error) {
      console.error('Error calculating estimated time:', error);
      setDeliveryTimeEstimation(null);
    }
  };

  const handleDeliveryTypeChange = async (type: DeliveryType) => {
    setDeliveryTypeLocal(type);
    setDeliveryType(type);

    if (type === 'retiro') {
      setDeliveryFee(0);
      setShippingPrice({ price: 0, isEstimated: false, message: 'Retiro en local' });
    } else {
      // Solo calcular si hay ubicación Y no se ha calculado antes para esta ubicación
      if (deliveryLocation) {
        const locationKey = `${deliveryLocation.lat},${deliveryLocation.lng}`;
        if (lastCalculatedLocation !== locationKey) {
          await calculateDeliveryFee(deliveryLocation);
          setLastCalculatedLocation(locationKey);
        }
        // Si ya se calculó, usar el precio existente (no hacer nada)
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
      coordinates: {
        latitude: location.lat,
        longitude: location.lng,
      },
    });

    // Calcular precio de envío automáticamente
    await calculateDeliveryFee(newLocation);
    // Actualizar cache de ubicación calculada
    setLastCalculatedLocation(`${newLocation.lat},${newLocation.lng}`);
  };

  const validateForm = (): boolean => {
    if (deliveryType === 'delivery' && !address.trim()) {
      Alert.alert('Error', 'Por favor ingresa una dirección de entrega');
      return false;
    }

    if (deliveryType === 'delivery' && calculatingShipping) {
      Alert.alert('Error', 'Espera a que se calcule el precio de envío');
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
        items: cart.items.map((item) => {
          const itemData: any = {
            productoId: item.product.id,
            cantidad: Number(item.quantity), // Asegurar que sea número
            precio: Number(item.product.price || item.product.precio), // Asegurar que sea número
          };

          // Agregar notas si existen
          if (item.notes && item.notes.trim()) {
            itemData.notas = item.notes.trim();
          }

          // Agregar ingredientes extras si existen
          if (item.ingredientesExtras && item.ingredientesExtras.length > 0) {
            itemData.ingredientesExtras = item.ingredientesExtras.map(ie => ({
              productoIngredienteId: ie.productoIngrediente.id,
              cantidad: ie.cantidad,
            }));
          }

          return itemData;
        }),
        tipoEntrega: deliveryType,
        formaPago: paymentMethod,
      };

      // Solo agregar transferenciaFoto si existe
      if (paymentMethod === 'transferencia' && receiptImage) {
        orderData.transferenciaFoto = receiptImage;
      }

      // Agregar ubicación solo si es delivery y hay ubicación seleccionada
      if (deliveryType === 'delivery' && deliveryLocation) {
        orderData.ubicacion = {
          direccion: String(deliveryLocation.direccion),
          lat: Number(deliveryLocation.lat),
          lng: Number(deliveryLocation.lng),
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
        {/* Delivery Type Selection - Estilo Toggle Moderno */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de entrega</Text>

          {/* Mensaje si delivery no está disponible por rango excedido (no mostrar si simplemente no hacen delivery) */}
          {!deliveryAvailable && deliveryUnavailableReason && deliveryUnavailableReason !== 'Esta empresa no realiza envíos a domicilio' && (
            <View style={styles.deliveryUnavailableCard}>
              <Ionicons name="information-circle" size={20} color={colors.warning} />
              <Text style={styles.deliveryUnavailableText}>{deliveryUnavailableReason}</Text>
            </View>
          )}

          {/* Toggle solo si delivery está disponible */}
          {deliveryAvailable ? (
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  styles.toggleOptionLeft,
                  deliveryType === 'delivery' && styles.toggleOptionActive,
                ]}
                onPress={() => handleDeliveryTypeChange('delivery')}
                activeOpacity={0.8}
              >
                <View style={styles.toggleIconContainer}>
                  <Ionicons
                    name="bicycle"
                    size={24}
                    color={deliveryType === 'delivery' ? colors.white : colors.gray600}
                  />
                </View>
                <View style={styles.toggleTextContainer}>
                  <Text
                    style={[
                      styles.toggleLabel,
                      deliveryType === 'delivery' && styles.toggleLabelActive,
                    ]}
                  >
                    Delivery
                  </Text>
                  <Text
                    style={[
                      styles.toggleSubtext,
                      deliveryType === 'delivery' && styles.toggleSubtextActive,
                    ]}
                  >
                    ${(cart.deliveryFee || 500).toLocaleString('es-AR')}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  styles.toggleOptionRight,
                  deliveryType === 'retiro' && styles.toggleOptionActive,
                ]}
                onPress={() => handleDeliveryTypeChange('retiro')}
                activeOpacity={0.8}
              >
                <View style={styles.toggleIconContainer}>
                  <Ionicons
                    name="bag-handle"
                    size={24}
                    color={deliveryType === 'retiro' ? colors.white : colors.gray600}
                  />
                </View>
                <View style={styles.toggleTextContainer}>
                  <Text
                    style={[
                      styles.toggleLabel,
                      deliveryType === 'retiro' && styles.toggleLabelActive,
                    ]}
                  >
                    Retiro
                  </Text>
                  <Text
                    style={[
                      styles.toggleSubtext,
                      deliveryType === 'retiro' && styles.toggleSubtextActive,
                    ]}
                  >
                    Gratis
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            /* Solo mostrar opción de retiro cuando delivery no está disponible */
            <View style={styles.singleOptionContainer}>
              <View style={[styles.toggleOption, styles.toggleOptionActive, styles.singleOption]}>
                <View style={styles.toggleIconContainer}>
                  <Ionicons name="bag-handle" size={24} color={colors.white} />
                </View>
                <View style={styles.toggleTextContainer}>
                  <Text style={[styles.toggleLabel, styles.toggleLabelActive]}>Retiro en local</Text>
                  <Text style={[styles.toggleSubtext, styles.toggleSubtextActive]}>Gratis</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Selección de hora de retiro */}
        {deliveryType === 'retiro' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hora de retiro</Text>
            <View style={styles.pickupTimeContainer}>
              {/* Opción: Cuanto antes */}
              <TouchableOpacity
                style={[
                  styles.pickupTimeOption,
                  pickupTimeMode === 'asap' && styles.pickupTimeOptionActive,
                ]}
                onPress={() => {
                  setPickupTimeMode('asap');
                  setSelectedPickupTime(null);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.pickupTimeRadio}>
                  {pickupTimeMode === 'asap' && <View style={styles.pickupTimeRadioInner} />}
                </View>
                <View style={styles.pickupTimeInfo}>
                  <Text style={[styles.pickupTimeLabel, pickupTimeMode === 'asap' && styles.pickupTimeLabelActive]}>
                    Cuanto antes
                  </Text>
                  <Text style={styles.pickupTimeSubtext}>
                    Listo en ~{deliveryTimeEstimation?.preparacionMinutos || 15} min
                  </Text>
                </View>
                <Ionicons
                  name="flash"
                  size={20}
                  color={pickupTimeMode === 'asap' ? colors.primary : colors.gray400}
                />
              </TouchableOpacity>

              {/* Opción: Programar hora */}
              <TouchableOpacity
                style={[
                  styles.pickupTimeOption,
                  pickupTimeMode === 'scheduled' && styles.pickupTimeOptionActive,
                ]}
                onPress={() => {
                  setPickupTimeMode('scheduled');
                  setShowPickupTimePicker(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.pickupTimeRadio}>
                  {pickupTimeMode === 'scheduled' && <View style={styles.pickupTimeRadioInner} />}
                </View>
                <View style={styles.pickupTimeInfo}>
                  <Text style={[styles.pickupTimeLabel, pickupTimeMode === 'scheduled' && styles.pickupTimeLabelActive]}>
                    Programar hora
                  </Text>
                  <Text style={styles.pickupTimeSubtext}>
                    {selectedPickupTime ? `Retiro a las ${selectedPickupTime}` : 'Selecciona un horario'}
                  </Text>
                </View>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={pickupTimeMode === 'scheduled' ? colors.primary : colors.gray400}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tiempo Estimado de Entrega */}
        {deliveryTimeEstimation && (
          <View style={styles.section}>
            <View style={styles.estimationCard}>
              <View style={styles.estimationHeader}>
                <Ionicons name="time-outline" size={24} color={colors.primary} />
                <Text style={styles.estimationTitle}>Tiempo estimado</Text>
              </View>

              <View style={styles.estimationTimeContainer}>
                <Text style={styles.estimationTime}>
                  {deliveryTimeEstimation.rangoMinimo} - {deliveryTimeEstimation.rangoMaximo} min
                </Text>
                <Text style={styles.estimationSubtext}>
                  {deliveryType === 'delivery' ? 'Entrega aprox.' : 'Listo para retiro'}
                </Text>
              </View>

              {deliveryType === 'delivery' && (
                <View style={styles.estimationBreakdown}>
                  <View style={styles.breakdownItem}>
                    <Ionicons name="restaurant-outline" size={16} color={colors.gray500} />
                    <Text style={styles.breakdownText}>
                      Preparación: {deliveryTimeEstimation.preparacionMinutos} min
                    </Text>
                  </View>
                  <View style={styles.breakdownItem}>
                    <Ionicons name="bicycle-outline" size={16} color={colors.gray500} />
                    <Text style={styles.breakdownText}>
                      Entrega: {deliveryTimeEstimation.entregaMinutos} min
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Delivery Address */}
        {deliveryType === 'delivery' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dirección de entrega</Text>

            {/* Mostrar ubicación actual si hay una seleccionada */}
            {deliveryLocation && (
              <View style={styles.selectedAddressCard}>
                <View style={styles.addressIconContainer}>
                  <Ionicons name="location" size={24} color={colors.primary} />
                </View>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressText}>{address}</Text>
                  {reference && <Text style={styles.referenceText}>{reference}</Text>}
                  {shippingPrice && shippingPrice.price !== null && (
                    <View style={styles.priceRow}>
                      <Text style={styles.shippingLabel}>Envío: </Text>
                      <Text style={styles.shippingPrice}>
                        ${shippingPrice.price.toLocaleString('es-AR')}
                      </Text>
                      {shippingPrice.isEstimated && (
                        <View style={styles.estimatedChip}>
                          <Text style={styles.estimatedChipText}>Est.</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={() => setShowAddressSelector(true)}
                >
                  <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
                </TouchableOpacity>
              </View>
            )}

            {/* Selector de direcciones guardadas */}
            {!deliveryLocation && locations.length > 0 && (
              <View style={styles.savedAddressesList}>
                <Text style={styles.savedAddressesTitle}>Tus direcciones guardadas</Text>
                {locations.map((loc) => (
                  <TouchableOpacity
                    key={loc.id}
                    style={styles.savedAddressCard}
                    onPress={async () => {
                      const location: DeliveryLocation = {
                        direccion: loc.direccion,
                        lat: loc.lat,
                        lng: loc.lng,
                      };
                      setDeliveryLocation(location);
                      setAddress(loc.direccion);
                      setReference(loc.referencia || '');
                      setSelectedSavedLocation(loc);
                      await calculateDeliveryFee(location);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.savedAddressIcon}>
                      <Ionicons name="location-outline" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.savedAddressInfo}>
                      <Text style={styles.savedAddressName}>{loc.nombre}</Text>
                      <Text style={styles.savedAddressText} numberOfLines={1}>
                        {loc.direccion}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Botón para seleccionar en mapa */}

          </View>
        )}

        {/* Payment Method - Estilo Toggle Moderno */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Forma de pago</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                styles.toggleOptionLeft,
                paymentMethod === 'efectivo' && styles.toggleOptionActive,
              ]}
              onPress={() => handlePaymentMethodChange('efectivo')}
              activeOpacity={0.8}
            >
              <View style={styles.toggleIconContainer}>
                <Ionicons
                  name="cash"
                  size={24}
                  color={paymentMethod === 'efectivo' ? colors.white : colors.gray600}
                />
              </View>
              <View style={styles.toggleTextContainer}>
                <Text
                  style={[
                    styles.toggleLabel,
                    paymentMethod === 'efectivo' && styles.toggleLabelActive,
                  ]}
                >
                  Efectivo
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleOption,
                styles.toggleOptionRight,
                paymentMethod === 'transferencia' && styles.toggleOptionActive,
              ]}
              onPress={() => handlePaymentMethodChange('transferencia')}
              activeOpacity={0.8}
            >
              <View style={styles.toggleIconContainer}>
                <Ionicons
                  name="card"
                  size={24}
                  color={paymentMethod === 'transferencia' ? colors.white : colors.gray600}
                />
              </View>
              <View style={styles.toggleTextContainer}>
                <Text
                  style={[
                    styles.toggleLabel,
                    paymentMethod === 'transferencia' && styles.toggleLabelActive,
                  ]}
                >
                  Transferencia
                </Text>
              </View>
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
                style={[styles.uploadButton, !isStoreOpen && styles.uploadButtonDisabled]}
                onPress={isStoreOpen ? handlePickImage : undefined}
                activeOpacity={isStoreOpen ? 0.7 : 1}
                disabled={!isStoreOpen}
              >
                <Ionicons name="cloud-upload-outline" size={48} color={isStoreOpen ? colors.gray400 : colors.gray300} />
                <Text style={[styles.uploadButtonText, !isStoreOpen && styles.uploadButtonTextDisabled]}>
                  {isStoreOpen ? 'Subir comprobante' : 'Tienda cerrada'}
                </Text>
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
        {/* Mensaje de tienda cerrada */}
        {!isStoreOpen && (
          <View style={styles.storeClosedBanner}>
            <Ionicons name="time-outline" size={18} color={colors.warning} />
            <Text style={styles.storeClosedText}>{storeClosedMessage}</Text>
          </View>
        )}
        <Button
          title={
            !isStoreOpen
              ? 'Tienda cerrada'
              : loading
              ? 'Procesando...'
              : calculatingShipping
              ? 'Calculando envío...'
              : 'Confirmar pedido'
          }
          onPress={handleSubmitOrder}
          disabled={loading || calculatingShipping || !isStoreOpen}
          icon={loading || calculatingShipping || !isStoreOpen ? undefined : 'checkmark-circle'}
        />
        {(loading || calculatingShipping) && <ActivityIndicator style={styles.loader} color={colors.white} />}
      </View>

      {/* Location Picker Modal */}
      <SimpleLocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={handleLocationSelected}
        initialLocation={deliveryLocation ? { lat: deliveryLocation.lat, lng: deliveryLocation.lng } : undefined}
      />

      {/* Address Selector Modal */}
      <Modal
        visible={showAddressSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddressSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar dirección</Text>
              <TouchableOpacity onPress={() => setShowAddressSelector(false)}>
                <Ionicons name="close" size={24} color={colors.gray900} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {/* Lista de direcciones guardadas */}
              {locations.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  style={[
                    styles.modalAddressCard,
                    selectedSavedLocation?.id === loc.id && styles.modalAddressCardActive,
                  ]}
                  onPress={async () => {
                    const location: DeliveryLocation = {
                      direccion: loc.direccion,
                      lat: loc.lat,
                      lng: loc.lng,
                    };
                    setDeliveryLocation(location);
                    setAddress(loc.direccion);
                    setReference(loc.referencia || '');
                    setSelectedSavedLocation(loc);
                    setShowAddressSelector(false);
                    await calculateDeliveryFee(location);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalAddressIcon}>
                    <Ionicons
                      name={selectedSavedLocation?.id === loc.id ? "checkmark-circle" : "location-outline"}
                      size={24}
                      color={selectedSavedLocation?.id === loc.id ? colors.primary : colors.gray600}
                    />
                  </View>
                  <View style={styles.modalAddressInfo}>
                    <Text style={styles.modalAddressName}>{loc.nombre}</Text>
                    <Text style={styles.modalAddressText}>{loc.direccion}</Text>
                    {loc.referencia && (
                      <Text style={styles.modalAddressReference}>{loc.referencia}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {/* Botón para agregar nueva dirección */}
              <TouchableOpacity
                style={styles.addNewAddressButton}
                onPress={() => {
                  setShowAddressSelector(false);
                  setShowLocationPicker(true);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                <Text style={styles.addNewAddressText}>Agregar nueva dirección</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Pickup Time Selector Modal */}
      <Modal
        visible={showPickupTimePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPickupTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar hora de retiro</Text>
              <TouchableOpacity onPress={() => setShowPickupTimePicker(false)}>
                <Ionicons name="close" size={24} color={colors.gray900} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {availablePickupSlots.length > 0 ? (
                availablePickupSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.pickupSlotCard,
                      selectedPickupTime === slot.time && styles.pickupSlotCardActive,
                    ]}
                    onPress={() => {
                      setSelectedPickupTime(slot.time);
                      setShowPickupTimePicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.pickupSlotIcon}>
                      <Ionicons
                        name={selectedPickupTime === slot.time ? "checkmark-circle" : "time-outline"}
                        size={24}
                        color={selectedPickupTime === slot.time ? colors.primary : colors.gray600}
                      />
                    </View>
                    <Text style={[
                      styles.pickupSlotText,
                      selectedPickupTime === slot.time && styles.pickupSlotTextActive,
                    ]}>
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noSlotsContainer}>
                  <Ionicons name="time-outline" size={48} color={colors.gray400} />
                  <Text style={styles.noSlotsText}>
                    No hay horarios disponibles para hoy
                  </Text>
                  <Text style={styles.noSlotsSubtext}>
                    La tienda puede estar cerrada o el horario de atención ha terminado
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? colors.gray200 : colors.gray200,
  },

  headerTitle: {
    ...typography.h2,
    color: colors.text,
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
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },

  optionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  optionCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: isDark ? colors.gray200 : colors.gray200,
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
    backgroundColor: isDark ? colors.gray100 : colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: isDark ? colors.gray200 : colors.gray200,
    color: colors.text,
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
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: isDark ? colors.gray200 : colors.gray200,
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
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: isDark ? colors.gray200 : colors.gray300,
    borderStyle: 'dashed',
  },

  uploadButtonText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
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
    backgroundColor: colors.card,
    borderRadius: 16,
  },

  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: isDark ? colors.gray200 : colors.gray200,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  summaryLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },

  summaryValue: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
  },

  totalRow: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: isDark ? colors.gray200 : colors.gray200,
    marginTop: spacing.sm,
    marginBottom: 0,
  },

  totalLabel: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: '700',
  },

  totalValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },

  bottomContainer: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: isDark ? colors.gray200 : colors.gray200,
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
    color: colors.text,
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

  // Estilos para Toggle Moderno (Tipo de entrega y Forma de pago)
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: isDark ? colors.gray100 : colors.gray200,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },

  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    backgroundColor: 'transparent',
    gap: spacing.sm,
  },

  toggleOptionLeft: {
    // Específico para el botón izquierdo si se necesita
  },

  toggleOptionRight: {
    // Específico para el botón derecho si se necesita
  },

  toggleOptionActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  toggleIconContainer: {
    // Contenedor del ícono
  },

  toggleTextContainer: {
    alignItems: 'center',
  },

  toggleLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  toggleLabelActive: {
    color: colors.white,
  },

  toggleSubtext: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: 2,
  },

  toggleSubtextActive: {
    color: colors.white,
    opacity: 0.9,
  },

  // Estilos para dirección seleccionada
  selectedAddressCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: isDark ? colors.black : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  addressIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  addressInfo: {
    flex: 1,
  },

  addressText: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },

  referenceText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },

  shippingLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  shippingPrice: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },

  estimatedChip: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: spacing.xs,
  },

  estimatedChipText: {
    ...typography.caption,
    color: colors.accent,
    fontSize: 10,
    fontWeight: '600',
  },

  changeButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },

  // Estilos para lista de direcciones guardadas
  savedAddressesList: {
    marginBottom: spacing.md,
  },

  savedAddressesTitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },

  savedAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: isDark ? colors.gray200 : colors.gray200,
  },

  savedAddressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  savedAddressInfo: {
    flex: 1,
  },

  savedAddressName: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },

  savedAddressText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  // Estilos para Modal de selección de direcciones
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: spacing.xl,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? colors.gray200 : colors.gray200,
  },

  modalTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },

  modalScrollView: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },

  modalAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: isDark ? colors.gray200 : colors.gray200,
  },

  modalAddressCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },

  modalAddressIcon: {
    marginRight: spacing.md,
  },

  modalAddressInfo: {
    flex: 1,
  },

  modalAddressName: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },

  modalAddressText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: 2,
  },

  modalAddressReference: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },

  addNewAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },

  addNewAddressText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },

  // Estilos para estimación de tiempo
  estimationCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    shadowColor: isDark ? colors.black : colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  estimationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },

  estimationTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },

  estimationTimeContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? colors.gray200 : colors.gray200,
    marginBottom: spacing.md,
  },

  estimationTime: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },

  estimationSubtext: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },

  estimationBreakdown: {
    gap: spacing.sm,
  },

  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  breakdownText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },

  // Estilos para delivery no disponible
  deliveryUnavailableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },

  deliveryUnavailableText: {
    ...typography.bodySmall,
    color: colors.warning,
    flex: 1,
    fontWeight: '500',
  },

  // Estilos para opción única (solo retiro)
  singleOptionContainer: {
    // Contenedor para la opción única
  },

  singleOption: {
    borderRadius: 12,
    width: '100%',
  },

  // Estilos para selección de hora de retiro
  pickupTimeContainer: {
    gap: spacing.sm,
  },

  pickupTimeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: isDark ? colors.gray200 : colors.gray200,
    gap: spacing.md,
  },

  pickupTimeOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },

  pickupTimeRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.gray400,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pickupTimeRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },

  pickupTimeInfo: {
    flex: 1,
  },

  pickupTimeLabel: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
  },

  pickupTimeLabelActive: {
    color: colors.primary,
  },

  pickupTimeSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Estilos para modal de selección de hora
  pickupSlotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: isDark ? colors.gray200 : colors.gray200,
    gap: spacing.md,
  },

  pickupSlotCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },

  pickupSlotIcon: {
    // Contenedor del icono
  },

  pickupSlotText: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },

  pickupSlotTextActive: {
    color: colors.primary,
  },

  noSlotsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },

  noSlotsText: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.md,
    textAlign: 'center',
  },

  noSlotsSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  // Estilos para botón de subir comprobante deshabilitado
  uploadButtonDisabled: {
    backgroundColor: colors.gray100,
    borderColor: colors.gray300,
  },

  uploadButtonTextDisabled: {
    color: colors.gray400,
  },

  // Estilos para banner de tienda cerrada
  storeClosedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warning + '15',
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },

  storeClosedText: {
    ...typography.bodySmall,
    color: colors.warning,
    fontWeight: '600',
  },
});

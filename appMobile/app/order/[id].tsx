/**
 * Order Detail Screen - Compact & Subtle Design
 * Vista compacta y moderna del pedido con mapa integrado
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import  {MapView,Marker, PROVIDER_GOOGLE, MapFallback } from '../../src/components/common/MapViewUniversal';
import { orderService } from '../../src/services/order.service';
import { PedidoWithDetails, OrderStatus } from '../../src/types/order';
import { DeliveryTrackingMap } from '../../src/components/orders/DeliveryTrackingMap';
import { OrderStatusTimeline } from '../../src/components/orders/OrderStatusTimeline';
import { useWebSocket } from '../../src/hooks/useWebSocket';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { textStyles as typography } from '../../src/theme/typography';

import { Platform } from 'react-native';
const { width } = Dimensions.get('window');

interface MapData {
  empresa: { latitud: number; longitud: number; name: string };
  cliente: { latitud: number; longitud: number };
  repartidor?: { latitud: number; longitud: number; nombre?: string };
}

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  pendiente_confirmacion: { label: 'Esperando confirmación', icon: 'time-outline', color: '#F26B1D' },
  confirmado: { label: 'Confirmado', icon: 'checkmark-circle', color: '#2E9D66' },
  en_proceso: { label: 'En preparación', icon: 'restaurant', color: '#007ACC' },
  esperando_delivery: { label: 'Buscando repartidor', icon: 'bicycle-outline', color: '#F26B1D' },
  en_camino: { label: 'En camino', icon: 'bicycle', color: '#0A2A43' },
  entregado: { label: 'Entregado', icon: 'checkmark-done-circle', color: '#2E9D66' },
  esperando_retiro: { label: 'Listo para retiro', icon: 'storefront', color: '#2E9D66' },
  no_confirmado: { label: 'No confirmado', icon: 'close-circle', color: '#DC2626' },
  cancelado: { label: 'Cancelado', icon: 'ban', color: '#737373' },
};

export default function OrderDetailScreen() {
    if (Platform.OS === 'web') return <MapFallback />;
  const { id, showMap } = useLocalSearchParams<{ id: string; showMap?: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<PedidoWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapVisible, setMapVisible] = useState(showMap === 'true');
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [mapExpanded, setMapExpanded] = useState(false);

  const { on, off, isConnected } = useWebSocket({ autoConnect: true });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (order && !loading) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, [order, loading]);

  useEffect(() => {
    if (order && order.estado === 'en_camino' && order.tipoEntrega === 'delivery') {
      fetchMapData();
    }
  }, [order]);

  useEffect(() => {
    if (!isConnected || !order || order.estado !== 'en_camino') return;

    const handleUbicacionActualizada = (data: any) => {
      if (data.pedidoId === id) {
        const lat = parseFloat(data.latitud);
        const lng = parseFloat(data.longitud);
        if (!isNaN(lat) && !isNaN(lng)) {
          setMapData((prev) => prev ? { ...prev, repartidor: { latitud: lat, longitud: lng, nombre: prev.repartidor?.nombre } } : null);
        }
      }
    };

    on('ubicacion_repartidor_actualizada', handleUbicacionActualizada);
    return () => off('ubicacion_repartidor_actualizada', handleUbicacionActualizada);
  }, [isConnected, order, id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrderById(id);
      console.log('📦 Order data:', JSON.stringify(data, null, 2));
      setOrder(data);
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.message || 'No se pudo cargar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const fetchMapData = async () => {
    try {
      const data = await orderService.getMapData(id);
      console.log('🗺️ Map data:', data);
      setMapData(data);
    } catch (err: any) {
      console.error('Error fetching map data:', err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.navbar}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
            style={styles.navbarGradient}
          >
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <View style={styles.backIconContainer}>
                <Ionicons name="arrow-back" size={20} color={colors.primary} />
              </View>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={styles.orderBadge}>
                <View style={styles.orderIconContainer}>
                  <Ionicons name="receipt" size={18} color={colors.primary} />
                </View>
                <View style={styles.orderTextContainer}>
                  <Text style={styles.orderLabel}>PEDIDO</Text>
                  <Text style={styles.orderTitle}>Cargando...</Text>
                </View>
              </View>
            </View>
            <View style={{ width: 40 }} />
          </LinearGradient>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.navbar}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
            style={styles.navbarGradient}
          >
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <View style={styles.backIconContainer}>
                <Ionicons name="arrow-back" size={20} color={colors.primary} />
              </View>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={styles.orderBadge}>
                <View style={styles.orderIconContainer}>
                  <Ionicons name="receipt" size={18} color={colors.primary} />
                </View>
                <View style={styles.orderTextContainer}>
                  <Text style={styles.orderLabel}>PEDIDO</Text>
                  <Text style={styles.orderTitle}>Error</Text>
                </View>
              </View>
            </View>
            <View style={{ width: 40 }} />
          </LinearGradient>
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error || 'Pedido no encontrado'}</Text>
          <TouchableOpacity onPress={fetchOrder} style={styles.button}>
            <Text style={styles.buttonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.estado];
  const formatDate = (date: string | Date) => new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Modern Glass Header */}
      <View style={styles.navbar}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          style={styles.navbarGradient}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <View style={styles.backIconContainer}>
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
            </View>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.orderBadge}>
              <View style={styles.orderIconContainer}>
                <Ionicons name="receipt" size={18} color={colors.primary} />
              </View>
              <View style={styles.orderTextContainer}>
                <Text style={styles.orderLabel}>PEDIDO</Text>
                <Text style={styles.orderTitle}>#{order.id.slice(0, 8).toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <View style={{ width: 40 }} />
        </LinearGradient>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Status Header Compacto */}
          <View style={[styles.statusHeader, { backgroundColor: statusConfig.color }]}>
            <View style={styles.statusRow}>
              <Ionicons name={statusConfig.icon} size={28} color={colors.white} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>{statusConfig.label}</Text>
                <Text style={styles.statusDate}>{formatDate(order.createdAt)}</Text>
              </View>
            </View>
          </View>

          {/* Timeline Animado */}
          <View style={styles.card}>
            <OrderStatusTimeline
              currentStatus={order.estado}
              tipoEntrega={order.tipoEntrega}
            />
          </View>

          {/* Mapa Integrado - Solo si está en camino */}
          {showMap && (
            <TouchableOpacity
              style={styles.mapCard}
              onPress={() => setMapExpanded(!mapExpanded)}
              activeOpacity={0.9}
            >
              <View style={styles.mapHeader}>
                <View style={styles.mapHeaderLeft}>
                  <Ionicons name="navigate" size={18} color={colors.primary} />
                  <Text style={styles.mapTitle}>Seguimiento en vivo</Text>
                  {isConnected && <View style={styles.liveDot} />}
                </View>
                <Ionicons name={mapExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.gray600} />
              </View>

              {mapExpanded && mapData && (
                <View style={styles.mapContainer}>
                  <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={{
                      latitude: (mapData.cliente.latitud + mapData.empresa.latitud) / 2,
                      longitude: (mapData.cliente.longitud + mapData.empresa.longitud) / 2,
                      latitudeDelta: Math.abs(mapData.cliente.latitud - mapData.empresa.latitud) * 2 || 0.02,
                      longitudeDelta: Math.abs(mapData.cliente.longitud - mapData.empresa.longitud) * 2 || 0.02,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                  >
                    <Marker coordinate={{ latitude: mapData.empresa.latitud, longitude: mapData.empresa.longitud }} pinColor={colors.primary} />
                    <Marker coordinate={{ latitude: mapData.cliente.latitud, longitude: mapData.cliente.longitud }} pinColor={colors.secondary} />
                    {mapData.repartidor && <Marker coordinate={{ latitude: mapData.repartidor.latitud, longitude: mapData.repartidor.longitud }} pinColor={colors.orange} />}
                  </MapView>
                  <TouchableOpacity style={styles.fullMapBtn} onPress={() => setMapVisible(true)}>
                    <Ionicons name="expand" size={16} color={colors.white} />
                    <Text style={styles.fullMapText}>Ver mapa completo</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Empresa */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="storefront" size={18} color={colors.gray700} />
              <Text style={styles.cardTitle}>Empresa</Text>
            </View>
            <View style={styles.companyRow}>
              {order.empresa?.logo ? (
                <Image source={{ uri: order.empresa.logo }} style={styles.logo} />
              ) : (
                <View style={[styles.logo, styles.logoPlaceholder]}>
                  <Ionicons name="business" size={20} color={colors.gray400} />
                </View>
              )}
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{order.empresa?.name || 'Empresa'}</Text>
                {order.empresa?.address && (
                  <View style={styles.row}>
                    <Ionicons name="location" size={12} color={colors.gray500} />
                    <Text style={styles.companyAddress}>{order.empresa.address}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Productos */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="cart" size={18} color={colors.gray700} />
              <Text style={styles.cardTitle}>Productos ({order.items?.length || 0})</Text>
            </View>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <View key={index} style={[styles.productRow, index < order.items!.length - 1 && styles.productBorder]}>
                  <View style={styles.qtyBadge}>
                    <Text style={styles.qtyText}>{item.cantidad}</Text>
                  </View>
                  <Text style={styles.productName} numberOfLines={2}>{item.producto?.name || 'Producto'}</Text>
                  <Text style={styles.productPrice}>${((item.precioUnitario || item.precio) * item.cantidad).toFixed(2)}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No hay productos</Text>
            )}
          </View>

          {/* Entrega */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name={order.tipoEntrega === 'delivery' ? 'bicycle' : 'bag-handle'} size={18} color={colors.gray700} />
              <Text style={styles.cardTitle}>Entrega</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Método</Text>
              <Text style={styles.infoValue}>{order.tipoEntrega === 'delivery' ? 'Delivery' : 'Retiro en local'}</Text>
            </View>
            {order.direccionEntrega && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Dirección</Text>
                <Text style={styles.infoValue}>{order.direccionEntrega}</Text>
              </View>
            )}
          </View>

          {/* Pago y Resumen */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="card" size={18} color={colors.gray700} />
              <Text style={styles.cardTitle}>Pago</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Método</Text>
              <Text style={styles.infoValue}>{(order.metodoPago || order.formaPago) === 'efectivo' ? 'Efectivo' : 'Transferencia'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Subtotal</Text>
              <Text style={styles.infoValue}>${order.subtotal.toFixed(2)}</Text>
            </View>
            {order.costoEnvio > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Envío</Text>
                <Text style={styles.infoValue}>${order.costoEnvio.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
            </View>
          </View>

          {order.notas && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="document-text" size={18} color={colors.gray700} />
                <Text style={styles.cardTitle}>Notas</Text>
              </View>
              <Text style={styles.notesText}>{order.notas}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <DeliveryTrackingMap pedidoId={id} visible={mapVisible} onClose={() => setMapVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },

  // Modern Glass Navbar
  navbar: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  navbarGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  orderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  orderIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderTextContainer: {
    gap: 0,
  },
  orderLabel: {
    ...typography.caption2,
    fontSize: 9,
    fontWeight: '700',
    color: colors.gray600,
    letterSpacing: 0.5,
  },
  orderTitle: {
    ...typography.bodySmall,
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray900,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing['2xl'] },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },

  card: { backgroundColor: colors.white, borderRadius: 16, padding: spacing.md, marginBottom: spacing.md, shadowColor: colors.shadowColor, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  cardTitle: { ...typography.bodyMedium, fontWeight: '700', color: colors.gray900 },

  statusHeader: { borderRadius: 16, padding: spacing.md, marginBottom: spacing.md, shadowColor: colors.shadowColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statusInfo: { flex: 1 },
  statusLabel: { ...typography.h3, fontSize: 18, color: colors.white, fontWeight: '700' },
  statusDate: { ...typography.caption1, color: 'rgba(255,255,255,0.9)', marginTop: 2 },

  mapCard: { backgroundColor: colors.white, borderRadius: 16, padding: spacing.md, marginBottom: spacing.md, shadowColor: colors.shadowColor, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  mapHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mapHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  mapTitle: { ...typography.bodyMedium, fontWeight: '700', color: colors.gray900 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  mapContainer: { marginTop: spacing.md, borderRadius: 12, overflow: 'hidden', height: 200 },
  map: { flex: 1 },
  fullMapBtn: { position: 'absolute', bottom: spacing.sm, right: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: 8 },
  fullMapText: { ...typography.caption2, color: colors.white, fontWeight: '600' },

  companyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: { width: 48, height: 48, borderRadius: 12 },
  logoPlaceholder: { backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  companyInfo: { flex: 1 },
  companyName: { ...typography.bodyMedium, fontWeight: '700', color: colors.gray900, marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  companyAddress: { ...typography.caption1, color: colors.gray600, flex: 1 },

  productRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  productBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  qtyBadge: { width: 24, height: 24, borderRadius: 6, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  qtyText: { ...typography.caption2, color: colors.white, fontWeight: '700' },
  productName: { ...typography.bodySmall, color: colors.gray900, flex: 1 },
  productPrice: { ...typography.bodyMedium, fontWeight: '700', color: colors.gray900 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  infoLabel: { ...typography.caption1, color: colors.gray600, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { ...typography.bodySmall, color: colors.gray900, fontWeight: '600', flex: 1, textAlign: 'right' },

  divider: { height: 1, backgroundColor: colors.gray100, marginVertical: spacing.xs },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.xs, marginTop: spacing.xs, borderTopWidth: 2, borderTopColor: colors.gray200 },
  totalLabel: { ...typography.bodyLarge, fontWeight: '700', color: colors.gray900 },
  totalValue: { ...typography.h3, fontWeight: '800', color: colors.primary },

  notesText: { ...typography.bodySmall, color: colors.gray700, lineHeight: 20 },
  emptyText: { ...typography.bodySmall, color: colors.gray500, textAlign: 'center', paddingVertical: spacing.md },

  errorText: { ...typography.bodyMedium, color: colors.gray600, textAlign: 'center' },
  button: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.primary, borderRadius: 12, marginTop: spacing.md },
  buttonText: { ...typography.bodyMedium, color: colors.white, fontWeight: '600' },
});

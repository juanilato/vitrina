/**
 * Company Store Screen - Premium Redesign
 * Experiencia premium con diseño moderno tipo Airbnb/Apple
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { usePublicCompanyStore } from '../../src/hooks/usePublicCompanyStore';
import { useCart } from '../../src/contexts/CartContext';
import { CategoryLoader } from '../../src/components/categories';
import { useTheme } from '../../src/contexts/ThemeContext';
import { normalize } from '../../src/utils/responsive';
import ratingService from '../../src/services/rating.service';
import { Product, Agregado, Promocion } from '../../src/types/company';
import { CartIngredienteExtra } from '../../src/types/cart';
import { ProductModal } from '../../src/components/products/ProductModal';
import { FloatingCartButton } from '../../src/components/cart/FloatingCartButton';
import { Toast } from '../../src/components/common';
import { getActivePromociones, isPromocionActiveNow, getPromoScheduleText } from '../../src/utils/promotions';
import * as Linking from 'expo-linking';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CompanyStoreScreen() {
  const { companyName } = useLocalSearchParams<{ companyName: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const { company, loading, error, refreshing, refresh } = usePublicCompanyStore(companyName);
  const { addItem } = useCart();

  const [companyRating, setCompanyRating] = useState<{ promedio: number; totalValoraciones: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [businessHoursExpanded, setBusinessHoursExpanded] = useState(false);
  const [socialLinksExpanded, setSocialLinksExpanded] = useState(false);
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false);
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const businessHoursAnimation = React.useRef(new Animated.Value(0)).current;
  const socialLinksAnimation = React.useRef(new Animated.Value(0)).current;
  const scrollViewRef = React.useRef<any>(null);
  const businessHoursRef = React.useRef<any>(null);
  const socialLinksRef = React.useRef<any>(null);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const buttonColor = useMemo(
    () => company?.preferenciasWeb?.colorBotones || colors.primary,
    [company, colors.primary]
  );

  // Función para verificar si está abierto ahora
  const isOpenNow = React.useMemo(() => {
    const horarios = company?.preferenciasWeb?.horarios;
    if (!horarios || horarios.length === 0) return true; // Si no hay horarios, asumimos abierto

    const now = new Date();
    const currentDayIndex = now.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    const dayMap = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
    const currentDay = dayMap[currentDayIndex];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Filtrar horarios del día actual
    const todaySchedules = horarios.filter(h => h.day === currentDay && !h.cerrado);

    // Verificar si está dentro de algún horario
    for (const schedule of todaySchedules) {
      if (schedule.cierraMin > 1440) {
        // Cruza medianoche
        if (currentMinutes >= schedule.abreMin || currentMinutes <= (schedule.cierraMin - 1440)) {
          return true;
        }
      } else {
        // Horario normal
        if (currentMinutes >= schedule.abreMin && currentMinutes <= schedule.cierraMin) {
          return true;
        }
      }
    }

    // También verificar si es continuación del día anterior
    const prevDayIndex = (currentDayIndex - 1 + 7) % 7;
    const prevDay = dayMap[prevDayIndex];
    const yesterdaySchedules = horarios.filter(h => h.day === prevDay && !h.cerrado);

    for (const schedule of yesterdaySchedules) {
      if (schedule.cierraMin > 1440) {
        const remainingMinutes = schedule.cierraMin - 1440;
        if (currentMinutes <= remainingMinutes) {
          return true;
        }
      }
    }

    return false;
  }, [company?.preferenciasWeb?.horarios]);

  // Cargar rating
  useEffect(() => {
    if (company?.id) {
      ratingService.getCompanyAverage(company.id)
        .then((data) => {
          if (data.totalValoraciones > 0) {
            setCompanyRating(data);
          }
        })
        .catch(console.error);
    }
  }, [company?.id]);

  // Animación para business hours
  useEffect(() => {
    Animated.timing(businessHoursAnimation, {
      toValue: businessHoursExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [businessHoursExpanded]);

  // Animación para social links
  useEffect(() => {
    Animated.timing(socialLinksAnimation, {
      toValue: socialLinksExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [socialLinksExpanded]);

  // Filtrar productos por búsqueda y categoría
  const filteredProducts = useMemo(() => {
    let allProducts = company?.products || [];

    // Filtrar por categoría si hay una seleccionada
    if (selectedCategory) {
      allProducts = allProducts.filter((product) =>
        product.categorias?.some((catRelation) => catRelation.categoria.id === selectedCategory)
      );
    }

    // Filtrar solo productos activos
    allProducts = allProducts.filter(p => p.activo);

    // Filtrar por búsqueda si hay texto
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      allProducts = allProducts.filter((product) =>
        product.nombre.toLowerCase().includes(query) ||
        product.descripcion?.toLowerCase().includes(query)
      );
    }

    return allProducts;
  }, [company?.products, selectedCategory, searchQuery]);

  // Obtener categorías únicas
  const categories = useMemo(() => {
    if (!company?.products) return [];
    const catMap = new Map();
    company.products.forEach(product => {
      product.categorias?.forEach(catRel => {
        if (!catMap.has(catRel.categoria.id)) {
          catMap.set(catRel.categoria.id, catRel.categoria);
        }
      });
    });
    return Array.from(catMap.values()).sort((a, b) => a.orden - b.orden);
  }, [company?.products]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Funciones para manejar productos y carrito
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleQuickAddToCart = (product: Product) => {
    if (!company) return;

    if (!product.activo) {
      showToast('Este producto no está disponible en este momento', 'warning');
      return;
    }

    // Si tiene agregados o ingredientes extras, abrir modal
    const hasAgregados = product.agregados && product.agregados.filter((a) => a.activo).length > 0;
    const hasIngredientesExtras = product.ingredientes && product.ingredientes.filter((pi) => pi.esExtraPermitido).length > 0;

    if (hasAgregados || hasIngredientesExtras) {
      handleProductPress(product);
      return;
    }

    // Agregar directo sin agregados ni ingredientes extras
    addItem(product, company.id, company.name, 1);
    showToast(`${product.nombre} se agregó al carrito`, 'success');
  };

  const handleAddToCartFromModal = (
    quantity: number,
    selectedAgregados: Agregado[],
    notes: string,
    ingredientesExtras?: CartIngredienteExtra[]
  ) => {
    if (!company || !selectedProduct) return;

    addItem(selectedProduct, company.id, company.name, quantity, selectedAgregados, notes, ingredientesExtras);
    showToast(`${selectedProduct.nombre} se agregó al carrito`, 'success');
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <CategoryLoader
        categoryName={company?.categoria?.nombre || 'Cargando'}
        categoryIcon={company?.categoria?.icono}
        isVisible={true}
      />
    );
  }

  // Error state
  if (error || !company) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.errorContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.errorContent}>
            <View style={styles.errorIcon}>
              <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
            </View>
            <Text style={styles.errorTitle}>No pudimos cargar la tienda</Text>
            <Text style={styles.errorMessage}>{error || 'Intenta nuevamente'}</Text>
            <TouchableOpacity onPress={refresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header flotante con blur */}
      <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity }]}>
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.headerBlur}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                <Ionicons name="arrow-back" size={22} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>{company.name}</Text>

              {/* Botón de menú con opciones */}
              {(company.preferenciasWeb?.horarios?.length || company.redesSociales?.length) ? (
                <TouchableOpacity
                  onPress={() => setHeaderMenuVisible(!headerMenuVisible)}
                  style={styles.headerButton}
                >
                  <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
                </TouchableOpacity>
              ) : (
                <View style={styles.headerButton} />
              )}
            </View>

            {/* Menú desplegable */}
            {headerMenuVisible && (
              <Animated.View style={styles.headerMenu}>
                {company.preferenciasWeb?.horarios && company.preferenciasWeb.horarios.length > 0 && (
                  <TouchableOpacity
                    style={styles.headerMenuItem}
                    onPress={() => {
                      setHeaderMenuVisible(false);
                      setBusinessHoursExpanded(true);
                      // Scroll suave hacia la sección de horarios
                      setTimeout(() => {
                        businessHoursRef.current?.measureLayout(
                          scrollViewRef.current?.getScrollableNode?.() || scrollViewRef.current,
                          (x: number, y: number) => {
                            scrollViewRef.current?.scrollTo({
                              y: y - 100,
                              animated: true,
                            });
                          },
                          () => {}
                        );
                      }, 100);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.headerMenuIconCircle, { backgroundColor: `${buttonColor}15` }]}>
                      <Ionicons name="time-outline" size={18} color={buttonColor} />
                    </View>
                    <Text style={styles.headerMenuText}>Horarios</Text>
                  </TouchableOpacity>
                )}

                {company.redesSociales && company.redesSociales.length > 0 && (
                  <TouchableOpacity
                    style={styles.headerMenuItem}
                    onPress={() => {
                      setHeaderMenuVisible(false);
                      setSocialLinksExpanded(true);
                      // Scroll suave hacia la sección de redes sociales
                      setTimeout(() => {
                        socialLinksRef.current?.measureLayout(
                          scrollViewRef.current?.getScrollableNode?.() || scrollViewRef.current,
                          (x: number, y: number) => {
                            scrollViewRef.current?.scrollTo({
                              y: y - 100,
                              animated: true,
                            });
                          },
                          () => {}
                        );
                      }, 100);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.headerMenuIconCircle, { backgroundColor: `${buttonColor}15` }]}>
                      <Ionicons name="share-social-outline" size={18} color={buttonColor} />
                    </View>
                    <Text style={styles.headerMenuText}>Redes sociales</Text>
                  </TouchableOpacity>
                )}
              </Animated.View>
            )}
          </SafeAreaView>
        </BlurView>
      </Animated.View>

      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section - Premium */}
        <View style={styles.hero}>
          {/* Background Image */}
          {company.preferenciasWeb?.dashboardFoto && (
            <Image
              source={{ uri: company.preferenciasWeb.dashboardFoto }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          )}

          {/* Gradient Overlay */}
          <LinearGradient
            colors={[
              'rgba(0,0,0,0.3)',
              'rgba(0,0,0,0.1)',
              isDark ? 'rgba(10, 42, 67, 0.95)' : 'rgba(255,255,255,0.95)',
            ]}
            style={styles.heroGradient}
          />

          {/* Back Button */}
          <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHero}>
              <BlurView intensity={50} tint="dark" style={styles.backButtonBlur}>
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              </BlurView>
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Company Info Card - Flotante sobre el hero */}
        <View style={styles.companyCard}>
          {/* Avatar Grande */}
          <View style={styles.avatarContainer}>
            {company.logo ? (
              <Image source={{ uri: company.logo }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={[buttonColor, `${buttonColor}CC`]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {company.name?.slice(0, 2)?.toUpperCase() ?? 'E'}
                </Text>
              </LinearGradient>
            )}

            {/* Rating Badge */}
            {companyRating && companyRating.totalValoraciones > 0 && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingBadgeText}>
                  {companyRating.promedio.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          {/* Info */}
          <View style={styles.companyInfo}>
            <Text style={styles.companyName} numberOfLines={2}>{company.name}</Text>

            {company.description && (
              <Text style={styles.companyDescription} numberOfLines={2}>
                {company.description}
              </Text>
            )}

            {/* Stats Row */}
            <View style={styles.statsRow}>
              {companyRating && (
                <View style={styles.stat}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.statText}>
                    {companyRating.promedio.toFixed(1)} ({companyRating.totalValoraciones})
                  </Text>
                </View>
              )}
            </View>

            {/* Status Pills - Abierto/Cerrado y Delivery */}
            {(company.preferenciasWeb?.horarios?.length || company.preferenciasWeb?.envioDomicilio) && (
              <View style={styles.statusPillsRow}>
                {company.preferenciasWeb?.horarios && company.preferenciasWeb.horarios.length > 0 && (
                  <View style={[
                    styles.statusPill,
                    { backgroundColor: isOpenNow ? `${buttonColor}15` : '#FEE2E2' }
                  ]}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: isOpenNow ? buttonColor : '#EF4444' }
                    ]} />
                    <Text style={[
                      styles.statusPillText,
                      { color: isOpenNow ? buttonColor : '#DC2626' }
                    ]}>
                      {isOpenNow ? 'Abierto ahora' : 'Cerrado'}
                    </Text>
                  </View>
                )}

                {company.preferenciasWeb?.envioDomicilio && (
                  <View style={[styles.statusPill, { backgroundColor: `${buttonColor}15` }]}>
                    <Ionicons name="bicycle" size={14} color={buttonColor} />
                    <Text style={[styles.statusPillText, { color: buttonColor }]}>
                      Delivery disponible
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Business Hours - Premium Collapsible */}
          {company.preferenciasWeb?.horarios && company.preferenciasWeb.horarios.length > 0 && (
            <View ref={businessHoursRef} style={styles.businessHoursPremium}>
              <TouchableOpacity
                style={styles.businessHoursHeaderPremium}
                onPress={() => setBusinessHoursExpanded(!businessHoursExpanded)}
                activeOpacity={0.7}
              >
                <View style={styles.businessHoursHeaderLeft}>
                  <View style={[styles.iconCirclePremium, { backgroundColor: `${buttonColor}15` }]}>
                    <Ionicons name="time-outline" size={16} color={buttonColor} />
                  </View>
                  <Text style={styles.businessHoursTitlePremium}>Horarios de atención</Text>
                </View>
                <Ionicons
                  name={businessHoursExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.hoursGridContainer,
                  {
                    maxHeight: businessHoursAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 500],
                    }),
                    opacity: businessHoursAnimation,
                  },
                ]}
              >
                <View style={styles.hoursGrid}>
                  {(() => {
                    const horarios = company.preferenciasWeb.horarios!;
                    const diasLabels: Record<string, string> = {
                      'LUN': 'Lun',
                      'MAR': 'Mar',
                      'MIE': 'Mié',
                      'JUE': 'Jue',
                      'VIE': 'Vie',
                      'SAB': 'Sáb',
                      'DOM': 'Dom',
                    };

                    const formatTime = (minutes: number): string => {
                      const hours = Math.floor(minutes / 60);
                      const mins = minutes % 60;
                      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                    };

                    // Combinar horarios que cruzan medianoche (lógica del BusinessHours original)
                    const grouped = horarios.reduce((acc, h) => {
                      if (!acc[h.day]) acc[h.day] = [];
                      acc[h.day].push(h);
                      return acc;
                    }, {} as Record<string, typeof horarios>);

                    const dias = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
                    const processedIds = new Set<number>();
                    const currentDayIndex = new Date().getDay();
                    const currentDayMap = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
                    const currentDay = currentDayMap[currentDayIndex];

                    const result: Array<{ dia: string; ranges: string; isToday: boolean }> = [];

                    for (let i = 0; i < dias.length; i++) {
                      const dia = dias[i];
                      const dayHorarios = (grouped[dia] || []).sort((a, b) => a.slotIndex - b.slotIndex);
                      const prevDay = dias[(i - 1 + 7) % 7];
                      const prevDayHorarios = grouped[prevDay] || [];
                      const displaySlots: Array<{ abreMin: number; cierraMin: number }> = [];

                      for (const h of dayHorarios) {
                        if (processedIds.has(h.id) || h.cerrado) continue;

                        // Caso 1: Empieza a medianoche (puede ser continuación del día anterior)
                        if (h.abreMin === 0) {
                          const prevNightSlot = prevDayHorarios
                            .filter(p => !p.cerrado && p.cierraMin > 1380)
                            .sort((a, b) => b.slotIndex - a.slotIndex)[0];

                          if (prevNightSlot && prevNightSlot.cierraMin === 1440) {
                            // Es continuación, mostrar en día anterior
                            processedIds.add(h.id);
                            continue;
                          }
                        }

                        // Caso 2: Termina después de medianoche (cruza al día siguiente)
                        if (h.cierraMin > 1440) {
                          displaySlots.push({ abreMin: h.abreMin, cierraMin: h.cierraMin });
                          processedIds.add(h.id);
                        }
                        // Caso 3: Slot normal del día
                        else {
                          displaySlots.push({ abreMin: h.abreMin, cierraMin: h.cierraMin });
                          processedIds.add(h.id);
                        }
                      }

                      const isToday = dia === currentDay;

                      if (displaySlots.length === 0) {
                        result.push({
                          dia: diasLabels[dia],
                          ranges: 'Cerrado',
                          isToday,
                        });
                      } else {
                        const timeRanges = displaySlots
                          .map(slot => {
                            const abreHoras = formatTime(slot.abreMin);
                            // Si cierra después de medianoche, mostrar hora del día siguiente
                            const cierraHoras = slot.cierraMin > 1440
                              ? formatTime(slot.cierraMin - 1440)
                              : formatTime(slot.cierraMin);
                            return `${abreHoras}-${cierraHoras}`;
                          })
                          .join(', ');

                        result.push({
                          dia: diasLabels[dia],
                          ranges: timeRanges,
                          isToday,
                        });
                      }
                    }

                    return result.map((item, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.hourRow,
                          item.isToday && { backgroundColor: `${buttonColor}08` },
                        ]}
                      >
                        <Text style={[styles.dayText, item.isToday && { color: buttonColor, fontWeight: '600' }]}>
                          {item.dia}
                        </Text>
                        <Text
                          style={item.ranges === 'Cerrado' ? styles.closedText : styles.timeText}
                          numberOfLines={1}
                        >
                          {item.ranges}
                        </Text>
                      </View>
                    ));
                  })()}
                </View>
              </Animated.View>
            </View>
          )}

          {/* Social Links - Premium Collapsible */}
          {company.redesSociales && company.redesSociales.length > 0 && (
            <View ref={socialLinksRef} style={styles.socialLinksPremium}>
              <TouchableOpacity
                style={styles.socialHeaderPremium}
                onPress={() => setSocialLinksExpanded(!socialLinksExpanded)}
                activeOpacity={0.7}
              >
                <View style={styles.businessHoursHeaderLeft}>
                  <View style={[styles.iconCirclePremium, { backgroundColor: `${buttonColor}15` }]}>
                    <Ionicons name="share-social-outline" size={16} color={buttonColor} />
                  </View>
                  <Text style={styles.socialTitlePremium}>Redes sociales</Text>
                </View>
                <Ionicons
                  name={socialLinksExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.socialGridContainer,
                  {
                    maxHeight: socialLinksAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 300],
                    }),
                    opacity: socialLinksAnimation,
                  },
                ]}
              >
                <View style={styles.socialGrid}>
                  {company.redesSociales.map((social, index) => {
                    const iconMap: { [key: string]: string } = {
                      'facebook': 'logo-facebook',
                      'instagram': 'logo-instagram',
                      'twitter': 'logo-twitter',
                      'x': 'logo-twitter',
                      'whatsapp': 'logo-whatsapp',
                      'youtube': 'logo-youtube',
                      'tiktok': 'logo-tiktok',
                      'linkedin': 'logo-linkedin',
                      'web': 'globe-outline',
                      'website': 'globe-outline',
                    };

                    const platformKey = social.key?.toLowerCase() || social.label?.toLowerCase() || '';
                    const iconName = iconMap[platformKey] || 'globe-outline';
                    const displayName = social.label || social.key || 'Link';

                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.socialButton}
                        onPress={() => {
                          if (social.value) {
                            Linking.openURL(social.value).catch(err => console.error('Error opening URL:', err));
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <LinearGradient
                          colors={[`${buttonColor}12`, `${buttonColor}06`]}
                          style={styles.socialButtonGradient}
                        >
                          <Ionicons name={iconName as any} size={20} color={buttonColor} />
                          <Text style={styles.socialButtonText} numberOfLines={1}>
                            {displayName}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>
            </View>
          )}
        </View>

        {/* Search Bar - Premium */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.gray500} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar productos..."
              placeholderTextColor={colors.gray500}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={colors.gray400} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Promotions Section - Compact Pills */}
        {(() => {
          const activePromos = company.promociones ? getActivePromociones(company.promociones as Promocion[]) : [];
          if (activePromos.length === 0) return null;

          return (
            <View style={styles.promotionsSectionNew}>
              <View style={styles.promotionsHeaderNew}>
                <View style={[styles.iconCirclePremium, { backgroundColor: `${buttonColor}15` }]}>
                  <Ionicons name="pricetag" size={14} color={buttonColor} />
                </View>
                <Text style={styles.promotionsTitleNew}>Ofertas activas</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.promosScrollNew}
              >
                {activePromos.map((promo) => {
                  // Calcular descuento
                  let discountText = '';
                  if (promo.tipo === 'CANTIDAD' && promo.configuracion?.porcentajeDescuento) {
                    discountText = `-${promo.configuracion.porcentajeDescuento}%`;
                  } else if (promo.tipo === 'BXPY') {
                    const cantCompra = promo.configuracion?.cantidadCompra || 0;
                    const cantPaga = promo.configuracion?.cantidadPaga || 0;
                    if (cantCompra && cantPaga) {
                      discountText = `${cantCompra}x${cantPaga}`;
                    }
                  }

                  return (
                    <View key={promo.id} style={styles.promoCardCompact}>
                      <LinearGradient
                        colors={[`${buttonColor}15`, `${buttonColor}08`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.promoCardCompactGradient}
                      >
                        {/* Icono + Badge */}
                        <View style={styles.promoCompactLeft}>
                          <View style={[styles.promoIconCompact, { backgroundColor: buttonColor }]}>
                            <Ionicons
                              name={promo.tipo === 'BXPY' ? 'gift' : 'flash'}
                              size={16}
                              color="#FFFFFF"
                            />
                          </View>
                          {discountText && (
                            <View style={[styles.discountBadgeCompact, { backgroundColor: buttonColor }]}>
                              <Text style={styles.discountBadgeTextCompact}>{discountText}</Text>
                            </View>
                          )}
                        </View>

                        {/* Contenido */}
                        <View style={styles.promoCompactContent}>
                          <Text style={styles.promoNameCompact} numberOfLines={1}>
                            {promo.nombre}
                          </Text>
                          <View style={styles.promoCompactFooter}>
                            <Feather name="clock" size={10} color={colors.textSecondary} />
                            <Text style={styles.promoScheduleCompact} numberOfLines={1}>
                              {getPromoScheduleText(promo.configuracion)}
                            </Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          );
        })()}

        {/* Categories Filter - Horizontal Scroll */}
        {categories.length > 0 && (
          <View style={styles.categoriesSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              <TouchableOpacity
                style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(null)}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
                  Todos
                </Text>
                {!selectedCategory && <View style={styles.categoryChipDot} />}
              </TouchableOpacity>

              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  {cat.icono && <Text style={styles.categoryChipIcon}>{cat.icono}</Text>}
                  <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive]}>
                    {cat.nombre}
                  </Text>
                  {selectedCategory === cat.id && <View style={styles.categoryChipDot} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Products Grid - Premium Layout */}
        <View style={styles.productsSection}>
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="package" size={64} color={colors.gray400} />
              <Text style={styles.emptyTitle}>No hay productos disponibles</Text>
              <Text style={styles.emptyMessage}>
                {selectedCategory ? 'Prueba con otra categoría' : 'Vuelve pronto para ver nuestros productos'}
              </Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {filteredProducts.map((product) => {
                // Calcular promociones activas para este producto
                const activePromotions = company.promociones?.filter(promo => {
                  if (!promo.activo) return false;
                  if (!isPromocionActiveNow(promo.configuracion)) return false;

                  if (promo.alcance === 'SELECCIONADOS') {
                    return promo.productos?.some((p: any) => p.productoId === product.id);
                  }

                  return true;
                }) || [];

                // Calcular mejor precio con descuento
                let bestPrice = product.precio;
                let hasDiscount = false;

                activePromotions.forEach(promo => {
                  let currentPrice = product.precio;

                  if (promo.tipo === 'CANTIDAD') {
                    if (promo.configuracion.cantidadCompra === 1 && promo.configuracion.porcentajeDescuento) {
                      const discount = (product.precio * promo.configuracion.porcentajeDescuento) / 100;
                      currentPrice = product.precio - discount;
                    }
                  }

                  if (currentPrice < bestPrice) {
                    bestPrice = currentPrice;
                    hasDiscount = true;
                  }
                });

                return (
                  <ProductCardPremium
                    key={product.id}
                    product={product}
                    onPress={() => handleProductPress(product)}
                    onQuickAdd={() => handleQuickAddToCart(product)}
                    colors={colors}
                    isDark={isDark}
                    buttonColor={buttonColor}
                    hasPromotion={activePromotions.length > 0}
                    discountedPrice={hasDiscount ? bestPrice : undefined}
                  />
                );
              })}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Product Modal - Premium con blur */}
      <ProductModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => {
          setModalVisible(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCartFromModal}
        buttonColor={buttonColor}
      />

      {/* Floating Cart Button */}
      <FloatingCartButton
        buttonColor={buttonColor}
        from="company"
        companyName={companyName}
        companyId={company.id}
        horarios={company.preferenciasWeb?.horarios}
        envioDomicilio={company.preferenciasWeb?.envioDomicilio}
      />


      {/* Toast Notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

// Componente de producto premium
const ProductCardPremium: React.FC<{
  product: Product;
  onPress: () => void;
  onQuickAdd: () => void;
  colors: any;
  isDark: boolean;
  buttonColor: string;
  hasPromotion?: boolean;
  discountedPrice?: number;
}> = ({ product, onPress, onQuickAdd, colors, isDark, buttonColor, hasPromotion, discountedPrice }) => {
  const cardStyles = useMemo(() => StyleSheet.create({
    productCard: {
      width: (SCREEN_WIDTH - 56) / 2,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    productImageContainer: {
      width: '100%' as any,
      height: 140,
      position: 'relative',
    },
    productImage: {
      width: '100%' as any,
      height: '100%' as any,
    },
    productImagePlaceholder: {
      width: '100%' as any,
      height: '100%' as any,
      alignItems: 'center',
      justifyContent: 'center',
    },
    inactiveBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    inactiveBadgeText: {
      fontSize: normalize(10),
      fontWeight: '600',
      color: '#FFFFFF',
    },
    productInfo: {
      padding: 12,
      gap: 6,
    },
    productName: {
      fontSize: normalize(14),
      fontWeight: '600',
      color: colors.text,
      lineHeight: 18,
    },
    productDescription: {
      fontSize: normalize(12),
      fontWeight: '400',
      color: colors.textSecondary,
      lineHeight: 16,
    },
    productFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    priceContainer: {
      flexDirection: 'column',
      gap: 2,
    },
    productPrice: {
      fontSize: normalize(16),
      fontWeight: '700',
      color: colors.text,
    },
    productPriceOriginal: {
      fontSize: normalize(12),
      fontWeight: '500',
      color: colors.textTertiary,
      textDecorationLine: 'line-through',
    },
    addButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: `${buttonColor}15`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    promotionBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: buttonColor,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    promotionBadgeText: {
      fontSize: normalize(10),
      fontWeight: '600',
      color: '#FFFFFF',
    },
  }), [colors, isDark, buttonColor]);

  // Obtener la URL de la imagen del producto
  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : product.fotoUrl;

  return (
    <TouchableOpacity style={cardStyles.productCard} onPress={onPress} activeOpacity={0.9}>
      {/* Imagen */}
      <View style={cardStyles.productImageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={cardStyles.productImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={isDark ? ['#1a1a1a', '#2a2a2a'] : ['#f5f5f5', '#e5e5e5']}
            style={cardStyles.productImagePlaceholder}
          >
            <Feather name="image" size={32} color={colors.gray400} />
          </LinearGradient>
        )}

        {/* Badge de promoción */}
        {hasPromotion && product.activo && (
          <View style={cardStyles.promotionBadge}>
            <Ionicons name="pricetag" size={12} color="#FFFFFF" />
            <Text style={cardStyles.promotionBadgeText}>OFERTA</Text>
          </View>
        )}

        {/* Badge de no disponible */}
        {!product.activo && (
          <View style={cardStyles.inactiveBadge}>
            <Text style={cardStyles.inactiveBadgeText}>No disponible</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={cardStyles.productInfo}>
        <Text style={cardStyles.productName} numberOfLines={2}>{product.nombre}</Text>

        {product.descripcion && (
          <Text style={cardStyles.productDescription} numberOfLines={1}>
            {product.descripcion}
          </Text>
        )}

        <View style={cardStyles.productFooter}>
          <View style={cardStyles.priceContainer}>
            {discountedPrice !== undefined ? (
              <>
                <Text style={cardStyles.productPrice}>${Number(discountedPrice).toFixed(2)}</Text>
                <Text style={cardStyles.productPriceOriginal}>${Number(product.precio).toFixed(2)}</Text>
              </>
            ) : (
              <Text style={cardStyles.productPrice}>${Number(product.precio).toFixed(2)}</Text>
            )}
          </View>

          <TouchableOpacity
            style={cardStyles.addButton}
            onPress={(e) => {
              e.stopPropagation();
              onQuickAdd();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={18} color={buttonColor} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Floating Header
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBlur: {
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: normalize(17),
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerMenu: {
    marginTop: 8,
    marginHorizontal: 20,
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
  },
  headerMenuIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMenuText: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Hero Section
  hero: {
    height: 240,
    position: 'relative',
    backgroundColor: colors.primary,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backButtonHero: {
    marginLeft: 20,
    marginTop: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Company Card
  companyCard: {
    marginTop: -80,
    marginHorizontal: 20,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginTop: -60,
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: normalize(36),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingBadgeText: {
    fontSize: normalize(12),
    fontWeight: '600',
    color: '#1a1a1a',
  },
  companyInfo: {
    gap: 8,
  },
  companyName: {
    fontSize: normalize(24),
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  companyDescription: {
    fontSize: normalize(14),
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: normalize(13),
    fontWeight: '500',
    color: colors.textSecondary,
  },

  // Status Pills
  statusPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: normalize(12),
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Categories
  categoriesSection: {
    marginTop: 24,
    marginBottom: 8,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipIcon: {
    fontSize: normalize(16),
  },
  categoryChipText: {
    fontSize: normalize(14),
    fontWeight: '500',
    color: colors.text,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  categoryChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },

  // Products
  productsSection: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  productCard: {
    width: (SCREEN_WIDTH - 56) / 2,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  productImageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inactiveBadgeText: {
    fontSize: normalize(10),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  productInfo: {
    padding: 12,
    gap: 6,
  },
  productName: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: colors.text,
    lineHeight: 18,
  },
  productDescription: {
    fontSize: normalize(12),
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 16,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  productPrice: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: colors.text,
  },
  emptyMessage: {
    fontSize: normalize(14),
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },

  // Error State
  errorContainer: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorIcon: {
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: normalize(20),
    fontWeight: '600',
    color: colors.text,
  },
  errorMessage: {
    fontSize: normalize(14),
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: colors.primary,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Business Hours Section - Premium Inline
  businessHoursPremium: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  },
  businessHoursHeaderPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  businessHoursHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  businessHoursTitlePremium: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  iconCirclePremium: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoursGridContainer: {
    overflow: 'hidden',
  },
  hoursGrid: {
    gap: 8,
    paddingTop: 0,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
  },
  dayText: {
    fontSize: normalize(14),
    fontWeight: '500',
    color: colors.text,
    minWidth: 35,
  },
  timeText: {
    fontSize: normalize(13),
    fontWeight: '400',
    color: colors.textSecondary,
  },
  closedText: {
    fontSize: normalize(13),
    fontWeight: '400',
    color: colors.error,
    opacity: 0.7,
  },

  // Social Links - Premium Inline
  socialLinksPremium: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  },
  socialHeaderPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  socialTitlePremium: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  socialGridContainer: {
    overflow: 'hidden',
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 0,
  },
  socialButton: {
    flex: 1,
    minWidth: '47%',
    maxWidth: '48%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  socialButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    borderRadius: 14,
  },
  socialButtonText: {
    flex: 1,
    fontSize: normalize(13),
    fontWeight: '500',
    color: colors.text,
  },

  // Search Section - Premium
  searchSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  },
  searchIcon: {
    marginRight: 10,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: normalize(15),
    fontWeight: '400',
    color: colors.text,
  },
  clearButton: {
    padding: 4,
  },

  // Promotions Section - Premium Redesign
  promotionsSectionNew: {
    marginTop: 24,
    marginBottom: 8,
  },
  promotionsHeaderNew: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  promotionsTitleNew: {
    flex: 1,
    fontSize: normalize(16),
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  promoBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  promoBadgeText: {
    fontSize: normalize(12),
    fontWeight: '600',
  },
  promosScrollNew: {
    paddingHorizontal: 20,
    gap: 10,
  },
  // Compact Promo Cards
  promoCardCompact: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.15 : 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  promoCardCompactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    minHeight: 64,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    borderRadius: 14,
  },
  promoCompactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promoIconCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  discountBadgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  discountBadgeTextCompact: {
    fontSize: normalize(11),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  promoCompactContent: {
    flex: 1,
    gap: 4,
  },
  promoNameCompact: {
    fontSize: normalize(13),
    fontWeight: '600',
    color: colors.text,
  },
  promoCompactFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promoScheduleCompact: {
    fontSize: normalize(11),
    fontWeight: '400',
    color: colors.textSecondary,
    flex: 1,
  },
});


import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HorarioAtencion, DayOfWeek } from '../../types/company';
import { colors as themeColors, spacing, borderRadius, textStyles } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
interface BusinessHoursProps {
  horarios?: HorarioAtencion[];
  compact?: boolean;
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.LUN]: 'Lunes',
  [DayOfWeek.MAR]: 'Martes',
  [DayOfWeek.MIE]: 'Miércoles',
  [DayOfWeek.JUE]: 'Jueves',
  [DayOfWeek.VIE]: 'Viernes',
  [DayOfWeek.SAB]: 'Sábado',
  [DayOfWeek.DOM]: 'Domingo',
};

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const getCurrentDay = (): DayOfWeek => {
  const days = [
    DayOfWeek.DOM,
    DayOfWeek.LUN,
    DayOfWeek.MAR,
    DayOfWeek.MIE,
    DayOfWeek.JUE,
    DayOfWeek.VIE,
    DayOfWeek.SAB,
  ];
  return days[new Date().getDay()];
};

const getCurrentMinutes = (): number => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

// Helper para recombinar horarios que cruzan medianoche
const combineSchedules = (horarios: HorarioAtencion[]): { day: DayOfWeek; displaySlots: { abreMin: number; cierraMin: number }[] }[] => {
  const grouped = horarios.reduce((acc, h) => {
    if (!acc[h.day]) acc[h.day] = [];
    acc[h.day].push(h);
    return acc;
  }, {} as Record<DayOfWeek, HorarioAtencion[]>);

  const days = [DayOfWeek.LUN, DayOfWeek.MAR, DayOfWeek.MIE, DayOfWeek.JUE, DayOfWeek.VIE, DayOfWeek.SAB, DayOfWeek.DOM];
  const result: { day: DayOfWeek; displaySlots: { abreMin: number; cierraMin: number }[] }[] = [];
  const processedIds = new Set<number>();

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const dayHorarios = (grouped[day] || []).sort((a, b) => a.slotIndex - b.slotIndex);
    const prevDay = days[(i - 1 + 7) % 7];
    const prevDayHorarios = grouped[prevDay] || [];
    const displaySlots: { abreMin: number; cierraMin: number }[] = [];

    for (const h of dayHorarios) {
      if (processedIds.has(h.id) || h.cerrado) continue;

      // Caso 1: Empieza a medianoche (puede ser continuación)
      if (h.abreMin === 0) {
        const matchingPrev = prevDayHorarios.find(
          prev => prev.cierraMin === 1440 && !processedIds.has(prev.id)
        );

        if (matchingPrev) {
          // No agregamos aquí, se agregó en el día anterior
          processedIds.add(h.id);
          continue;
        }
      }

      // Caso 2: Termina a medianoche (buscar continuación)
      if (h.cierraMin === 1440) {
        const nextDay = days[(i + 1) % 7];
        const nextDayHorarios = grouped[nextDay] || [];
        const continuation = nextDayHorarios.find(
          next => next.abreMin === 0 && !processedIds.has(next.id)
        );

        if (continuation) {
          // Recombinar: mostrar en este día como horario que cruza medianoche
          displaySlots.push({ abreMin: h.abreMin, cierraMin: continuation.cierraMin });
          processedIds.add(h.id);
          processedIds.add(continuation.id);
          continue;
        }
      }

      // Caso 3: Horario normal
      displaySlots.push({ abreMin: h.abreMin, cierraMin: h.cierraMin });
      processedIds.add(h.id);
    }

    if (displaySlots.length > 0) {
      result.push({ day, displaySlots });
    }
  }

  return result;
};

export const BusinessHours: React.FC<BusinessHoursProps> = ({
  horarios,
  compact = false,
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [expanded, setExpanded] = useState(false);
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
  const { isOpen, currentStatus, todayDisplaySlots, groupedHorarios } = useMemo(() => {
    if (!horarios || horarios.length === 0) {
      return {
        isOpen: false,
        currentStatus: 'Sin horarios definidos',
        todayDisplaySlots: null,
        groupedHorarios: {},
      };
    }

    const currentDay = getCurrentDay();
    const currentMinutes = getCurrentMinutes();

    // Combinar horarios que cruzan medianoche para la visualización
    const combinedSchedules = combineSchedules(horarios);
    const todaySchedule = combinedSchedules.find(s => s.day === currentDay);

    const grouped = horarios.reduce((acc, horario) => {
      if (!acc[horario.day]) acc[horario.day] = [];
      acc[horario.day].push(horario);
      return acc;
    }, {} as Record<DayOfWeek, HorarioAtencion[]>);

    if (!todaySchedule || todaySchedule.displaySlots.length === 0) {
      return {
        isOpen: false,
        currentStatus: 'Cerrado hoy',
        todayDisplaySlots: null,
        groupedHorarios: grouped,
      };
    }

    // Verificar si está abierto actualmente usando los horarios originales (divididos)
    // porque la lógica de verificación necesita las franjas exactas
    const todayHorarios = horarios.filter(
      (h) => h.day === currentDay && !h.cerrado
    );

    const isCurrentlyOpen = todayHorarios.some(
      (h) => currentMinutes >= h.abreMin && currentMinutes < h.cierraMin
    );

    let status = 'Cerrado';
    if (isCurrentlyOpen) {
      const slot = todayHorarios.find(
        (h) => currentMinutes >= h.abreMin && currentMinutes < h.cierraMin
      );

      if (slot) {
        // Buscar el displaySlot correspondiente para mostrar la hora de cierre correcta
        const displaySlot = todaySchedule.displaySlots.find(ds =>
          ds.abreMin <= slot.abreMin && ds.cierraMin >= slot.cierraMin
        ) || todaySchedule.displaySlots[0];

        status = `Abierto · Cierra ${formatTime(displaySlot.cierraMin)}`;
      } else {
        status = 'Abierto';
      }
    } else {
      const next = todayHorarios.find((h) => currentMinutes < h.abreMin);
      status = next
        ? `Cerrado · Abre ${formatTime(next.abreMin)}`
        : 'Cerrado';
    }

    return {
      isOpen: isCurrentlyOpen,
      currentStatus: status,
      todayDisplaySlots: todaySchedule.displaySlots,
      groupedHorarios: grouped,
    };
  }, [horarios]);

  const currentDay = getCurrentDay();

  // Animaciones para cada día
  const animatedValues = useRef(
    Object.keys(DAY_LABELS).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (expanded) {
      Animated.stagger(
        70,
        animatedValues.map((anim) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          })
        )
      ).start();
    } else {
      animatedValues.forEach((anim) =>
        Animated.timing(anim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start()
      );
    }
  }, [expanded]);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Ionicons
          name={isOpen ? 'time' : 'time-outline'}
          size={11}
          color={isOpen ? '#4CAF50' : colors.textSecondary}
        />
        <Text
          style={[
            styles.compactText,
            isOpen ? styles.openText : styles.closedText,
          ]}
        >
          {currentStatus}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => {
    // <-- ESTA LÍNEA hace que el cambio de altura del componente
    // se anime y empuje/traiga al resto del layout del PADRE.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }}
        activeOpacity={0.7}
      >
        <View style={[styles.statusBadge, isOpen ? styles.openBadge : styles.closedBadge]}>
          <View style={[styles.statusDot, isOpen ? styles.openDot : styles.closedDot]} />
          <Text style={[styles.statusText, isOpen && styles.statusTextOpen]}>
            {isOpen ? 'Abierto' : 'Cerrado'}
          </Text>
        </View>

        <View style={styles.todayInfo}>
          <Text style={styles.todayLabel}>{DAY_LABELS[currentDay]}</Text>
          {todayDisplaySlots?.length ? (
            <View style={styles.todayTimes}>
              {todayDisplaySlots.map((slot, i) => (
                <Text key={i} style={styles.todayTimeText}>
                  {formatTime(slot.abreMin)}-{formatTime(slot.cierraMin)}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.closedText}>Cerrado</Text>
          )}
        </View>

        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Lista animada */}
      {expanded && (
        <View style={styles.scheduleList}>
          {(() => {
            // Combinar horarios que cruzan medianoche
            const combinedSchedules = combineSchedules(horarios || []);
            const scheduleMap = combinedSchedules.reduce((acc, item) => {
              acc[item.day] = item.displaySlots;
              return acc;
            }, {} as Record<DayOfWeek, { abreMin: number; cierraMin: number }[]>);

            return Object.entries(DAY_LABELS).map(([day, label], index) => {
              const displaySlots = scheduleMap[day as DayOfWeek] || [];
              const isToday = day === currentDay;
              const hasCerrado = displaySlots.length === 0;

              const opacity = animatedValues[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              });

              const translateY = animatedValues[index].interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              });

              return (
                <Animated.View
                  key={day}
                  style={[
                    styles.dayRow,
                    {
                      opacity,
                      transform: [{ translateY }],
                    },
                    isToday && styles.todayRow,
                  ]}
                >
                  <Text style={[styles.dayText, isToday && styles.todayText]}>
                    {label.substring(0, 3)}
                  </Text>
                  {hasCerrado ? (
                    <Text style={styles.closedTextSmall}>Cerrado</Text>
                  ) : (
                    <View style={styles.timesContainer}>
                      {displaySlots.map((slot, i) => (
                        <Text key={i} style={styles.timeText}>
                          {formatTime(slot.abreMin)}-{formatTime(slot.cierraMin)}
                        </Text>
                      ))}
                    </View>
                  )}
                </Animated.View>
              );
            });
          })()}
        </View>
      )}
    </View>
  );
};


const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    shadowColor: isDark ? colors.black : '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 0.5,
    borderColor: isDark ? colors.gray200 : `${themeColors.gray100}60`,
  },

  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  compactText: {
    fontSize: 9,
    fontWeight: '500',
  },

  openText: {
    color: '#4CAF50',
  },

  closedText: {
    color: colors.textSecondary,
    fontStyle: 'normal',
    fontSize: 9,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 5,
    borderWidth: 0.5,
  },

  openBadge: {
    backgroundColor: isDark ? 'rgba(76, 175, 80, 0.15)' : '#E8F5E910',
    borderColor: '#4CAF5020',
  },

  closedBadge: {
    backgroundColor: isDark ? 'rgba(244, 67, 54, 0.15)' : '#FFEBEE10',
    borderColor: '#F4433620',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  openDot: {
    backgroundColor: '#4CAF50',
  },

  closedDot: {
    backgroundColor: '#F44336',
  },

  statusText: {
    ...textStyles.caption1,
    fontWeight: '600',
    fontSize: 11,
    color: '#F44336',
  },

  statusTextOpen: {
    color: '#2E7D32',
  },

  todayInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  todayLabel: {
    ...textStyles.subheadline,
    fontWeight: '600',
    fontSize: 13,
    color: colors.text,
  },

  todayTimes: {
    flexDirection: 'row',
    gap: 4,
  },

  todayTimeText: {
    ...textStyles.caption1,
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 11,
  },

  scheduleList: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    gap: 2,
  },

  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },

  todayRow: {
    backgroundColor: isDark ? colors.gray100 : colors.backgroundSecondary,
  },

  dayText: {
    ...textStyles.caption1,
    color: colors.textSecondary,
    fontWeight: '500',
    width: 35,
  },

  todayText: {
    color: colors.primary,
    fontWeight: '700',
  },

  timesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 4,
  },

  timeText: {
    ...textStyles.caption2,
    color: colors.text,
    fontWeight: '500',
  },

  closedTextSmall: {
    ...textStyles.caption2,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
});

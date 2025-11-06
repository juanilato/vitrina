
import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HorarioAtencion, DayOfWeek } from '../../types/company';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import {
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
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

export const BusinessHours: React.FC<BusinessHoursProps> = ({
  horarios,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(false);
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
  const { isOpen, currentStatus, todaySchedule, groupedHorarios } = useMemo(() => {
    if (!horarios || horarios.length === 0) {
      return {
        isOpen: false,
        currentStatus: 'Sin horarios definidos',
        todaySchedule: null,
        groupedHorarios: {},
      };
    }

    const currentDay = getCurrentDay();
    const currentMinutes = getCurrentMinutes();
    const todayHorarios = horarios.filter(
      (h) => h.day === currentDay && !h.cerrado
    );

    const grouped = horarios.reduce((acc, horario) => {
      if (!acc[horario.day]) acc[horario.day] = [];
      acc[horario.day].push(horario);
      return acc;
    }, {} as Record<DayOfWeek, HorarioAtencion[]>);

    if (todayHorarios.length === 0) {
      return {
        isOpen: false,
        currentStatus: 'Cerrado hoy',
        todaySchedule: null,
        groupedHorarios: grouped,
      };
    }

    const isCurrentlyOpen = todayHorarios.some(
      (h) => currentMinutes >= h.abreMin && currentMinutes < h.cierraMin
    );

    let status = 'Cerrado';
    if (isCurrentlyOpen) {
      const slot = todayHorarios.find(
        (h) => currentMinutes >= h.abreMin && currentMinutes < h.cierraMin
      );
      status = slot
        ? `Abierto · Cierra ${formatTime(slot.cierraMin)}`
        : 'Abierto';
    } else {
      const next = todayHorarios.find((h) => currentMinutes < h.abreMin);
      status = next
        ? `Cerrado · Abre ${formatTime(next.abreMin)}`
        : 'Cerrado';
    }

    return {
      isOpen: isCurrentlyOpen,
      currentStatus: status,
      todaySchedule: todayHorarios,
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
          size={16}
          color={isOpen ? colors.success : colors.textSecondary}
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
          {todaySchedule?.length ? (
            <View style={styles.todayTimes}>
              {todaySchedule
                .sort((a, b) => a.slotIndex - b.slotIndex)
                .map((horario, i) => (
                  <Text key={i} style={styles.todayTimeText}>
                    {formatTime(horario.abreMin)}-{formatTime(horario.cierraMin)}
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
          {Object.entries(DAY_LABELS).map(([day, label], index) => {
            const dayHorarios = groupedHorarios[day as DayOfWeek] || [];
            const isToday = day === currentDay;
            const hasCerrado =
              dayHorarios.length === 0 || dayHorarios.every((h) => h.cerrado);

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
                    {dayHorarios
                      .filter((h) => !h.cerrado)
                      .sort((a, b) => a.slotIndex - b.slotIndex)
                      .map((h, i) => (
                        <Text key={i} style={styles.timeText}>
                          {formatTime(h.abreMin)}-{formatTime(h.cierraMin)}
                        </Text>
                      ))}
                  </View>
                )}
              </Animated.View>
            );
          })}
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 0.5,
    borderColor: `${colors.gray100}60`,
  },

  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  compactText: {
    ...textStyles.subheadline,
    fontWeight: '500',
  },

  openText: {
    color: colors.success,
  },

  closedText: {
    color: colors.textTertiary,
    fontStyle: 'italic',
    fontSize: 12,
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
    backgroundColor: '#E8F5E910',
    borderColor: '#4CAF5020',
  },

  closedBadge: {
    backgroundColor: '#FFEBEE10',
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
    color: colors.gray900,
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
    backgroundColor: colors.backgroundSecondary,
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

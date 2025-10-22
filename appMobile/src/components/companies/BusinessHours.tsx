/**
 * BusinessHours Component
 * Muestra los horarios de atención y el estado actual (abierto/cerrado)
 * Estilo iOS moderno con expansión colapsable
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HorarioAtencion, DayOfWeek } from '../../types/company';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

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

export const BusinessHours: React.FC<BusinessHoursProps> = ({ horarios, compact = false }) => {
  const [expanded, setExpanded] = useState(false);

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

    // Agrupar todos los horarios por día
    const grouped = horarios.reduce((acc, horario) => {
      if (!acc[horario.day]) {
        acc[horario.day] = [];
      }
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

    // Verificar si está abierto ahora
    const isCurrentlyOpen = todayHorarios.some(
      (h) => currentMinutes >= h.abreMin && currentMinutes < h.cierraMin
    );

    let status = 'Cerrado';
    if (isCurrentlyOpen) {
      // Encontrar cuándo cierra
      const currentSlot = todayHorarios.find(
        (h) => currentMinutes >= h.abreMin && currentMinutes < h.cierraMin
      );
      if (currentSlot) {
        status = `Abierto · Cierra ${formatTime(currentSlot.cierraMin)}`;
      } else {
        status = 'Abierto';
      }
    } else {
      // Encontrar cuándo abre
      const nextSlot = todayHorarios.find((h) => currentMinutes < h.abreMin);
      if (nextSlot) {
        status = `Cerrado · Abre ${formatTime(nextSlot.abreMin)}`;
      } else {
        status = 'Cerrado';
      }
    }

    return {
      isOpen: isCurrentlyOpen,
      currentStatus: status,
      todaySchedule: todayHorarios,
      groupedHorarios: grouped,
    };
  }, [horarios]);

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

  if (!horarios || horarios.length === 0) {
    return null;
  }

  const currentDay = getCurrentDay();

  return (
    <View style={styles.container}>
      {/* Header compacto con día actual */}
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        {/* Status Badge */}
        <View style={[styles.statusBadge, isOpen ? styles.openBadge : styles.closedBadge]}>
          <View style={[styles.statusDot, isOpen ? styles.openDot : styles.closedDot]} />
          <Text style={[styles.statusText, isOpen ? styles.statusTextOpen : null]}>
            {isOpen ? 'Abierto' : 'Cerrado'}
          </Text>
        </View>

        {/* Día actual y horario */}
        <View style={styles.todayInfo}>
          <Text style={styles.todayLabel}>{DAY_LABELS[currentDay]}</Text>
          {todaySchedule && todaySchedule.length > 0 ? (
            <View style={styles.todayTimes}>
              {todaySchedule
                .sort((a, b) => a.slotIndex - b.slotIndex)
                .map((horario, index) => (
                  <Text key={index} style={styles.todayTimeText}>
                    {formatTime(horario.abreMin)}-{formatTime(horario.cierraMin)}
                  </Text>
                ))}
            </View>
          ) : (
            <Text style={styles.closedText}>Cerrado</Text>
          )}
        </View>

        {/* Flecha de expansión */}
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Lista expandible de todos los días */}
      {expanded && (
        <View style={styles.scheduleList}>
          {Object.entries(DAY_LABELS).map(([day, label]) => {
            const dayHorarios = groupedHorarios[day as DayOfWeek] || [];
            const isToday = day === currentDay;
            const hasCerrado = dayHorarios.length === 0 || dayHorarios.every((h) => h.cerrado);

            return (
              <View key={day} style={[styles.dayRow, isToday && styles.todayRow]}>
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
                      .map((horario, index) => (
                        <Text key={index} style={styles.timeText}>
                          {formatTime(horario.abreMin)}-{formatTime(horario.cierraMin)}
                        </Text>
                      ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.md,
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
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },

  openBadge: {
    backgroundColor: '#E8F5E9',
  },

  closedBadge: {
    backgroundColor: '#FFEBEE',
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

/**
 * Utilidades para validar promociones con horarios que pueden cruzar medianoche
 */

import { Promocion, PromocionConfig } from '../types/company';

const MINUTOS_POR_DIA = 1440; // 24 * 60

/**
 * Verifica si una promoción está activa en el momento actual
 * Soporta horarios que cruzan medianoche (ej: 20:00 a 04:00 del día siguiente)
 *
 * @param config Configuración de la promoción
 * @param now Fecha/hora actual (opcional, para testing)
 * @returns true si la promoción está activa ahora
 */
export function isPromocionActiveNow(config: PromocionConfig, now: Date = new Date()): boolean {
    // 1. Verificar días aplicables
    if (!isDayApplicable(config, now)) {
        return false;
    }

    // 2. Verificar horario (si está configurado)
    if (!isTimeApplicable(config, now)) {
        return false;
    }

    return true;
}

/**
 * Verifica si una promoción completa está activa
 * Considera: activo=true, día aplicable, y horario
 */
export function isPromocionActive(promo: Promocion, now: Date = new Date()): boolean {
    if (!promo.activo) {
        return false;
    }
    return isPromocionActiveNow(promo.configuracion, now);
}

/**
 * Filtra una lista de promociones y devuelve solo las activas
 */
export function getActivePromociones(promociones: Promocion[], now: Date = new Date()): Promocion[] {
    return promociones.filter(promo => isPromocionActive(promo, now));
}

/**
 * Verifica si el día actual está en los días aplicables de la promoción
 * Considera también el día anterior si estamos en un horario que cruzó medianoche
 */
export function isDayApplicable(config: PromocionConfig, now: Date = new Date()): boolean {
    const diasAplicables = config?.diasAplicables;

    // Si no hay días configurados, aplica todos los días
    if (!diasAplicables || diasAplicables.length === 0) {
        return true;
    }

    const currentDayIndex = now.getDay(); // 0 = Domingo
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Verificar si el día actual está en los días aplicables
    if (diasAplicables.includes(currentDayIndex)) {
        return true;
    }

    // Si hay horario configurado y cruza medianoche, verificar el día anterior
    const horaInicio = config?.horaInicio;
    const horaFin = config?.horaFin;

    if (horaInicio !== undefined && horaFin !== undefined && horaFin > MINUTOS_POR_DIA) {
        // Horario cruza medianoche - verificar si estamos en la "extensión" del día anterior
        const finAjustado = horaFin - MINUTOS_POR_DIA; // Hora de fin en el día siguiente

        if (currentMinutes < finAjustado) {
            // Estamos en las primeras horas del día (parte de la promo del día anterior)
            const previousDayIndex = (currentDayIndex - 1 + 7) % 7;
            if (diasAplicables.includes(previousDayIndex)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Verifica si la hora actual está dentro del horario de la promoción
 * Soporta horarios que cruzan medianoche
 */
export function isTimeApplicable(config: PromocionConfig, now: Date = new Date()): boolean {
    const horaInicio = config?.horaInicio;
    const horaFin = config?.horaFin;

    // Si no hay horario configurado, aplica todo el día
    if (horaInicio === undefined || horaFin === undefined) {
        return true;
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentDayIndex = now.getDay();
    const diasAplicables = config?.diasAplicables || [];

    // Caso 1: Horario NO cruza medianoche (ej: 10:00 a 22:00)
    if (horaFin <= MINUTOS_POR_DIA) {
        // El día actual debe estar en los días aplicables
        if (diasAplicables.length > 0 && !diasAplicables.includes(currentDayIndex)) {
            return false;
        }
        return currentMinutes >= horaInicio && currentMinutes < horaFin;
    }

    // Caso 2: Horario cruza medianoche (ej: 20:00 a 04:00 = horaInicio: 1200, horaFin: 1680)
    const finAjustado = horaFin - MINUTOS_POR_DIA; // Hora de fin en el día siguiente

    // Verificar si estamos en la parte "nocturna" (antes de medianoche)
    if (currentMinutes >= horaInicio) {
        // Estamos después del inicio - verificar si hoy es día aplicable
        if (diasAplicables.length > 0 && !diasAplicables.includes(currentDayIndex)) {
            return false;
        }
        return true;
    }

    // Verificar si estamos en la parte "madrugada" (después de medianoche)
    if (currentMinutes < finAjustado) {
        // Estamos antes del fin - verificar si ayer fue día aplicable
        const previousDayIndex = (currentDayIndex - 1 + 7) % 7;
        if (diasAplicables.length > 0 && !diasAplicables.includes(previousDayIndex)) {
            return false;
        }
        return true;
    }

    return false;
}

/**
 * Formatea minutos a string de hora (ej: 1200 -> "20:00")
 */
export function formatMinutesToTime(minutes: number): string {
    // Si cruza medianoche (> 1440), ajustar
    const adjustedMinutes = minutes >= MINUTOS_POR_DIA ? minutes - MINUTOS_POR_DIA : minutes;
    const hours = Math.floor(adjustedMinutes / 60);
    const mins = adjustedMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Convierte hora string a minutos (ej: "20:00" -> 1200)
 */
export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Obtiene los nombres de los días de la semana
 */
export function getDayName(dayIndex: number): string {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[dayIndex] || '';
}

/**
 * Genera un texto descriptivo del horario de la promoción
 */
export function getPromoScheduleText(config: PromocionConfig): string {
    const parts: string[] = [];

    // Días
    if (config.diasAplicables && config.diasAplicables.length > 0 && config.diasAplicables.length < 7) {
        const dayNames = config.diasAplicables.map(d => getDayName(d)).join(', ');
        parts.push(dayNames);
    }

    // Horario
    if (config.horaInicio !== undefined && config.horaFin !== undefined) {
        const inicio = formatMinutesToTime(config.horaInicio);
        const fin = formatMinutesToTime(config.horaFin);
        parts.push(`${inicio} - ${fin}`);
    }

    return parts.join(' · ') || 'Siempre activa';
}

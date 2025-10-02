"use client";

import React from "react";
import './CalendarSchedule.css';
import { DayKey, TimeSlot } from "../../../types/index";
import TimeInput from './TimeInput';
const DAYS: DayKey[] = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];

interface CalendarScheduleProps {
  schedule: Record<DayKey, TimeSlot[]>;
  onChange: (next: Record<DayKey, TimeSlot[]>) => void;
}

const emptyTimeSlot: TimeSlot = { open: "08:00", close: "12:00" };

const CalendarSchedule: React.FC<CalendarScheduleProps> = ({ schedule, onChange }) => {
  const handleChange = (day: DayKey, index: number, field: keyof TimeSlot, value: string) => {
    const updated = [...(schedule[day] || [])];
    if (!updated[index]) updated[index] = { ...emptyTimeSlot };
    updated[index][field] = value;
    onChange({ ...schedule, [day]: updated });
  };

  const handleAddSlot = (day: DayKey) => {
    const slots = schedule[day] || [];
    if (slots.length >= 2) return;
    const updated = [...slots, { ...emptyTimeSlot }];
    onChange({ ...schedule, [day]: updated });
  };

  const handleRemoveDay = (day: DayKey) => {
    const updated = { ...schedule, [day]: [] };
    onChange(updated);
  };

  return (
    <div className="calendar-container">
      <h3 className="calendar-title">Horarios de atención</h3>
      <p className="calendar-subtitle">Máximo dos horarios por día. Selección en pasos de 30 minutos.</p>
      <div className="days-list">
        {DAYS.map((day) => (
          <div key={day} className="day-row">
            <div className="day-header">
              <span className="day-name">{day}</span>
              <button
                className="clear-button"
                onClick={() => handleRemoveDay(day)}
                title={`Limpiar ${day}`}
              >
                ✕
              </button>
            </div>
            {(schedule[day] || []).map((slot, index) => (
              <div key={index} className="time-inputs">
<TimeInput
  value={slot.open}
  onChange={(val) => handleChange(day, index, "open", val)}
/>
<span className="to">a</span>
<TimeInput
  value={slot.close} // ✅ CORRECTO
  onChange={(val) => handleChange(day, index, "close", val)} // ✅
/>
              </div>
            ))}
            {(schedule[day]?.length || 0) < 2 && (
              <button className="add-slot-button" onClick={() => handleAddSlot(day)}>
                + Agregar horario
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarSchedule;

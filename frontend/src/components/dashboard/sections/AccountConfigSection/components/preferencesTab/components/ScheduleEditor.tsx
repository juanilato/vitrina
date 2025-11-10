"use client";

import React from "react";
import "./CalendarSchedule.css";
import { DayKey, TimeSlot } from "../../../types";
import TimeInput from "./TimeInput";

//Editor de horarios de empresa
const DAYS: { key: DayKey; label: string; isWeekday: boolean }[] = [
  { key: "LUN", label: "Lunes", isWeekday: true },
  { key: "MAR", label: "Martes", isWeekday: true },
  { key: "MIE", label: "Miércoles", isWeekday: true },
  { key: "JUE", label: "Jueves", isWeekday: true },
  { key: "VIE", label: "Viernes", isWeekday: true },
  { key: "SAB", label: "Sábado", isWeekday: false },
  { key: "DOM", label: "Domingo", isWeekday: false },
];

interface Props {
  schedule: Record<DayKey, TimeSlot[]>;
  onChange: (next: Record<DayKey, TimeSlot[]>) => void;
}

const emptySlot: TimeSlot = { open: "08:00", close: "12:00" };

function ensureTwoSlots(slots: TimeSlot[]): TimeSlot[] {
  // devuelve exactamente 2 posiciones (para UI alineada); vacías si no existen
  const a = slots?.[0] ?? null;
  const b = slots?.[1] ?? null;
  const out: (TimeSlot | null)[] = [a, b];
  return out as any;
}

const CalendarSchedule: React.FC<Props> = ({ schedule, onChange }) => {
  const isOpen = (day: DayKey) => (schedule[day]?.length || 0) > 0;

  const setDay = (day: DayKey, slots: TimeSlot[]) => {
    onChange({ ...schedule, [day]: slots });
  };

  const toggleOpen = (day: DayKey, nextOpen: boolean) => {
    if (!nextOpen) setDay(day, []);
    else setDay(day, [emptySlot]);
  };

  const setSlot = (day: DayKey, idx: 0 | 1, field: keyof TimeSlot, val: string) => {
    const curr = [...(schedule[day] ?? [])];
    if (!curr[idx]) curr[idx] = { ...emptySlot };
    curr[idx] = { ...curr[idx], [field]: val };
    // filtrar vacíos si quedaron sin horas (no aquí: mantenemos densidad)
    setDay(day, curr);
  };

  const clearSlot = (day: DayKey, idx: 0 | 1) => {
    const curr = [...(schedule[day] ?? [])];
    curr.splice(idx, 1);
    setDay(day, curr);
  };

  const addSecondSlot = (day: DayKey) => {
    const curr = [...(schedule[day] ?? [])];
    if (curr.length >= 2) return;
    curr.push({ open: "16:00", close: "20:00" });
    setDay(day, curr);
  };

  // ====== Acciones rápidas
  const applyTemplate = (tpl: "LV_9_18" | "LV_10_19" | "FindeCerrado") => {
    const next = { ...schedule };
    if (tpl === "LV_9_18") {
      DAYS.forEach(d => {
        if (d.isWeekday) next[d.key] = [{ open: "09:00", close: "18:00" }];
      });
    }
    if (tpl === "LV_10_19") {
      DAYS.forEach(d => {
        if (d.isWeekday) next[d.key] = [{ open: "10:00", close: "19:00" }];
      });
    }
    if (tpl === "FindeCerrado") {
      next["SAB"] = [];
      next["DOM"] = [];
    }
    onChange(next);
  };

  const copyMonToWeek = () => {
    const mon = schedule["LUN"] ?? [];
    const next = { ...schedule };
    ["MAR", "MIE", "JUE", "VIE"].forEach((k) => (next[k as DayKey] = [...mon]));
    onChange(next);
  };

  const clearAll = () => {
    const next: Record<DayKey, TimeSlot[]> = { LUN: [], MAR: [], MIE: [], JUE: [], VIE: [], SAB: [], DOM: [] };
    onChange(next);
  };

  return (
    <div className="sched-matrix">
      <header className="sched-toolbar">
 
          <div className="section-head">
          <h1 className="sched-title">Horarios de atención</h1>
</div>


        <div className="sched-quick">
          <div className="btn-group">
            <button className="btn-ghost sm" onClick={() => applyTemplate("LV_9_18")}>L–V 9–18</button>
            <button className="btn-ghost sm" onClick={() => applyTemplate("LV_10_19")}>L–V 10–19</button>
            <button className="btn-ghost sm" onClick={copyMonToWeek}>Copiar L→V</button>
          </div>
          <button className="btn-danger sm" onClick={clearAll} title="Limpiar todos los días">Limpiar</button>
        </div>
      </header>

      <div className="sched-table card">
        {/* Encabezados (desktop) */}
        <div className="sched-row sched-row--head">
          <div className="cell daycol">Día</div>
          <div className="cell statecol">Estado</div>
          <div className="cell slotcol">Franja 1</div>
          <div className="cell slotcol">Franja 2</div>
          <div className="cell actionscol">Acciones</div>
        </div>

        {DAYS.map(({ key, label }) => {
          const slots = schedule[key] ?? [];
          const [s1, s2] = ensureTwoSlots(slots);

          return (
            <div key={key} className="sched-row">
              {/* Día */}
              <div className="cell daycol">
                <div className="day-badge">{label}</div>
              </div>

              {/* Estado toggle */}
              <div className="cell statecol">
                <label className="toggle-switch small">
                  <input
                    type="checkbox"
                    checked={isOpen(key)}
                    onChange={(e) => toggleOpen(key, e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
                <span className={`state-text ${isOpen(key) ? "on" : "off"}`}>
                  {isOpen(key) ? "Abierto" : "Cerrado"}
                </span>
              </div>

              {/* Franja 1 */}
              <div className="cell slotcol">
                {s1 ? (
                  <div className="slot-edit">
                    <TimeInput
                      value={s1.open}
                      onChange={(v) => setSlot(key, 0, "open", v)}
                    />
                    <span className="to">a</span>
                    <TimeInput
                      value={s1.close}
                      onChange={(v) => setSlot(key, 0, "close", v)}
                    />
                    <button className="iconbtn subtle" onClick={() => clearSlot(key, 0)} title="Eliminar franja">
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="slot-placeholder muted">—</div>
                )}
              </div>

              {/* Franja 2 */}
              <div className="cell slotcol">
                {s2 ? (
                  <div className="slot-edit">
                    <TimeInput
                      value={s2.open}
                      onChange={(v) => setSlot(key, 1, "open", v)}
                    />
                    <span className="to">a</span>
                    <TimeInput
                      value={s2.close}
                      onChange={(v) => setSlot(key, 1, "close", v)}
                    />
                    <button className="iconbtn subtle" onClick={() => clearSlot(key, 1)} title="Eliminar franja">
                      ✕
                    </button>
                  </div>
                ) : isOpen(key) ? (
                  <button className="chip-add" onClick={() => addSecondSlot(key)}>+ Agregar franja</button>
                ) : (
                  <div className="slot-placeholder muted">—</div>
                )}
              </div>

              {/* Acciones rápidas por día */}
              <div className="cell actionscol">
                <div className="btn-group right">

                  <button className="btn-ghost xs" onClick={() => setDay(key, [])}>
                    Vaciar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nota accesible */}
      <p className="muted" style={{ marginTop: 8 }}>
        Sugerencia: podés usar las plantillas de arriba y luego ajustar día por día.
      </p>
    </div>
  );
};

export default CalendarSchedule;

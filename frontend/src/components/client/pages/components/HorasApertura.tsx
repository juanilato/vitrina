// src/pages/company/site/components/BusinessHours.tsx
import React, { useMemo } from 'react';
import './horasApertura.css';
type Slot = {
  day: 'LUN' | 'MAR' | 'MIE' | 'JUE' | 'VIE' | 'SAB' | 'DOM';
  slotIndex: number;
  abreMin: number;
  cierraMin: number;
  cerrado: boolean;
};


const DAY_ORDER: Array<Slot['day']> = ['LUN','MAR','MIE','JUE','VIE','SAB','DOM'];
const DAY_LABEL: Record<Slot['day'], string> = {
  LUN: 'Lunes', MAR: 'Martes', MIE: 'Miércoles', JUE: 'Jueves', VIE: 'Viernes', SAB: 'Sábado', DOM: 'Domingo',
};

const toHM = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
};

function getTodayCode(): Slot['day'] {
  // Date.getDay(): 0=Dom,1=Lun,...  -> nuestro enum usa DOM..SAB
  const map: Record<number, Slot['day']> = { 0:'DOM',1:'LUN',2:'MAR',3:'MIE',4:'JUE',5:'VIE',6:'SAB' };
  return map[new Date().getDay()];
}

function isOpenNow(slotsToday: Slot[]): boolean {
  if (!slotsToday?.length) return false;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return slotsToday.some(s => !s.cerrado && nowMin >= s.abreMin && nowMin < s.cierraMin);
}

export const BusinessHours: React.FC<{ slots: Slot[] | undefined }> = ({ slots }) => {
  const today = getTodayCode();

  const grouped = useMemo(() => {
    const map = new Map<Slot['day'], Slot[]>();
    DAY_ORDER.forEach(d => map.set(d, []));
    (slots || []).forEach(s => {
      const arr = map.get(s.day)!;
      arr.push(s);
    });
    // ordenar por slotIndex por las dudas
    DAY_ORDER.forEach(d => map.get(d)!.sort((a,b) => a.slotIndex - b.slotIndex));
    return map;
  }, [slots]);

  const openNow = isOpenNow(grouped.get(today)!);

  return (
    <div className="hours-widget">
      <div className="hours-header">
        <span className={`pill ${openNow ? 'open' : 'closed'}`}>
          {openNow ? 'Abierto ahora' : 'Cerrado'}
        </span>
      </div>

      <ul className="hours-list">
        {DAY_ORDER.map((d) => {
          const daySlots = grouped.get(d)!;
          const isToday = d === today;

          let content: React.ReactNode;
          if (!daySlots.length) {
            content = <span className="hours-closed">Cerrado</span>;
          } else {
            const visible = daySlots
              .filter(s => !s.cerrado)
              .map((s, i) => (
                <span key={i} className="hours-range">
                  {toHM(s.abreMin)} — {toHM(s.cierraMin)}
                </span>
              ));
            content = visible.length ? visible : <span className="hours-closed">Cerrado</span>;
          }

          return (
            <li key={d} className={`hours-item ${isToday ? 'today' : ''}`}>
              <span className="hours-day">{DAY_LABEL[d]}</span>
              <span className="hours-times">{content}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

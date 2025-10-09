// types locales del componente/parent
const DAY_ORDER = ['LUN','MAR','MIE','JUE','VIE','SAB','DOM'] as const;
type DayCode = typeof DAY_ORDER[number];

type Slot = {
  day: DayCode;
  slotIndex: number;
  abreMin: number;
  cierraMin: number;
  cerrado: boolean;
};

// si tu backend trae esto:
type BackendSlot = {
  day: string;         // <- string genérico
  slotIndex: number;
  abreMin: number;
  cierraMin: number;
  cerrado: boolean;
};

// util: chequear y mapear a DayCode
const toDayCode = (raw: string): DayCode | null => {
  const up = (raw || '').toUpperCase();
  return (DAY_ORDER as readonly string[]).includes(up) ? (up as DayCode) : null;
};

// normalizador seguro -> devuelve Slot[] (filtra inválidos)
export const normalizeSlots = (slots?: BackendSlot[]): Slot[] | undefined => {
  if (!slots) return undefined;
  const normalized: Slot[] = [];
  for (const s of slots) {
    const d = toDayCode(s.day);
    if (!d) continue; // ignora días no válidos
    normalized.push({
      day: d,
      slotIndex: Number(s.slotIndex) || 0,
      abreMin: Number(s.abreMin) || 0,
      cierraMin: Number(s.cierraMin) || 0,
      cerrado: Boolean(s.cerrado),
    });
  }
  // opcional: ordena por day y slotIndex
  normalized.sort((a, b) => {
    const ad = DAY_ORDER.indexOf(a.day);
    const bd = DAY_ORDER.indexOf(b.day);
    return ad !== bd ? ad - bd : a.slotIndex - b.slotIndex;
  });
  return normalized;
};

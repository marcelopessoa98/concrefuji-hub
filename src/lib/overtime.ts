// Horário de expediente:
// Segunda a Quinta: 07:00 às 17:00
// Sexta: 07:00 às 16:00
// Hora extra = antes das 07:00 ou depois do horário de saída

export interface WorkSchedule {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export function getWorkSchedule(dayOfWeek: number): WorkSchedule | null {
  // 0 = Domingo, 6 = Sábado
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Fins de semana - todo trabalho é hora extra
    return null;
  }
  
  if (dayOfWeek === 5) {
    // Sexta-feira: 07:00 às 16:00
    return { startHour: 7, startMinute: 0, endHour: 16, endMinute: 0 };
  }
  
  // Segunda a Quinta: 07:00 às 17:00
  return { startHour: 7, startMinute: 0, endHour: 17, endMinute: 0 };
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function normalizeEndMinutes(startMinutes: number, endMinutes: number): number {
  // Aceitar 00:00 como meia-noite (virada do dia) quando fizer sentido.
  // Ex.: 18:00 -> 00:00 significa 6h (fim no dia seguinte).
  if (endMinutes === 0 && startMinutes > 0) return 24 * 60;
  if (endMinutes <= startMinutes) return endMinutes + 24 * 60;
  return endMinutes;
}

function getBranchKey(branchName?: string) {
  const name = (branchName || '').toLowerCase();
  if (name.includes('são lu') || name.includes('sao lu')) return 'sao_luis' as const;
  return 'default' as const;
}

function overlapMinutes(
  interval: { start: number; end: number },
  windows: Array<{ start: number; end: number }>
) {
  return windows.reduce((sum, w) => {
    const s = Math.max(interval.start, w.start);
    const e = Math.min(interval.end, w.end);
    return sum + Math.max(0, e - s);
  }, 0);
}

function saoLuisWindows(dayOfWeek: number) {
  // 0=Dom, 6=Sáb
  if (dayOfWeek === 0) return null; // Domingo: tudo extra
  if (dayOfWeek === 6) {
    // Sábado: 07:00–11:00
    return {
      regular: [{ start: 7 * 60, end: 11 * 60 }],
      lunchExtraMinutes: 0,
      lunchAllowed: false,
    };
  }

  if (dayOfWeek === 5) {
    // Sexta: 07:00–12:00 / 13:00–16:00 (almoço 12:00–13:00)
    return {
      regular: [
        { start: 7 * 60, end: 12 * 60 },
        { start: 13 * 60, end: 16 * 60 },
      ],
      lunchExtraMinutes: 60,
      lunchAllowed: true,
    };
  }

  // Seg–Qui: 07:00–11:30 / 13:00–16:30 (almoço 11:30–13:00)
  return {
    regular: [
      { start: 7 * 60, end: 11 * 60 + 30 },
      { start: 13 * 60, end: 16 * 60 + 30 },
    ],
    lunchExtraMinutes: 90,
    lunchAllowed: true,
  };
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function calculateOvertimeHours(
  date: string,
  startTime: string,
  endTime: string,
  options?: {
    branchName?: string;
    lunchWorked?: boolean;
    startTime2?: string | null;
    endTime2?: string | null;
  }
): number {
  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();

  let branchKey = getBranchKey(options?.branchName);

  const start1 = timeToMinutes(startTime);
  const end1 = normalizeEndMinutes(start1, timeToMinutes(endTime));
  const interval1 = { start: start1, end: end1 };

  const hasSecond = !!options?.startTime2 && !!options?.endTime2;
  const interval2 = hasSecond
    ? (() => {
        const s2 = timeToMinutes(options!.startTime2!);
        const e2 = normalizeEndMinutes(s2, timeToMinutes(options!.endTime2!));
        return { start: s2, end: e2 };
      })()
    : null;

  // Se vier com 2 períodos, assume regra de São Luís mesmo sem nome da sede.
  if (branchKey === 'default' && hasSecond) {
    branchKey = 'sao_luis';
  }

  // =========================
  // São Luís (jornada em 2 períodos + almoço opcional)
  // =========================
  if (branchKey === 'sao_luis') {
    const config = saoLuisWindows(dayOfWeek);

    // Domingo: tudo extra
    if (!config) {
      const total = Math.max(0, interval1.end - interval1.start) + (interval2 ? Math.max(0, interval2.end - interval2.start) : 0);
      return total;
    }

    const windows = config.regular;
    const calcInterval = (iv: { start: number; end: number }) => {
      const worked = Math.max(0, iv.end - iv.start);
      const inRegular = overlapMinutes(iv, windows);
      return Math.max(0, worked - inRegular);
    };

    let overtime = calcInterval(interval1);
    if (interval2) overtime += calcInterval(interval2);

    if (options?.lunchWorked && config.lunchAllowed) {
      overtime += config.lunchExtraMinutes;
    }

    return overtime;
  }

  // =========================
  // Padrão (Fortaleza/geral)
  // =========================
  const schedule = getWorkSchedule(dayOfWeek);

  // Se não tem expediente (fim de semana), todo o período é hora extra
  if (!schedule) {
    let total = Math.max(0, interval1.end - interval1.start);
    if (options?.lunchWorked) {
      // fim de semana: almoço já está dentro do período de trabalho informado
    }
    return total;
  }

  const scheduleStartMinutes = schedule.startHour * 60 + schedule.startMinute;
  const scheduleEndMinutes = schedule.endHour * 60 + schedule.endMinute;

  let overtimeMinutes = 0;

  // Horas antes do expediente
  if (interval1.start < scheduleStartMinutes) {
    const earlyEnd = Math.min(interval1.end, scheduleStartMinutes);
    overtimeMinutes += Math.max(0, earlyEnd - interval1.start);
  }

  // Horas depois do expediente
  if (interval1.end > scheduleEndMinutes) {
    const lateStart = Math.max(interval1.start, scheduleEndMinutes);
    overtimeMinutes += Math.max(0, interval1.end - lateStart);
  }

  // Almoço (Seg–Sex): se marcou que trabalhou, soma +1h
  if (options?.lunchWorked && dayOfWeek >= 1 && dayOfWeek <= 5) {
    overtimeMinutes += 60;
  }

  return overtimeMinutes;
}

export function formatOvertimeMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function getDayOfWeekName(date: string): string {
  const dateObj = new Date(date + 'T00:00:00');
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days[dateObj.getDay()];
}

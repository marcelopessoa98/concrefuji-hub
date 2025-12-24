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

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function calculateOvertimeHours(
  date: string,
  startTime: string,
  endTime: string
): number {
  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();
  const schedule = getWorkSchedule(dayOfWeek);
  
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  // Se não tem expediente (fim de semana), todo o período é hora extra
  if (!schedule) {
    return Math.max(0, endMinutes - startMinutes);
  }
  
  const scheduleStartMinutes = schedule.startHour * 60 + schedule.startMinute;
  const scheduleEndMinutes = schedule.endHour * 60 + schedule.endMinute;
  
  let overtimeMinutes = 0;
  
  // Horas antes do expediente (antes das 07:00)
  if (startMinutes < scheduleStartMinutes) {
    const earlyEnd = Math.min(endMinutes, scheduleStartMinutes);
    overtimeMinutes += Math.max(0, earlyEnd - startMinutes);
  }
  
  // Horas depois do expediente
  if (endMinutes > scheduleEndMinutes) {
    const lateStart = Math.max(startMinutes, scheduleEndMinutes);
    overtimeMinutes += Math.max(0, endMinutes - lateStart);
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

export interface Employee {
  id: string;
  name: string;
  birthDate: string;
  role: string;
  createdAt: string;
}

export interface Client {
  id: string;
  clientName: string;
  projectName: string;
  reference: string;
  createdAt: string;
}

export interface OvertimeEntry {
  id: string;
  date: string;
  projectId: string;
  projectName: string;
  startTime: string;
  endTime: string;
  type: 'remunerada' | 'banco_de_horas';
  observation: string;
}

export interface OvertimeRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: string;
  entries: OvertimeEntry[];
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  employeeId?: string;
  employeeName?: string;
  createdAt: string;
  read: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'employee';
}

export interface SystemSettings {
  maxWeeklyOvertime: number;
  maxSaturdayOvertime: number;
}

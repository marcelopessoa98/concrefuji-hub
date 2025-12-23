import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee, Client, OvertimeRecord, Notification, User, SystemSettings } from '@/types';

interface AppContextType {
  // User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  
  // Employees
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  
  // Clients/Projects
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Overtime
  overtimeRecords: OvertimeRecord[];
  addOvertimeRecord: (record: Omit<OvertimeRecord, 'id' | 'createdAt'>) => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Settings
  settings: SystemSettings;
  updateSettings: (settings: Partial<SystemSettings>) => void;
  
  // Birthday helpers
  getBirthdaysThisMonth: () => Employee[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Sample data for demonstration
const sampleEmployees: Employee[] = [
  { id: '1', name: 'João Silva', birthDate: '1985-12-15', role: 'Pedreiro', createdAt: new Date().toISOString() },
  { id: '2', name: 'Maria Santos', birthDate: '1990-12-20', role: 'Engenheira Civil', createdAt: new Date().toISOString() },
  { id: '3', name: 'Carlos Oliveira', birthDate: '1988-01-10', role: 'Mestre de Obras', createdAt: new Date().toISOString() },
  { id: '4', name: 'Ana Costa', birthDate: '1992-12-05', role: 'Técnica de Segurança', createdAt: new Date().toISOString() },
  { id: '5', name: 'Pedro Ferreira', birthDate: '1987-06-22', role: 'Eletricista', createdAt: new Date().toISOString() },
];

const sampleClients: Client[] = [
  { id: '1', clientName: 'Construtora ABC', projectName: 'Residencial Flores', reference: 'RF-001', createdAt: new Date().toISOString() },
  { id: '2', clientName: 'Incorporadora XYZ', projectName: 'Edifício Central', reference: 'EC-002', createdAt: new Date().toISOString() },
  { id: '3', clientName: 'Governo Municipal', projectName: 'Ponte Nova', reference: 'PN-003', createdAt: new Date().toISOString() },
];

const sampleOvertimeRecords: OvertimeRecord[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'João Silva',
    month: '12',
    year: '2024',
    entries: [
      { id: '1-1', date: '2024-12-02', projectId: '1', projectName: 'Residencial Flores', startTime: '18:00', endTime: '22:00', type: 'remunerada', observation: 'Concretagem urgente' },
      { id: '1-2', date: '2024-12-05', projectId: '2', projectName: 'Edifício Central', startTime: '17:00', endTime: '21:00', type: 'remunerada', observation: '' },
      { id: '1-3', date: '2024-12-07', projectId: '1', projectName: 'Residencial Flores', startTime: '08:00', endTime: '14:00', type: 'banco_de_horas', observation: 'Sábado - finalização de etapa' },
      { id: '1-4', date: '2024-12-10', projectId: '1', projectName: 'Residencial Flores', startTime: '18:00', endTime: '23:00', type: 'remunerada', observation: '' },
      { id: '1-5', date: '2024-12-12', projectId: '2', projectName: 'Edifício Central', startTime: '18:00', endTime: '22:00', type: 'remunerada', observation: 'Instalação elétrica' },
      { id: '1-6', date: '2024-12-14', projectId: '1', projectName: 'Residencial Flores', startTime: '08:00', endTime: '16:00', type: 'remunerada', observation: 'Sábado' },
      { id: '1-7', date: '2024-12-16', projectId: '3', projectName: 'Ponte Nova', startTime: '18:00', endTime: '22:00', type: 'remunerada', observation: '' },
      { id: '1-8', date: '2024-12-18', projectId: '1', projectName: 'Residencial Flores', startTime: '18:00', endTime: '23:00', type: 'remunerada', observation: '' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Maria Santos',
    month: '12',
    year: '2024',
    entries: [
      { id: '2-1', date: '2024-12-03', projectId: '2', projectName: 'Edifício Central', startTime: '18:00', endTime: '21:00', type: 'remunerada', observation: 'Supervisão noturna' },
      { id: '2-2', date: '2024-12-08', projectId: '1', projectName: 'Residencial Flores', startTime: '17:00', endTime: '20:00', type: 'banco_de_horas', observation: '' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Carlos Oliveira',
    month: '12',
    year: '2024',
    entries: [
      { id: '3-1', date: '2024-12-04', projectId: '3', projectName: 'Ponte Nova', startTime: '18:00', endTime: '22:00', type: 'remunerada', observation: '' },
      { id: '3-2', date: '2024-12-06', projectId: '3', projectName: 'Ponte Nova', startTime: '17:00', endTime: '22:00', type: 'remunerada', observation: 'Estrutura metálica' },
      { id: '3-3', date: '2024-12-09', projectId: '2', projectName: 'Edifício Central', startTime: '18:00', endTime: '21:00', type: 'remunerada', observation: '' },
    ],
    createdAt: new Date().toISOString(),
  },
];

const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Limite de horas extras',
    message: 'João Silva está próximo do limite de 40 horas extras semanais.',
    employeeId: '1',
    employeeName: 'João Silva',
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: '2',
    type: 'error',
    title: 'Limite excedido',
    message: 'João Silva excedeu o limite de 16 horas extras aos sábados.',
    employeeId: '1',
    employeeName: 'João Silva',
    createdAt: new Date().toISOString(),
    read: false,
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: '1',
    email: 'admin@concrefuji.com.br',
    firstName: 'Administrador',
    lastName: 'Sistema',
    role: 'admin',
  });
  
  const [employees, setEmployees] = useState<Employee[]>(sampleEmployees);
  const [clients, setClients] = useState<Client[]>(sampleClients);
  const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRecord[]>(sampleOvertimeRecords);
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [settings, setSettings] = useState<SystemSettings>({
    maxWeeklyOvertime: 40,
    maxSaturdayOvertime: 16,
  });

  const isAuthenticated = currentUser !== null;

  const addEmployee = (employee: Omit<Employee, 'id' | 'createdAt'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setEmployees((prev) => [...prev, newEmployee]);
  };

  const updateEmployee = (id: string, employee: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...employee } : emp))
    );
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
  };

  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setClients((prev) => [...prev, newClient]);
  };

  const updateClient = (id: string, client: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...client } : c))
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const addOvertimeRecord = (record: Omit<OvertimeRecord, 'id' | 'createdAt'>) => {
    const newRecord: OvertimeRecord = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setOvertimeRecords((prev) => [...prev, newRecord]);
    
    // Check for overtime limit violations
    checkOvertimeLimits(newRecord);
  };

  const checkOvertimeLimits = (record: OvertimeRecord) => {
    let totalHours = 0;
    let saturdayHours = 0;
    
    record.entries.forEach((entry) => {
      const start = new Date(`2024-01-01T${entry.startTime}`);
      const end = new Date(`2024-01-01T${entry.endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      totalHours += hours;
      
      const dayOfWeek = new Date(entry.date).getDay();
      if (dayOfWeek === 6) {
        saturdayHours += hours;
      }
    });

    if (totalHours >= settings.maxWeeklyOvertime * 0.9) {
      addNotification({
        type: totalHours >= settings.maxWeeklyOvertime ? 'error' : 'warning',
        title: totalHours >= settings.maxWeeklyOvertime ? 'Limite excedido' : 'Limite de horas extras',
        message: `${record.employeeName} ${totalHours >= settings.maxWeeklyOvertime ? 'excedeu' : 'está próximo do'} limite de ${settings.maxWeeklyOvertime} horas extras semanais.`,
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        read: false,
      });
    }

    if (saturdayHours >= settings.maxSaturdayOvertime) {
      addNotification({
        type: 'error',
        title: 'Limite de sábados excedido',
        message: `${record.employeeName} excedeu o limite de ${settings.maxSaturdayOvertime} horas extras aos sábados.`,
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        read: false,
      });
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const getBirthdaysThisMonth = () => {
    const currentMonth = new Date().getMonth() + 1;
    return employees.filter((emp) => {
      const birthMonth = parseInt(emp.birthDate.split('-')[1], 10);
      return birthMonth === currentMonth;
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        clients,
        addClient,
        updateClient,
        deleteClient,
        overtimeRecords,
        addOvertimeRecord,
        notifications,
        addNotification,
        markNotificationAsRead,
        deleteNotification,
        clearAllNotifications,
        settings,
        updateSettings,
        getBirthdaysThisMonth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

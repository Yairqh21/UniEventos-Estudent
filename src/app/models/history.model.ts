export interface HistoryEvent {
  category: string;
  registrationDate: string; // ISO date string
  eventName: string;
  userAttendance: 'Asistió' | 'No asistió';
  status: 'Finalizado' | 'Pendiente' | 'Cancelado' | "En Progreso";
  colorStatus?: string;
  colorAttendance?: string;
}

//
  //ejemplo de historial
  // hostoryEvents: History[] = [
  //   {
  //     category: 'education',
  //     registrationDate: '15 jun 2025',
  //     eventName: 'Programación Orientada a Objetos con Java',
  //     userattented: 'Asistió',
  //     status: 'Finalizado'
  //   },
  //   {
  //     category: 'workshop',
  //     registrationDate: '10 jun 2025',
  //     eventName: 'Taller de Desarrollo Web',
  //     userattented: 'No asistió',
  //     status: 'Cancelado'
  //   },
  //   {
  //     category: 'seminar',
  //     registrationDate: '5 jun 2025',
  //     eventName: 'Seminario de Inteligencia Artificial',
  //     userattented: 'Por confirmar',
  //     status: 'Pendiente'
  //   },
  //   {
  //     category: 'meeting',
  //     registrationDate: '20 jun 2025',
  //     eventName: 'Reunión de Trabajo',
  //     userattented: 'Asistió',
  //     status: 'Finalizado'
  //   }
  // ];


import { Component, OnInit, OnDestroy } from '@angular/core';
import { RefresherCustomEvent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/services/events.service';
import { EventParticipationService } from 'src/app/services/eventParticipation.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { Events } from 'src/app/models/events.model';
import { EventParticipationModel } from 'src/app/models/eventParticipation.model';
import { HistoryEvent } from 'src/app/models/history.model';


import { Directory, Filesystem, FilesystemDirectory, FilesystemEncoding } from '@capacitor/filesystem';
//import { RefresherCustomEvent } from '@ionic/core';
import { Capacitor } from '@capacitor/core';

import jsPDF from 'jspdf';

import 'jspdf-autotable';
import { Utils } from 'src/app/services/utils/reports';
import { saveAs } from 'file-saver';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit, OnDestroy {

  public groupedEvents: { title: string, events: HistoryEvent[] }[] = [];
  public allHistoryEvents: HistoryEvent[] = [];
  public todaysEvents: HistoryEvent[] = [];
  public recentEvents: HistoryEvent[] = [];
  public pastMonthEvents: HistoryEvent[] = [];
  public olderEvents: HistoryEvent[] = [];
  public isLoading: boolean = true;

  private events: Events[] = [];
  private participations: EventParticipationModel[] = [];
  private username: string ;

  private participationsSubscription?: Subscription;

  constructor(
    private participationService: EventParticipationService,
    private eventService: EventsService,
    private utilService: UtilsService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.loadHistoryData();
    this.username = this.authService.currentUser().username;
  }

  ionViewWillEnter(): void {
    this.loadHistoryData();
  }

  ngOnDestroy(): void {
    this.participationsSubscription?.unsubscribe();
  }

  /**
 * Maneja el evento de actualización (pull-to-refresh)
 */
  handleRefresh(event: RefresherCustomEvent): void {
    this.loadHistoryData();
    setTimeout(() => event.target.complete(), 1000);
  }

  /**
   * Carga todos los datos del historial
   */
  private loadHistoryData(): void {
    this.participationsSubscription?.unsubscribe();

    this.participationsSubscription = this.participationService.getAllParticipations().subscribe({
      next: (participations) => {
        this.participations = participations;
        this.loadEventsForParticipations();

      },
      error: (error) => {
        console.error('Error loading participations:', error);
        this.utilService.toast('Error al cargar el historial', 'bottom', 2000, 'danger');
      }
    });
  }

  /**
   * Carga los eventos correspondientes a las participaciones
   */
  private loadEventsForParticipations(): void {
    const eventIds = this.participations.map(p => p.eventId);

    this.eventService.getAll().subscribe({
      next: (events) => {
        this.events = events.filter(event => eventIds.includes(event.id));
        this.categorizeHistoricalEvents();
        this.groupEvents();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.utilService.toast('Error al cargar los eventos', 'bottom', 2000, 'danger');
      }
    });
  }

  /**
   * Organiza los eventos en categorías temporales
   */
  private categorizeHistoricalEvents(): void {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Reiniciar las categorías
    this.allHistoryEvents = [];
    this.todaysEvents = [];
    this.recentEvents = [];
    this.pastMonthEvents = [];
    this.olderEvents = [];

    // Procesar cada evento
    this.events.forEach(event => {
      const historyEvent = this.createHistoryEventFromData(event);
      this.allHistoryEvents.push(historyEvent);

      // Clasificar por antigüedad
      const eventDate = this.getParticipationDate(event.id);

      if (eventDate.toDateString() === now.toDateString()) {
        this.todaysEvents.push(historyEvent);
      } else if (eventDate >= weekAgo) {
        this.recentEvents.push(historyEvent);
      } else if (eventDate >= monthAgo) {
        this.pastMonthEvents.push(historyEvent);
      } else {
        this.olderEvents.push(historyEvent);
      }
    });
  }

  /**
   * Crea un objeto HistoryEvent a partir de los datos del evento y participación
   */
  private createHistoryEventFromData(event: Events): HistoryEvent {
    const participation = this.participations.find(p => p.eventId === event.id);
    const status = this.determineEventStatus(event);
    const attendanceStatus = participation?.isAttended ? 'Asistió' : 'No asistió';

    return {
      category: event.eventType || 'general',
      registrationDate: new Date(participation?.registrationDate).toISOString(),
      eventName: event.eventName,
      userAttendance: attendanceStatus,
      status: status,
      colorStatus: this.getStatusColor(status),
      colorAttendance: participation?.isAttended ? 'success' : 'danger'
    };
  }

  // agrupar los eventos
  private groupEvents() {
    this.groupedEvents = [];

    if (this.todaysEvents.length > 0) {
      this.groupedEvents.push({
        title: 'Hoy',
        events: this.todaysEvents
      });
    }

    if (this.recentEvents.length > 0) {
      this.groupedEvents.push({
        title: 'Últimos 7 días',
        events: this.recentEvents
      });
    }

    if (this.pastMonthEvents.length > 0) {
      this.groupedEvents.push({
        title: 'Este mes',
        events: this.pastMonthEvents
      });
    }

    if (this.olderEvents.length > 0) {
      this.groupedEvents.push({
        title: 'Eventos anteriores',
        events: this.olderEvents
      });
    }
  }

  /**
   * Determina el estado de un evento (Finalizado, Pendiente, Cancelado)
   */
  private determineEventStatus(event: Events): 'Finalizado' | 'Pendiente' | 'Cancelado' | "En Progreso" {
    const eventDate = new Date(event.eventDateTime);
    const now = new Date();

    if (event.cancellationReason) {
      return 'Cancelado';
    }
    return eventDate < now ? 'Finalizado' : 'Pendiente';
  }

  /**
   * Obtiene la fecha de participación para un evento
   */
  private getParticipationDate(eventId: string): Date {
    const participation = this.participations.find(p => p.eventId === eventId);
    return new Date(participation?.registrationDate || new Date());
  }

  // Métodos para los iconos
  getEventIcon(category: string): string {
    const icons: Record<string, string> = {
      'education': 'school-outline',
      'workshop': 'construct-outline',
      'seminar': 'people-outline',
      'meeting': 'briefcase-outline',
      'general': 'calendar-outline'
    };
    return icons[category.toLowerCase()] || 'calendar-outline';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'finalizado': 'primary',
      'pendiente': 'warning',
      'cancelado': 'danger',
      'en progreso': 'success'
    };
    return colors[status.toLowerCase()] || 'medium';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'finalizado': 'checkmark-circle-outline',
      'pendiente': 'time-outline',
      'cancelado': 'close-circle-outline',
      'en progreso': 'play-circle-outline'
    };
    return icons[status.toLowerCase()] || 'help-circle-outline';
  }

  getAttendanceColor(attendance: string): string {
    const colors: Record<string, string> = {
      'asistió': 'success',
      'no asistió': 'danger'
    };
    return colors[attendance.toLowerCase()] || 'medium';
  }

  getAttendanceIcon(attendance: string): string {
    const icons: Record<string, string> = {
      'asistió': 'checkmark-outline',
      'no asistió': 'close-outline'
    };
    return icons[attendance.toLowerCase()] || 'ellipse-outline';
  }



  /**
   * Formatea una fecha en formato legible
   * @param dateTime - Cadena de fecha ISO
   * @returns Fecha formateada como "DD-MM-YYYY a las HH:MM:SS AM/PM"
   */
  private formatEventDateTime(dateTime: string): string {
    const date = new Date(dateTime);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; // Convertir a formato 12 horas

    return `${day}-${month}-${year} a las ${hours}:${minutes}:${seconds} ${period}`;
  }

  /**
   * Genera un nombre de archivo consistente para el PDF
   * @returns Nombre de archivo en formato "reporte-UniEventos-usuario-fecha.pdf"
   */
  private generatePdfFileName(): string {
    const currentDate = new Date();
    const formattedDate = [
      currentDate.getDate(),
      currentDate.getMonth() + 1,
      currentDate.getFullYear()
    ].join('-');

    return `reporte-UniEventos-${this.username}-${formattedDate}.pdf`;
  }

  /**
   * Agrega el encabezado al documento PDF
   * @param doc - Instancia de jsPDF
   * @param logoBase64 - Imagen del logo en base64
   */
  private addPdfHeader(doc: jsPDF, logoBase64: string): void {
    // Logo
    doc.addImage(logoBase64, 'PNG', 24, 15, 15, 10);

    // Título y usuario
    doc.setFontSize(18);
    doc.text('UniEventos', 15, 30);
    doc.setFontSize(12);
    doc.text(this.username, 23, 35);

    // Fecha actual
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Fecha: ${currentDate}`, 163, 30);

    // Título del reporte
    doc.setFontSize(15);
    doc.text('Mi historial', 15, 55);
  }

  /**
   * Genera y descarga un PDF con el historial de eventos
   */
  public async generateEventHistoryPDF(): Promise<void> {
    const pdfDocument = new jsPDF();
    const logoPath = 'assets/img/logoApp-removebg-preview.png';

    try {
      // Convertir logo a base64
      const logoBase64 = await Utils.convertImageToBase64(logoPath);

      // Configurar encabezado
      this.addPdfHeader(pdfDocument, logoBase64);

      // Configurar tabla de datos
      const tableHeaders = ['Fecha y hora', 'Nombre del evento', 'Estado', 'Asistencia'];
      const tableData = this.allHistoryEvents.map(event => [
        this.formatEventDateTime(event.registrationDate),
        event.eventName,
        event.status,
        event.userAttendance
      ]);

      // Agregar tabla al PDF
      Utils.addTableToPDF(
        pdfDocument,
        60, // startY
        { top: 10, right: 15, bottom: 10, left: 15 }, // margins
        tableHeaders,
        tableData
      );

      // Guardar PDF según plataforma
      if (Capacitor.isNativePlatform()) {
        await this.savePdfToDevice(pdfDocument);
      } else {
        this.downloadPdfInBrowser(pdfDocument);
      }

      this.utilService.toast('PDF generado correctamente', 'bottom', 2000, 'success');

    } catch (error) {
      console.error('Error al generar el PDF:', error);
      this.utilService.toast('Error al generar el PDF', 'top', 2000, 'danger');
      throw error;
    }
  }

  /**
   * Guarda el PDF en el sistema de archivos del dispositivo
   * @param pdfDocument - Instancia de jsPDF
   */
  private async savePdfToDevice(pdfDocument: jsPDF): Promise<void> {
    const pdfDataUri = pdfDocument.output('datauristring');
    const fileName = this.generatePdfFileName();

    await Filesystem.writeFile({
      path: fileName,
      data: pdfDataUri,
      directory: FilesystemDirectory.Documents,
      encoding: FilesystemEncoding.UTF8
    });

    console.log('PDF guardado en:', fileName);
  }

  /**
   * Descarga el PDF en el navegador web
   * @param pdfDocument - Instancia de jsPDF
   */
  private downloadPdfInBrowser(pdfDocument: jsPDF): void {
    const fileName = this.generatePdfFileName();
    pdfDocument.save(fileName);
  }



}

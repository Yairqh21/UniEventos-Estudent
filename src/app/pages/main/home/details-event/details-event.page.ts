import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Events } from 'src/app/models/events.model';
import { AlertController, RefresherCustomEvent } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { EventsService } from 'src/app/services/events.service';
import { UtilsService } from '../../../../services/utils/utils.service';
import { EventParticipationService } from 'src/app/services/eventParticipation.service';

@Component({
  selector: 'app-details-event',
  templateUrl: './details-event.page.html',
  styleUrls: ['./details-event.page.scss'],
})
export class DetailsEventPage implements OnInit {
  // Estado del componente
  event: Events = {} as Events;
  isLoading = true;

  // Estados de los botones
  showCancelButton = false;
  showMarkAttendanceButton = false;
  showAttendanceMarkedButton = false;
  isAttendanceMarked = false;

  // IDs relevantes
  private eventId: string = '';
  private eventRegistrationId: string = '';
  public ticketCode: string = '';

  constructor(
    private eventsService: EventsService,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private utilsService: UtilsService,
    private eventParticipationService: EventParticipationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeComponent();
  }

  /**
   * Inicializa el componente obteniendo parámetros y cargando datos
   */
  private initializeComponent(): void {
    this.activatedRoute.params
      .pipe(
        switchMap(params => {
          this.eventId = params['id'];
          return this.activatedRoute.queryParams;
        }),
        switchMap(queryParams => {
          this.eventRegistrationId = queryParams['eventRegistrations'] ;
          this.ticketCode = queryParams['ticketCode'];
          return this.loadEventData();
        })
      )
      .subscribe({
        next: () => this.checkAttendanceStatus(this.event),
        error: () => this.showErrorToast('Error al cargar el evento')
      });
  }


  /**
   * Maneja el evento de actualización (pull-to-refresh)
   */
  async handleRefresh(event: RefresherCustomEvent): Promise<void> {
    try {
      await this.loadEventData().toPromise();
      this.checkAttendanceStatus(this.event);
    } catch (error) {
      this.showErrorToast('Error al actualizar los datos. Verifique su conexión.');
    } finally {
      setTimeout(() => event.target.complete(), 1000);
    }
  }

  /**
   * Carga los datos del evento
   */
  private loadEventData(): Observable<void> {
    return this.eventsService.getById(this.eventId).pipe(
      map(eventData => {
        this.event = eventData;
        //this.isLoading = false;
      })
    );
  }

  /**
   * Cancela la participación en el evento
   */
  public cancelEventParticipation(): void {
    this.eventParticipationService.deleteParticipation(this.eventRegistrationId).subscribe({
      next: () => {
        this.utilsService.toast("Participación cancelada correctamente", "bottom");
        this.router.navigate(["/main/home"]);
      },
      error: (error) => this.handleError("Error al cancelar la participación", error)
    });
  }

  /**
   * Marca la asistencia al evento
   */
  public markAttendance(): void {
    this.getUserRegistration(this.eventId).pipe(
      take(1),
      switchMap(registrationId => {
        if (!registrationId) {
          throw new Error('No estás registrado en este evento');
        }
        return this.getRegistrationDate(registrationId);
      }),
      switchMap(registrationDate => {
        const attendanceData = {
          id: this.eventRegistrationId,
          eventId: this.eventId,
          isAttended: true,
          registrationDate: registrationDate
        };
        return this.eventParticipationService.updateParticipation(this.eventRegistrationId, attendanceData);
      })
    ).subscribe({
      next: () => this.handleAttendanceSuccess(),
      error: (error) => this.handleError("Error al marcar la asistencia", error)
    });
  }

  /**
   * Verifica el estado de asistencia del usuario
   */
  private checkAttendanceStatus(event: Events): void {
    this.eventParticipationService.getAllParticipations().pipe(take(1)).subscribe(registrations => {
      this.isAttendanceMarked = registrations.some(reg =>
        reg.eventId === event.id && reg.isAttended
      );

      const { isEventInFuture, isWithinEventHour, isEventFinished } = this.calculateEventTimeStates(event);

      this.updateButtonVisibility(isEventInFuture, isWithinEventHour, isEventFinished);
      this.isLoading = false;
    });
  }

  /**
   * Calcula los estados del evento basados en el tiempo actual
   */
  private calculateEventTimeStates(event: Events) {
    const eventTime = new Date(event.eventDateTime);
    const currentTime = new Date();
    const oneHourAfter = new Date(eventTime.getTime() + (60 * 60 * 1000));

    return {
      isEventInFuture: currentTime < eventTime,
      isWithinEventHour: currentTime >= eventTime && currentTime <= oneHourAfter,
      isEventFinished: currentTime > oneHourAfter
    };
  }

  /**
   * Actualiza la visibilidad de los botones
   */
  private updateButtonVisibility(isEventInFuture: boolean, isWithinEventHour: boolean, isEventFinished: boolean): void {
    this.showCancelButton = isEventInFuture && !isEventFinished;
    this.showMarkAttendanceButton = isWithinEventHour && !this.isAttendanceMarked;
    this.showAttendanceMarkedButton = this.isAttendanceMarked && (isWithinEventHour || isEventFinished);

    // Caso especial: evento finalizado sin asistencia marcada
    if (isEventFinished && !this.isAttendanceMarked) {
      this.showCancelButton = false;
      this.showMarkAttendanceButton = false;
      this.showAttendanceMarkedButton = false;
    }
  }

  /**
   * Obtiene el ID de registro del usuario para el evento
   */
  private getUserRegistration(eventId: string): Observable<string> {
    return this.eventParticipationService.getAllParticipations().pipe(
      map(registrations => {
        const registration = registrations.find(reg => reg.eventId === eventId);
        if (!registration) {
          throw new Error('Registration not found');
        }
        return registration.id;
      })
    );
  }

  /**
   * Obtiene la fecha de registro para una asistencia
   */
  private getRegistrationDate(registrationId: string): Observable<string> {
    return this.eventParticipationService.getAllParticipations().pipe(
      map(registrations => {
        const registration = registrations.find(reg => reg.id === registrationId);
        if (!registration?.registrationDate) {
          throw new Error('Registration date not found');
        }
        return registration.registrationDate;
      })
    );
  }

  /**
   * Maneja el éxito al marcar asistencia
   */
  private handleAttendanceSuccess(): void {
    this.isAttendanceMarked = true;
    this.showMarkAttendanceButton = false;
    this.showAttendanceMarkedButton = true;
    this.showCancelButton = false;
    this.utilsService.toast("Asistencia marcada correctamente", "bottom" , 2000, "success");
  }

  /**
   * Muestra alerta de confirmación para cancelar participación
   */
  public async showCancellationConfirmation(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Estás seguro de cancelar tu asistencia al evento?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => this.cancelEventParticipation()
        }
      ]
    });

    await alert.present();
  }

  /**
   * Maneja errores y muestra toast
   */
  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.utilsService.toast(message, "bottom" , 2000, "danger");
  }

  private showErrorToast(message: string): void {
    this.utilsService.toast(message, "bottom" , 2000, "danger");
  }
}

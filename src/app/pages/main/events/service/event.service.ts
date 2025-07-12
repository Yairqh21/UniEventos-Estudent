import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventParticipationModel } from 'src/app/models/eventParticipation.model';
import { Events } from 'src/app/models/events.model';
import { EventParticipationService } from 'src/app/services/eventParticipation.service';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Injectable({
  providedIn: 'root',
})
export class EventUtilsService {
  private destroy$ = new Subject<void>();
  private allEvents: Events[] = [];
  private allParticipations = new BehaviorSubject<EventParticipationModel[]>([]);
  ticketCode: string = '';

  // devolver un observable
  get participations$(): Observable<EventParticipationModel[]> {
    return this.allParticipations.asObservable();
  }

  constructor(
    private utilsService: UtilsService,
    private eventParticipationService: EventParticipationService
  ) {
    this.verifyIfAlreadySubscribed();
  }

  saveEventRegistration(eventId: string): void {
    if (!eventId) {
      this.utilsService.toast('No se encontraron datos del evento', 'bottom', 2000, 'warning');
      return;
    }

    this.verifyIfAlreadySubscribed(eventId);
  }

  private verifyIfAlreadySubscribed(eventId?: string): void {
    this.eventParticipationService.getAllParticipations().pipe(
      takeUntil(this.destroy$)
    ).subscribe(participations => {
      //this.allParticipations = participations;
      this.allParticipations.next(participations);
      if (!eventId) return;

      const isAlreadyRegistered = this.isAlreadyRegistered(eventId);

      if (isAlreadyRegistered) {
        this.utilsService.toast('Ya está registrado en este evento', 'bottom', 2000);
      } else {
        this.registerToEvent(eventId);
      }
    });
  }


  // Actualizar otros métodos relevantes
  private registerToEvent(eventId: string): void {
    const registration = this.buildParticipation(eventId);

    this.eventParticipationService.createParticipation(registration).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (event) => {
        this.ticketCode = event.ticketCode;
        this.utilsService.toast('Se registró al evento correctamente', 'bottom', 2000, 'success');
        // Actualizar las participaciones después de registrar
        this.fetchParticipations().then(participations => {
          this.allParticipations.next(participations);
        });
      },
      error: (err) => {
        console.error('Error en registro:', err);
        this.utilsService.toast('Error al registrar en el evento', 'bottom', 2000, 'danger');
      },
    });
  }

  private buildParticipation(eventId: string): EventParticipationModel {

    return {
      id: '',
      eventId,
      isAttended: false,
      ticketCode: this.generateTicketCode(),
      registrationDate: this.getCurrentDateTime(),
    };
  }

  fetchParticipations(): Promise<EventParticipationModel[]> {
    return new Promise((resolve, reject) => {
      this.eventParticipationService.getAllParticipations().pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: participations => {
          this.allParticipations.next(participations);
          resolve(participations);
        },
        error: error => reject(error)
      });
    });
  }

  // Actualizar isAlreadyRegistered
  isAlreadyRegistered(eventId: string): boolean {
    const currentParticipations = this.allParticipations.getValue();
    return currentParticipations.some(p => p.eventId === eventId && !p.isAttended);
  }

  generateTicketCode(): string {
    return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  }

  private getCurrentDateTime(): string {
    return new Date().toISOString().split('.')[0] + 'Z';
  }

  getticketCode(): string {
    return this.ticketCode;
  }

  setEvents(events: Events[]): void {
    this.allEvents = events;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}

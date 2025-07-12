import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RefresherCustomEvent } from '@ionic/angular';

import { Events } from 'src/app/models/events.model';
import { EventParticipationModel } from 'src/app/models/eventParticipation.model';
import { EventsService } from 'src/app/services/events.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { EventUtilsService } from './service/event.service';
import { AuthService } from 'src/app/services/auth.service';

type EventType =
  | 'Todos'
  | 'Academico'
  | 'Cultural'
  | 'Deportivo'
  | 'Conferencias'
  | 'Voluntariado'
  | 'Orientacion'
  | 'PresentacionesPyE';

interface EventTypeOption {
  value: EventType;
  label: string;
}

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit, OnDestroy {

  // ========== State ==========
  private destroy$ = new Subject<void>();
  allEvents: Events[] = [];
  filteredEvents: Events[] = [];
  allEventsParticipated: EventParticipationModel[] = [];

  selectedEventType: EventType = 'Todos';
  selectedDate = '';
  selectedModality = 'Todos';
  searchTerm = '';

  ticketCode: string;
  estudentCareer: string | null = null;
  displayModal = false;
  isLoading = false;
  contentLoaded = false;
  infiniteDisabled = false;
  lastEventTimestamp: number | null = null;

  readonly typeEvents: EventTypeOption[] = [
    { value: 'Todos', label: 'Todos' },
    { value: 'Academico', label: 'Académico' },
    { value: 'Cultural', label: 'Cultural' },
    { value: 'Deportivo', label: 'Deportivo' },
    { value: 'Conferencias', label: 'Conferencias' },
    { value: 'Voluntariado', label: 'Voluntariado' },
    { value: 'Orientacion', label: 'Orientación' },
    { value: 'PresentacionesPyE', label: 'Presentaciones P y E' }
  ];

  // ========== Constructor ==========
  constructor(
    private eventsService: EventsService,
    private utilsService: UtilsService,
    private eventUtilsService: EventUtilsService,
    private authService: AuthService,
  ) { }

  // ========== Lifecycle ==========
  ngOnInit(): void {
    this.eventUtilsService.participations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(participations => {
        this.allEventsParticipated = participations;
      });

    this.loadParticipations();
    this.retrieveEvents();
    this.estudentCareer = this.authService.currentUser().career;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========== Data Fetch ==========
  private loadParticipations(): void {
    this.eventUtilsService.fetchParticipations();
  }

  private async retrieveEvents(): Promise<void> {
    this.lastEventTimestamp = null;

    this.eventsService.getEventsPage(10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: events => {
          this.allEvents = this.filterEventsByAudience(events);
          this.filteredEvents = [...this.allEvents];
          this.eventUtilsService.setEvents(this.allEvents);

          const last = events.slice(-1)[0];

          if (last?.createdAt) {
            this.lastEventTimestamp = last.createdAt.seconds * 1000 + Math.floor(last.createdAt.nanos / 1e6);
          }

          this.contentLoaded = true;
        },
        error: error => {
          console.error(error);
          this.utilsService.toast('Error al cargar los eventos', 'bottom', 2000, 'danger');
        }
      });
  }

  loadNextPage(event?: any): void {
    this.eventsService.getEventsPage(10, this.lastEventTimestamp).subscribe(page => {
      const newEvents = page.filter(e => !this.filteredEvents.some(ev => ev.id === e.id));
      this.filteredEvents.push(...newEvents);

      const last = page.slice(-1)[0];
      if (last?.createdAt) {
        this.lastEventTimestamp = last.createdAt.seconds * 1000 + Math.floor(last.createdAt.nanos / 1e6);
      }

      event?.target.complete();
      if (page.length < 10) this.infiniteDisabled = true;
    });
  }

  private filterEventsByAudience(events: Events[]): Events[] {
    return events.filter(event =>
      event.targetAudience.includes(this.estudentCareer ?? '') ||
      event.targetAudience.includes('Todos')
    );
  }

  // ========== Registro ==========
  registerIfNotAlready(eventId: string): void {
    if (this.isUserRegisteredToEvent(eventId)) {
      this.utilsService.toast('Ya estás inscrito en este evento', 'bottom');
      return;
    }

    this.isLoading = true;
    this.eventUtilsService.saveEventRegistration(eventId);

    setTimeout(() => {
      this.isLoading = false;
      this.ticketCode = this.eventUtilsService.getticketCode();
      this.displayModal = true;
    }, 1500);
  }

  isUserRegisteredToEvent(eventId: string): boolean {
    return this.allEventsParticipated.some(p => p.eventId === eventId);
  }

  // ========== Filtros ==========
  applyFilters(): void {
    this.filteredEvents = this.allEvents.filter(event => {
      const matchesType = this.selectedEventType === 'Todos' || event.eventType === this.selectedEventType;
      const matchesSearch = !this.searchTerm || (
        event.eventName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (event.description?.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (event.location?.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
      console.log('1111111', event.eventDateTime, this.selectedDate);
      const matchesDate = !this.selectedDate || this.matchDate(event.eventDateTime.toString(), this.selectedDate);
      console.log("matchesDate", matchesDate);
      const matchesModality = this.selectedModality === 'Todos' || event.eventModality?.toLowerCase() === this.selectedModality.toLowerCase();

      return matchesType && matchesSearch && matchesDate && matchesModality;
    });

    this.contentLoaded = true;
  }

  private matchDate(eventDateStr: string, selectedDateStr: string): boolean {
    const eventDate = new Date(eventDateStr);
    const eventFormatted = eventDate.toISOString().slice(0, 10);
    return eventFormatted === selectedDateStr;
  }


  // ========== Eventos de UI ==========
  async handleRefresh(event: RefresherCustomEvent): Promise<void> {
    try {
      await this.retrieveEvents();
    } finally {
      event.target.complete();
    }
  }

  onEventTypeChange(event: CustomEvent): void {
    this.selectedEventType = event.detail.value;
    this.applyFilters();
  }

  onSearchChange(event: CustomEvent): void {
    this.searchTerm = event.detail.value ?? '';
    this.applyFilters();
  }

  onDateChange(event: CustomEvent): void {
    this.selectedDate = event.detail.value ?? '';
    this.applyFilters();
  }

  onModalityChange(event: CustomEvent): void {
    this.selectedModality = event.detail.value ?? 'Todos';
    this.applyFilters();
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Events } from 'src/app/models/events.model';
import { EventsService } from 'src/app/services/events.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { EventUtilsService } from '../service/event.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-details-event',
  templateUrl: './details-event.page.html',
  styleUrls: ['./details-event.page.scss'],
})
export class DetailsEventPage implements OnInit {
  eventId: string = '';
  event: Events = {} as Events;
  user: User = {} as User;
  contentLoaded = false;
  buttonText: string = 'Participar';
  buttonDisabled: boolean = false;
  displayModal = false;
  isLoading = false;
  isRegistered = false;
  private destroy$ = new Subject<void>();

  get ticketCode(): string {
    return this.eventUtilsService.getticketCode();
  }

  constructor(
    private eventsService: EventsService,
    private userService: UserService,
    private route: ActivatedRoute,
    private utilsService: UtilsService,
    private eventUtilsService: EventUtilsService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.eventId = params.get('id') || '';
      this.loadEvent();
    });

    this.eventUtilsService.participations$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.isRegistered = this.eventUtilsService.isAlreadyRegistered(this.eventId);
    });
  }

  async loadEvent(): Promise<void> {
    if (!this.eventId) return;

    try {
      this.event = await this.eventsService.getById(this.eventId).toPromise();
      this.user = await this.userService.getUserById(this.event.userCreatedId).toPromise();
      this.contentLoaded = true;
    } catch (error) {
      console.error('Error retrieving event details:', error);
      this.utilsService.toast('Error al cargar los detalles del evento.', 'bottom' , 2000, 'danger');
    }
  }

  isUserRegistered(): boolean {
    return this.eventUtilsService.isAlreadyRegistered(this.eventId);
  }


  saveEventRegistration(eventId: string): void {
    if (this.isRegistered) {
      this.utilsService.toast('Ya estás inscrito en este evento', 'bottom' , 2000, 'warning');
      return;
    }

    this.isLoading = true;
    this.eventUtilsService.saveEventRegistration(eventId);

    setTimeout(() => {
      this.isLoading = false;
      this.displayModal = true;
    }, 1500);
  }

}

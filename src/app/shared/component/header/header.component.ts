import { UtilsService } from './../../../services/utils/utils.service';
import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Events } from 'src/app/models/events.model';
import { EventsService } from 'src/app/services/events.service';
import { EventParticipationService } from 'src/app/services/eventParticipation.service';
import { EventParticipationModel } from 'src/app/models/eventParticipation.model';
import { SurveyModel } from 'src/app/models/survey.model';
import { SurveyService } from 'src/app/services/survey.service';
import { Answer } from 'src/app/models/answer.model';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { forkJoin } from 'rxjs';

interface Notification {
  eventId: string;
  eventName: string;
  eventType: string;
  date: Date;
  read: boolean;
  type: 'survey' | 'info';
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() title!: string;
  @Input() buttonType: 'menu' | 'back' | 'nav' = 'menu';
  @Input() showAvatar: boolean = false;
  @Input() showNotifications: boolean = false;

  isModalOpen = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  userImage: string | null = null;
  loadingNotifications = false;


  constructor(
    private location: Location,
    private authService: AuthService,
    private eventService: EventsService,
    private surveyService: SurveyService,
    private router: Router,
    private assistancesService: EventParticipationService,
    private utilsService: UtilsService
  ) { }

  ngOnInit() {
    this.loadUserData();
    this.loadNotifications();
  }

  private loadUserData() {
    const user = this.authService.currentUser();
    this.userImage = user?.imgUrl || null;
  }

  private async loadNotifications() {
    if (!this.showNotifications) return;

    this.loadingNotifications = true;
    try {
      const [events, participations] = await forkJoin([
        this.eventService.getAll().toPromise(),
        this.assistancesService.getAllParticipations().toPromise()
      ]).toPromise();

      if (events && participations) {
        await this.processNotifications(events, participations);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.utilsService.toast('Error al cargar notificaciones');
    } finally {
      this.loadingNotifications = false;
    }
  }

  private async processNotifications(events: Events[], participations: EventParticipationModel[]) {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Procesar eventos finalizados
    const pastEvents = events.filter(event => {
      const eventDate = new Date(event.eventDateTime!);
      return eventDate < now && eventDate >= yesterday;
    });

    // Verificar participación y encuestas
    for (const event of pastEvents) {
      const participated = participations.some(p =>
        p.eventId === event.id && p.isAttended
      );

      if (participated) {
        const surveyCompleted = await this.checkSurveyCompletion(event.id!);
        if (!surveyCompleted) {
          this.addNotification({
            eventId: event.id!,
            eventName: event.eventName!,
            eventType: event.eventType!,
            date: new Date(event.eventDateTime!),
            read: false,
            type: 'survey'
          });
        }
      }
    }

    this.updateUnreadCount();
  }

  private async checkSurveyCompletion(eventId: string): Promise<boolean> {
    try {
      const surveys = await this.surveyService.getAllSurveys().toPromise();
      if (!surveys || surveys.length === 0) return false;

      const activeSurvey = surveys.find(s => s.isActive) || surveys[0];
      const answers = await this.surveyService.readAnswers(activeSurvey.id).toPromise();

      return answers?.some(a => a.eventId === eventId) || false;
    } catch (error) {
      console.error('Error checking survey:', error);
      return false;
    }
  }

  private addNotification(notification: Notification) {
    // Evitar duplicados
    if (!this.notifications.some(n => n.eventId === notification.eventId)) {
      this.notifications.push(notification);
    }
  }

  private updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  navigateToProfile() {
    this.router.navigate(['/main/profile']);
  }

  goBack() {
    this.location.back();
  }

  setOpen(isOpen: boolean): void {
    this.isModalOpen = isOpen;
    if (!isOpen) {
      this.markAllAsRead();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.updateUnreadCount();
  }

  async openToSurvey(eventId: string) {
    this.setOpen(false);
    // Marcar como leída
    const notification = this.notifications.find(n => n.eventId === eventId);
    if (notification) {
      notification.read = true;
      this.updateUnreadCount();
    }

    await new Promise(resolve => setTimeout(resolve, 100));
    this.router.navigate(['/main/events/satisfaction-survey'], {
      queryParams: { eventId }
    });
  }

  getNotificationIcon(type: 'survey' | 'info'): string {
    return type === 'survey' ? 'document-text-outline' : 'information-circle-outline';
  }

  getNotificationColor(type: 'survey' | 'info'): string {
    return type === 'survey' ? 'primary' : 'secondary';
  }
}

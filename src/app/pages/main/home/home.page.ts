import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, RefresherCustomEvent } from '@ionic/angular';
import { lastValueFrom } from 'rxjs';
import { EventParticipation } from 'src/app/interfaces/event-participation.interface';
import { EventParticipationModel } from 'src/app/models/eventParticipation.model';
import { AuthService } from 'src/app/services/auth.service';
import { EventParticipationService } from 'src/app/services/eventParticipation.service';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  // Servicios inyectados
  private readonly authService = inject(AuthService);
  private readonly eventParticipationService = inject(EventParticipationService);
  private readonly alertController = inject(AlertController);
  private readonly utilsService = inject(UtilsService);

  // Propiedades públicas
  public currentUser = computed(() => this.authService.currentUser());
  public upcomingEvents: EventParticipation[] = [];
  public todaysEvents: EventParticipation[] = [];
  public showTodaysEventsSection: boolean = false;
  isLoading = true;


  /**
   * Se ejecuta cuando la vista está a punto de entrar
   */
  async ionViewWillEnter(): Promise<void> {
    await this.loadWeekEvents();
    this.loadTodaysEvents(this.upcomingEvents);
  }


  /**
   * Maneja el evento de actualización (pull-to-refresh)
   * @param event Evento de refresco
   */
  async handleRefresh(event: RefresherCustomEvent): Promise<void> {
    try {
      await this.loadTodaysEvents(this.upcomingEvents);
      event.target.complete();
    } catch (error) {
      event.target.complete();
      await this.showErrorAlert("Error al actualizar los eventos");
    }
  }

  /**
   * Carga todos los eventos de la semana
   */
  private async loadWeekEvents(): Promise<void> {
    this.isLoading = true;
    try {
      const events$ = this.eventParticipationService.getAllParticipations();
      const events = await lastValueFrom(events$);
      this.upcomingEvents = events || [];
      this.loadTodaysEvents(this.upcomingEvents);
      if (!events?.length) {
        this.utilsService.toast('No hay eventos en la semana', 'top' , 2000, 'warning');
      }
      this.isLoading = false;
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      this.upcomingEvents = [];
      await this.showErrorAlert("Error al cargar los eventos de la semana");
    }
  }

  /**
   * Carga los eventos de hoy
   */
  private async loadTodaysEvents(events: EventParticipation[]): Promise<void> {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(startOfToday.getTime() + (24 * 60 * 60 * 1000));

      this.todaysEvents = events.filter(event => {
        const eventDate = new Date(event.eventDateTime);
        return eventDate >= startOfToday && eventDate < endOfToday;
      });

      this.updateTodaysEventsVisibility(this.todaysEvents);
    } catch (error) {
      console.error('Error al cargar eventos de hoy:', error);
      await this.showErrorAlert("Error al cargar los eventos de hoy");
    }
  }


  /**
   * Actualiza la visibilidad de la sección de eventos de hoy
   * @param events Lista de eventos de hoy
   */
  private updateTodaysEventsVisibility(events: EventParticipation[]): void {
    this.showTodaysEventsSection = events.length > 0;
  }

  /**
   * Muestra una alerta de error
   * @param message Mensaje de error
   */
  private async showErrorAlert(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

}

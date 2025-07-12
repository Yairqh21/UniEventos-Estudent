import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';
import { EventParticipationModel } from '../models/eventParticipation.model';
import { EventParticipation } from '../interfaces/event-participation.interface';

@Injectable({
  providedIn: 'root'
})
export class EventParticipationService {
  private readonly baseUrl = `${API_CONFIG.baseUrl}/event-participation`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las participaciones de eventos del usuario actual
   */
  getAllParticipations(): Observable<EventParticipation[]> {
    return this.http.get<EventParticipation[]>(this.baseUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene una participación específica por ID
   * @param id ID de la participación
   */
  getParticipationById(id: string): Observable<EventParticipationModel> {
    if (!id) {
      return throwError(() => new Error('ID is required'));
    }

    return this.http.get<EventParticipationModel>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea una nueva participación en evento
   * @param participationData Datos de la participación
   */
  createParticipation(participationData: EventParticipationModel): Observable<EventParticipationModel> {
    if (!participationData) {
      return throwError(() => new Error('Participation data is required'));
    }

    return this.http.post<EventParticipationModel>(this.baseUrl, participationData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza una participación existente
   * @param id ID de la participación a actualizar
   * @param participationData Datos actualizados
   */
  updateParticipation(id: string, participationData: EventParticipationModel): Observable<EventParticipationModel> {
    if (!id || !participationData) {
      return throwError(() => new Error('ID and participation data are required'));
    }

    return this.http.put<EventParticipationModel>(
      `${this.baseUrl}/${id}`,
      participationData
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina una participación
   * @param id ID de la participación a eliminar
   */
  deleteParticipation(id: string): Observable<void> {
    if (!id) {
      return throwError(() => new Error('ID is required'));
    }

    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Maneja errores HTTP de manera consistente
   * @param error Error recibido
   * @returns Observable que emite el error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error en EventParticipationService:', error);

    let errorMessage = 'Ocurrió un error al procesar la solicitud';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }



}

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Events } from '../models/events.model';
import { API_CONFIG } from '../config/api.config';
import { DataRequest } from '../interfaces/data-request.interface';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private readonly baseEndpoint = 'events';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los eventos
   * @returns Observable con array de eventos
   */
  getAll(): Observable<Events[]> {
    return this.http.get<Events[]>(
      `${API_CONFIG.baseUrl}/${this.baseEndpoint}`,
      { params: { pathSegments: this.baseEndpoint } }
    );
  }

  getEventsPage(limit: number, startAfterCreatedAt?: number): Observable<Events[]> {
    let params = new HttpParams()
      .set('pathSegments', 'events')
      .set('limit', limit.toString());

    if (startAfterCreatedAt) {
      params = params.set('startAfterCreatedAt', startAfterCreatedAt.toString());
    }

    return this.http.get<Events[]>(`${API_CONFIG.baseUrl}/events/paginated`, { params });
  }

  /**
   * Obtiene un evento por su ID
   * @param id ID del evento
   * @returns Observable con el evento
   */
  getById(id: string): Observable<Events> {
    if (!id) {
      throw new Error('ID is required');
    }

    return this.http.get<Events>(
      `${API_CONFIG.baseUrl}/${this.baseEndpoint}/${id}`,
      { params: { pathSegments: this.baseEndpoint } }
    );
  }

  /**
   * Crea un nuevo evento
   * @param event Datos del evento a crear
   * @returns Observable con el evento creado
   */
  create(event: Events): Observable<Events> {
    if (!event) {
      throw new Error('Event data is required');
    }

    const request: DataRequest<Events> = {
      path: { pathSegments: [this.baseEndpoint] },
      entity: event
    };

    return this.http.post<Events>(
      `${API_CONFIG.baseUrl}/${this.baseEndpoint}`,
      request
    );
  }

  /**
   * Actualiza un evento existente
   * @param id ID del evento a actualizar
   * @param event Datos actualizados del evento
   * @returns Observable con la respuesta
   */
  update(id: string, event: Events): Observable<Events> {
    if (!id || !event) {
      throw new Error('ID and event data are required');
    }
    const request: DataRequest<Events> = {
      path: { pathSegments: [this.baseEndpoint] },
      entity: event
    };

    return this.http.put<Events>(
      `${API_CONFIG.baseUrl}/${this.baseEndpoint}/${id}`,
      request
    );
  }

  /**
   * Elimina un evento
   * @param id ID del evento a eliminar
   * @returns Observable con la respuesta
   */
  delete(id: string): Observable<void> {
    if (!id) {
      throw new Error('ID is required');
    }

    return this.http.delete<void>(
      `${API_CONFIG.baseUrl}/${this.baseEndpoint}/${id}`,
      { params: { pathSegments: this.baseEndpoint } }
    );
  }

  /**
   * Busca eventos por nombre
   * @param eventName Nombre o parte del nombre del evento
   * @returns Observable con array de eventos encontrados
   */
  searchByName(eventName: string): Observable<Events[]> {
    if (!eventName) {
      throw new Error('Event name is required');
    }

    return this.http.get<Events[]>(
      `${API_CONFIG.baseUrl}/${this.baseEndpoint}`,
      { params: { eventName } }
    );
  }
}

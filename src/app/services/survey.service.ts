import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { SurveyModel } from '../models/survey.model';
import { DataRequest } from '../interfaces/data-request.interface';
import { Answer } from '../models/answer.model';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private readonly baseEndpoint = 'surveys';

  constructor(private http: HttpClient) { }

  getAllSurveys(): Observable<SurveyModel[]> {
    return this.http.get<SurveyModel[]>(
      `${API_CONFIG.baseUrl}/${this.baseEndpoint}`,
      { params: { pathSegments: this.baseEndpoint } }
    );
  }

  getById(id: string): Observable<SurveyModel> {
    if (!id) throw new Error('ID is required');
    return this.http.get<SurveyModel>(
      `${API_CONFIG.baseUrl}/${this.baseEndpoint}/${id}`,
      { params: { pathSegments: this.baseEndpoint } }
    );
  }

  getByEventId(id: string): Observable<SurveyModel> {
    if (!id) throw new Error('ID is required');
    return this.http.get<SurveyModel>(
      `${API_CONFIG.baseUrl}/${this.baseEndpoint}/event/${id}`,
      { params: { pathSegments: this.baseEndpoint } }
    );
  }

  create(survey: SurveyModel): Observable<SurveyModel> {
    if (!survey) throw new Error('Survey is required');

    const request: DataRequest<SurveyModel> = {
      path: { pathSegments: [this.baseEndpoint] },
      entity: survey
    };

    return this.http.post<SurveyModel>(
      `${API_CONFIG.baseUrl}/${this.baseEndpoint}`,
      request
    );
  }

  update(id: string, survey: SurveyModel): Observable<SurveyModel> {
    if (!id || !survey) throw new Error('ID and Survey are required');

    const request: DataRequest<SurveyModel> = {
      path: { pathSegments: [this.baseEndpoint] },
      entity: survey
    };

    return this.http.put<SurveyModel>(
      `${API_CONFIG.baseUrl}/${this.baseEndpoint}/${id}`,
      request
    );
  }

  delete(id: string): Observable<void> {
    if (!id) throw new Error('ID is required');
    return this.http.delete<void>(
      `${API_CONFIG.baseUrl}/${this.baseEndpoint}/${id}`,
      { params: { pathSegments: this.baseEndpoint } }
    );
  }

  //create answer
  saveSurveyAnswer(data: Answer, surveyId: string): Observable<Answer> {
    console.log('las respuestas', data);
    if (!data) {
      throw new Error('Answer data is required');
    }

    const request: DataRequest<Answer> = {
      path: { pathSegments: [this.baseEndpoint, surveyId, 'surveyAnswer'] },
      entity: data
    };
    return this.http.post<Answer>(
      `${API_CONFIG.baseUrl}/survey-response`,
      request
    );
  }

  //read answer
  readAnswers(id: string): Observable<Answer[]> {
    if (!id) throw new Error('ID is required');
    return this.http.get<Answer[]>(
      `${API_CONFIG.baseUrl}/${this.baseEndpoint}/${id}/surveyAnswer`,
      { params: { pathSegments: this.baseEndpoint } }
    );
  }


}

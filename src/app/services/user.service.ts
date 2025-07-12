import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';

import { API_CONFIG } from '../config/api.config';
import { User } from '../models/user.model';
import { DataRequest } from '../interfaces/data-request.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly endpoint = 'users';
  private currentUserCache$?: Observable<User>;

  private userSource = new BehaviorSubject<User | null>(null);
  public user$ = this.userSource.asObservable();

  constructor(private http: HttpClient) { }


  /**
   * Updates the current user in the BehaviorSubject
   * @param user The user object to set as current
   */
  public updateCurrentUser(user: User): void {
    this.userSource.next(user);
    // Clear cache when manually updating user to ensure consistency
    this.clearCache();
  }

  /**
   * Gets all users from the API
   * @returns Observable with array of users
   */
  public getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(
      this.buildUrl(''),
      { params: this.buildPathParams() }
    ).pipe(
      shareReplay(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Gets the current authenticated user with caching
   * @returns Observable with the current user data
   */
  public getCurrentUser(): Observable<User> {
    if (!this.currentUserCache$) {
      this.currentUserCache$ = this.http.get<User>(
        this.buildUrl('me'),
        { params: this.buildPathParams() }
      ).pipe(
        tap(user => this.updateCurrentUser(user)),
        shareReplay(1),
        catchError(this.handleError.bind(this))
      );
    }
    return this.currentUserCache$;
  }

  public getUserById(id: string): Observable<User> {
    return this.http.get<User>(
      this.buildUrl(id),
      { params: this.buildPathParams() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Registers a new user
   * @param userData User registration data
   * @returns Observable with the created user
   */
  public registerUser(userData: User): Observable<User> {
    if (!userData) {
      return throwError(() => new Error('User data is required'));
    }

    const request: DataRequest<User> = this.buildRequest(userData);

    return this.http.put<User>(this.buildUrl(''), request).pipe(
      tap(user => this.updateCurrentUser(user)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Updates a user
   * @param id User ID to update
   * @param userData Updated user data
   * @returns Observable with the updated user
   */
  public updateUser( userData: User): Observable<User> {
    if (!userData) {
      return throwError(() => new Error('ID and user data are required'));
    }

    const request: DataRequest<User> = this.buildRequest(userData);
    return this.http.put<User>(this.buildUrl('me'), request).pipe(
      tap(user => this.updateCurrentUser(user)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Deletes a user
   * @param id User ID to delete
   * @returns Observable with the deletion result
   */
  public deleteUser(id: string): Observable<void> {
    if (!id) {
      return throwError(() => new Error('ID is required'));
    }

    return this.http.delete<void>(
      this.buildUrl(id),
      { params: this.buildPathParams() }
    ).pipe(
      tap(() => {
        this.updateCurrentUser(null);
        this.clearCache();
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Clears the current user cache
   */
  public clearCache(): void {
    this.currentUserCache$ = undefined;
  }

  /**
   * Builds the complete URL for API requests
   * @param path The endpoint path to append
   * @returns Complete API URL
   */
  private buildUrl(path: string): string {
    // Remove duplicate slashes and trailing slashes
    return `${API_CONFIG.baseUrl}/${this.endpoint}/${path}`
      .replace(/([^:]\/)\/+/g, '$1')
      .replace(/\/+$/, '');
  }

  /**
   * Builds the standard path parameters for API requests
   * @returns HttpParams with path segments
   */
  private buildPathParams(): HttpParams {
    return new HttpParams().set('pathSegments', this.endpoint);
  }

  /**
   * Builds a DataRequest object
   * @param entity The entity data for the request
   * @returns DataRequest object
   */
  private buildRequest<T>(entity: T): DataRequest<T> {
    return {
      path: { pathSegments: [this.endpoint] },
      entity
    };
  }

  /**
   * Handles HTTP errors consistently
   * @param error The error response
   * @returns Error observable
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = this.getErrorMessage(error);
    console.error('UserService error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Gets a user-friendly error message
   * @param error The error response
   * @returns Error message string
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      return `Client error: ${error.error.message}`;
    }

    return this.getServerErrorMessage(error);
  }

  /**
   * Gets server-side specific error messages
   * @param error The HTTP error response
   * @returns Formatted error message
   */
  private getServerErrorMessage(error: HttpErrorResponse): string {
    const defaultMsg = error.message || 'An unknown error occurred. Please try again later.';

    switch (error.status) {
      case 400: return 'Invalid request data. Please check your input.';
      case 401: return 'Authentication required. Please log in.';
      case 403: return 'You do not have permission to perform this action.';
      case 404: return 'The requested resource was not found.';
      case 409: return 'Conflict: Resource already exists.';
      case 500: return 'Internal server error occurred.';
      default: return defaultMsg;
    }
  }

  //#endregion
}

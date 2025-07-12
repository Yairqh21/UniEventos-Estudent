import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { API_CONFIG } from '../config/api.config';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isPublicRequest(req)) {
      return next.handle(req);
    }

    return next.handle(this.addAuthHeader(req)).pipe(
      catchError(error => this.handleError(error, req, next))
    );
  }

  private isPublicRequest(req: HttpRequest<any>): boolean {
    const publicRoutes = [
      `${API_CONFIG.baseUrl}/auth/register`,
      `${API_CONFIG.baseUrl}/auth/check-account`,
      'identitytoolkit.googleapis.com' // Firebase endpoints
    ];
    return publicRoutes.some(route => req.url.includes(route));
  }

  private addAuthHeader(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getToken();
    return token ?
      req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) }) :
      req;
  }

  private handleError(
    error: any,
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        !this.authService.getToken()) {
      return throwError(() => error);
    }

    if (!this.isRefreshing) {
      return this.handleTokenRefresh(req, next);
    } else {
      return this.waitForTokenRefresh(req, next);
    }
  }

  private handleTokenRefresh(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.authService.refreshToken().pipe(
      switchMap((token) => {
        this.isRefreshing = false;
        this.refreshTokenSubject.next(token);
        return next.handle(this.addAuthHeader(req));
      }),
      catchError((err) => {
        this.isRefreshing = false;
        this.authService.logout();
        return throwError(() => err);
      })
    );
  }

  private waitForTokenRefresh(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addAuthHeader(req)))
    );
  }
}

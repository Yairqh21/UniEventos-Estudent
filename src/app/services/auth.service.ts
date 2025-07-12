import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, first, firstValueFrom, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthStatus } from '../models/auth-status.enum';
import { User } from '../models/user.model';
import { API_CONFIG } from '../config/api.config';
import { UserResponse } from '../models/UserResponse.interface';
import { getAuth, sendPasswordResetEmail, signInWithCustomToken, signInWithEmailAndPassword } from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Signals para estado de autenticación
  private _currentUser = signal<User | null>(null);
  private _authStatus = signal<AuthStatus>(AuthStatus.CHECKING);

  // Variables para manejo de refresh token
  private refreshTokenInProgress = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  // Dependencias
  private http = inject(HttpClient);
  private auth = inject(AngularFireAuth);

  // Computed properties
  public currentUser = computed(() => this._currentUser());
  public authStatus = computed(() => this._authStatus());

  constructor() {
    initializeApp(environment.firebaseConfig);
    this.initializeAuth();
  }

  /**
   * Inicializa el estado de autenticación al cargar el servicio
   */
  private initializeAuth(): void {
    const user = this.getUserFromLocalStorage();
    const token = this.getToken();

    if (user && token) {
      if (this.isTokenExpired(token)) {
        this.handleExpiredToken(user);
      } else {
        this.setAuthentication(user, token);
        this.scheduleTokenRefresh(token);
      }
    } else {
      this._authStatus.set(AuthStatus.UNAUTHENTICATED);
    }
  }

  /**
   * Maneja token expirado
   */
  private handleExpiredToken(user: User): void {
    this.refreshToken().subscribe({
      next: (newToken) => newToken ?
        this.setAuthentication(user, newToken) :
        this.logout(),
      error: () => this.logout()
    });
  }

  /**
   * Verifica si el token está expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (Math.floor(Date.now() / 1000)) >= payload.exp;
    } catch {
      return true;
    }
  }

  /**
   * Programa el refresco automático del token
   */
  private scheduleTokenRefresh(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      const bufferTime = 60000; // 1 minuto antes de expirar
      const timeUntilRefresh = expiry - Date.now() - bufferTime;

      if (timeUntilRefresh > 0) {
        setTimeout(() => this.refreshToken().subscribe(), timeUntilRefresh);
      }
    } catch (e) {
      console.error('Error scheduling token refresh:', e);
    }
  }

  /**
   * Registro de usuario
   */
  registerUser(data: User): Observable<boolean> {
    const url = `${API_CONFIG.baseUrl}/auth/register`;
    return this.http.post<UserResponse>(url, data).pipe(
      switchMap(({ user, token }) => this.exchangeCustomToken(user, token)),
      catchError(this.handleRegisterError)
    );
  }

  private exchangeCustomToken(user: User, token: string): Observable<boolean> {
    return from(signInWithCustomToken(getAuth(), token)).pipe(
      switchMap((userCredential) =>
        from(userCredential.user?.getIdToken() ?? Promise.reject('No token'))
      ),
      map((idToken) => this.setAuthentication(user, idToken)),
      catchError(() => throwError(() => new Error('Error exchanging token')))
    );
  }

  private handleRegisterError(error: any): Observable<never> {
    const message = error.status === 400 ?
      'Ya existe una cuenta con este correo' :
      'Error al registrar el usuario';
    return throwError(() => new Error(message));
  }

  /**
   * Login de usuario
   */
  async login(credentials: { email: string; password: string }): Promise<void> {
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const token = await userCredential.user.getIdToken();
      const userData = await firstValueFrom(this.getUser(token));
      this.validateUserRole(userData);
      this.setAuthentication(userData, token);
      this.scheduleTokenRefresh(token);
    } catch (error: any) {
      throw this.mapLoginError(error);
    }
  }

  private validateUserRole(user: User): void {
    if (user.role !== 'STUDENT' && user.role !== 'DEV') {
      throw new Error('NO_PERMISSION');
    }
  }

  private mapLoginError(error: any): Error {
    if (error.code === 400 || error.code === 'auth/invalid-credential') {
      return new Error('Credenciales incorrectas');
    } else if (error.message === 'NO_PERMISSION') {
      return new Error('No tienes permiso para ingresar');
    } else {
      return new Error('Error al iniciar sesión');
    }
  }

  /**
   * Obtener información del usuario
   */
  getUser(token: string): Observable<User> {
    const pathSegments: string[] = ['users'];
    const url = `${API_CONFIG.baseUrl}/users/me?pathSegments=${pathSegments.join(',')}`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);
    return this.http.get<User>(url, { headers });
  }

  /**
   * Verificar estado de autenticación
   */
  checkAuthStatus(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      this.logout();
      return of(false);
    }

    const url = `${API_CONFIG.baseUrl}/auth/check-token`;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<UserResponse>(url, { headers }).pipe(
      map(({ user, token }) => this.setAuthentication(user, token)),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  /**
   * Refrescar token
   */
  refreshToken(): Observable<string> {
    if (this.refreshTokenInProgress) {
      return this.refreshTokenSubject.pipe(first());
    }

    this.refreshTokenInProgress = true;
    this.refreshTokenSubject.next(null);

    return from(getAuth().currentUser?.getIdToken(true) ?? Promise.reject('No user')).pipe(
      switchMap((newToken) => this.validateTokenWithBackend(newToken)),
      catchError((error) => {
        this.refreshTokenInProgress = false;
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private validateTokenWithBackend(token: string): Observable<string> {
    return this.http.get<void>(`${API_CONFIG.baseUrl}/auth/check-token`, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
    }).pipe(
      map(() => {
        this.refreshTokenInProgress = false;
        localStorage.setItem('token', token);
        this.refreshTokenSubject.next(token);
        this.scheduleTokenRefresh(token);
        return token;
      })
    );
  }

  /**
   * Establecer autenticación
   */
  private setAuthentication(user: User, token: string): boolean {
    this._currentUser.set(user);
    this._authStatus.set(AuthStatus.AUTHENTICATED);

    localStorage.setItem('user', JSON.stringify({
      id: user.id,
      username: user.username,
      career: user.career,
      role: user.role,
      email: user.email
    }));

    localStorage.setItem('token', token);
    return true;
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.auth.signOut();
    this._currentUser.set(null);
    this._authStatus.set(AuthStatus.UNAUTHENTICATED);
  }

  /**
   * Recuperación de contraseña
   */
  async sendRecoveryEmail(email: string): Promise<void> {
    if (!(await this.ifAccountExists(email))) {
      throw new Error('El correo no está registrado');
    }

    const auth = getAuth();
    await sendPasswordResetEmail(auth, email).catch(() => {
      throw new Error('Error al enviar el correo');
    });
  }

  private async ifAccountExists(email: string): Promise<boolean> {
    const url = `${API_CONFIG.baseUrl}/auth/check-account`;
    return firstValueFrom(this.http.post<boolean>(url, { email }));
  }

  /**
   * Helpers
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token ?? ''}`);
  }

  private getUserFromLocalStorage(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
}


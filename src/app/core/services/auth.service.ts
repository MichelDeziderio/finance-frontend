import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  SimpleMessageResponse,
  User,
} from '../../models/auth.models';

const TOKEN_KEY = 'finance.auth.token';
const USER_KEY = 'finance.auth.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly _currentUser = signal<User | null>(this.getStoredUser());
  private readonly _token = signal<string | null>(this.getStoredToken());

  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  readonly userInitials = computed(() => {
    const name = this._currentUser()?.name?.trim();
    if (!name) return 'FN';
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap(res => this.setSession(res))
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap(res => this.setSession(res))
    );
  }

  forgotPassword(payload: ForgotPasswordPayload): Observable<SimpleMessageResponse> {
    return this.http.post<SimpleMessageResponse>(`${this.apiUrl}/forgot-password`, payload);
  }

  resetPassword(payload: ResetPasswordPayload): Observable<SimpleMessageResponse> {
    return this.http.post<SimpleMessageResponse>(`${this.apiUrl}/reset-password`, payload);
  }

  changePassword(payload: ChangePasswordPayload): Observable<SimpleMessageResponse> {
    return this.http.post<SimpleMessageResponse>(`${this.apiUrl}/change-password`, payload);
  }

  loadProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        this._currentUser.set(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      })
    );
  }

  logout(): void {
    this._token.set(null);
    this._currentUser.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem('finance.active-wallet-id');
    this.router.navigate(['/login']);
  }

  private setSession(auth: AuthResponse): void {
    this._token.set(auth.token);
    this._currentUser.set(auth.user);
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  }

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap, finalize } from 'rxjs/operators';
import { LoginRequest, LoginResponse, User, TokenStorage, ApiResponse } from '../models/auth.models';
import { TokenService } from './token.service';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);
  private readonly env = inject(EnvironmentService);
  
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  // Signals for reactive state management
  public readonly currentUser = signal<User | null>(null);
  public readonly isAuthenticated = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(false);

  // Observable streams
  public readonly currentUser$ = this.currentUserSubject.asObservable();
  public readonly isLoading$ = this.loadingSubject.asObservable();
  public readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const user = this.tokenService.getUser();
    const isValid = this.tokenService.isTokenValid();
    
    if (user && isValid) {
      this.setCurrentUser(user);
    } else {
      this.logout();
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.loadingSubject.next(true);
    this.isLoading.set(true);

    const url = `${this.env.apiUrl}/auth/login`;
    
    return this.http.post<LoginResponse>(url, credentials).pipe(
      tap((response: LoginResponse) => {
        if (response.success && response.data) {
          this.handleLoginSuccess(response);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error);
      }),
      finalize(() => {
        this.loadingSubject.next(false);
        this.isLoading.set(false);
      })
    );
  }

  logout(): void {
    // Call logout endpoint if needed
    const token = this.tokenService.getToken();
    if (token) {
      const url = `${this.env.apiUrl}/auth/logout`;
      this.http.post(url, {}).pipe(
        catchError(() => of(null)) // Ignore logout errors
      ).subscribe();
    }

    this.tokenService.clearTokens();
    this.setCurrentUser(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const url = `${this.env.apiUrl}/auth/refresh`;
    
    return this.http.post<LoginResponse>(url, { refreshToken }).pipe(
      tap((response: LoginResponse) => {
        if (response.success && response.data) {
          this.handleLoginSuccess(response);
        }
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private handleLoginSuccess(response: LoginResponse): void {
    if (!response.data) return;
    
    const { token, refreshToken, user, expiresIn } = response.data;
    const expiresAt = this.tokenService.calculateExpiryTime(expiresIn);
    
    const tokenStorage: TokenStorage = {
      token,
      refreshToken,
      user,
      expiresAt
    };

    this.tokenService.setTokens(tokenStorage);
    this.setCurrentUser(user);
    this.router.navigate(['/dashboard']);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Invalid credentials';
      } else if (error.status === 403) {
        errorMessage = 'Access denied';
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }

    console.error('Auth Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  private setCurrentUser(user: User | null): void {
    this.currentUser.set(user);
    this.isAuthenticated.set(!!user);
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(!!user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  shouldRefreshToken(): boolean {
    const token = this.tokenService.getToken();
    const refreshToken = this.tokenService.getRefreshToken();
    
    return !!(token && refreshToken && this.tokenService.isTokenExpired());
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }
}
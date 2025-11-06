import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { LoginForm, LoginResponse, ApiError } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  private readonly currentUserSubject = new BehaviorSubject<any>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  
  // Signals for reactive state management
  public readonly currentUser = signal<any>(null);
  public readonly isAuthenticated = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(false);

  // Observable streams
  public readonly currentUser$ = this.currentUserSubject.asObservable();
  public readonly isLoading$ = this.loadingSubject.asObservable();

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    
    if (token && user) {
      this.setCurrentUser(user);
    }
  }

  login(credentials: LoginForm): Observable<LoginResponse> {
    this.loadingSubject.next(true);
    this.isLoading.set(true);

    // Simulate API call - replace with actual endpoint
    return this.simulateLogin(credentials).pipe(
      tap((response: LoginResponse) => {
        this.handleLoginSuccess(response);
      }),
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error);
      }),
      tap(() => {
        this.loadingSubject.next(false);
        this.isLoading.set(false);
      })
    );
  }

  logout(): void {
    this.clearStoredAuth();
    this.setCurrentUser(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<LoginResponse> {
    const token = this.getStoredToken();
    if (!token) {
      return throwError(() => new Error('No token available'));
    }

    // Simulate token refresh - replace with actual endpoint
    return of({
      token: token,
      user: this.getStoredUser()
    } as LoginResponse);
  }

  private simulateLogin(credentials: LoginForm): Observable<LoginResponse> {
    // Simulate API delay
    return new Observable(observer => {
      setTimeout(() => {
        // Simple validation for demo
        if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
          const response: LoginResponse = {
            token: 'mock_jwt_token_' + Date.now(),
            user: {
              id: '1',
              email: credentials.email,
              name: 'Admin User',
              role: 'admin'
            }
          };
          observer.next(response);
        } else {
          observer.error({
            status: 401,
            error: { message: 'Invalid email or password' }
          } as HttpErrorResponse);
        }
        observer.complete();
      }, 1000);
    });
  }

  private handleLoginSuccess(response: LoginResponse): void {
    this.storeAuth(response.token, response.user);
    this.setCurrentUser(response.user);
    this.router.navigate(['/dashboard']);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }

    const apiError: ApiError = {
      message: errorMessage,
      code: error.status?.toString(),
      details: error.error
    };

    return throwError(() => apiError);
  }

  private setCurrentUser(user: any): void {
    this.currentUser.set(user);
    this.isAuthenticated.set(!!user);
    this.currentUserSubject.next(user);
  }

  private storeAuth(token: string, user: any): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private clearStoredAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return this.getStoredToken();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }
}
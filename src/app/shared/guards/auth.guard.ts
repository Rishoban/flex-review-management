import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map((isAuthenticated: boolean) => {
      if (isAuthenticated && tokenService.isTokenValid()) {
        // Check if route requires specific roles
        const requiredRoles = route.data?.['roles'] as string[];
        if (requiredRoles && requiredRoles.length > 0) {
          const hasRequiredRole = authService.hasAnyRole(requiredRoles);
          if (!hasRequiredRole) {
            router.navigate(['/unauthorized']);
            return false;
          }
        }
        return true;
      }

      // Check if token can be refreshed
      if (authService.shouldRefreshToken()) {
        authService.refreshToken().subscribe({
          next: () => {
            // Token refreshed successfully
            return true;
          },
          error: () => {
            // Refresh failed, redirect to login
            router.navigate(['/login'], { 
              queryParams: { returnUrl: state.url } 
            });
            return false;
          }
        });
      } else {
        // Not authenticated and can't refresh, redirect to login
        router.navigate(['/login'], { 
          queryParams: { returnUrl: state.url } 
        });
        return false;
      }

      return false;
    })
  );
};

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map((isAuthenticated: boolean) => {
      if (isAuthenticated) {
        // User is already logged in, redirect to dashboard
        router.navigate(['/dashboard']);
        return false;
      }
      return true; // Allow access to login page
    })
  );
};

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data?.['roles'] as string[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // No role requirement
  }

  if (authService.hasAnyRole(requiredRoles)) {
    return true;
  }

  // User doesn't have required role
  router.navigate(['/unauthorized']);
  return false;
};
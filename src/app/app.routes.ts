import { Routes } from '@angular/router';
import { authGuard, loginGuard, roleGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login-simple.component').then(m => m.LoginSimpleComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent),
    canActivate: [authGuard],
    data: { roles: ['admin', 'manager'] }
  },
  {
    path: 'property/:id',
    loadComponent: () => import('./features/property/property-display.component').then(m => m.PropertyDisplayComponent),
    canActivate: [authGuard]
  },
  {
    path: 'review/:id',
    loadComponent: () => import('./features/reviews/review-detail.component').then(m => m.ReviewDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'reviews',
    loadComponent: () => import('./features/public/reviews-display.component').then(m => m.ReviewsDisplayComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/auth/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

import { Routes } from '@angular/router';

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
    loadComponent: () => import('./features/dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent)
  },
  {
    path: 'property/:id',
    loadComponent: () => import('./features/property/property-display.component').then(m => m.PropertyDisplayComponent)
  },
  {
    path: 'review/:id',
    loadComponent: () => import('./features/reviews/review-detail.component').then(m => m.ReviewDetailComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

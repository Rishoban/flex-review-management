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
    path: 'reviews',
    loadComponent: () => import('./features/public/reviews-display.component').then(m => m.ReviewsDisplayComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

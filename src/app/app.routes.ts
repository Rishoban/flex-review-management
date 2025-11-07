import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./simple-login.component').then(m => m.SimpleLoginComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./simple-login.component').then(m => m.SimpleLoginComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./simple-login.component').then(m => m.SimpleLoginComponent)
  }
];

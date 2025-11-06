import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  template: `
    <mat-toolbar class="toolbar">
      <span class="app-name">Flex Review Management</span>
      <span class="spacer"></span>
      <span class="user-info">Welcome, {{ currentUser()?.name }}</span>
      <button mat-icon-button (click)="logout()" matTooltip="Logout">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <div class="dashboard-container">
      <div class="dashboard-content">
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard! You have successfully logged in.</p>
        
        <div class="user-card">
          <h3>User Information</h3>
          <p><strong>Name:</strong> {{ currentUser()?.name }}</p>
          <p><strong>Email:</strong> {{ currentUser()?.email }}</p>
          <p><strong>Role:</strong> {{ currentUser()?.role }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --theme-primary: #485e54;
      --theme-background: #fffbee;
      --theme-surface: #fffdf6;
      --theme-on-primary: #ffffff;
      --theme-on-background: #485e54;
      --theme-shadow: rgba(72, 94, 84, 0.1);
    }

    .toolbar {
      background-color: var(--theme-primary);
      color: var(--theme-on-primary);
      box-shadow: 0 2px 4px var(--theme-shadow);
    }

    .app-name {
      font-weight: 600;
      font-size: 1.2rem;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .user-info {
      margin-right: 1rem;
      font-weight: 500;
    }

    .dashboard-container {
      min-height: calc(100vh - 64px);
      background: linear-gradient(135deg, var(--theme-background) 0%, var(--theme-surface) 100%);
      padding: 2rem;
    }

    .dashboard-content {
      max-width: 800px;
      margin: 0 auto;
    }

    h1 {
      color: var(--theme-primary);
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    p {
      color: var(--theme-on-background);
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }

    .user-card {
      background: var(--theme-surface);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 6px var(--theme-shadow);
      border: 1px solid rgba(72, 94, 84, 0.1);
    }

    .user-card h3 {
      color: var(--theme-primary);
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .user-card p {
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }

    .user-card strong {
      color: var(--theme-primary);
    }
  `]
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  
  protected readonly currentUser = this.authService.currentUser;

  protected logout(): void {
    this.authService.logout();
  }
}
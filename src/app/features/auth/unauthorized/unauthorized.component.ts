import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <mat-icon class="unauthorized-icon">lock</mat-icon>
        <h1>Access Denied</h1>
        <p class="unauthorized-message">
          You don't have permission to access this page.
          Please contact your administrator if you believe this is an error.
        </p>
        <div class="unauthorized-actions">
          <button mat-raised-button color="primary" routerLink="/dashboard">
            <mat-icon>home</mat-icon>
            Go to Dashboard
          </button>
          <button mat-stroked-button color="warn" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Go Back
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, var(--surface-color) 0%, var(--background-color) 100%);
    }

    .unauthorized-content {
      text-align: center;
      max-width: 500px;
      padding: 3rem;
      background: var(--surface-color);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .unauthorized-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: var(--error-color);
      margin-bottom: 1.5rem;
    }

    h1 {
      color: var(--text-primary);
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .unauthorized-message {
      color: var(--text-secondary);
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .unauthorized-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    button {
      min-width: 140px;
    }

    button mat-icon {
      margin-right: 0.5rem;
    }

    @media (max-width: 600px) {
      .unauthorized-container {
        padding: 1rem;
      }

      .unauthorized-content {
        padding: 2rem;
      }

      h1 {
        font-size: 2rem;
      }

      .unauthorized-actions {
        flex-direction: column;
      }

      button {
        width: 100%;
      }
    }
  `]
})
export class UnauthorizedComponent {
  goBack(): void {
    window.history.back();
  }
}
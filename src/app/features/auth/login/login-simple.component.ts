import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { LoginRequest } from '../../../shared/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login-simple.component.html',
  styleUrls: ['./login-simple.component.css']
})
export class LoginSimpleComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  protected loginForm: FormGroup;
  protected showPassword = false;
  protected isSubmitting = false;

  // Use both AuthService and local loading state
  protected get isLoading() {
    return this.authService.isLoading() || this.isSubmitting;
  }

  constructor() {
    this.loginForm = this.fb.group({
      email: ['admin@gmail.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required, Validators.minLength(6)]]
    });
  }

  protected onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isSubmitting = true;
      
      const credentials: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      // Add timeout safety mechanism
      const timeoutId = setTimeout(() => {
        if (this.isSubmitting) {
          this.isSubmitting = false;
          this.showErrorMessage('Request timed out. Please try again.');
        }
      }, 30000); // 30 second timeout

      this.authService.login(credentials).subscribe({
        next: (response) => {
          clearTimeout(timeoutId);
          this.isSubmitting = false;
          this.showSuccessMessage('Login successful!');
          // Navigation is handled by AuthService
        },
        error: (error: Error) => {
          clearTimeout(timeoutId);
          this.isSubmitting = false;
          this.showErrorMessage(error.message || 'Login failed. Please try again.');
        }
      });
    } else if (!this.loginForm.valid) {
      this.markAllFieldsAsTouched();
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  protected togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  protected get emailError(): string | null {
    const email = this.loginForm.get('email');
    if (email?.errors && email.touched) {
      if (email.errors['required']) return 'Email is required';
      if (email.errors['email']) return 'Please enter a valid email';
    }
    return null;
  }

  protected get passwordError(): string | null {
    const password = this.loginForm.get('password');
    if (password?.errors && password.touched) {
      if (password.errors['required']) return 'Password is required';
      if (password.errors['minlength']) return 'Password must be at least 6 characters';
    }
    return null;
  }
}
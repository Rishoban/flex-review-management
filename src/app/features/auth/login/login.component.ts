import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../shared/services/auth.service';
import { LoginForm, ApiError } from '../../../shared/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  // Reactive state
  protected readonly isLoading = this.authService.isLoading;
  protected readonly showPassword = signal(false);
  protected readonly loginForm: FormGroup;
  protected readonly formErrors = signal<{[key: string]: string}>({});

  constructor() {
    this.loginForm = this.createForm();
    this.setupFormValidation();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      email: ['admin@example.com', [
        Validators.required,
        Validators.email
      ]],
      password: ['password', [
        Validators.required,
        Validators.minLength(6)
      ]],
      rememberMe: [false]
    });
  }

  private setupFormValidation(): void {
    // Real-time validation
    this.loginForm.statusChanges.subscribe(() => {
      this.updateFormErrors();
    });

    this.loginForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });
  }

  private updateFormErrors(): void {
    const errors: {[key: string]: string} = {};
    
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control && !control.valid && (control.dirty || control.touched)) {
        errors[key] = this.getErrorMessage(key, control.errors);
      }
    });
    
    this.formErrors.set(errors);
  }

  private getErrorMessage(fieldName: string, errors: any): string {
    if (errors['required']) {
      return `${this.capitalizeFirst(fieldName)} is required`;
    }
    if (errors['email']) {
      return 'Please enter a valid email address';
    }
    if (errors['minlength']) {
      return `${this.capitalizeFirst(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
    }
    return 'Invalid input';
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  protected onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading()) {
      const formValue = this.loginForm.value as LoginForm;
      
      this.authService.login(formValue).subscribe({
        next: (response: any) => {
          this.showSuccessMessage('Login successful!');
        },
        error: (error: ApiError) => {
          this.showErrorMessage(error.message);
        }
      });
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
    this.updateFormErrors();
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

  protected onForgotPassword(): void {
    // Navigate to forgot password or show dialog
    this.showSuccessMessage('Password reset link sent to your email!');
  }

  protected onCreateAccount(): void {
    // Navigate to registration page
    this.router.navigate(['/register']);
  }

  // Computed properties for reactive UI
  protected readonly emailError = computed(() => this.formErrors()['email']);
  protected readonly passwordError = computed(() => this.formErrors()['password']);
  protected readonly isFormValid = computed(() => this.loginForm.valid);
}
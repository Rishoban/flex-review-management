import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

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
    MatIconModule
  ],
  templateUrl: './login-simple.component.html',
  styleUrls: ['./login-simple.component.css']
})
export class LoginSimpleComponent {
  protected loginForm: FormGroup;
  protected isLoading = false;
  protected showPassword = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['admin@example.com', [Validators.required, Validators.email]],
      password: ['password', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  protected onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      // Simulate login
      setTimeout(() => {
        this.isLoading = false;
        console.log('Login successful!');
        this.router.navigate(['/dashboard']);
      }, 1000);
    }
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
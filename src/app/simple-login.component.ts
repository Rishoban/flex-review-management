import { Component } from '@angular/core';

@Component({
  selector: 'app-simple-login',
  standalone: true,
  template: `
    <div style="padding: 40px; text-align: center; font-family: Arial;">
      <h1 style="color: #2196F3; margin-bottom: 30px;">✅ Angular is Working!</h1>
      <h2>Login Page</h2>
      <p>This is a simplified login component to test Angular loading.</p>
      <div style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px;">
        <p><strong>Email:</strong> admin@gmail.com</p>
        <p><strong>Password:</strong> 123456</p>
        <button style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Login (Not functional yet)
        </button>
      </div>
    </div>
  `
})
export class SimpleLoginComponent {}
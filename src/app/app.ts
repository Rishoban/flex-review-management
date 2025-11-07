import { Component } from '@angular/core';
import { SimpleLoginComponent } from './simple-login.component';

@Component({
  selector: 'app-root',
  imports: [SimpleLoginComponent],
  template: `
    <div style="min-height: 100vh; background: #f5f5f5;">
      <h1 style="text-align: center; padding: 20px; color: #333; margin: 0;">Flex Review Management</h1>
      <app-simple-login></app-simple-login>
    </div>
  `,
  styleUrl: './app.css'
})
export class App {}

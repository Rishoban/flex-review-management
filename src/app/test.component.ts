import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  standalone: true,
  template: `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 9999; padding: 20px; font-family: Arial;">
      <h1 style="color: red; font-size: 24px;">ANGULAR IS LOADING!</h1>
      <p>If you can see this, Angular is working.</p>
      <p>Test timestamp: {{ timestamp }}</p>
    </div>
  `
})
export class TestComponent {
  timestamp = new Date().toISOString();
}
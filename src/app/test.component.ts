import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  standalone: true,
  template: `
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <h1 style="color: #4CAF50;">🎉 Angular App is Working!</h1>
      <p>This is a simple test component to verify Angular is loading correctly.</p>
      <p>Current time: {{ currentTime }}</p>
      <button (click)="updateTime()" style="padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Update Time
      </button>
    </div>
  `
})
export class TestComponent {
  currentTime = new Date().toLocaleString();

  updateTime() {
    this.currentTime = new Date().toLocaleString();
  }
}
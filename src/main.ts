import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

console.log('Starting Angular bootstrap...');

bootstrapApplication(App, appConfig)
  .then(() => {
    console.log('✅ Angular bootstrap successful!');
  })
  .catch((err: any) => {
    console.error('❌ Angular bootstrap failed:', err);
  });

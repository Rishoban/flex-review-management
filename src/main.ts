import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

console.log('Starting Angular bootstrap...');

bootstrapApplication(App, appConfig)
  .then(() => {
    console.log('Angular bootstrap successful!');
  })
  .catch((err) => {
    console.error('Angular bootstrap failed:', err);
    
    // Show error on page
    const appRoot = document.querySelector('app-root');
    if (appRoot) {
      appRoot.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #ffebee; z-index: 9999; padding: 20px; font-family: Arial;">
          <h1 style="color: #d32f2f;">❌ Angular Bootstrap Failed</h1>
          <p>There was an error starting the Angular application:</p>
          <pre style="background: white; padding: 10px; border-radius: 4px; overflow: auto; color: #d32f2f;">${err}</pre>
          <p>Please check the browser console for more details.</p>
        </div>
      `;
    }
  });

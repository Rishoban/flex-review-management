import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

console.log('Starting Angular bootstrap...');
console.log('App config:', appConfig);

try {
  bootstrapApplication(App, appConfig)
    .then(() => {
      console.log('✅ Angular bootstrap successful!');
      // Hide the loading message
      const appRoot = document.querySelector('app-root');
      if (appRoot) {
        const loadingDiv = appRoot.querySelector('div[style*="Loading Angular App"]');
        if (loadingDiv) {
          loadingDiv.style.display = 'none';
        }
      }
    })
    .catch((err) => {
      console.error('❌ Angular bootstrap failed:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      // Show detailed error on page
      const appRoot = document.querySelector('app-root');
      if (appRoot) {
        appRoot.innerHTML = `
          <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #ffebee; z-index: 9999; padding: 20px; font-family: Arial; overflow: auto;">
            <h1 style="color: #d32f2f;">❌ Angular Bootstrap Failed</h1>
            <p><strong>Error:</strong> ${err.name || 'Unknown Error'}</p>
            <p><strong>Message:</strong> ${err.message || 'No error message'}</p>
            <details style="margin-top: 20px;">
              <summary style="cursor: pointer; padding: 10px; background: white; border-radius: 4px;">Show Stack Trace</summary>
              <pre style="background: white; padding: 10px; border-radius: 4px; overflow: auto; color: #d32f2f; margin-top: 10px; white-space: pre-wrap;">${err.stack || 'No stack trace available'}</pre>
            </details>
            <div style="margin-top: 20px; padding: 10px; background: #fff3e0; border-radius: 4px; border-left: 4px solid #ff9800;">
              <strong>Common causes:</strong><br>
              • Missing or invalid dependencies<br>
              • Configuration errors in app.config.ts<br>
              • Component import issues<br>
              • Guard or service errors<br>
            </div>
          </div>
        `;
      }
    });
} catch (syncError) {
  console.error('❌ Synchronous error during bootstrap setup:', syncError);
  
  const appRoot = document.querySelector('app-root');
  if (appRoot) {
    appRoot.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #ffebee; z-index: 9999; padding: 20px; font-family: Arial;">
        <h1 style="color: #d32f2f;">❌ Critical Bootstrap Error</h1>
        <p>Failed before Angular could even attempt to start:</p>
        <pre style="background: white; padding: 10px; border-radius: 4px; overflow: auto; color: #d32f2f;">${syncError}</pre>
      </div>
    `;
  }
}

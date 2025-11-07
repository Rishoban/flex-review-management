import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private readonly config = {
    production: true,
    apiUrl: 'https://flex-backend-git-master-rishobans-projects.vercel.app/api/v1',
    tokenKey: 'flex_auth_token',
    refreshTokenKey: 'flex_refresh_token',
    userKey: 'flex_user_data',
    tokenExpiryKey: 'flex_token_expiry'
  };

  get isProduction(): boolean {
    return this.config.production;
  }

  get apiUrl(): string {
    return this.config.apiUrl;
  }

  get storageKeys() {
    return {
      token: this.config.tokenKey,
      refreshToken: this.config.refreshTokenKey,
      user: this.config.userKey,
      tokenExpiry: this.config.tokenExpiryKey
    };
  }

  // Method to update config for different environments
  updateConfig(newConfig: Partial<typeof this.config>) {
    Object.assign(this.config, newConfig);
  }
}
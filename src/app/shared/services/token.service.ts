import { Injectable } from '@angular/core';
import { TokenStorage, User } from '../models/auth.models';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  constructor(private env: EnvironmentService) {}

  setTokens(tokenData: TokenStorage): void {
    const keys = this.env.storageKeys;
    
    try {
      localStorage.setItem(keys.token, tokenData.token);
      localStorage.setItem(keys.refreshToken, tokenData.refreshToken);
      localStorage.setItem(keys.user, JSON.stringify(tokenData.user));
      localStorage.setItem(keys.tokenExpiry, tokenData.expiresAt.toString());
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.env.storageKeys.token);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.env.storageKeys.refreshToken);
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  }

  getUser(): User | null {
    try {
      const userData = localStorage.getItem(this.env.storageKeys.user);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  getTokenExpiry(): number | null {
    try {
      const expiry = localStorage.getItem(this.env.storageKeys.tokenExpiry);
      return expiry ? parseInt(expiry, 10) : null;
    } catch (error) {
      console.error('Error retrieving token expiry:', error);
      return null;
    }
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    const expiry = this.getTokenExpiry();
    
    if (!token || !expiry) {
      return false;
    }

    // Check if token is expired (with 5 minute buffer)
    const now = Date.now();
    const buffer = 5 * 60 * 1000; // 5 minutes
    
    return expiry > (now + buffer);
  }

  isTokenExpired(): boolean {
    return !this.isTokenValid();
  }

  clearTokens(): void {
    const keys = this.env.storageKeys;
    
    try {
      localStorage.removeItem(keys.token);
      localStorage.removeItem(keys.refreshToken);
      localStorage.removeItem(keys.user);
      localStorage.removeItem(keys.tokenExpiry);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // Helper method to calculate expiry timestamp from expiresIn string
  calculateExpiryTime(expiresIn: string): number {
    const now = Date.now();
    
    // Parse expiresIn format like "7d", "24h", "60m", "3600s"
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (!match) {
      // Default to 7 days if format is unrecognized
      return now + (7 * 24 * 60 * 60 * 1000);
    }

    const [, amount, unit] = match;
    const value = parseInt(amount, 10);

    switch (unit) {
      case 'd': // days
        return now + (value * 24 * 60 * 60 * 1000);
      case 'h': // hours
        return now + (value * 60 * 60 * 1000);
      case 'm': // minutes
        return now + (value * 60 * 1000);
      case 's': // seconds
        return now + (value * 1000);
      default:
        return now + (7 * 24 * 60 * 60 * 1000);
    }
  }
}
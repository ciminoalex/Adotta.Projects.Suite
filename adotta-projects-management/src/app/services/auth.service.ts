import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { User, Session } from '../models/user.model';
import { MockDataService } from './mock/mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly SESSION_KEY = 'auth_session';
  private mockData: MockDataService;

  constructor(private router: Router) {
    this.mockData = MockDataService.getInstance();
  }

  login(username: string, password: string): Observable<User> {
    // Get users from mock data
    const users = this.mockData.getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      // Create session
      const session: Session = {
        token: this.generateToken(),
        user: { ...user, password: undefined } as any, // Remove password from session
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      // Store session
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

      return of(user);
    }

    return throwError(() => new Error('Credenziali non valide'));
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): User | null {
    const sessionStr = localStorage.getItem(this.SESSION_KEY);
    if (!sessionStr) {
      return null;
    }

    try {
      const session: Session = JSON.parse(sessionStr);
      
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        this.logout();
        return null;
      }

      return session.user;
    } catch {
      return null;
    }
  }

  getSessionToken(): string | null {
    const sessionStr = localStorage.getItem(this.SESSION_KEY);
    if (!sessionStr) {
      return null;
    }

    try {
      const session: Session = JSON.parse(sessionStr);
      
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        this.logout();
        return null;
      }

      return session.token;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null && this.getSessionToken() !== null;
  }

  getUserInitials(): string {
    const user = this.getCurrentUser();
    if (!user) {
      return '';
    }

    const firstInitial = user.nome ? user.nome.charAt(0).toUpperCase() : '';
    const lastInitial = user.cognome ? user.cognome.charAt(0).toUpperCase() : '';
    const initials = `${firstInitial}${lastInitial}`;
    
    return initials;
  }

  getFullName(): string {
    const user = this.getCurrentUser();
    if (!user) {
      return '';
    }
    return `${user.nome} ${user.cognome}`;
  }

  private generateToken(): string {
    // Simple token generation - in production, use a proper JWT library
    return btoa(`${Date.now()}-${Math.random()}`).replace(/[^a-zA-Z0-9]/g, '');
  }

  // Redirect to login if not authenticated
  requireAuth(): boolean {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    return true;
  }
}


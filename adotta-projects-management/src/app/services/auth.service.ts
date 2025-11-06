import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Session, LoginRequest, LoginResponse } from '../models/user.model';
import { ServiceConfigurationService } from './service-configuration.service';
import { MockDataService } from './mock/mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly SESSION_KEY = 'auth_session';
  private readonly API_URL = '/api/Auth';
  private mockData: MockDataService | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private serviceConfig: ServiceConfigurationService
  ) {
    if (this.serviceConfig.getUseMockServices()) {
      this.mockData = MockDataService.getInstance();
    }
  }

  login(username: string, password: string, companyDB?: string): Observable<LoginResponse | any> {
    // Use mock if configured
    if (this.serviceConfig.getUseMockServices() && this.mockData) {
      const users = this.mockData.getUsers();
      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        // Create session from mock data
        const mockSessionId = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const session: Session = {
          sessionId: mockSessionId,
          version: '1.0.0',
          sessionTimeout: 30,
          user: { ...user, password: undefined } as any,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        };

        // Store session
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

        // Return mock response compatible with LoginResponse
        const mockResponse: LoginResponse = {
          sessionId: mockSessionId,
          version: '1.0.0',
          sessionTimeout: 30
        };

        return of(mockResponse);
      }

      return throwError(() => new Error('Credenziali non valide'));
    }

    // Use real API
    const loginRequest: LoginRequest = {
      companyDB: companyDB,
      userName: username,
      password: password
    };

    return this.http.post<LoginResponse>(`${this.API_URL}/login`, loginRequest).pipe(
      map((response) => {
        // Create session from response
        const session: Session = {
          sessionId: response.sessionId,
          version: response.version,
          sessionTimeout: response.sessionTimeout,
          expiresAt: new Date(Date.now() + (response.sessionTimeout || 30) * 60 * 1000) // Convert minutes to milliseconds
        };

        // Store session
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

        return response;
      }),
      catchError((error) => {
        // Gestione errori più dettagliata
        let errorMessage = 'Credenziali non valide';
        
        if (error.status === 404) {
          errorMessage = 'Endpoint API non trovato. Verificare la configurazione del server.';
        } else if (error.status === 401) {
          errorMessage = 'Username o password non validi';
        } else if (error.status === 0 || error.status === undefined) {
          errorMessage = 'Impossibile raggiungere il server. Verificare la connessione.';
        } else if (error.status >= 500) {
          errorMessage = 'Errore del server. Riprovare più tardi.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): Observable<void> {
    // Use mock if configured
    if (this.serviceConfig.getUseMockServices()) {
      this.clearSession();
      return of(undefined);
    }

    // Use real API
    const sessionId = this.getSessionId();
    
    if (sessionId) {
      // Call logout API
      return this.http.post<void>(`${this.API_URL}/logout`, null, {
        headers: {
          'X-SAP-Session-Id': sessionId
        }
      }).pipe(
        catchError((error) => {
          // Even if logout API fails, clear local session
          this.clearSession();
          return throwError(() => error);
        }),
        map(() => {
          this.clearSession();
        })
      );
    }

    this.clearSession();
    return of(undefined);
  }

  getSessionId(): string | null {
    const sessionStr = localStorage.getItem(this.SESSION_KEY);
    if (!sessionStr) {
      return null;
    }

    try {
      const session: Session = JSON.parse(sessionStr);
      
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        this.clearSession();
        return null;
      }

      return session.sessionId;
    } catch {
      return null;
    }
  }

  getSession(): Session | null {
    const sessionStr = localStorage.getItem(this.SESSION_KEY);
    if (!sessionStr) {
      return null;
    }

    try {
      const session: Session = JSON.parse(sessionStr);
      
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        this.clearSession();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getSessionId() !== null;
  }

  getCurrentUser(): any {
    // Note: User information is not returned by the login API
    // This is kept for backward compatibility
    // In a real implementation, you might need to fetch user info from a separate endpoint
    const session = this.getSession();
    return session?.user || null;
  }

  getUserInitials(): string {
    const user = this.getCurrentUser();
    if (!user) {
      return '';
    }

    const full = user.userName || '';
    const parts = full.trim().split(/\s+/);
    const firstInitial = parts[0]?.charAt(0).toUpperCase() || '';
    const lastInitial = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : '';
    const initials = `${firstInitial}${lastInitial}` || (full.charAt(0).toUpperCase() || '');
    
    return initials;
  }

  getFullName(): string {
    const user = this.getCurrentUser();
    if (!user) {
      return '';
    }
    return (user.userName || '').trim() || 'Utente';
  }

  private clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.router.navigate(['/auth/login']);
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


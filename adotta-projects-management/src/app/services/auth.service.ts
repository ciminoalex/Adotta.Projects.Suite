import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Session, LoginRequest, LoginResponse } from '../models/user.model';
import { ServiceConfigurationService } from './service-configuration.service';
import { MockDataService } from './mock/mock-data.service';
import { MsalService } from '@azure/msal-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly SESSION_KEY = 'auth_session';
  private readonly API_URL = '/api/Auth';
  private mockData: MockDataService | null = null;

  private msalService = inject(MsalService);

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
      const user = users.find(u => (u.userCode === username || u.email === username) && u.password === password);

      if (user) {
        // Create session from mock data
        const mockToken = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const userWithoutPassword = { ...user, password: undefined };
        
        const session: Session = {
          sessionId: mockToken,
          version: '1.0.0',
          sessionTimeout: 1440, // 24 hours in minutes
          user: userWithoutPassword as any,
          expiresAt: expiresAt
        };

        // Store session
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

        // Return mock response compatible with LoginResponseDto
        const mockResponse: LoginResponse = {
          token: mockToken,
          expiresAt: expiresAt,
          expiresInSeconds: 24 * 60 * 60,
          user: userWithoutPassword as any
        };

        return of(mockResponse);
      }

      return throwError(() => new Error('Credenziali non valide'));
    }

    // Use real API
    const loginRequest: LoginRequest = {
      email: username,
      password: password
    };

    return this.http.post<LoginResponse>(`${this.API_URL}/login`, loginRequest).pipe(
      map((response) => {
        // Create session from response (allineato con LoginResponseDto)
        const session: Session = {
          sessionId: response.token,
          version: '1.0.0',
          sessionTimeout: Math.floor(response.expiresInSeconds / 60),
          expiresAt: new Date(response.expiresAt),
          user: response.user
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
    // Se è un login Office365, fai logout da MSAL
    if (this.isOffice365Authenticated()) {
      return this.logoutOffice365();
    }

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
          'Authorization': `Bearer ${sessionId}`
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
    if (!user || !user.userName) {
      return '';
    }

    const full = user.userName.trim();
    if (!full) {
      return '';
    }

    const parts = full.split(/\s+/).filter((p: string) => p.length > 0);
    if (parts.length === 0) {
      return '';
    }

    const firstInitial = parts[0].charAt(0).toUpperCase();
    const lastInitial = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : '';
    
    return lastInitial ? `${firstInitial}${lastInitial}` : firstInitial;
  }

  getFullName(): string {
    const user = this.getCurrentUser();
    if (!user || !user.userName) {
      return 'Utente';
    }
    const name = user.userName.trim();
    return name || 'Utente';
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

  /**
   * Login con Office365 usando MSAL popup
   * Restituisce l'email dell'utente autenticato
   * Verifica che l'utente sia abilitato nell'applicazione
   */
  loginWithOffice365(): Observable<{ email: string; name?: string; userPrincipalName?: string }> {
    return from(
      this.msalService.loginPopup({
        scopes: ['User.Read']
      })
    ).pipe(
      switchMap(() => {
        // Ottieni l'account attivo
        const accounts = this.msalService.instance.getAllAccounts();
        if (accounts.length === 0) {
          return throwError(() => new Error('Nessun account trovato dopo il login'));
        }

        const account = accounts[0];
        
        // Ottieni le informazioni utente da Microsoft Graph
        return this.getUserInfoFromGraph().pipe(
          switchMap((userInfo) => {
            // Estrai l'email
            const email = userInfo.mail || userInfo.userPrincipalName || account.username;
            const name = userInfo.displayName || account.name || email;

            // Verifica che l'utente sia abilitato nell'applicazione
            return this.verifyUserEnabled(email).pipe(
              map((appUser) => {
                // Crea una sessione compatibile con il sistema esistente
                const session: Session = {
                  sessionId: `O365-${account.localAccountId}-${Date.now()}`,
                  version: '1.0.0',
                  sessionTimeout: 480, // 8 ore (Office365 token durata tipica)
                  user: {
                    userCode: appUser.userCode || email,
                    email: email,
                    userName: appUser.userName || name,
                    ruolo: appUser.ruolo,
                    isActive: appUser.isActive
                  },
                  expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 ore
                };

                // Salva la sessione
                localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

                return {
                  email: email,
                  name: appUser.userName || name,
                  userPrincipalName: userInfo.userPrincipalName || email
                };
              })
            );
          }),
          catchError((error) => {
            console.error('Errore nel recupero informazioni utente:', error);
            // Se fallisce il recupero da Graph, usa i dati dell'account MSAL
            const email = account.username || '';
            const name = account.name || email;

            // Verifica comunque che l'utente sia abilitato
            return this.verifyUserEnabled(email).pipe(
              map((appUser) => {
                const session: Session = {
                  sessionId: `O365-${account.localAccountId}-${Date.now()}`,
                  version: '1.0.0',
                  sessionTimeout: 480,
                  user: {
                    userCode: appUser.userCode || email,
                    email: email,
                    userName: appUser.userName || name,
                    ruolo: appUser.ruolo,
                    isActive: appUser.isActive
                  },
                  expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000)
                };

                localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

                return {
                  email: email,
                  name: appUser.userName || name,
                  userPrincipalName: email
                };
              })
            );
          })
        );
      }),
      catchError((error) => {
        console.error('Errore durante il login Office365:', error);
        let errorMessage = 'Errore durante l\'autenticazione Office365';
        
        if (error.errorCode === 'user_cancelled') {
          errorMessage = 'Login annullato dall\'utente';
        } else if (error.errorCode === 'consent_required') {
          errorMessage = 'Consenso richiesto per accedere alle informazioni utente';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Recupera le informazioni utente da Microsoft Graph
   */
  private getUserInfoFromGraph(): Observable<any> {
    // Ottieni il token di accesso
    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length === 0) {
      return throwError(() => new Error('Nessun account disponibile'));
    }

    return from(
      this.msalService.acquireTokenSilent({
        scopes: ['User.Read'],
        account: accounts[0]
      })
    ).pipe(
      switchMap((response) => {
        // Chiama Microsoft Graph API per ottenere le informazioni utente
        return this.http.get('https://graph.microsoft.com/v1.0/me', {
          headers: {
            'Authorization': `Bearer ${response.accessToken}`
          }
        });
      }),
      catchError((error) => {
        // Se il token silenzioso fallisce, prova con popup
        return from(
          this.msalService.acquireTokenPopup({
            scopes: ['User.Read']
          })
        ).pipe(
          switchMap((response) => {
            return this.http.get('https://graph.microsoft.com/v1.0/me', {
              headers: {
                'Authorization': `Bearer ${response.accessToken}`
              }
            });
          })
        );
      })
    );
  }

  /**
   * Verifica se l'utente è abilitato nell'applicazione tramite email
   * Se l'utente non esiste o non è attivo, lancia un errore
   */
  private verifyUserEnabled(email: string): Observable<any> {
    // Normalizza l'email (lowercase per il confronto)
    const normalizedEmail = email.toLowerCase().trim();

    // Se si usano i mock services, verifica nel mock data
    if (this.serviceConfig.getUseMockServices() && this.mockData) {
      const users = this.mockData.getUsers();
      const user = users.find(u => u.email?.toLowerCase().trim() === normalizedEmail);

      if (!user) {
        return throwError(() => new Error('Il tuo utente non è abilitato ad accedere. Contattare il supporto tecnico.'));
      }

      if (user.isActive === false) {
        return throwError(() => new Error('Il tuo utente non è abilitato ad accedere. Contattare il supporto tecnico.'));
      }

      // Restituisci i dati dell'utente trovato
      return of({
        userCode: user.userCode,
        email: user.email,
        userName: user.userName,
        ruolo: user.ruolo,
        isActive: user.isActive
      });
    }

    // Se si usano le API reali, chiama l'endpoint per verificare l'utente
    return this.http.get<any>(`${this.API_URL}/users/by-email/${encodeURIComponent(email)}`).pipe(
      map((user) => {
        if (!user || user.isActive === false) {
          throw new Error('Il tuo utente non è abilitato ad accedere. Contattare il supporto tecnico.');
        }
        return user;
      }),
      catchError((error) => {
        // Se l'utente non esiste (404) o non è abilitato, mostra il messaggio
        if (error.status === 404 || error.status === 403) {
          return throwError(() => new Error('Il tuo utente non è abilitato ad accedere. Contattare il supporto tecnico.'));
        }
        // Per altri errori, propaga l'errore originale
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica se l'utente è autenticato con Office365
   */
  isOffice365Authenticated(): boolean {
    const accounts = this.msalService.instance.getAllAccounts();
    return accounts.length > 0;
  }

  /**
   * Logout da Office365
   */
  logoutOffice365(): Observable<void> {
    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {
      // Logout da MSAL
      this.msalService.logoutPopup({
        account: accounts[0]
      });
    }
    
    // Pulisci anche la sessione locale
    this.clearSession();
    return of(undefined);
  }
}


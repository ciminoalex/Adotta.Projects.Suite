import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ServiceConfigurationService } from '../services/service-configuration.service';
import { DbInitStateService } from '../services/db-init-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const serviceConfig = inject(ServiceConfigurationService);
  const dbInitState = inject(DbInitStateService);

  // Skip interceptor if using mock services (no real API calls)
  // In questo caso, il DB è sempre considerato inizializzato
  if (serviceConfig.getUseMockServices()) {
    dbInitState.setInitialized(true);
    return next(req);
  }

  // Aggiungi URL base alle richieste API
  let apiBaseUrl = serviceConfig.getApiBaseUrl();
  if (apiBaseUrl && req.url.startsWith('/api')) {
    // Rimuovi lo slash finale se presente
    apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
    // Crea una nuova richiesta con l'URL base
    req = req.clone({
      url: `${apiBaseUrl}${req.url}`
    });
  }

  // Skip adding header and error handling for auth and init endpoints
  // Questi endpoint devono sempre funzionare anche se il DB non è inizializzato
  if (req.url.includes('/api/Auth/login') || req.url.includes('/api/init')) {
    return next(req);
  }

  // Get session ID from AuthService
  const sessionId = authService.getSessionId();

  // Clone request and add X-SAP-Session-Id header if session exists
  if (sessionId) {
    const clonedReq = req.clone({
      setHeaders: {
        'X-SAP-Session-Id': sessionId
      }
    });

    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Verifica se l'errore indica che il DB non è inizializzato
        // Possibili codici: 503 (Service Unavailable), 500 con messaggio specifico, o altri codici
        const isDbNotInitialized = isDbNotInitializedError(error);
        
        if (isDbNotInitialized) {
          // Imposta lo stato di non inizializzato
          dbInitState.setInitialized(false);
          dbInitState.setInitCheckPerformed();
          
          // Reindirizza alla pagina di inizializzazione se non ci siamo già
          const currentUrl = router.url;
          if (!currentUrl.includes('/system/init')) {
            router.navigate(['/system/init']);
          }
          
          // Non propagare l'errore per evitare che venga mostrato all'utente
          // L'utente verrà reindirizzato alla pagina di inizializzazione
          return throwError(() => error);
        }

        // Handle 401 Unauthorized - session expired or invalid
        if (error.status === 401) {
          // Clear session and redirect to login
          authService.logout().subscribe({
            next: () => {
              router.navigate(['/auth/login'], {
                queryParams: { returnUrl: router.url }
              });
            }
          });
        }

        return throwError(() => error);
      })
    );
  }

  // If no session and not on login page, redirect to login
  if (!req.url.includes('/api/Auth/login')) {
    router.navigate(['/auth/login']);
  }

  return next(req);
};

/**
 * Verifica se l'errore HTTP indica che il DB non è inizializzato
 */
function isDbNotInitializedError(error: HttpErrorResponse): boolean {
  // Codice 503 (Service Unavailable) spesso indica che il servizio non è pronto
  if (error.status === 503) {
    return true;
  }

  // Codice 500 con messaggio che indica DB non inizializzato
  if (error.status === 500) {
    const errorMessage = error.error?.message || error.message || '';
    const errorMessageLower = errorMessage.toLowerCase();
    
    // Cerca parole chiave che indicano DB non inizializzato
    const keywords = [
      'not initialized',
      'non inizializzato',
      'database not initialized',
      'database non inizializzato',
      'db not initialized',
      'db non inizializzato',
      'initialization required',
      'inizializzazione richiesta'
    ];
    
    return keywords.some(keyword => errorMessageLower.includes(keyword));
  }

  // Altri codici che potrebbero indicare DB non inizializzato
  // 502 Bad Gateway potrebbe anche essere un caso
  if (error.status === 502) {
    return true;
  }

  return false;
}


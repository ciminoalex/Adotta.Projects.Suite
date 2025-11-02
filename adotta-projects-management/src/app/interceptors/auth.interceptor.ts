import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ServiceConfigurationService } from '../services/service-configuration.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const serviceConfig = inject(ServiceConfigurationService);

  // Skip interceptor if using mock services (no real API calls)
  if (serviceConfig.getUseMockServices()) {
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

  // Skip adding header for auth endpoints
  if (req.url.includes('/api/Auth/login')) {
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


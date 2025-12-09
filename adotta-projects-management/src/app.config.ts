import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, APP_INITIALIZER, Injector } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { 
  MSAL_INSTANCE, 
  MSAL_INTERCEPTOR_CONFIG, 
  MSAL_GUARD_CONFIG,
  MsalService
} from '@azure/msal-angular';
import { IPublicClientApplication } from '@azure/msal-browser';
import { 
  MSALInstanceFactory, 
  MSALGuardConfigFactory, 
  MSALInterceptorConfigFactory
} from './app/config/msal.config';
import { TranslationService } from './app/services/translation.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark'} } }),
        // MSAL providers per Office365 authentication
        {
          provide: MSAL_INSTANCE,
          useFactory: MSALInstanceFactory
        },
        {
          provide: MSAL_GUARD_CONFIG,
          useFactory: MSALGuardConfigFactory
        },
        {
          provide: MSAL_INTERCEPTOR_CONFIG,
          useFactory: MSALInterceptorConfigFactory
        },
        MsalService,
        // Inizializza il servizio di traduzione all'avvio
        {
          provide: APP_INITIALIZER,
          useFactory: (translationService: TranslationService) => {
            return () => translationService.initialize().toPromise();
          },
          deps: [TranslationService],
          multi: true
        },
        // Inizializza MSAL all'avvio dell'applicazione
        {
          provide: APP_INITIALIZER,
          useFactory: (injector: Injector) => {
            return () => {
              try {
                const msalInstance = injector.get<IPublicClientApplication>(MSAL_INSTANCE);
                return msalInstance.initialize().catch((error: unknown) => {
                  // Gestisci errori durante l'inizializzazione MSAL
                  console.error('Errore durante l\'inizializzazione di MSAL:', error);
                  // Non bloccare l'avvio dell'applicazione se MSAL fallisce
                  // L'utente potrà comunque usare l'app, ma senza autenticazione
                  return Promise.resolve();
                });
              } catch (error) {
                console.error('Errore critico durante la configurazione di MSAL:', error);
                return Promise.resolve();
              }
            };
          },
          deps: [Injector],
          multi: true
        }
    ]
};

import { 
  MSAL_INSTANCE, 
  MSAL_INTERCEPTOR_CONFIG, 
  MSAL_GUARD_CONFIG,
  MsalInterceptorConfiguration,
  MsalGuardConfiguration
} from '@azure/msal-angular';
import { 
  IPublicClientApplication, 
  PublicClientApplication, 
  InteractionType,
  BrowserCacheLocation,
  LogLevel
} from '@azure/msal-browser';

/**
 * Configurazione MSAL per Office365/Azure AD
 * 
 * IMPORTANTE: Devi configurare questi valori con i dati della tua Azure AD App Registration:
 * 
 * 1. Vai su https://portal.azure.com
 * 2. Azure Active Directory > App registrations > New registration
 * 3. Crea una nuova app e copia:
 *    - Application (client) ID -> clientId
 *    - Directory (tenant) ID -> authority (o usa 'common' per multi-tenant)
 * 4. In Authentication, aggiungi:
 *    - Platform: Single-page application (SPA)
 *    - Redirect URI: http://localhost:4200 (dev) e la tua URL di produzione
 * 5. In API permissions, aggiungi:
 *    - Microsoft Graph > User.Read (per ottenere email e profilo)
 * 
 * Per produzione, usa variabili d'ambiente o un file di configurazione separato.
 */
export const msalConfig = {
  auth: {
    clientId: '9fc3615d-e5a7-463e-a140-6070155fb321', // Sostituisci con il tuo Client ID
    authority: 'https://login.microsoftonline.com/common', // Usa 'common' per multi-tenant o il tuo Tenant ID
    redirectUri: window.location.origin, // Usa l'origine corrente
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage, // Salva i token in localStorage
    storeAuthStateInCookie: false, // Non necessario per SPA moderne
  },
  system: {
    loggerOptions: {
      loggerCallback(logLevel: LogLevel, message: string) {
        // Log solo in sviluppo
        if (window.location.hostname === 'localhost') {
          console.log(message);
        }
      },
      logLevel: LogLevel.Info,
      piiLoggingEnabled: false
    }
  }
};

/**
 * Scopes richiesti per l'autenticazione Office365
 * User.Read permette di leggere il profilo utente e l'email
 */
export const protectedResources = {
  graphMeEndpoint: {
    endpoint: 'https://graph.microsoft.com/v1.0/me',
    scopes: ['User.Read']
  }
};

/**
 * Configurazione per MSAL Guard (protezione route)
 */
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Popup, // Usa popup invece di redirect
    authRequest: {
      scopes: ['User.Read']
    }
  };
}

/**
 * Configurazione per MSAL Interceptor (aggiunge token alle richieste HTTP)
 */
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  return {
    interactionType: InteractionType.Popup,
    protectedResourceMap: new Map([
      ['https://graph.microsoft.com/v1.0/me', ['User.Read']]
    ])
  };
}

/**
 * Factory per creare l'istanza MSAL
 */
export function MSALInstanceFactory(): IPublicClientApplication {
  // Verifica disponibilità Web Crypto API
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname === '[::1]');
  
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  
  if (!isLocalhost && !isHttps) {
    console.warn('MSAL richiede HTTPS per funzionare correttamente in produzione. L\'API Web Crypto è disponibile solo su HTTPS.');
  }
  
  // Verifica se crypto.subtle è disponibile
  if (typeof window !== 'undefined' && window.crypto && !window.crypto.subtle) {
    console.warn('window.crypto.subtle non è disponibile. MSAL potrebbe non funzionare correttamente.');
  }
  
  return new PublicClientApplication(msalConfig);
}


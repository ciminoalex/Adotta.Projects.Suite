# Configurazione Autenticazione Office365

Questa guida spiega come configurare l'autenticazione Office365/Azure AD per la webapp.

## Prerequisiti

- Un account Azure Active Directory (Office365)
- Accesso al portale Azure (https://portal.azure.com)

## Passo 1: Creare App Registration in Azure AD

1. Accedi al [portale Azure](https://portal.azure.com)
2. Vai su **Azure Active Directory** > **App registrations**
3. Clicca su **New registration**
4. Compila il form:
   - **Name**: Nome della tua app (es. "Adotta Projects Management")
   - **Supported account types**: 
     - Seleziona "Accounts in any organizational directory and personal Microsoft accounts" per multi-tenant
     - Oppure "Accounts in this organizational directory only" per single-tenant
   - **Redirect URI**: 
     - Platform: **Single-page application (SPA)**
     - URI: `http://localhost:4200` (per sviluppo)
     - Per produzione, aggiungi anche la tua URL di produzione (es. `https://app.adotta.it`)
5. Clicca su **Register**

## Passo 2: Ottenere Client ID e Tenant ID

Dopo la registrazione, nella pagina **Overview** troverai:
- **Application (client) ID**: Copia questo valore
- **Directory (tenant) ID**: Copia questo valore (opzionale, puoi usare 'common' per multi-tenant)

## Passo 3: Configurare API Permissions

1. Nella pagina della tua app, vai su **API permissions**
2. Clicca su **Add a permission**
3. Seleziona **Microsoft Graph**
4. Seleziona **Delegated permissions**
5. Aggiungi le seguenti permissions:
   - `User.Read` (per leggere il profilo utente e l'email)
6. Clicca su **Add permissions**
7. **IMPORTANTE**: Se sei in un tenant Azure AD, potrebbe essere necessario il consenso dell'amministratore. Clicca su **Grant admin consent for [your tenant]**

## Passo 4: Configurare il codice

1. Apri il file `src/app/config/msal.config.ts`
2. Sostituisci `YOUR_CLIENT_ID_HERE` con il tuo **Application (client) ID**
3. Configura l'authority:
   - Per multi-tenant: `'https://login.microsoftonline.com/common'`
   - Per single-tenant: `'https://login.microsoftonline.com/{TENANT_ID}'` (sostituisci {TENANT_ID} con il tuo Directory ID)

Esempio:
```typescript
export const msalConfig = {
  auth: {
    clientId: '12345678-1234-1234-1234-123456789012', // Il tuo Client ID
    authority: 'https://login.microsoftonline.com/common', // o il tuo Tenant ID
    redirectUri: window.location.origin,
  },
  // ... resto della configurazione
};
```

## Passo 5: Testare l'autenticazione

1. Avvia l'applicazione: `npm start`
2. Vai alla pagina di login
3. Clicca su **"Accedi con Office365"**
4. Si aprirà un popup per l'autenticazione Microsoft
5. Dopo il login, l'email dell'utente verrà recuperata e salvata nella sessione

## Funzionalità implementate

- ✅ Login con popup Office365
- ✅ Recupero email e informazioni utente da Microsoft Graph
- ✅ Integrazione con il sistema di autenticazione esistente
- ✅ Gestione sessione compatibile con il sistema attuale
- ✅ Logout da Office365

## Note importanti

1. **Redirect URI**: Assicurati che i redirect URI configurati in Azure AD corrispondano esattamente alle URL della tua applicazione (incluso http/https e porta)

2. **CORS**: Microsoft Graph API non richiede configurazioni CORS aggiuntive per le chiamate da browser

3. **Token Storage**: I token vengono salvati in `localStorage` per default. Per maggiore sicurezza in produzione, considera l'uso di `sessionStorage`

4. **Scopes**: Attualmente viene richiesto solo `User.Read`. Se in futuro hai bisogno di altre informazioni (es. calendario, email), aggiungi i relativi scopes in `msal.config.ts` e in Azure AD

5. **Produzione**: 
   - Usa variabili d'ambiente per Client ID e Tenant ID
   - Configura redirect URI per l'ambiente di produzione
   - Considera l'uso di Azure Key Vault per gestire i segreti

## Troubleshooting

### Errore: "AADSTS50011: The redirect URI specified in the request does not match"
- Verifica che il redirect URI in Azure AD corrisponda esattamente all'URL della tua app
- Controlla che non ci siano trailing slash o differenze tra http/https

### Errore: "AADSTS65005: The application requires access to a service that your organization has not subscribed to"
- Verifica che il tenant Azure AD abbia una sottoscrizione valida
- Controlla le API permissions configurate

### Popup bloccato
- Assicurati che il browser permetta i popup per il tuo dominio
- Verifica le impostazioni del browser per i popup

### Email non recuperata
- Verifica che la permission `User.Read` sia stata concessa
- Controlla la console del browser per eventuali errori
- L'email viene recuperata da `userInfo.mail` o `userInfo.userPrincipalName` da Microsoft Graph

## Supporto

Per ulteriori informazioni:
- [Documentazione MSAL Angular](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-angular)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/overview)
- [Azure AD App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)


# 🏗️ ADOTTA Projects Suite

> **Sistema di Gestione Progetti ADOTTA** - Piattaforma web per la gestione completa dei progetti di installazione e produzione

[![Angular](https://img.shields.io/badge/Angular-20-red.svg)](https://angular.io/)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-20-blue.svg)](https://primeng.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-cyan.svg)](https://tailwindcss.com/)

## 📋 Panoramica

**ADOTTA Projects Suite** è una soluzione completa per la gestione dei progetti di installazione e produzione dell'azienda ADOTTA. Il sistema sostituisce l'attuale gestione tramite Excel, centralizzando tutte le informazioni dei progetti in una piattaforma web moderna e scalabile.

### 🎯 Obiettivi Principali

- **Centralizzazione**: Un'unica piattaforma per tutti i progetti ADOTTA
- **Tracciabilità**: Sistema WIC (Weekly Information Control) per snapshot settimanali
- **Integrazione**: Collegamento diretto con SAP Business One
- **Collaborazione**: Gestione team multi-disciplinari (Tecnico, APL, Sales, PM, Installazione)
- **Analytics**: Dashboard e reportistica avanzata per decisioni strategiche

## 🏛️ Architettura del Sistema

### Stack Tecnologico

| Componente | Tecnologia | Versione |
|------------|------------|----------|
| **Frontend** | Angular | 20.x |
| **UI Library** | PrimeNG | 20.x |
| **Styling** | TailwindCSS | 4.1.x |
| **Icons** | PrimeIcons | 7.0.x |
| **Charts** | Chart.js | 4.4.2 |
| **Language** | TypeScript | 5.8.x |
| **Build Tool** | Angular CLI | 20.x |

### Struttura Progetto

```
adotta-projects-management/
├── src/
│   ├── app/
│   │   ├── layout/                 # Componenti layout (sidebar, topbar, footer)
│   │   ├── models/                 # Modelli dati TypeScript
│   │   ├── pages/                  # Pagine applicazione
│   │   │   ├── projects/           # Gestione progetti
│   │   │   ├── lookup/             # Tabelle di supporto
│   │   │   ├── dashboard/          # Dashboard principale
│   │   │   └── auth/               # Autenticazione
│   │   ├── services/               # Servizi Angular
│   │   └── app.config.ts           # Configurazione applicazione
│   ├── assets/                     # Risorse statiche
│   └── main.ts                     # Entry point
├── package.json                    # Dipendenze progetto
└── angular.json                    # Configurazione Angular CLI
```

## 🗄️ Modello Dati

### Entità Principale: Progetto

Il sistema è basato su un modello dati gerarchico con **Progetto** come entità principale:

#### Campi Principali (~30 campi totali)

**Identificativi e Dati Base**
- `numeroProgetto`: Codice univoco con prefisso anno (es. 25.087)
- `nomeProgetto`: Denominazione del progetto
- `cliente`: Riferimento al cliente
- `citta` / `stato`: Localizzazione progetto
- `codiceSAP`: Collegamento a SAP Business One

**Team e Responsabilità**
- `teamTecnico`: Responsabili tecnici
- `teamAPL`: Team Application
- `sales`: Rappresentante vendite
- `projectManager`: PM del progetto
- `teamInstallazione`: Squadra di installazione

**Date e Pianificazione**
- `dataCreazione`: Data di creazione progetto
- `dataInizioInstallazione`: Inizio pianificato
- `dataFineInstallazione`: Fine pianificata
- `versioneWIC`: Snapshot settimanale (WIC 30, WIC 29, ecc.)

**Stati Progetto**
```typescript
enum ProjectStatus {
  ON_GOING = 'ON GOING',
  CRITICAL = 'CRITICAL',
  HOLD_ON = 'HOLD ON',
  RUSH = 'RUSH',
  TO_CHECK = 'TO CHECK',
  UPCOMING = 'UPCOMING',
  PUSHED_OUT = 'PUSHED OUT',
  ON_BID = 'ON BID'
}
```

### Entità Secondarie

#### 1. LivelloProgetto
Suddivisione per piani/livelli dell'edificio:
```typescript
interface LivelloProgetto {
  id?: number;
  progettoId: number;
  nome: string;
  ordine: number;
  descrizione: string;
  dataInizioInstallazione?: Date;
  dataFineInstallazione?: Date;
}
```

#### 2. ProdottoProgetto
Dettaglio prodotti installati (Metafora, Wallen, Armonica):
```typescript
interface ProdottoProgetto {
  id?: number;
  progettoId: number;
  tipoProdotto: string;  // Metafora/Wallen/Armonica
  variante: string;
  qMq: number;          // Quantità in metri quadri
  qFt: number;          // Quantità in piedi
}
```

#### 3. StoricoModifica
Sistema WIC per tracciamento modifiche:
```typescript
interface StoricoModifica {
  id?: number;
  progettoId: number;
  dataModifica: Date;
  utenteModifica: string;
  campoModificato: string;
  valorePrecedente?: string;
  nuovoValore?: string;
}
```

## 🚀 Funzionalità Implementate

### ✅ Core Features

1. **Gestione Progetti Completa**
   - Creazione, modifica, eliminazione progetti
   - Vista lista con filtri avanzati
   - Vista dettaglio con informazioni complete
   - Gestione stati progetto

2. **Sistema WIC (Weekly Information Control)**
   - Snapshot settimanali automatici
   - Tracciamento completo modifiche
   - Timeline cronologica modifiche
   - Confronto versioni

3. **Gestione Team Multi-disciplinare**
   - Team Tecnico
   - Team APL (Application)
   - Sales (Rappresentanti Vendite)
   - Project Manager
   - Team Installazione

4. **Gestione Prodotti**
   - Categorie: Metafora, Wallen, Armonica
   - Varianti specifiche per prodotto
   - Quantità per livello/piano
   - Calcoli automatici superfici

5. **Pianificazione per Livelli**
   - Suddivisione progetti per piani/livelli
   - Date specifiche per livello
   - Organizzazione logistica installazione

6. **Lookup Tables**
   - Clienti
   - Stati/Paesi
   - Città
   - Team vari
   - Prodotti master

### 🔮 Roadmap Sviluppi Futuri

- **Integrazione SAP Business One**: Sincronizzazione automatica ordini e produzione
- **Power BI Integration**: Dashboard avanzate e analytics
- **Sistema Ruoli**: Controllo accessi granulare
- **App Mobile**: Gestione in mobilità
- **Workflow Approvazioni**: Processi automatizzati
- **Notifiche Real-time**: Alert per eventi critici

## 🛠️ Setup e Installazione

### Prerequisiti

- **Node.js**: versione 18.x o superiore
- **npm**: versione 9.x o superiore
- **Angular CLI**: versione 20.x

### Installazione

1. **Clona il repository**
   ```bash
   git clone <repository-url>
   cd Adotta.Projects.Suite/adotta-projects-management
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Avvia il server di sviluppo**
   ```bash
   npm start
   ```

4. **Apri il browser**
   ```
   http://localhost:4200
   ```

### Script Disponibili

```bash
# Sviluppo
npm start                    # Avvia server dev (ng serve)
npm run watch               # Build in watch mode

# Build
npm run build               # Build produzione
npm run format              # Formatta codice con Prettier

# Test
npm test                    # Esegue test unitari
```

## 🎨 UI/UX Design

### Design System

Il progetto utilizza **PrimeNG** come libreria UI principale, garantendo:

- **Consistenza**: Design system coerente
- **Accessibilità**: Componenti conformi WCAG
- **Responsive**: Layout adattivo mobile-first
- **Performance**: Componenti ottimizzati

### Tema Personalizzato

```typescript
// Configurazione tema ADOTTA
providePrimeNG({ 
  theme: { 
    preset: Aura, 
    options: { 
      darkModeSelector: '.app-dark' 
    } 
  } 
})
```

### Componenti Principali

#### Dashboard Progetti
- **p-table**: Lista progetti con sorting/filtering
- **p-toolbar**: Barra azioni superiore
- **p-paginator**: Paginazione risultati
- **p-multiSelect**: Filtri multipli

#### Form Progetti
- **p-tabView**: Organizzazione in tab logici
- **p-autoComplete**: Ricerca clienti
- **p-calendar**: Selezione date
- **p-inputNumber**: Valori numerici

#### Dettaglio Progetto
- **p-card**: Container informazioni
- **p-timeline**: Cronologia modifiche WIC
- **p-tag**: Stati colorati
- **p-chip**: Team members

## 🔧 Configurazione

### Environment

Il progetto supporta configurazioni per diversi ambienti:

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withInMemoryScrolling({ 
      anchorScrolling: 'enabled', 
      scrollPositionRestoration: 'enabled' 
    })),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: Aura } })
  ]
};
```

### Servizi Mock

Durante lo sviluppo, il progetto utilizza servizi mock per simulare il backend:

```typescript
// MockProjectService
export class MockProjectService implements ProjectService {
  getProjects(): Observable<Project[]> {
    // Simula chiamata API
  }
  
  getProject(numero: string): Observable<Project> {
    // Simula recupero singolo progetto
  }
}
```

## 📊 Performance e Ottimizzazioni

### Strategie Implementate

1. **Lazy Loading**: Caricamento on-demand dei moduli
2. **OnPush Change Detection**: Ottimizzazione rendering
3. **Virtual Scrolling**: Per tabelle con molti record
4. **Debounced Search**: Ricerca ottimizzata
5. **State Management**: Salvataggio preferenze utente

### Metriche Target

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

## 🔒 Sicurezza

### Implementazioni Attuali

- **HTTPS**: Obbligatorio in produzione
- **Input Validation**: Validazione client-side e server-side
- **XSS Protection**: Sanitizzazione output
- **CSRF Protection**: Token anti-CSRF

### Roadmap Sicurezza

- **JWT Authentication**: Sistema autenticazione robusto
- **Role-based Access Control**: Controllo accessi granulare
- **Audit Logging**: Log completo attività utenti
- **Data Encryption**: Crittografia dati sensibili

## 🧪 Testing

### Strategia Testing

```bash
# Test unitari
npm test

# Test e2e (quando implementati)
npm run e2e

# Coverage report
npm run test:coverage
```

### Struttura Test

```
src/
├── app/
│   ├── pages/
│   │   └── projects/
│   │       ├── project-list.spec.ts
│   │       └── project-detail.spec.ts
│   └── services/
│       └── project.service.spec.ts
```

## 📈 Monitoraggio e Analytics

### Metriche Implementate

- **Performance Monitoring**: Core Web Vitals
- **Error Tracking**: Gestione errori centralizzata
- **User Analytics**: Comportamento utenti
- **Business Metrics**: KPI progetti

### Dashboard Analytics (Futuro)

- Progetti per stato
- Timeline installazioni
- Performance team
- Analisi finanziaria

## 🤝 Contributi

### Processo di Sviluppo

1. **Fork** del repository
2. **Feature branch**: `git checkout -b feature/nuova-funzionalita`
3. **Commit**: `git commit -m 'Aggiunge nuova funzionalità'`
4. **Push**: `git push origin feature/nuova-funzionalita`
5. **Pull Request**: Creazione PR per review

### Standard di Codice

- **ESLint**: Linting automatico
- **Prettier**: Formattazione codice
- **TypeScript Strict**: Modalità strict abilitata
- **Conventional Commits**: Standard commit messages

## 📞 Supporto e Contatti

### Team di Sviluppo

- **Lead Developer**: [Nome Lead]
- **UI/UX Designer**: [Nome Designer]
- **Backend Developer**: [Nome Backend]
- **DevOps**: [Nome DevOps]

### Documentazione

- **API Documentation**: [Link Swagger]
- **Design System**: [Link Storybook]
- **User Manual**: [Link Manuale]
- **Technical Specs**: [Link Specifiche]

## 📄 Licenza

Questo progetto è proprietario di **ADOTTA** e riservato all'uso interno aziendale.

---

## 🏷️ Versioni

| Versione | Data | Descrizione |
|----------|------|-------------|
| **1.0.0** | 2024-12 | Release iniziale con funzionalità core |
| **1.1.0** | TBD | Integrazione SAP Business One |
| **1.2.0** | TBD | Power BI Integration |
| **2.0.0** | TBD | Sistema ruoli e mobile app |

---

**ADOTTA Projects Suite** - *Gestione Progetti del Futuro* 🚀

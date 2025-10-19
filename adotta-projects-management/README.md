# 🏗️ ADOTTA Projects Management

Sistema di gestione progetti ADOTTA sviluppato con Angular 20 e PrimeNG, basato sul template Sakai.

## 📋 Panoramica

Questo sistema sostituisce l'attuale gestione Excel di Luigi e centralizza la gestione di tutti i progetti ADOTTA in un'unica piattaforma web moderna e scalabile.

## ✨ Funzionalità Implementate

### 🏠 Dashboard
- **KPI Cards**: Progetti attivi, valore portfolio, installazioni mese, progetti in ritardo
- **Grafici**: Progetti per stato, trend mensile
- **Progetti Recenti**: Lista ultimi progetti con stato e date installazione
- **Azioni Rapide**: Nuovo progetto, calendario, export, report
- **Notifiche**: Sistema notifiche per eventi critici

### 📊 Gestione Progetti
- **Lista Progetti**: Tabella avanzata con filtri, ordinamento, paginazione
- **Form Progetto**: Creazione/modifica con tabs organizzati:
  - Informazioni Base (numero, nome, cliente, stato, città)
  - Team e Responsabilità (team tecnico, APL, sales, PM, installazione)
  - Pianificazione e Date (date creazione, inizio, installazione, fine, completamento)
  - Dati Finanziari (valore, margine, costi)
  - Livelli/Piani (gestione livelli edificio con superficie e altezza)
  - Prodotti (Metafora, Wallen, Armonica con varianti e componenti)
- **Dettaglio Progetto**: Vista completa con timeline WIC e gestione documenti
- **Sistema WIC**: Snapshot settimanali automatici e tracciamento modifiche

### 🗂️ Anagrafiche
- **Clienti**: Gestione completa clienti con contatti e informazioni
- **Team Tecnici**: Gestione team tecnici con specializzazioni
- **Team APL**: Gestione team Application
- **Sales**: Gestione rappresentanti vendite
- **Project Managers**: Gestione PM con esperienza e certificazioni
- **Squadre Installazione**: Gestione squadre con competenze e disponibilità
- **Prodotti Master**: Catalogo prodotti con varianti e codici SAP

### 📈 Reportistica (Pianificata)
- Report progetti con filtri avanzati
- Analisi finanziaria e margini
- Performance team e carico lavoro
- Export dati in Excel/PDF/CSV

### 🔧 Sistema (Pianificato)
- Storico modifiche WIC completo
- Integrazione SAP Business One
- Backup e restore dati
- Configurazione sistema

## 🛠️ Stack Tecnologico

- **Frontend**: Angular 20 (Standalone Components)
- **UI Library**: PrimeNG 20 con tema Aura
- **Styling**: TailwindCSS + PrimeFlex
- **Icons**: PrimeIcons
- **Charts**: Chart.js
- **Forms**: Angular Reactive Forms
- **HTTP**: Angular HttpClient con fetch
- **Routing**: Angular Router con lazy loading

## 🚀 Avvio Progetto

```bash
# Installazione dipendenze
npm install

# Avvio server di sviluppo
npm start

# Build produzione
npm run build
```

## 📁 Struttura Progetto

```
src/
├── app/
│   ├── models/           # Modelli TypeScript
│   │   ├── project.model.ts
│   │   └── lookup.model.ts
│   ├── services/         # Servizi Angular
│   │   ├── project.service.ts
│   │   └── lookup.service.ts
│   ├── pages/            # Pagine applicazione
│   │   ├── dashboard/    # Dashboard principale
│   │   ├── projects/     # Gestione progetti
│   │   ├── lookup/       # Anagrafiche
│   │   ├── reports/      # Reportistica
│   │   └── system/      # Sistema
│   └── layout/           # Layout e componenti comuni
└── assets/              # Risorse statiche
```

## 🎯 Caratteristiche Chiave

### ✅ Implementate
- ✅ Codice univoco progetto con prefisso anno (es. 25.087)
- ✅ Suddivisione per livelli/piani per pianificazione installazione
- ✅ Gestione team completa (5 tipologie)
- ✅ Date flessibili con focus su installazione (cambiano 50-60%)
- ✅ Sistema versioning WIC per snapshot settimanali
- ✅ Tracciamento automatizzato modifiche
- ✅ Gestione documenti e allegati
- ✅ Dettaglio prodotti con varianti (Metafora, Wallen, Armonica)
- ✅ Dashboard con KPI e widget
- ✅ Tabella progetti avanzata con filtri e export

### 🔮 Sviluppi Futuri
- 🔮 Integrazione Power BI per analytics avanzate
- 🔮 Controllo accessi basato su ruoli
- 🔮 Diagrammi Gantt automatici
- 🔮 Reportistica dinamica personalizzabile
- 🔮 Sistema notifiche real-time
- 🔮 Workflow approvazioni automatizzati
- 🔮 App mobile per gestione in mobilità

## 📊 Modelli Dati

### Entità Principale: Progetto
- **30+ campi** organizzati in sezioni logiche
- **Relazioni**: Livelli, Prodotti, Storico Modifiche, Documenti
- **Integrazione SAP**: Codici ordini e stato produzione
- **Versioning WIC**: Snapshot settimanali automatici

### Tabelle di Supporto
- Clienti, Stati, Città
- Team Tecnici, APL, Sales, PM
- Squadre Installazione
- Prodotti Master

## 🎨 UI/UX

- **Design System**: PrimeNG con tema personalizzato ADOTTA
- **Responsive**: Mobile-first con breakpoints TailwindCSS
- **Accessibility**: Componenti accessibili con aria-labels
- **Performance**: Lazy loading, virtual scrolling, OnPush change detection
- **UX**: Autocomplete, filtri avanzati, ricerca globale

## 📝 Note Implementative

- **Database**: SQL Server/PostgreSQL raccomandato
- **API**: RESTful con autenticazione JWT
- **Caching**: Redis per dati frequenti
- **Sicurezza**: HTTPS, input validation, protezione XSS/SQL injection
- **Backup**: Giornaliero con retention 30 giorni

## 🤝 Contributi

Questo progetto è sviluppato per ADOTTA secondo le specifiche definite nel documento `ADOTTA_Struttura_Dati_Gestione_Progetti.md`.

## 📄 Licenza

Proprietario ADOTTA - Tutti i diritti riservati.
# 📊 STRUTTURA DATI GESTIONE PROGETTI ADOTTA

> **Nota**: Questo documento definisce la struttura dati completa per il portale di gestione progetti ADOTTA.

## Indice
1. [Entità Principale: Progetto](#entità-principale-progetto)
2. [Struttura a Secondo Livello](#struttura-a-secondo-livello)
3. [Tabelle di Supporto](#tabelle-di-supporto)
4. [Integrazioni Esterne](#integrazioni-esterne)
5. [Caratteristiche Chiave del Sistema](#caratteristiche-chiave-del-sistema)
6. [Implementazione UI con PrimeNG](#implementazione-ui-con-primeng)
7. [Relazioni tra Entità](#relazioni-tra-entità)
8. [Stack Tecnologico Raccomandato](#stack-tecnologico-raccomandato)

---

## 🏗️ ENTITÀ PRINCIPALE: PROGETTO

### Identificativi e Dati Base (6 campi)
- **NumeroProgetto**: Codice univoco con prefisso anno (es. 25.087)
- **NomeProgetto**: Denominazione del progetto
- **Cliente**: Riferimento al cliente
- **Città**: Città di realizzazione
- **Stato**: Stato/Paese del progetto
- **CodiceSAP**: Collegamento a SAP Business One

### Team e Responsabilità (5 campi)
- **TeamTecnico**: Responsabili tecnici
- **TeamAPL**: Team Application
- **RappresentanteVendite**: Sales di riferimento
- **ProjectManager**: PM del progetto
- **TeamInstallazione**: Squadra di installazione

### Date e Pianificazione (5 campi)
- **DataCreazione**: Data di creazione progetto
- **DataInizioPrevista**: Inizio pianificato
- **DataInstallazione**: Data installazione (soggetta a frequenti cambiamenti 50-60%)
- **DataFinePrevista**: Fine pianificata
- **DataCompletamento**: Completamento effettivo

### Dati Finanziari (3 campi)
- **ValoreProgetto**: Valore economico totale
- **MarginePrevisto**: Margine atteso
- **CostiSostenuti**: Costi accumulati

### Integrazione SAP (3 campi)
- **StatoOrdineSAP**: Stato ordine in SAP
- **StatoProduzione**: Stato produzione da SAP
- Dati sincronizzati automaticamente da SAP Business One

### Versioning e Tracciamento (3 campi)
- **VersioneWIC**: Snapshot settimanale (WIC 30, WIC 29, ecc.)
- **UltimaModifica**: Timestamp ultima modifica
- **UtenteModifica**: Utente che ha modificato

### Altri Campi (5 campi circa)
- **Note**: Note generali
- **StatoProgetto**: Stato corrente (In pianificazione, In corso, Completato)
- **Priorità**: Livello di priorità
- **DocumentiAllegati**: Riferimenti a documenti
- **FlagAttivo**: Stato attivo/archiviato

**TOTALE: ~30 campi nell'entità principale**

---

## 📐 STRUTTURA A SECONDO LIVELLO

### 1️⃣ LIVELLO PROGETTO (Suddivisione per Piani)
**Cruciale per pianificazione installazione e gestione varianti**

#### Campi:
- **Id**: Identificativo livello (Primary Key)
- **ProgettoId**: Foreign Key a Progetto
- **NumeroPiano**: Numero del piano/livello
- **DescrizionePiano**: Descrizione del livello
- **SuperficieMQ**: Superficie in mq
- **AltezzaMM**: Altezza in mm
- **Note**: Note specifiche livello
- **OrdinePresentazione**: Ordine visualizzazione

**Relazione**: 1 Progetto → N Livelli (One-to-Many)

**Caratteristiche**:
- Fondamentale per pianificazione installazione
- Gestione varianti di prodotto per piano
- Permette organizzazione logistica per livello
- Supporta calcoli di superfici e volumi

---

### 2️⃣ PRODOTTO PROGETTO (Dettaglio Prodotti)
**Suddivisione prodotti Metafora, Wallen, Armonica con componenti e varianti**

#### Campi:
- **Id**: Identificativo prodotto (Primary Key)
- **ProgettoId**: Foreign Key a Progetto
- **LivelloId**: Foreign Key a LivelloProgetto (opzionale)
- **TipoProdotto**: Metafora / Wallen / Armonica / Altri
- **CodiceProdotto**: Codice articolo SAP
- **Descrizione**: Descrizione prodotto
- **Variante**: Variante specifica
- **Quantità**: Quantità
- **UnitàMisura**: UM (PZ, MT, MQ)
- **Componenti**: Dettaglio componenti

**Relazione**: 1 Progetto → N Prodotti (One-to-Many)

**Caratteristiche**:
- Dettagliata suddivisione prodotti principali
- Gestione varianti specifiche
- Collegamento opzionale ai livelli/piani
- Integrazione con codici SAP

---

### 3️⃣ STORICO MODIFICHE (Tracciamento WIC)
**Sistema automatizzato per snapshot settimanali e tracciamento modifiche**

#### Campi:
- **Id**: Identificativo modifica (Primary Key)
- **ProgettoId**: Foreign Key a Progetto
- **DataModifica**: Timestamp modifica
- **UtenteModifica**: Utente che ha modificato
- **VersioneWIC**: Versione snapshot (WIC 30, WIC 29...)
- **CampoModificato**: Campo modificato
- **ValorePrecedente**: Valore prima della modifica
- **NuovoValore**: Valore dopo la modifica
- **TipoModifica**: Tipo (Manuale, Automatica, Sincronizzazione SAP)
- **Note**: Note sulla modifica

**Relazione**: 1 Progetto → N Modifiche (One-to-Many)

**Funzionalità chiave**:
- Snapshot settimanali automatici
- Tracciamento completo storia progetto
- Confronto tra versioni
- Audit trail completo
- Supporto per rollback se necessario

**Note importanti**:
- Le date di installazione cambiano nel 50-60% dei casi
- Sistema WIC permette di tracciare tutte le variazioni
- Essenziale per mantenere storico affidabile

---

### 4️⃣ DOCUMENTO PROGETTO (Allegati)
**Gestione documenti e allegati**

#### Campi:
- **Id**: Identificativo documento (Primary Key)
- **ProgettoId**: Foreign Key a Progetto
- **NomeFile**: Nome file
- **TipoDocumento**: Tipo (Contratto, Planimetria, Specifiche, Altro)
- **PercorsoFile**: Path storage
- **DataCaricamento**: Data upload
- **CaricatoDa**: Utente
- **Dimensione**: Dimensione file
- **Note**: Note

**Relazione**: 1 Progetto → N Documenti (One-to-Many)

**Tipi di documenti supportati**:
- Contratti
- Planimetrie
- Specifiche tecniche
- Documentazione fotografica
- Report di installazione
- Altri documenti

---

## 🔗 TABELLE DI SUPPORTO (Lookup/Master Data)

### 1. CLIENTI
```
- Id (PK)
- Nome
- Email
- Telefono
- PartitaIVA
- IndirizzoCompleto
- Contatto
- Note
```

### 2. STATI
```
- Id (PK)
- Nome
- CodiceISO
- Continente
```

### 3. CITTÀ
```
- Id (PK)
- Nome
- StatoId (FK)
- CAP
- Provincia
- Regione
```
**Relazione**: Città filtrata per Stato selezionato

### 4. TEAM TECNICI
```
- Id (PK)
- Nome
- Specializzazione
- Membri
- Email
- Telefono
- Disponibilità
```

### 5. APL TEAM (Application Team)
```
- Id (PK)
- Nome
- Email
- Telefono
- Area
- Competenze
```

### 6. SALES (Rappresentanti Vendite)
```
- Id (PK)
- Nome
- Email
- Telefono
- Zona
- RegioneDiCompetenza
- ProgettiGestiti
```

### 7. PROJECT MANAGERS
```
- Id (PK)
- Nome
- Email
- Telefono
- ProgettiAttivi
- Esperienza
- Certificazioni
```

### 8. SQUADRE INSTALLAZIONE
```
- Id (PK)
- Nome
- Tipo
- Contatto
- Disponibilità
- Competenze
- NumeroMembri
```

### 9. PRODOTTI MASTER
```
- Id (PK)
- Nome
- Categoria (Metafora/Wallen/Armonica)
- UnitàMisura
- CodiceSAP
- Descrizione
- VariantiDisponibili
```

---

## 🔄 INTEGRAZIONI ESTERNE

### SAP Business One (Sistema ERP)

**Scopo integrazione**: Collegamento diretto per dati ordini, produzione e informazioni commerciali

**Campi collegati in Progetto**:
- CodiceSAP
- StatoOrdineSAP
- StatoProduzione
- Valori commerciali e finanziari

**Funzionalità**:
- Aggiornamento automatizzato dati
- Sincronizzazione stato ordini
- Tracciamento produzione
- Recupero informazioni commerciali
- Sincronizzazione bidirezionale

**Modalità di integrazione**:
- API REST/SOAP di SAP Business One
- Sincronizzazione schedulata
- Eventi real-time per aggiornamenti critici
- Gestione errori e retry automatici

---

### Power BI (Reportistica e Analytics - Implementazione Futura)

**Scopo integrazione**: Analisi avanzate e reportistica dinamica

**Funzionalità pianificate**:
- Dashboard progetti interattive
- Analisi performance e KPI
- Report automatizzati schedulati
- Visualizzazioni Gantt dinamiche
- Analisi predittive
- Report personalizzati per ruolo
- Drill-down su dati dettagliati

**Dashboard previste**:
- Overview progetti (stato, avanzamento, valore)
- Analisi temporale (ritardi, rispetto pianificazione)
- Analisi finanziaria (margini, costi, budget)
- Analisi risorse (carico lavoro team, disponibilità)
- Analisi clienti e geografica

---

### Sistema Ruoli e Permessi (Implementazione Futura)

**Scopo integrazione**: Controllo accessi basato su ruoli e visibilità personalizzata

**Funzionalità pianificate**:
- Controllo accessi granulare per ruolo
- Visibilità dati personalizzata
- Log attività utenti
- Workflow approvazioni
- Notifiche personalizzate

**Ruoli previsti**:
- Amministratore sistema
- Project Manager
- Team Tecnico
- Sales
- Installazione
- Visualizzazione (Read-only)

---

## 📋 CARATTERISTICHE CHIAVE DEL SISTEMA

### ✅ Requisiti Funzionali Implementati

1. **Codice univoco progetto** con prefisso anno (es. 25.087)
2. **Suddivisione per livelli/piani** fondamentale per pianificazione installazione
3. **Gestione team completa** (5 tipologie di team/responsabili)
4. **Date flessibili** con particolare attenzione a installazione (cambiano nel 50-60% dei casi)
5. **Sistema di versioning WIC** per snapshot settimanali automatici
6. **Tracciamento automatizzato** di tutte le modifiche
7. **Integrazione SAP** per dati ordini e produzione
8. **Gestione documenti** e allegati per progetto
9. **Dettaglio prodotti** con varianti (Metafora, Wallen, Armonica)

### 🔮 Sviluppi Futuri Pianificati

- **Integrazione Power BI** per analisi avanzate e dashboard
- **Controllo accessi basato su ruoli** e permessi granulari
- **Diagrammi di Gantt automatici** generati dalle date progetto
- **Reportistica dinamica** e personalizzabile
- **Dashboard personalizzate** per utente/ruolo
- **Sistema notifiche** per eventi critici
- **Workflow approvazioni** automatizzati
- **App mobile** per gestione in mobilità
- **Integrazione calendari** per pianificazione risorse

### 📊 Benefici della Struttura

1. **Visione d'insieme** mantenendo possibilità di approfondire dettagli
2. **Flessibilità** per gestire peculiarità di ogni installazione
3. **Storicizzazione completa** delle modifiche con sistema WIC
4. **Preparazione** per future integrazioni e analisi avanzate
5. **Scalabilità** del sistema per crescita aziendale
6. **Tracciabilità** completa di ogni modifica
7. **Integrazione** con sistemi aziendali esistenti (SAP)
8. **Reportistica** avanzata per decisioni strategiche

### 🎯 Obiettivi del Sistema

- **Sostituire** l'attuale sistema Excel di Luigi
- **Centralizzare** la gestione progetti in un'unica piattaforma
- **Automatizzare** aggiornamenti e sincronizzazioni
- **Migliorare** visibilità e controllo progetti
- **Supportare** decisioni operative e strategiche
- **Facilitare** collaborazione tra team
- **Garantire** storico completo e audit trail

---

## 🔗 RELAZIONI TRA ENTITÀ

### Schema Relazionale

```
PROGETTO (1) ──────── (N) LivelloProgetto
    │                      │
    │                      └─ Suddivisione per piani/livelli
    │                         Fondamentale per installazione
    │
    ├────────────────── (N) ProdottoProgetto
    │                      │
    │                      └─ Metafora, Wallen, Armonica
    │                         Varianti e componenti
    │
    ├────────────────── (N) StoricoModifica
    │                      │
    │                      └─ Tracciamento WIC settimanale
    │                         Audit trail completo
    │
    └────────────────── (N) DocumentoProgetto
                           │
                           └─ Allegati e documentazione

PROGETTO ╌╌╌╌╌╌╌╌╌╌╌ SAP Business One
    │                    │
    │                    └─ Integrazione ordini/produzione
    │
    ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ Power BI (futuro)
    │                    │
    │                    └─ Analytics e reportistica
    │
    ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ Sistema Ruoli (futuro)
                         │
                         └─ Controllo accessi
```

**Legenda**:
- `────` Relazioni dirette One-to-Many nel database
- `╌╌╌╌` Integrazioni esterne via API/servizi
- `(1)` e `(N)` Cardinalità delle relazioni

### Dettaglio Relazioni

#### PROGETTO → LIVELLO PROGETTO
- **Tipo**: One-to-Many
- **Obbligatorietà**: Almeno un livello per progetto
- **Cascade**: Delete cascade (eliminando progetto, elimina livelli)
- **Uso**: Organizzazione logistica per piano/livello edificio

#### PROGETTO → PRODOTTO PROGETTO
- **Tipo**: One-to-Many
- **Obbligatorietà**: Almeno un prodotto per progetto
- **Cascade**: Delete cascade
- **Uso**: Dettaglio prodotti installati con varianti

#### LIVELLO PROGETTO → PRODOTTO PROGETTO
- **Tipo**: One-to-Many (opzionale)
- **Obbligatorietà**: Facoltativa
- **Uso**: Associare prodotti a specifici piani quando necessario

#### PROGETTO → STORICO MODIFICHE
- **Tipo**: One-to-Many
- **Obbligatorietà**: Automatica ad ogni modifica
- **Cascade**: No delete (mantenere storico)
- **Uso**: Audit trail e confronto versioni WIC

#### PROGETTO → DOCUMENTO
- **Tipo**: One-to-Many
- **Obbligatorietà**: Opzionale
- **Cascade**: Delete cascade
- **Uso**: Allegati e documentazione correlata

---

## 💡 NOTE IMPLEMENTATIVE

### Database
- **Tecnologia suggerita**: SQL Server / PostgreSQL
- **ORM**: Entity Framework Core / Dapper
- **Indici**: Su campi di ricerca frequente (NumeroProgetto, Cliente, Date)
- **Backup**: Giornaliero con retention 30 giorni

### API
- **Architettura**: RESTful API
- **Autenticazione**: JWT / OAuth2
- **Documentazione**: Swagger/OpenAPI
- **Versioning**: API versioning per evolutive

### Frontend
- **Framework**: Angular (standalone components)
- **UI Library**: **PrimeNG** (componenti enterprise-ready)
- **Tema**: PrimeNG Theme personalizzato per ADOTTA
- **Responsive**: Design mobile-first con PrimeNG Flex
- **UX**: Autocomplete, filtri avanzati, ricerca globale tramite componenti PrimeNG

### Performance
- **Caching**: Redis per dati frequenti
- **Paginazione**: Obbligatoria per liste lunghe
- **Lazy loading**: Per dettagli e documenti

### Sicurezza
- **HTTPS**: Obbligatorio
- **Input validation**: Server-side completa
- **SQL Injection**: Protezione via parametrizzazione
- **XSS**: Sanitizzazione output

---

## 🎨 IMPLEMENTAZIONE UI CON PRIMENG

### Perché PrimeNG per ADOTTA

**PrimeNG** è la scelta ideale per questo progetto per i seguenti motivi:
- **Componenti Enterprise**: 90+ componenti pronti all'uso per applicazioni gestionali
- **Temi Professionali**: Look & feel professionale out-of-the-box
- **Tabelle Avanzate**: DataTable con sorting, filtering, paging, export nativo
- **Form Complessi**: Tutti i componenti necessari per i ~30 campi del progetto
- **Responsive**: Grid system e componenti responsive nativi
- **Documentazione**: Eccellente con esempi live
- **Performance**: Ottimizzato per grandi quantità di dati
- **Consistenza**: Design system coerente in tutta l'applicazione

### Componenti PrimeNG per Sezioni Principali

#### 📋 LISTA PROGETTI (Dashboard Principale)

**Componenti utilizzati:**
```typescript
// Template principale
<p-table>           // Tabella progetti con sorting/filtering
<p-column>          // Colonne personalizzabili
<p-toolbar>         // Barra azioni superiore
<p-button>          // Pulsanti azione (Nuovo, Esporta, etc.)
<p-inputText>       // Ricerca globale
<p-dropdown>        // Filtri per stato, cliente, etc.
<p-calendar>        // Filtri per range date
<p-multiSelect>     // Filtri multipli (team, prodotti)
<p-paginator>       // Paginazione risultati
```

**Funzionalità specifiche:**
- **Lazy Loading**: Per progetti con molti record
- **Export**: Excel/CSV/PDF tramite `exportCSV()` di p-table
- **Column Chooser**: Selezione colonne visibili con p-multiSelect
- **Global Filter**: Ricerca trasversale su tutti i campi
- **State Saving**: Salvataggio filtri e ordinamento utente

**Colonne suggerite per la tabella:**
1. Numero Progetto (con link al dettaglio)
2. Nome Progetto
3. Cliente (con p-avatar)
4. Città/Stato
5. Project Manager (con badge PrimeNG)
6. Data Installazione (con p-tag per evidenziare scadenze)
7. Stato (con p-tag colorato)
8. Valore Progetto (formattato)
9. Azioni (p-button icon per edit/delete/view)

#### 📝 FORM CREAZIONE/MODIFICA PROGETTO

**Componenti utilizzati:**
```typescript
<p-card>                    // Container principale form
<p-tabView>                 // Organizzazione in tab logici
<p-panel>                   // Raggruppamento sezioni
<p-inputText>               // Campi testuali (nome, numero)
<p-autoComplete>            // Cliente con ricerca
<p-dropdown>                // Selezioni singole (stato, città)
<p-multiSelect>             // Selezioni multiple (team)
<p-calendar>                // Date (installazione, completamento)
<p-inputNumber>             // Valori numerici (prezzi, quantità)
<p-inputTextarea>           // Note e descrizioni
<p-chips>                   // Tag e keywords
<p-fileUpload>              // Upload documenti
<p-progressBar>             // Avanzamento progetto
```

**Organizzazione in Tab:**

**Tab 1 - Informazioni Base**
- Numero Progetto (p-inputText con validazione)
- Nome Progetto (p-inputText required)
- Cliente (p-autoComplete con ricerca API)
- Stato/Città (p-dropdown con cascata)
- Codice SAP (p-inputText read-only se integrato)

**Tab 2 - Team e Responsabilità**
- Team Tecnico (p-dropdown)
- Team APL (p-dropdown)
- Sales (p-dropdown con avatar)
- Project Manager (p-dropdown con avatar)
- Team Installazione (p-multiSelect)

**Tab 3 - Pianificazione e Date**
- Data Creazione (p-calendar read-only)
- Data Inizio Prevista (p-calendar)
- Data Installazione (p-calendar con highlight)
- Data Fine Prevista (p-calendar)
- Data Completamento (p-calendar)
- Visualizzazione Timeline (p-timeline)

**Tab 4 - Dati Finanziari**
- Valore Progetto (p-inputNumber con currency)
- Margine Previsto (p-inputNumber con percentage)
- Costi Sostenuti (p-inputNumber read-only)
- Chart riepilogativo (p-chart)

**Tab 5 - Livelli/Piani**
- Tabella livelli (p-table inline editing)
- Aggiungi livello (p-button + p-dialog)
- Colonne: Piano, Descrizione, Superficie, Altezza
- Azioni inline (edit/delete)

**Tab 6 - Prodotti**
- Tabella prodotti (p-table con grouping)
- Selezione prodotto (p-dropdown categorie)
- Varianti (p-multiSelect)
- Quantità per livello
- Export distinta (p-button)

**Tab 7 - Documenti**
- Upload area (p-fileUpload con drag&drop)
- Lista documenti (p-dataView o p-table)
- Preview documenti (p-dialog con viewer)
- Download/Delete azioni

#### 📊 DETTAGLIO PROGETTO (Vista Completa)

**Componenti utilizzati:**
```typescript
<p-card>                // Card container
<p-fieldset>            // Sezioni collapsabili
<p-panel>               // Pannelli informativi
<p-splitter>            // Layout split per info/documenti
<p-timeline>            // Timeline modifiche WIC
<p-badge>               // Badge per stati e notifiche
<p-tag>                 // Tag colorati per categorie
<p-chip>                // Chip per team members
<p-avatar>              // Avatar utenti
<p-divider>             // Separatori sezioni
<p-organizationChart>   // Struttura team (opzionale)
```

**Layout suggerito:**
- Header con numero progetto e stato (p-card con p-tag)
- Sidebar con azioni rapide (p-menu o p-panelMenu)
- Content area con tabs (p-tabView)
- Footer con storico modifiche (p-timeline)

#### 📈 DASHBOARD E ANALYTICS

**Componenti utilizzati:**
```typescript
<p-chart>               // Grafici (Chart.js wrapper)
<p-knob>                // Indicatori circolari (% completamento)
<p-progressBar>         // Progress bar avanzamento
<p-card>                // Card per KPI
<p-dataView>            // Vista alternativa dati
<p-carousel>            // Carousel progetti in evidenza
```

**KPI Cards suggerite:**
- Progetti Attivi (p-card + p-knob)
- Valore Portfolio (p-card + number formatted)
- Installazioni Mese (p-card + p-chart small)
- Ritardi (p-card + p-tag danger)

**Grafici suggeriti:**
- Timeline progetti (p-chart type="line")
- Distribuzione per stato (p-chart type="pie")
- Valore per cliente (p-chart type="bar")
- Trend mensile (p-chart type="line")

#### 🔍 RICERCA AVANZATA

**Componenti utilizzati:**
```typescript
<p-sidebar>             // Sidebar per filtri avanzati
<p-accordion>           // Accordion per gruppi filtri
<p-selectButton>        // Toggle filtri rapidi
<p-slider>              // Range valori numerici
<p-inputSwitch>         // Toggle boolean
<p-checkbox>            // Checkbox multipli
<p-radioButton>         // Selezione esclusiva
```

#### 📅 CALENDARIO E PIANIFICAZIONE

**Componenti utilizzati:**
```typescript
<p-fullCalendar>        // Calendario full-page per installazioni
<p-calendar>            // Date picker standard
<p-schedule>            // Visualizzazione eventi (da valutare)
```

**Vista Gantt (se necessaria in futuro):**
- Integrare libreria esterna (es. DHTMLX Gantt)
- Wrapper in componente Angular
- Styling coordinato con tema PrimeNG

#### 🔔 NOTIFICHE E MESSAGGI

**Componenti utilizzati:**
```typescript
<p-toast>               // Notifiche toast
<p-messages>            // Messaggi inline
<p-message>             // Singolo messaggio
<p-confirmDialog>       // Dialog conferma azioni
<p-confirmPopup>        // Popup conferma veloce
```

#### 🗂️ STORICO MODIFICHE WIC

**Componenti utilizzati:**
```typescript
<p-timeline>            // Timeline modifiche
<p-panel>               // Dettaglio singola modifica
<p-chip>                // Utente che ha modificato
<p-tag>                 // Tipo modifica
<p-button>              // Confronta versioni
<p-dialog>              // Dialog confronto versioni
<p-table>               // Tabella differenze (old vs new)
```

**Funzionalità specifiche:**
- Timeline verticale cronologica
- Filtri per utente/data/campo
- Confronto side-by-side versioni
- Ripristino versione precedente (con conferma)
- Export storico (CSV/PDF)

#### 📤 EXPORT E REPORTISTICA

**Componenti utilizzati:**
```typescript
<p-menu>                // Menu export options
<p-overlayPanel>        // Panel opzioni export
<p-checkbox>            // Selezione campi da esportare
<p-progressSpinner>     // Loading export
<p-fileUpload>          // Upload template report (futuro)
```

**Formati export supportati:**
- Excel (via p-table `exportCSV()` con customExportFunction)
- PDF (via jsPDF integration)
- CSV (nativo p-table)
- JSON (per API integration)

### Temi e Personalizzazione PrimeNG

#### Tema Suggerito per ADOTTA

**PrimeNG Theme Designer** o temi predefiniti:
- **Lara (Light/Dark)**: Tema moderno e pulito
- **Saga**: Tema business professionale
- **Arya**: Per dark mode
- **Custom ADOTTA Theme**: Colori brand aziendali

**Personalizzazione colori:**
```scss
// _adotta-theme.scss
$primaryColor: #0066cc;        // Blu ADOTTA
$primaryLightColor: #4d94ff;
$primaryDarkColor: #004d99;
$accentColor: #ff6b35;         // Arancione accenti
```

#### Layout Application

**Struttura consigliata:**
```
<p-toast>                      // Notifiche globali
<p-confirmDialog>              // Conferme globali

<app-topbar>                   // Top navigation
  <p-menubar>                  // Menu principale
  <p-avatar>                   // User avatar
  <p-badge>                    // Notifiche
</app-topbar>

<app-sidebar>                  // Sidebar navigation
  <p-panelMenu>                // Menu laterale
  <p-divider>
</app-sidebar>

<app-content>                  // Content area
  <router-outlet>              // Angular routing
</app-content>

<app-footer>                   // Footer
```

### Responsive Design con PrimeNG

**PrimeFlex Grid System:**
```html
<div class="grid">
  <div class="col-12 md:col-6 lg:col-4">
    <p-card>KPI Card</p-card>
  </div>
  <!-- Ripeti per altre card -->
</div>
```

**Breakpoints:**
- Mobile: < 576px
- Tablet: 576px - 768px
- Desktop: 768px - 992px
- Large: > 992px

### Best Practices PrimeNG per ADOTTA

1. **Virtual Scrolling**: Per tabelle con molti progetti
   ```html
   <p-table [virtualScroll]="true" [rows]="100">
   ```

2. **Lazy Loading**: Per performance
   ```html
   <p-table [lazy]="true" (onLazyLoad)="loadData($event)">
   ```

3. **Template Caching**: Per celle ripetute
   ```html
   <ng-template pTemplate="body" let-project>
   ```

4. **State Management**: Salvare filtri e preferenze utente
   ```typescript
   <p-table [stateStorage]="'session'" stateKey="adotta-projects">
   ```

5. **Accessibility**: Sempre specificare aria-labels
   ```html
   <p-button label="Nuovo" icon="pi pi-plus" ariaLabel="Crea nuovo progetto">
   ```

### Icone PrimeIcons

**Icone principali per ADOTTA:**
```typescript
// Azioni comuni
'pi-plus'           // Nuovo
'pi-pencil'         // Modifica
'pi-trash'          // Elimina
'pi-search'         // Cerca
'pi-filter'         // Filtri
'pi-download'       // Export
'pi-upload'         // Import
'pi-save'           // Salva
'pi-times'          // Chiudi/Annulla
'pi-check'          // Conferma

// Navigazione
'pi-home'           // Home
'pi-list'           // Lista
'pi-th-large'       // Dashboard
'pi-calendar'       // Calendario
'pi-chart-bar'      // Analytics

// Stati
'pi-circle-fill'    // Stato progetto
'pi-clock'          // In corso
'pi-check-circle'   // Completato
'pi-exclamation-triangle' // Attenzione

// Documenti
'pi-file'           // File generico
'pi-file-pdf'       // PDF
'pi-file-excel'     // Excel
'pi-folder'         // Cartella
```

### Performance Optimization

**Tips specifici per PrimeNG:**

1. **OnPush Change Detection**:
   ```typescript
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush
   })
   ```

2. **TrackBy Functions** per p-table:
   ```typescript
   trackByProjectId(index: number, project: Project) {
     return project.id;
   }
   ```

3. **Pagination** invece di scroll infinito:
   ```html
   <p-paginator [rows]="50" [totalRecords]="totalProjects">
   ```

4. **Debounce** per ricerche:
   ```typescript
   searchProjects = debounceTime(300)(this.searchTerm$);
   ```

---

## 🎯 WIREFRAME UI SUGGERITO

### Dashboard Principale
```
┌─────────────────────────────────────────────────────┐
│ ADOTTA - Gestione Progetti    [Search] [@Avatar]    │
├─────────────────────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐           │
│ │ KPI 1 │ │ KPI 2 │ │ KPI 3 │ │ KPI 4 │           │
│ └───────┘ └───────┘ └───────┘ └───────┘           │
├─────────────────────────────────────────────────────┤
│ [Nuovo] [Export] [Filtri▼] [Ricerca avanzata]      │
├─────────────────────────────────────────────────────┤
│ N.Prog │ Nome    │ Cliente │ PM  │ Data  │ Stato   │
│ 25.087 │ Proj A  │ ACME    │ JZ  │ 12/10 │ ●Attivo│
│ 25.088 │ Proj B  │ XYZ     │ LL  │ 15/10 │ ●Attivo│
│ ...                                                  │
├─────────────────────────────────────────────────────┤
│ [1] [2] [3] ... Pagina 1 di 45                     │
└─────────────────────────────────────────────────────┘
```

### Form Progetto
```
┌─────────────────────────────────────────────────────┐
│ Progetto 25.087 - Nuovo Progetto        [X] [Save]  │
├─────────────────────────────────────────────────────┤
│ [Info Base][Team][Date][Finanziari][Livelli][Docs] │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Numero Progetto: [25.087____________]               │
│  Nome Progetto:   [___________________] *            │
│  Cliente:         [Cerca cliente...___] *            │
│  Stato:           [Seleziona▼________]               │
│  Città:           [Seleziona▼________]               │
│                                                      │
│                                    [Annulla] [Salva] │
└─────────────────────────────────────────────────────┘
```

### Dettaglio Progetto
```
┌─────────────────────────────────────────────────────┐
│ ← Progetto 25.087                      [Edit][PDF]  │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────────────────┐│
│ │ Info Principali │ │   Timeline WIC              ││
│ │                 │ │   ○ 10/10 - Creazione       ││
│ │ Nome: Prog A    │ │   ○ 11/10 - Modifica data   ││
│ │ Cliente: ACME   │ │   ○ 12/10 - Update team     ││
│ │ PM: J.Zannier   │ │                             ││
│ │ Stato: ●Attivo  │ │                             ││
│ └─────────────────┘ └─────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│ [Info][Livelli][Prodotti][Documenti][Storico][SAP] │
└─────────────────────────────────────────────────────┘
```

---


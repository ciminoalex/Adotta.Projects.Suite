# Mock Services Documentation

Questo documento descrive come funzionano i servizi mock e come effettuare il passaggio alle API reali.

## Struttura

I servizi mock sono organizzati in modo da simulare un'API REST completa, supportando operazioni GET, POST, PATCH, DELETE:

```
services/
├── mock/
│   ├── mock-data.service.ts      # Gestione centralizzata dei dati in-memory
│   ├── mock-lookup.service.ts    # Servizio mock per i dati anagrafici
│   ├── mock-project.service.ts   # Servizio mock per i progetti
│   └── README.md                  # Questa documentazione
├── lookup.service.ts               # Interfaccia per Lookup (API reale)
├── project.service.ts              # Interfaccia per Projects (API reale)
├── service-configuration.service.ts  # Configurazione (mock vs API)
└── service-provider.service.ts       # Factory per iniettare servizi corretti
```

## MockDataService

Il servizio `MockDataService` è il cuore della gestione dei dati mock. Gestisce tutti i dati in memoria e fornisce operazioni CRUD per:

- **Clienti**
- **Team Tecnici**
- **Team APL**
- **Sales**
- **Project Managers**
- **Squadre Installazione**
- **Prodotti Master**
- **Progetti**
- **Messaggi Progetto**
- **Change Log**

### Come usare MockDataService

Tutti i servizi mock utilizzano il `MockDataService` come backend centralizzato. Questo garantisce:
- **Persistenza dei dati** durante l'utilizzo dell'applicazione
- **Consistenza** tra diversi componenti
- **Facilità di test** e debug

## Operazioni Supportate

### Clienti

```typescript
// GET - Ottieni tutti i clienti
lookupService.getClienti(): Observable<Cliente[]>

// GET - Ottieni un cliente specifico
lookupService.getCliente(id: number): Observable<Cliente>

// POST - Crea un nuovo cliente
lookupService.createCliente(cliente: Cliente): Observable<Cliente>

// PUT - Aggiorna un cliente esistente
lookupService.updateCliente(id: number, cliente: Cliente): Observable<Cliente>

// DELETE - Elimina un cliente
lookupService.deleteCliente(id: number): Observable<void>

// Ricerca clienti
lookupService.searchClienti(searchTerm: string): Observable<Cliente[]>
```

### Progetti

```typescript
// GET - Ottieni tutti i progetti
projectService.getProjects(): Observable<Project[]>

// GET - Ottieni un progetto specifico
projectService.getProject(numeroProgetto: string): Observable<Project>

// POST - Crea un nuovo progetto
projectService.createProject(project: Project): Observable<Project>

// PUT - Aggiorna completamente un progetto
projectService.updateProject(numeroProgetto: string, project: Project): Observable<Project>

// PATCH - Aggiorna parzialmente un progetto
projectService.patchProject(numeroProgetto: string, partial: Partial<Project>): Observable<Project>

// DELETE - Elimina un progetto
projectService.deleteProject(numeroProgetto: string): Observable<void>

// Livelli Progetto
projectService.addLivelloProgetto(numeroProgetto: string, livello: LivelloProgetto): Observable<LivelloProgetto>
projectService.updateLivelloProgetto(numeroProgetto: string, livelloId: number, livello: LivelloProgetto): Observable<LivelloProgetto>
projectService.deleteLivelloProgetto(numeroProgetto: string, livelloId: number): Observable<void>

// Prodotti Progetto
projectService.addProdottoProgetto(numeroProgetto: string, prodotto: ProdottoProgetto): Observable<ProdottoProgetto>
projectService.updateProdottoProgetto(numeroProgetto: string, prodottoId: number, prodotto: ProdottoProgetto): Observable<ProdottoProgetto>
projectService.deleteProdottoProgetto(numeroProgetto: string, prodottoId: number): Observable<void>

// Messaggi Progetto
projectService.getMessaggiProgetto(numeroProgetto: string): Observable<MessaggioProgetto[]>
projectService.addMessaggioProgetto(messaggio: MessaggioProgetto): Observable<MessaggioProgetto>
projectService.updateMessaggioProgetto(id: number, messaggio: MessaggioProgetto): Observable<MessaggioProgetto>
projectService.deleteMessaggioProgetto(id: number): Observable<void>

// Change Log
projectService.getChangeLogProgetto(numeroProgetto: string): Observable<ChangeLog[]>
```

## Messaggi e Change Log

I progetti ora supportano due nuovi tipi di dati:

### Messaggi Progetto

I messaggi permettono di registrare comunicazioni per un progetto:

```typescript
interface MessaggioProgetto {
  id?: number;
  progettoId: number;
  data: Date;
  utente: string;
  messaggio: string;
  tipo?: 'info' | 'warning' | 'error' | 'success';
  allegato?: string;
}
```

**Esempio di utilizzo:**
```typescript
// Aggiungi un messaggio a un progetto
const nuovoMessaggio: MessaggioProgetto = {
  progettoId: 1,
  data: new Date(),
  utente: 'Mario Rossi',
  messaggio: 'Installazione completata con successo',
  tipo: 'success'
};

projectService.addMessaggioProgetto(nuovoMessaggio).subscribe(
  messaggio => console.log('Messaggio aggiunto:', messaggio)
);
```

### Change Log

Il change log registra automaticamente tutte le modifiche ai progetti:

```typescript
interface ChangeLog {
  id?: number;
  progettoId: number;
  data: Date;
  utente: string;
  azione: string; // 'created', 'updated', 'deleted', etc.
  descrizione: string;
  dettagli?: Record<string, any>;
}
```

**Le azioni vengono registrate automaticamente quando:**
- Un progetto viene creato
- Un progetto viene aggiornato
- Un progetto viene eliminato
- Un livello viene aggiunto/modificato/eliminato
- Un prodotto viene aggiunto/modificato/eliminato
- Un messaggio viene aggiunto/modificato/eliminato

**Esempio di utilizzo:**
```typescript
// Ottieni il change log di un progetto
projectService.getChangeLogProgetto('24001').subscribe(
  logs => console.log('Storico modifiche:', logs)
);
```

## Passaggio alle API Reali

Per passare dai servizi mock alle API reali:

### 1. Configurazione

Modifica il file `service-configuration.service.ts`:

```typescript
export class ServiceConfigurationService {
  private useMockServices = false; // Cambia da true a false
  
  // ... rest of the code
}
```

### 2. Configurazione delle API

Assicurati che le API reali implementino gli stessi endpoint e strutture dati:

#### Endpoint Lookup
- `GET /api/lookup/clienti` - Lista clienti
- `POST /api/lookup/clienti` - Crea cliente
- `PUT /api/lookup/clienti/:id` - Aggiorna cliente
- `DELETE /api/lookup/clienti/:id` - Elimina cliente
- `GET /api/lookup/clienti/search?q=term` - Cerca clienti

#### Endpoint Projects
- `GET /api/projects` - Lista progetti
- `GET /api/projects/:numero` - Dettaglio progetto
- `POST /api/projects` - Crea progetto
- `PUT /api/projects/:numero` - Aggiorna progetto (completo)
- `PATCH /api/projects/:numero` - Aggiorna progetto (parziale)
- `DELETE /api/projects/:numero` - Elimina progetto

#### Endpoint Livelli
- `GET /api/projects/:numero/livelli` - Lista livelli
- `POST /api/projects/:numero/livelli` - Aggiungi livello
- `PUT /api/projects/:numero/livelli/:id` - Aggiorna livello
- `DELETE /api/projects/:numero/livelli/:id` - Elimina livello

#### Endpoint Prodotti
- `GET /api/projects/:numero/prodotti` - Lista prodotti
- `POST /api/projects/:numero/prodotti` - Aggiungi prodotto
- `PUT /api/projects/:numero/prodotti/:id` - Aggiorna prodotto
- `DELETE /api/projects/:numero/prodotti/:id` - Elimina prodotto

#### Endpoint Messaggi
- `GET /api/projects/:numero/messaggi` - Lista messaggi
- `POST /api/projects/:numero/messaggi` - Aggiungi messaggio
- `PUT /api/projects/:numero/messaggi/:id` - Aggiorna messaggio
- `DELETE /api/projects/:numero/messaggi/:id` - Elimina messaggio

#### Endpoint Change Log
- `GET /api/projects/:numero/changelog` - Lista change log

### 3. Nessuna Modifica ai Componenti

I componenti non richiedono modifiche perché utilizzano le stesse interfacce:
- `LookupService` (mock o reale)
- `ProjectService` (mock o reale)

### 4. Test

Testa l'applicazione con le API reali:

```bash
# Avvia il server di sviluppo
npm start

# Verifica che i dati vengano caricati dalle API reali
# Controlla la console per eventuali errori
```

## Best Practices

1. **Utilizza sempre i tipi TypeScript** definiti in `models/`
2. **Gestisci gli errori** con try-catch o operatori RxJS
3. **Usa gli operatori RxJS** per gestire gli stream asincroni
4. **Mantieni la consistenza** tra mock e API reali
5. **Testa prima con i mock** prima di passare alle API reali

## Esempio Completo

```typescript
import { Component, OnInit } from '@angular/core';
import { LookupService } from './services/lookup.service';
import { ProjectService } from './services/project.service';
import { Cliente } from './models/lookup.model';
import { Project } from './models/project.model';

@Component({
  selector: 'app-example',
  template: '...'
})
export class ExampleComponent implements OnInit {
  clienti: Cliente[] = [];
  progetti: Project[] = [];

  constructor(
    private lookupService: LookupService,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.loadClienti();
    this.loadProgetti();
  }

  loadClienti() {
    this.lookupService.getClienti().subscribe({
      next: (clienti) => this.clienti = clienti,
      error: (error) => console.error('Errore caricamento clienti:', error)
    });
  }

  loadProgetti() {
    this.projectService.getProjects().subscribe({
      next: (progetti) => this.progetti = progetti,
      error: (error) => console.error('Errore caricamento progetti:', error)
    });
  }

  // Crea un nuovo cliente
  createCliente() {
    const nuovoCliente: Cliente = {
      nome: 'Nuovo Cliente',
      email: 'info@example.com',
      telefono: '+39 123 456 7890',
      partitaIVA: 'IT12345678901',
      contatto: 'Mario Rossi'
    };

    this.lookupService.createCliente(nuovoCliente).subscribe({
      next: (cliente) => {
        console.log('Cliente creato:', cliente);
        this.loadClienti(); // Ricarica la lista
      },
      error: (error) => console.error('Errore creazione cliente:', error)
    });
  }

  // Aggiungi un messaggio a un progetto
  addMessaggio(progettoId: number) {
    const messaggio = {
      progettoId: progettoId,
      data: new Date(),
      utente: 'Mario Rossi',
      messaggio: 'Note di installazione completata',
      tipo: 'success' as const
    };

    this.projectService.addMessaggioProgetto(messaggio).subscribe({
      next: (msg) => {
        console.log('Messaggio aggiunto:', msg);
      },
      error: (error) => console.error('Errore aggiunta messaggio:', error)
    });
  }
}
```

## Conclusion

I servizi mock sono completamente funzionali e pronti per il passaggio alle API reali. Tutti i dati vengono gestiti in memoria e persistono per tutta la durata della sessione dell'applicazione.


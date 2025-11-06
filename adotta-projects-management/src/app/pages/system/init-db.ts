import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InitService, InitResponse } from '../../services/init.service';
import { DbInitStateService } from '../../services/db-init-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-init-db',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="card">
      <h1 class="text-2xl font-bold mb-4">Inizializzazione Database SAP Business One</h1>
      
      <p-card>
        <ng-template pTemplate="header">
          <div class="p-4">
            <h2 class="text-xl font-semibold">Inizializza Database</h2>
          </div>
        </ng-template>
        
        <div class="mb-4">
          <p class="text-gray-600 mb-4">
            Questa operazione inizializzerà il database di SAP Business One con le strutture dati necessarie.
            L'operazione potrebbe richiedere alcuni minuti.
          </p>
          
          <p class="text-orange-600 font-semibold mb-4">
            <i class="pi pi-exclamation-triangle mr-2"></i>
            Attenzione: Assicurati di aver eseguito un backup del database prima di procedere.
          </p>
        </div>

        <div class="flex gap-2 mb-4">
          <p-button 
            label="Avvia Inizializzazione" 
            icon="pi pi-play" 
            severity="primary"
            [loading]="loading"
            [disabled]="loading"
            (click)="initialize()">
          </p-button>
          
          <p-button 
            label="Pulisci Log" 
            icon="pi pi-trash" 
            severity="secondary"
            [disabled]="loading || !initLog"
            (click)="clearLog()">
          </p-button>
        </div>

        <div *ngIf="loading" class="flex justify-content-center align-items-center p-4">
          <p-progressSpinner [style]="{width: '50px', height: '50px'}" strokeWidth="4"></p-progressSpinner>
          <span class="ml-3">Inizializzazione in corso...</span>
        </div>

        <div *ngIf="initLog" class="mt-4">
          <h3 class="text-lg font-semibold mb-2">Log Inizializzazione</h3>
          <div class="bg-gray-900 text-green-400 p-4 rounded border border-gray-700 font-mono text-sm overflow-auto max-h-96">
            <pre class="whitespace-pre-wrap m-0">{{ initLog }}</pre>
          </div>
          
          <div *ngIf="initTimestamp" class="mt-2 text-sm text-gray-500">
            <i class="pi pi-clock mr-1"></i>
            Inizializzazione completata il: {{ initTimestamp | date:'medium' }}
          </div>
        </div>
      </p-card>
    </div>

    <p-toast></p-toast>
  `
})
export class InitDbComponent implements OnInit {
  loading = false;
  initLog: string | null = null;
  initTimestamp: Date | null = null;

  constructor(
    private initService: InitService,
    private messageService: MessageService,
    private dbInitState: DbInitStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  initialize(): void {
    this.loading = true;
    this.initLog = null;
    this.initTimestamp = null;

    this.initService.initializeDatabase().subscribe({
      next: (response: InitResponse) => {
        this.loading = false;
        this.initLog = response.log || 'Inizializzazione completata con successo.';
        this.initTimestamp = response.timestamp ? new Date(response.timestamp) : new Date();
        
        if (response.success !== false) {
          // Aggiorna lo stato di inizializzazione del DB
          this.dbInitState.setInitialized(true);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Successo',
            detail: 'Inizializzazione completata con successo'
          });

          // Reindirizza alla dashboard dopo un breve delay
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Attenzione',
            detail: 'Inizializzazione completata con alcuni avvisi'
          });
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMessage = error.error?.log || error.error?.message || error.message || 'Errore durante l\'inizializzazione';
        this.initLog = `ERRORE: ${errorMessage}`;
        this.initTimestamp = new Date();
        
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Si è verificato un errore durante l\'inizializzazione'
        });
      }
    });
  }

  clearLog(): void {
    this.initLog = null;
    this.initTimestamp = null;
  }
}


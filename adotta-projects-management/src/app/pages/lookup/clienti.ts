import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LookupService } from '../../services/lookup.service';
import { ServiceProviderService } from '../../services/service-provider.service';
import { Cliente } from '../../models/lookup.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-clienti',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="card">
      <!-- Toolbar -->
      <p-toolbar>
        <ng-template pTemplate="left">
          <div class="flex gap-2">
          </div>
        </ng-template>
        <ng-template pTemplate="right">
          <p-iconfield iconPosition="left">
              <input pInputText type="text" placeholder="Cerca clienti..." [(ngModel)]="globalFilter" (input)="filterGlobal($event)" />
              <p-inputicon class="pi pi-search" />
          </p-iconfield>
        </ng-template>
      </p-toolbar>

      <!-- Tabella Clienti -->
      <p-table 
        [value]="clienti" 
        [paginator]="true" 
        [rows]="pageSize"
        [totalRecords]="totalRecords"
        [lazy]="true"
        (onLazyLoad)="onLazyLoad($event)"
        [showCurrentPageReport]="true"
        [rowHover]="true"
        [showGridlines]="false"
        stripedRows
        currentPageReportTemplate="Mostrando {first} a {last} di {totalRecords} clienti"
        [globalFilterFields]="['nome','email','partitaIVA']"
        [loading]="loading"
        styleClass="p-datatable-sm">
        
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="nome">
              Nome
              <p-sortIcon field="nome"></p-sortIcon>
            </th>
            <th pSortableColumn="email">
              Email
              <p-sortIcon field="email"></p-sortIcon>
            </th>
            <th pSortableColumn="telefono">
              Telefono
              <p-sortIcon field="telefono"></p-sortIcon>
            </th>
            <th pSortableColumn="partitaIVA">
              Partita IVA
              <p-sortIcon field="partitaIVA"></p-sortIcon>
            </th>
            <th pSortableColumn="contatto">
              Contatto
              <p-sortIcon field="contatto"></p-sortIcon>
            </th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-cliente>
          <tr>
            <td class="font-bold">{{ cliente.nome }}</td>
            <td>{{ cliente.email || '-' }}</td>
            <td>{{ cliente.telefono || '-' }}</td>
            <td>{{ cliente.partitaIVA || '-' }}</td>
            <td>{{ cliente.contatto || '-' }}</td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center p-4">
              <div class="text-500">
                <i class="pi pi-info-circle mr-2"></i>
                Nessun cliente trovato
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialog Cliente -->
    <p-dialog 
      [header]="isEdit ? 'Modifica Cliente' : 'Nuovo Cliente'" 
      [(visible)]="showDialog" 
      [modal]="true" 
      [style]="{width: '500px'}"
      (onHide)="onDialogHide()">
      
      <form [formGroup]="clienteForm" (ngSubmit)="saveCliente()">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12">
            <label class="block text-900 font-medium mb-2">Nome *</label>
            <input type="text" 
                   pInputText 
                   formControlName="nome"
                   placeholder="Nome cliente"
                   class="w-full">
            <small *ngIf="clienteForm.get('nome')?.invalid && clienteForm.get('nome')?.touched" 
                   class="text-red-500">
              Nome obbligatorio
            </small>
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Email</label>
            <input type="email" 
                   pInputText 
                   formControlName="email"
                   placeholder="email@example.com"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Telefono</label>
            <input type="text" 
                   pInputText 
                   formControlName="telefono"
                   placeholder="+39 123 456 7890"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Partita IVA</label>
            <input type="text" 
                   pInputText 
                   formControlName="partitaIVA"
                   placeholder="IT12345678901"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Contatto</label>
            <input type="text" 
                   pInputText 
                   formControlName="contatto"
                   placeholder="Nome contatto"
                   class="w-full">
          </div>

          <div class="col-span-12">
            <label class="block text-900 font-medium mb-2">Indirizzo Completo</label>
            <textarea 
              formControlName="indirizzoCompleto"
              placeholder="Indirizzo completo"
              rows="2"
              class="w-full p-3 border-1 surface-border rounded">
            </textarea>
          </div>

          <div class="col-span-12">
            <label class="block text-900 font-medium mb-2">Note</label>
            <textarea 
              formControlName="note"
              placeholder="Note aggiuntive"
              rows="3"
              class="w-full p-3 border-1 surface-border rounded">
            </textarea>
          </div>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <button type="button" 
                class="p-button p-button-outlined" 
                (click)="showDialog = false">
          Annulla
        </button>
        <button type="button" 
                class="p-button p-button-primary" 
                (click)="saveCliente()"
                [disabled]="!clienteForm.valid || loading">
          {{ loading ? 'Salvataggio...' : 'Salva' }}
        </button>
      </ng-template>
    </p-dialog>

    <!-- Dialog di conferma -->
    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `
})
export class Clienti implements OnInit, OnDestroy {
  clienti: Cliente[] = [];
  loading = false;
  showDialog = false;
  isEdit = false;
  globalFilter = '';
  totalRecords = 0;
  page = 1;
  pageSize = 25;
  sortField: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  clienteForm: FormGroup;
  private lookupService: LookupService | any;

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private serviceProvider: ServiceProviderService
  ) {
    // Use services based on configuration (mock or real API)
    this.lookupService = this.serviceProvider.provideLookupService();
    this.clienteForm = this.fb.group({
      id: [''],
      nome: ['', Validators.required],
      email: [''],
      telefono: [''],
      partitaIVA: [''],
      indirizzoCompleto: [''],
      contatto: [''],
      note: ['']
    });
  }

  ngOnInit() {
    // Setup ricerca con debounce
    this.searchSubscription = this.searchSubject
      .pipe(
        map(value => value ?? ''),
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.globalFilter = value;
        this.loadClienti(1, this.pageSize, this.globalFilter);
      });

    this.loadClienti();
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
  }

  // Helper per gestire sia response semplice (array) che paginata { items: T[] }
  private extractArray<T>(response: T[] | { items: T[] } | any): T[] {
    if (Array.isArray(response)) {
      return response;
    }
    if (response && typeof response === 'object' && 'items' in response && Array.isArray(response.items)) {
      return response.items;
    }
    return [];
  }

  loadClienti(
    page: number = this.page,
    pageSize: number = this.pageSize,
    search?: string | null,
    sortBy: string | null = this.sortField,
    sortDirection: string | null = this.sortDirection
  ) {
    this.loading = true;
    console.log('Clienti.loadClienti() - lookupService type:', this.lookupService?.constructor?.name);
    const searchTerm = search !== undefined ? search : (this.globalFilter || null);

    this.lookupService.getClienti(page, pageSize, searchTerm, sortBy, sortDirection).subscribe({
      next: (response: any) => {
        const clienti = this.extractArray<Cliente>(response);
        this.clienti = clienti;
        // Se la response è paginata, prova a leggere il totalCount
        this.totalRecords = typeof response === 'object' && response && 'totalCount' in response
          ? (response.totalCount as number)
          : clienti.length;
        this.page = typeof response === 'object' && response && 'page' in response
          ? (response.page as number)
          : page;
        this.pageSize = pageSize;
        this.sortField = sortBy;
        this.sortDirection = sortDirection as any;
        this.loading = false;
        console.log('Clienti loaded:', this.clienti.length);
      },
      error: (error: any) => {
        console.error('Errore nel caricamento clienti:', error);
        this.loading = false;
      }
    });
  }

  openDialog() {
    this.isEdit = false;
    this.clienteForm.reset();
    this.showDialog = true;
  }

  editCliente(cliente: Cliente) {
    this.isEdit = true;
    this.clienteForm.patchValue(cliente);
    this.showDialog = true;
  }

  saveCliente() {
    if (this.clienteForm.valid) {
      this.loading = true;
      const clienteData = this.clienteForm.value;

      const saveOperation = this.isEdit 
        ? this.lookupService.updateCliente(clienteData.id, clienteData)
        : this.lookupService.createCliente(clienteData);

      saveOperation.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successo',
            detail: `Cliente ${this.isEdit ? 'aggiornato' : 'creato'} con successo`
          });
          this.showDialog = false;
          this.loadClienti();
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Errore',
            detail: 'Errore nel salvataggio del cliente'
          });
          this.loading = false;
        }
      });
    }
  }

  deleteCliente(cliente: Cliente) {
    this.confirmationService.confirm({
      message: `Sei sicuro di voler eliminare il cliente "${cliente.nome}"?`,
      header: 'Conferma Eliminazione',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Elimina',
      rejectLabel: 'Annulla',
      accept: () => {
        this.lookupService.deleteCliente(String(cliente.id!)).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successo',
              detail: 'Cliente eliminato con successo'
            });
            this.loadClienti();
          },
          error: (error: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Errore',
              detail: 'Errore nell\'eliminazione del cliente'
            });
          }
        });
      }
    });
  }

  filterGlobal(event: any) {
    const value = event.target?.value ?? '';
    // Invia il testo alla ricerca con debounce (non chiama subito l'API)
    this.searchSubject.next(value);
  }

  onDialogHide() {
    this.clienteForm.reset();
    this.isEdit = false;
  }

  // Gestisce il lazy loading/paginazione della tabella
  onLazyLoad(event: any) {
    // PrimeNG emette first (indice record iniziale), rows (righe per pagina) e info di ordinamento
    const rows = event.rows ?? this.pageSize;
    const first = event.first ?? 0;
    const newPageIndex = rows > 0 ? Math.floor(first / rows) : 0;
    const newPage = newPageIndex + 1; // API usa indice base 1
    const newPageSize = rows;

    // Gestione ordinamento singolo campo
    let sortField: string | null = this.sortField;
    let sortDirection: 'asc' | 'desc' | null = this.sortDirection;

    if (event.sortField) {
      sortField = event.sortField;
      if (event.sortOrder === 1) {
        sortDirection = 'asc';
      } else if (event.sortOrder === -1) {
        sortDirection = 'desc';
      } else {
        sortDirection = null;
      }
    }

    this.sortField = sortField;
    this.sortDirection = sortDirection;

    this.loadClienti(newPage, newPageSize, undefined, sortField, sortDirection || null);
  }
}
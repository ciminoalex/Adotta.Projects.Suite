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
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { ChangeDetectorRef } from '@angular/core';
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
    ToolbarModule,
    TranslatePipe
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
              <input pInputText type="text" [placeholder]="'lookup.searchCustomers' | translate" [(ngModel)]="globalFilter" (input)="filterGlobal($event)" />
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
        [currentPageReportTemplate]="currentPageReportTemplate"
        [globalFilterFields]="['nome','email','partitaIVA']"
        [loading]="loading"
        styleClass="p-datatable-sm">
        
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="nome">
              {{ 'lookup.name' | translate }}
              <p-sortIcon field="nome"></p-sortIcon>
            </th>
            <th pSortableColumn="email">
              {{ 'auth.email' | translate }}
              <p-sortIcon field="email"></p-sortIcon>
            </th>
            <th pSortableColumn="telefono">
              {{ 'lookup.phone' | translate }}
              <p-sortIcon field="telefono"></p-sortIcon>
            </th>
            <th pSortableColumn="partitaIVA">
              {{ 'lookup.vatNumber' | translate }}
              <p-sortIcon field="partitaIVA"></p-sortIcon>
            </th>
            <th pSortableColumn="contatto">
              {{ 'lookup.contact' | translate }}
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
                {{ 'lookup.noCustomersFound' | translate }}
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialog Cliente -->
    <p-dialog 
      [header]="isEdit ? ('lookup.editCustomer' | translate) : ('lookup.newCustomer' | translate)" 
      [(visible)]="showDialog" 
      [modal]="true" 
      [style]="{width: '500px'}"
      (onHide)="onDialogHide()">
      
      <form [formGroup]="clienteForm" (ngSubmit)="saveCliente()">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12">
            <label class="block text-900 font-medium mb-2">{{ 'lookup.name' | translate }} *</label>
            <input type="text" 
                   pInputText 
                   formControlName="nome"
                   [placeholder]="'lookup.customerName' | translate"
                   class="w-full">
            <small *ngIf="clienteForm.get('nome')?.invalid && clienteForm.get('nome')?.touched" 
                   class="text-red-500">
              {{ 'validation.required' | translate }}
            </small>
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">{{ 'auth.email' | translate }}</label>
            <input type="email" 
                   pInputText 
                   formControlName="email"
                   [placeholder]="'auth.email' | translate"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">{{ 'lookup.phone' | translate }}</label>
            <input type="text" 
                   pInputText 
                   formControlName="telefono"
                   [placeholder]="'lookup.phonePlaceholder' | translate"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">{{ 'lookup.vatNumber' | translate }}</label>
            <input type="text" 
                   pInputText 
                   formControlName="partitaIVA"
                   [placeholder]="'lookup.vatPlaceholder' | translate"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">{{ 'lookup.contact' | translate }}</label>
            <input type="text" 
                   pInputText 
                   formControlName="contatto"
                   [placeholder]="'lookup.contactName' | translate"
                   class="w-full">
          </div>

          <div class="col-span-12">
            <label class="block text-900 font-medium mb-2">{{ 'lookup.fullAddress' | translate }}</label>
            <textarea 
              formControlName="indirizzoCompleto"
              [placeholder]="'lookup.fullAddress' | translate"
              rows="2"
              class="w-full p-3 border-1 surface-border rounded">
            </textarea>
          </div>

          <div class="col-span-12">
            <label class="block text-900 font-medium mb-2">{{ 'timesheet.notes' | translate }}</label>
            <textarea 
              formControlName="note"
              [placeholder]="'lookup.additionalNotes' | translate"
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
          {{ 'common.cancel' | translate }}
        </button>
        <button type="button" 
                class="p-button p-button-primary" 
                (click)="saveCliente()"
                [disabled]="!clienteForm.valid || loading">
          {{ loading ? ('projects.saving' | translate) : ('common.save' | translate) }}
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

  clienteForm!: FormGroup;
  private lookupService!: LookupService | any;

  currentPageReportTemplate = '';

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private serviceProvider: ServiceProviderService,
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {
    this.updatePageReportTemplate();
    this.translationService.language$.subscribe(() => {
      this.updatePageReportTemplate();
      this.cdr.markForCheck();
    });
  }

  private updatePageReportTemplate() {
    this.currentPageReportTemplate = this.translationService.translate('lookup.showing', { entity: this.translationService.translate('lookup.customers') });
  }

  ngOnInit() {
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
            summary: this.translationService.translate('messages.success'),
            detail: this.translationService.translate(this.isEdit ? 'lookup.customerUpdated' : 'lookup.customerCreated')
          });
          this.showDialog = false;
          this.loadClienti();
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translationService.translate('messages.error'),
            detail: this.translationService.translate('lookup.customerSaveError')
          });
          this.loading = false;
        }
      });
    }
  }

  deleteCliente(cliente: Cliente) {
    this.confirmationService.confirm({
      message: this.translationService.translate('lookup.confirmDeleteCustomer', { name: cliente.nome }),
      header: this.translationService.translate('lookup.confirmDelete'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translationService.translate('common.delete'),
      rejectLabel: this.translationService.translate('common.cancel'),
      accept: () => {
        this.lookupService.deleteCliente(String(cliente.id!)).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.translationService.translate('messages.success'),
              detail: this.translationService.translate('lookup.customerDeleted')
            });
            this.loadClienti();
          },
          error: (error: any) => {
            this.messageService.add({
              severity: 'error',
              summary: this.translationService.translate('messages.error'),
              detail: this.translationService.translate('lookup.customerDeleteError')
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
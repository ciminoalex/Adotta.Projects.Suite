import { Component, OnInit } from '@angular/core';
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
import { ProdottoMaster } from '../../models/lookup.model';

@Component({
  selector: 'app-prodotti-master',
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
            <p-button icon="pi pi-plus" label="Nuovo Prodotto Master" (click)="openDialog()">
            </p-button>
          </div>
        </ng-template>
        <ng-template pTemplate="right">
          <p-iconfield iconPosition="left">
              <input pInputText type="text" placeholder="Cerca prodotti master..." [(ngModel)]="globalFilter" (input)="filterGlobal($event)" />
              <p-inputicon class="pi pi-search" />
          </p-iconfield>
        </ng-template>
      </p-toolbar>

      <!-- Tabella Prodotti Master -->
      <p-table 
        [value]="prodottiMaster" 
        [paginator]="true" 
        [rows]="25"
        [rowHover]="true"
        [showGridlines]="false"
        stripedRows
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Mostrando {first} a {last} di {totalRecords} prodotti master"
        [globalFilterFields]="['nome','categoria','codiceSAP','unitaMisura']"
        [loading]="loading"
        styleClass="p-datatable-sm">
        
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="nome">
              Nome Prodotto
              <p-sortIcon field="nome"></p-sortIcon>
            </th>
            <th pSortableColumn="codiceSAP">
              Codice SAP
              <p-sortIcon field="codiceSAP"></p-sortIcon>
            </th>
            <th pSortableColumn="categoria">
              Categoria
              <p-sortIcon field="categoria"></p-sortIcon>
            </th>
            <th pSortableColumn="unitaMisura">
              Unità Misura
              <p-sortIcon field="unitaMisura"></p-sortIcon>
            </th>
            <th>Descrizione</th>
            <th style="width: 120px">Azioni</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-prodotto>
          <tr>
            <td class="font-bold">{{ prodotto.nome }}</td>
            <td>{{ prodotto.codiceSAP || '-' }}</td>
            <td>{{ prodotto.categoria || '-' }}</td>
            <td>{{ prodotto.unitaMisura || '-' }}</td>
            <td>{{ prodotto.descrizione || '-' }}</td>
            <td>
              <div class="flex gap-1">
                <button class="p-button p-button-text p-button-sm" 
                        (click)="editProdotto(prodotto)"
                        pTooltip="Modifica">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="p-button p-button-text p-button-sm p-button-danger" 
                        (click)="deleteProdotto(prodotto)"
                        pTooltip="Elimina">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center p-4">
              <div class="text-500">
                <i class="pi pi-info-circle mr-2"></i>
                Nessun prodotto master trovato
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialog Prodotto Master -->
    <p-dialog 
      [header]="isEdit ? 'Modifica Prodotto Master' : 'Nuovo Prodotto Master'" 
      [(visible)]="showDialog" 
      [modal]="true" 
      [style]="{width: '500px'}"
      (onHide)="onDialogHide()">
      
      <form [formGroup]="prodottoForm" (ngSubmit)="saveProdotto()">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12">
            <label class="block text-900 font-medium mb-2">Nome Prodotto *</label>
            <input type="text" 
                   pInputText 
                   formControlName="nome"
                   placeholder="Nome prodotto"
                   class="w-full">
            <small *ngIf="prodottoForm.get('nome')?.invalid && prodottoForm.get('nome')?.touched" 
                   class="text-red-500">
              Nome obbligatorio
            </small>
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Codice SAP</label>
            <input type="text" 
                   pInputText 
                   formControlName="codiceSAP"
                   placeholder="Codice SAP"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Categoria *</label>
            <input type="text" 
                   pInputText 
                   formControlName="categoria"
                   placeholder="Es. Metafora, Wallen, Armonica"
                   class="w-full">
            <small *ngIf="prodottoForm.get('categoria')?.invalid && prodottoForm.get('categoria')?.touched" 
                   class="text-red-500">
              Categoria obbligatoria
            </small>
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Unità Misura *</label>
            <input type="text" 
                   pInputText 
                   formControlName="unitaMisura"
                   placeholder="Es. pz, mq, ml"
                   class="w-full">
            <small *ngIf="prodottoForm.get('unitaMisura')?.invalid && prodottoForm.get('unitaMisura')?.touched" 
                   class="text-red-500">
              Unità di misura obbligatoria
            </small>
          </div>

          <div class="col-span-12">
            <label class="block text-900 font-medium mb-2">Descrizione</label>
            <textarea 
              formControlName="descrizione"
              placeholder="Descrizione prodotto"
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
                (click)="saveProdotto()"
                [disabled]="!prodottoForm.valid || loading">
          {{ loading ? 'Salvataggio...' : 'Salva' }}
        </button>
      </ng-template>
    </p-dialog>

    <!-- Dialog di conferma -->
    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `
})
export class ProdottiMaster implements OnInit {
  prodottiMaster: ProdottoMaster[] = [];
  loading = false;
  showDialog = false;
  isEdit = false;
  globalFilter = '';

  prodottoForm: FormGroup;
  private lookupService: LookupService | any;

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private serviceProvider: ServiceProviderService
  ) {
    // Use services based on configuration (mock or real API)
    this.lookupService = this.serviceProvider.provideLookupService();
    this.prodottoForm = this.fb.group({
      id: [''],
      nome: ['', Validators.required],
      codiceSAP: [''],
      categoria: ['', Validators.required],
      unitaMisura: ['', Validators.required],
      descrizione: [''],
      variantiDisponibili: [[]]
    });
  }

  ngOnInit() {
    this.loadProdottiMaster();
  }

  loadProdottiMaster() {
    this.loading = true;
    this.lookupService.getProdottiMaster().subscribe({
      next: (prodottiMaster: ProdottoMaster[]) => {
        this.prodottiMaster = prodottiMaster;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Errore nel caricamento prodotti master:', error);
        this.loading = false;
      }
    });
  }

  openDialog() {
    this.isEdit = false;
    this.prodottoForm.reset();
    this.showDialog = true;
  }

  editProdotto(prodotto: ProdottoMaster) {
    this.isEdit = true;
    this.prodottoForm.patchValue(prodotto);
    this.showDialog = true;
  }

  saveProdotto() {
    if (this.prodottoForm.valid) {
      this.loading = true;
      const formValue = this.prodottoForm.value;
      
      // Build prodotto data object aligned with C# model
      // Required fields: Nome, Categoria, UnitaMisura (always strings, never empty)
      // Optional fields: CodiceSAP, Descrizione, VariantiDisponibili (null if empty)
      const prodottoData: any = {
        nome: formValue.nome || '',
        categoria: formValue.categoria || '',
        unitaMisura: formValue.unitaMisura || ''
      };
      
      // Add optional nullable fields only if they have values
      if (formValue.codiceSAP && formValue.codiceSAP.trim() !== '') {
        prodottoData.codiceSAP = formValue.codiceSAP;
      } else {
        prodottoData.codiceSAP = null;
      }
      
      if (formValue.descrizione && formValue.descrizione.trim() !== '') {
        prodottoData.descrizione = formValue.descrizione;
      } else {
        prodottoData.descrizione = null;
      }
      
      if (formValue.variantiDisponibili && Array.isArray(formValue.variantiDisponibili) && formValue.variantiDisponibili.length > 0) {
        prodottoData.variantiDisponibili = formValue.variantiDisponibili;
      } else {
        prodottoData.variantiDisponibili = null;
      }
      
      // Add id only for edit (for create, don't send id - backend will generate it)
      if (this.isEdit) {
        if (formValue.id && formValue.id.trim() !== '') {
          prodottoData.id = formValue.id;
        } else {
          // If editing but no id, this is an error
          console.error('Cannot update prodotto master without id');
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Errore',
            detail: 'ID prodotto mancante per l\'aggiornamento'
          });
          return;
        }
      }
      // For create, don't include id - backend will generate it
      
      // Log the payload being sent for debugging
      console.log('Sending prodotto master data:', JSON.stringify(prodottoData, null, 2));

      const saveOperation = this.isEdit 
        ? this.lookupService.updateProdottoMaster(prodottoData.id!, prodottoData)
        : this.lookupService.createProdottoMaster(prodottoData);

      saveOperation.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successo',
            detail: `Prodotto master ${this.isEdit ? 'aggiornato' : 'creato'} con successo`
          });
          this.showDialog = false;
          this.loadProdottiMaster();
        },
        error: (error: any) => {
          console.error('Error saving prodotto master:', error);
          console.error('Error response:', error.error);
          
          let errorDetail = 'Errore nel salvataggio del prodotto master';
          
          // Check for validation errors (ASP.NET Core format)
          if (error.error && error.error.errors) {
            const validationErrors = error.error.errors;
            const errorMessages: string[] = [];
            
            Object.keys(validationErrors).forEach(field => {
              const fieldErrors = validationErrors[field];
              if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach((msg: string) => {
                  errorMessages.push(`${field}: ${msg}`);
                });
              } else if (typeof fieldErrors === 'string') {
                errorMessages.push(`${field}: ${fieldErrors}`);
              }
            });
            
            if (errorMessages.length > 0) {
              errorDetail = 'Errori di validazione:\n' + errorMessages.join('\n');
            } else if (error.error.title) {
              errorDetail = error.error.title;
            }
          } else if (error.error && error.error.message) {
            errorDetail = error.error.message;
          } else if (error.error && typeof error.error === 'string') {
            errorDetail = error.error;
          } else if (error.error && error.error.title) {
            errorDetail = error.error.title;
          }
          
          this.messageService.add({
            severity: 'error',
            summary: 'Errore',
            detail: errorDetail,
            life: 10000
          });
          this.loading = false;
        }
      });
    }
  }

  deleteProdotto(prodotto: ProdottoMaster) {
    this.confirmationService.confirm({
      message: `Sei sicuro di voler eliminare il prodotto master "${prodotto.nome}"?`,
      header: 'Conferma Eliminazione',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Elimina',
      rejectLabel: 'Annulla',
      accept: () => {
        this.lookupService.deleteProdottoMaster(prodotto.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successo',
              detail: 'Prodotto master eliminato con successo'
            });
            this.loadProdottiMaster();
          },
          error: (error: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Errore',
              detail: 'Errore nell\'eliminazione del prodotto master'
            });
          }
        });
      }
    });
  }

  filterGlobal(event: any) {
    this.globalFilter = event.target.value;
  }

  onDialogHide() {
    this.prodottoForm.reset();
    this.isEdit = false;
  }
}

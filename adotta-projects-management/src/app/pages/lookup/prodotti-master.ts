import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LookupService } from '../../services/lookup.service';
import { MockLookupService } from '../../services/mock/mock-lookup.service';
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
            <button class="p-button p-button-primary" (click)="openDialog()">
              <i class="pi pi-plus mr-2"></i>
              Nuovo Prodotto Master
            </button>
          </div>
        </ng-template>
        <ng-template pTemplate="right">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input type="text" 
                   pInputText 
                   placeholder="Cerca prodotti master..." 
                   [(ngModel)]="globalFilter"
                   (input)="filterGlobal($event)">
          </span>
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
        [globalFilterFields]="['nome','categoria','codice']"
        [loading]="loading"
        styleClass="p-datatable-sm">
        
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="nome">
              Nome Prodotto
              <p-sortIcon field="nome"></p-sortIcon>
            </th>
            <th pSortableColumn="codice">
              Codice
              <p-sortIcon field="codice"></p-sortIcon>
            </th>
            <th pSortableColumn="categoria">
              Categoria
              <p-sortIcon field="categoria"></p-sortIcon>
            </th>
            <th pSortableColumn="prezzo">
              Prezzo
              <p-sortIcon field="prezzo"></p-sortIcon>
            </th>
            <th pSortableColumn="unitaMisura">
              Unità Misura
              <p-sortIcon field="unitaMisura"></p-sortIcon>
            </th>
            <th style="width: 120px">Azioni</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-prodotto>
          <tr>
            <td class="font-bold">{{ prodotto.nome }}</td>
            <td>{{ prodotto.codice || '-' }}</td>
            <td>{{ prodotto.categoria || '-' }}</td>
            <td>
              <span *ngIf="prodotto.prezzo" class="font-bold">
                {{ prodotto.prezzo | currency:'EUR':'symbol':'1.2-2' }}
              </span>
              <span *ngIf="!prodotto.prezzo" class="text-500">-</span>
            </td>
            <td>{{ prodotto.unitaMisura || '-' }}</td>
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
            <label class="block text-900 font-medium mb-2">Codice</label>
            <input type="text" 
                   pInputText 
                   formControlName="codice"
                   placeholder="Codice prodotto"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Categoria</label>
            <input type="text" 
                   pInputText 
                   formControlName="categoria"
                   placeholder="Es. HVAC, Elettrico"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Prezzo</label>
            <input type="number" 
                   pInputText 
                   formControlName="prezzo"
                   placeholder="0.00"
                   step="0.01"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Unità Misura</label>
            <input type="text" 
                   pInputText 
                   formControlName="unitaMisura"
                   placeholder="Es. pz, mq, ml"
                   class="w-full">
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

          <div class="col-span-12">
            <label class="block text-900 font-medium mb-2">Note</label>
            <textarea 
              formControlName="note"
              placeholder="Note aggiuntive"
              rows="2"
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
  private lookupService: LookupService;

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    // Use mock service for development
    this.lookupService = new MockLookupService() as any;
    this.prodottoForm = this.fb.group({
      id: [''],
      nome: ['', Validators.required],
      codice: [''],
      categoria: [''],
      prezzo: [''],
      unitaMisura: [''],
      descrizione: [''],
      note: ['']
    });
  }

  ngOnInit() {
    this.loadProdottiMaster();
  }

  loadProdottiMaster() {
    this.loading = true;
    this.lookupService.getProdottiMaster().subscribe({
      next: (prodottiMaster) => {
        this.prodottiMaster = prodottiMaster;
        this.loading = false;
      },
      error: (error) => {
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
      const prodottoData = this.prodottoForm.value;

      const saveOperation = this.isEdit 
        ? this.lookupService.updateProdottoMaster(prodottoData.id, prodottoData)
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
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Errore',
            detail: 'Errore nel salvataggio del prodotto master'
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
          error: (error) => {
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

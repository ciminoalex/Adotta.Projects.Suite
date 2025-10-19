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
import { SquadraInstallazione } from '../../models/lookup.model';

@Component({
  selector: 'app-squadre-installazione',
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
              Nuova Squadra Installazione
            </button>
          </div>
        </ng-template>
        <ng-template pTemplate="right">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input type="text" 
                   pInputText 
                   placeholder="Cerca squadre installazione..." 
                   [(ngModel)]="globalFilter"
                   (input)="filterGlobal($event)">
          </span>
        </ng-template>
      </p-toolbar>

      <!-- Tabella Squadre Installazione -->
      <p-table 
        [value]="squadreInstallazione" 
        [paginator]="true" 
        [rows]="25"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Mostrando {first} a {last} di {totalRecords} squadre installazione"
        [globalFilterFields]="['nome','capoSquadra','specializzazione']"
        [loading]="loading"
        styleClass="p-datatable-sm">
        
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="nome">
              Nome Squadra
              <p-sortIcon field="nome"></p-sortIcon>
            </th>
            <th pSortableColumn="capoSquadra">
              Capo Squadra
              <p-sortIcon field="capoSquadra"></p-sortIcon>
            </th>
            <th pSortableColumn="specializzazione">
              Specializzazione
              <p-sortIcon field="specializzazione"></p-sortIcon>
            </th>
            <th pSortableColumn="numeroMembri">
              Numero Membri
              <p-sortIcon field="numeroMembri"></p-sortIcon>
            </th>
            <th pSortableColumn="zonaOperativa">
              Zona Operativa
              <p-sortIcon field="zonaOperativa"></p-sortIcon>
            </th>
            <th style="width: 120px">Azioni</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-squadra>
          <tr>
            <td class="font-bold">{{ squadra.nome }}</td>
            <td>{{ squadra.capoSquadra || '-' }}</td>
            <td>{{ squadra.specializzazione || '-' }}</td>
            <td>{{ squadra.numeroMembri || '-' }}</td>
            <td>{{ squadra.zonaOperativa || '-' }}</td>
            <td>
              <div class="flex gap-1">
                <button class="p-button p-button-text p-button-sm" 
                        (click)="editSquadra(squadra)"
                        pTooltip="Modifica">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="p-button p-button-text p-button-sm p-button-danger" 
                        (click)="deleteSquadra(squadra)"
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
                Nessuna squadra installazione trovata
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialog Squadra Installazione -->
    <p-dialog 
      [header]="isEdit ? 'Modifica Squadra Installazione' : 'Nuova Squadra Installazione'" 
      [(visible)]="showDialog" 
      [modal]="true" 
      [style]="{width: '500px'}"
      (onHide)="onDialogHide()">
      
      <form [formGroup]="squadraForm" (ngSubmit)="saveSquadra()">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12">
            <label class="block text-900 font-medium mb-2">Nome Squadra *</label>
            <input type="text" 
                   pInputText 
                   formControlName="nome"
                   placeholder="Nome squadra installazione"
                   class="w-full">
            <small *ngIf="squadraForm.get('nome')?.invalid && squadraForm.get('nome')?.touched" 
                   class="text-red-500">
              Nome obbligatorio
            </small>
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Capo Squadra</label>
            <input type="text" 
                   pInputText 
                   formControlName="capoSquadra"
                   placeholder="Nome capo squadra"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Numero Membri</label>
            <input type="number" 
                   pInputText 
                   formControlName="numeroMembri"
                   placeholder="3"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Specializzazione</label>
            <input type="text" 
                   pInputText 
                   formControlName="specializzazione"
                   placeholder="Es. HVAC, Elettrico"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Zona Operativa</label>
            <input type="text" 
                   pInputText 
                   formControlName="zonaOperativa"
                   placeholder="Es. Nord Italia, Centro"
                   class="w-full">
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
                (click)="saveSquadra()"
                [disabled]="!squadraForm.valid || loading">
          {{ loading ? 'Salvataggio...' : 'Salva' }}
        </button>
      </ng-template>
    </p-dialog>

    <!-- Dialog di conferma -->
    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `
})
export class SquadreInstallazione implements OnInit {
  squadreInstallazione: SquadraInstallazione[] = [];
  loading = false;
  showDialog = false;
  isEdit = false;
  globalFilter = '';

  squadraForm: FormGroup;
  private lookupService: LookupService;

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    // Use mock service for development
    this.lookupService = new MockLookupService() as any;
    this.squadraForm = this.fb.group({
      id: [''],
      nome: ['', Validators.required],
      capoSquadra: [''],
      numeroMembri: [''],
      specializzazione: [''],
      zonaOperativa: [''],
      note: ['']
    });
  }

  ngOnInit() {
    this.loadSquadreInstallazione();
  }

  loadSquadreInstallazione() {
    this.loading = true;
    this.lookupService.getSquadreInstallazione().subscribe({
      next: (squadreInstallazione) => {
        this.squadreInstallazione = squadreInstallazione;
        this.loading = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento squadre installazione:', error);
        this.loading = false;
      }
    });
  }

  openDialog() {
    this.isEdit = false;
    this.squadraForm.reset();
    this.showDialog = true;
  }

  editSquadra(squadra: SquadraInstallazione) {
    this.isEdit = true;
    this.squadraForm.patchValue(squadra);
    this.showDialog = true;
  }

  saveSquadra() {
    if (this.squadraForm.valid) {
      this.loading = true;
      const squadraData = this.squadraForm.value;

      const saveOperation = this.isEdit 
        ? this.lookupService.updateSquadraInstallazione(squadraData.id, squadraData)
        : this.lookupService.createSquadraInstallazione(squadraData);

      saveOperation.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successo',
            detail: `Squadra installazione ${this.isEdit ? 'aggiornata' : 'creata'} con successo`
          });
          this.showDialog = false;
          this.loadSquadreInstallazione();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Errore',
            detail: 'Errore nel salvataggio della squadra installazione'
          });
          this.loading = false;
        }
      });
    }
  }

  deleteSquadra(squadra: SquadraInstallazione) {
    this.confirmationService.confirm({
      message: `Sei sicuro di voler eliminare la squadra installazione "${squadra.nome}"?`,
      header: 'Conferma Eliminazione',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Elimina',
      rejectLabel: 'Annulla',
      accept: () => {
        this.lookupService.deleteSquadraInstallazione(squadra.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successo',
              detail: 'Squadra installazione eliminata con successo'
            });
            this.loadSquadreInstallazione();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Errore',
              detail: 'Errore nell\'eliminazione della squadra installazione'
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
    this.squadraForm.reset();
    this.isEdit = false;
  }
}

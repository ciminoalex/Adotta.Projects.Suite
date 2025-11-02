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
import { Cliente } from '../../models/lookup.model';

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
              Nuovo Cliente
            </button>
          </div>
        </ng-template>
        <ng-template pTemplate="right">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input type="text" 
                   pInputText 
                   placeholder="Cerca clienti..." 
                   [(ngModel)]="globalFilter"
                   (input)="filterGlobal($event)">
          </span>
        </ng-template>
      </p-toolbar>

      <!-- Tabella Clienti -->
      <p-table 
        [value]="clienti" 
        [paginator]="true" 
        [rows]="25"
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
            <th style="width: 120px">Azioni</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-cliente>
          <tr>
            <td class="font-bold">{{ cliente.nome }}</td>
            <td>{{ cliente.email || '-' }}</td>
            <td>{{ cliente.telefono || '-' }}</td>
            <td>{{ cliente.partitaIVA || '-' }}</td>
            <td>{{ cliente.contatto || '-' }}</td>
            <td>
              <div class="flex gap-1">
                <button class="p-button p-button-text p-button-sm" 
                        (click)="editCliente(cliente)"
                        pTooltip="Modifica">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="p-button p-button-text p-button-sm p-button-danger" 
                        (click)="deleteCliente(cliente)"
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
export class Clienti implements OnInit {
  clienti: Cliente[] = [];
  loading = false;
  showDialog = false;
  isEdit = false;
  globalFilter = '';

  clienteForm: FormGroup;
  private lookupService: LookupService;

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    // Use mock service for development
    this.lookupService = new MockLookupService() as any;
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
    this.loadClienti();
  }

  loadClienti() {
    this.loading = true;
    this.lookupService.getClienti().subscribe({
      next: (clienti) => {
        this.clienti = clienti;
        this.loading = false;
      },
      error: (error) => {
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
        error: (error) => {
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
          error: (error) => {
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
    this.globalFilter = event.target.value;
    // Implementare filtro globale se necessario
  }

  onDialogHide() {
    this.clienteForm.reset();
    this.isEdit = false;
  }
}
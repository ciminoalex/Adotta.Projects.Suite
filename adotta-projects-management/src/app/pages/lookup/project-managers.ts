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
import { ProjectManager } from '../../models/lookup.model';

@Component({
  selector: 'app-project-managers',
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
          <p-button icon="pi pi-plus" label="Nuovo Project Manager" (click)="openDialog()">
            </p-button>
          </div>
        </ng-template>
        <ng-template pTemplate="right">
          <p-iconfield iconPosition="left">
              <input pInputText type="text" placeholder="Cerca project managers..." [(ngModel)]="globalFilter" (input)="filterGlobal($event)" />
              <p-inputicon class="pi pi-search" />
          </p-iconfield>
        </ng-template>
      </p-toolbar>

      <!-- Tabella Project Managers -->
      <p-table 
        [value]="projectManagers" 
        [paginator]="true" 
        [rows]="25"
        [rowHover]="true"
        [showGridlines]="false"
        stripedRows
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Mostrando {first} a {last} di {totalRecords} project managers"
        [globalFilterFields]="['nome','email','specializzazione']"
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
            <th pSortableColumn="specializzazione">
              Specializzazione
              <p-sortIcon field="specializzazione"></p-sortIcon>
            </th>
            <th pSortableColumn="esperienza">
              Esperienza (anni)
              <p-sortIcon field="esperienza"></p-sortIcon>
            </th>
            <th style="width: 120px">Azioni</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-pm>
          <tr>
            <td class="font-bold">{{ pm.nome }}</td>
            <td>{{ pm.email || '-' }}</td>
            <td>{{ pm.telefono || '-' }}</td>
            <td>{{ pm.specializzazione || '-' }}</td>
            <td>{{ pm.esperienza || '-' }}</td>
            <td>
              <div class="flex gap-1">
                <button class="p-button p-button-text p-button-sm" 
                        (click)="editPM(pm)"
                        pTooltip="Modifica">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="p-button p-button-text p-button-sm p-button-danger" 
                        (click)="deletePM(pm)"
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
                Nessun project manager trovato
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialog Project Manager -->
    <p-dialog 
      [header]="isEdit ? 'Modifica Project Manager' : 'Nuovo Project Manager'" 
      [(visible)]="showDialog" 
      [modal]="true" 
      [style]="{width: '500px'}"
      (onHide)="onDialogHide()">
      
      <form [formGroup]="pmForm" (ngSubmit)="savePM()">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12">
            <label class="block text-900 font-medium mb-2">Nome *</label>
            <input type="text" 
                   pInputText 
                   formControlName="nome"
                   placeholder="Nome project manager"
                   class="w-full">
            <small *ngIf="pmForm.get('nome')?.invalid && pmForm.get('nome')?.touched" 
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
            <label class="block text-900 font-medium mb-2">Specializzazione</label>
            <input type="text" 
                   pInputText 
                   formControlName="specializzazione"
                   placeholder="Es. HVAC, Elettrico"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Esperienza (anni)</label>
            <input type="number" 
                   pInputText 
                   formControlName="esperienza"
                   placeholder="5"
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
                (click)="savePM()"
                [disabled]="!pmForm.valid || loading">
          {{ loading ? 'Salvataggio...' : 'Salva' }}
        </button>
      </ng-template>
    </p-dialog>

    <!-- Dialog di conferma -->
    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `
})
export class ProjectManagers implements OnInit {
  projectManagers: ProjectManager[] = [];
  loading = false;
  showDialog = false;
  isEdit = false;
  globalFilter = '';

  pmForm: FormGroup;
  private lookupService: LookupService | any;

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private serviceProvider: ServiceProviderService
  ) {
    // Use services based on configuration (mock or real API)
    this.lookupService = this.serviceProvider.provideLookupService();
    this.pmForm = this.fb.group({
      id: [''],
      nome: ['', Validators.required],
      email: [''],
      telefono: [''],
      specializzazione: [''],
      esperienza: [''],
      note: ['']
    });
  }

  ngOnInit() {
    this.loadProjectManagers();
  }

  loadProjectManagers() {
    this.loading = true;
    console.log('ProjectManagers.loadProjectManagers() - lookupService type:', this.lookupService?.constructor?.name);
    this.lookupService.getProjectManagers().subscribe({
      next: (projectManagers: ProjectManager[]) => {
        this.projectManagers = projectManagers;
        this.loading = false;
        console.log('ProjectManagers loaded:', projectManagers.length);
      },
      error: (error: any) => {
        console.error('Errore nel caricamento project managers:', error);
        this.loading = false;
      }
    });
  }

  openDialog() {
    this.isEdit = false;
    this.pmForm.reset();
    this.showDialog = true;
  }

  editPM(pm: ProjectManager) {
    this.isEdit = true;
    this.pmForm.patchValue(pm);
    this.showDialog = true;
  }

  savePM() {
    if (this.pmForm.valid) {
      this.loading = true;
      const pmData = this.pmForm.value;

      const saveOperation = this.isEdit 
        ? this.lookupService.updateProjectManager(pmData.id, pmData)
        : this.lookupService.createProjectManager(pmData);

      saveOperation.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successo',
            detail: `Project Manager ${this.isEdit ? 'aggiornato' : 'creato'} con successo`
          });
          this.showDialog = false;
          this.loadProjectManagers();
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Errore',
            detail: 'Errore nel salvataggio del project manager'
          });
          this.loading = false;
        }
      });
    }
  }

  deletePM(pm: ProjectManager) {
    this.confirmationService.confirm({
      message: `Sei sicuro di voler eliminare il project manager "${pm.nome}"?`,
      header: 'Conferma Eliminazione',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Elimina',
      rejectLabel: 'Annulla',
      accept: () => {
        this.lookupService.deleteProjectManager(pm.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successo',
              detail: 'Project Manager eliminato con successo'
            });
            this.loadProjectManagers();
          },
          error: (error: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Errore',
              detail: 'Errore nell\'eliminazione del project manager'
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
    this.pmForm.reset();
    this.isEdit = false;
  }
}

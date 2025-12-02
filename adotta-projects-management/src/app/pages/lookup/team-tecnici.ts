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
import { TeamTecnico } from '../../models/lookup.model';

@Component({
  selector: 'app-team-tecnici',
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
          <p-button icon="pi pi-plus" label="Nuovo Team Tecnico" (click)="openDialog()">
            </p-button>
          </div>
        </ng-template>
        <ng-template pTemplate="right">
          <p-iconfield iconPosition="left">
              <input pInputText type="text" placeholder="Cerca team tecnici..." [(ngModel)]="globalFilter" (input)="filterGlobal($event)" />
              <p-inputicon class="pi pi-search" />
          </p-iconfield>
        </ng-template>
      </p-toolbar>

      <!-- Tabella Team Tecnici -->
      <p-table 
        [value]="teamTecnici" 
        [paginator]="true" 
        [rows]="25"
        [rowHover]="true"
        [showGridlines]="false"
        stripedRows
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Mostrando {first} a {last} di {totalRecords} team tecnici"
        [globalFilterFields]="['nome','specializzazione','email']"
        [loading]="loading"
        styleClass="p-datatable-sm">
        
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="nome">
              Nome
              <p-sortIcon field="nome"></p-sortIcon>
            </th>
            <th pSortableColumn="specializzazione">
              Specializzazione
              <p-sortIcon field="specializzazione"></p-sortIcon>
            </th>
            <th pSortableColumn="email">
              Email
              <p-sortIcon field="email"></p-sortIcon>
            </th>
            <th pSortableColumn="telefono">
              Telefono
              <p-sortIcon field="telefono"></p-sortIcon>
            </th>
            <th pSortableColumn="livelloEsperienza">
              Livello Esperienza
              <p-sortIcon field="livelloEsperienza"></p-sortIcon>
            </th>
            <th style="width: 120px">Azioni</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-team>
          <tr>
            <td class="font-bold">{{ team.nome }}</td>
            <td>{{ team.specializzazione || '-' }}</td>
            <td>{{ team.email || '-' }}</td>
            <td>{{ team.telefono || '-' }}</td>
            <td>{{ team.livelloEsperienza || '-' }}</td>
            <td>
              <div class="flex gap-1">
                <button class="p-button p-button-text p-button-sm" 
                        (click)="editTeam(team)"
                        pTooltip="Modifica">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="p-button p-button-text p-button-sm p-button-danger" 
                        (click)="deleteTeam(team)"
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
                Nessun team tecnico trovato
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialog Team Tecnico -->
    <p-dialog 
      [header]="isEdit ? 'Modifica Team Tecnico' : 'Nuovo Team Tecnico'" 
      [(visible)]="showDialog" 
      [modal]="true" 
      [style]="{width: '500px'}"
      (onHide)="onDialogHide()">
      
      <form [formGroup]="teamForm" (ngSubmit)="saveTeam()">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12">
            <label class="block text-900 font-medium mb-2">Nome *</label>
            <input type="text" 
                   pInputText 
                   formControlName="nome"
                   placeholder="Nome team tecnico"
                   class="w-full">
            <small *ngIf="teamForm.get('nome')?.invalid && teamForm.get('nome')?.touched" 
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
                   placeholder="Es. Elettricista, Idraulico"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Livello Esperienza</label>
            <input type="text" 
                   pInputText 
                   formControlName="livelloEsperienza"
                   placeholder="Es. Junior, Senior"
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
                (click)="saveTeam()"
                [disabled]="!teamForm.valid || loading">
          {{ loading ? 'Salvataggio...' : 'Salva' }}
        </button>
      </ng-template>
    </p-dialog>

    <!-- Dialog di conferma -->
    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `
})
export class TeamTecnici implements OnInit {
  teamTecnici: TeamTecnico[] = [];
  loading = false;
  showDialog = false;
  isEdit = false;
  globalFilter = '';

  teamForm: FormGroup;
  private lookupService: LookupService | any;

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private serviceProvider: ServiceProviderService
  ) {
    // Use services based on configuration (mock or real API)
    this.lookupService = this.serviceProvider.provideLookupService();
    this.teamForm = this.fb.group({
      id: [''],
      nome: ['', Validators.required],
      email: [''],
      telefono: [''],
      specializzazione: [''],
      livelloEsperienza: [''],
      note: ['']
    });
  }

  ngOnInit() {
    this.loadTeamTecnici();
  }

  loadTeamTecnici() {
    this.loading = true;
    this.lookupService.getTeamTecnici().subscribe({
      next: (teamTecnici: TeamTecnico[]) => {
        this.teamTecnici = teamTecnici;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Errore nel caricamento team tecnici:', error);
        this.loading = false;
      }
    });
  }

  openDialog() {
    this.isEdit = false;
    this.teamForm.reset();
    this.showDialog = true;
  }

  editTeam(team: TeamTecnico) {
    this.isEdit = true;
    this.teamForm.patchValue(team);
    this.showDialog = true;
  }

  saveTeam() {
    if (this.teamForm.valid) {
      this.loading = true;
      const teamData = this.teamForm.value;

      const saveOperation = this.isEdit 
        ? this.lookupService.updateTeamTecnico(teamData.id, teamData)
        : this.lookupService.createTeamTecnico(teamData);

      saveOperation.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successo',
            detail: `Team tecnico ${this.isEdit ? 'aggiornato' : 'creato'} con successo`
          });
          this.showDialog = false;
          this.loadTeamTecnici();
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Errore',
            detail: 'Errore nel salvataggio del team tecnico'
          });
          this.loading = false;
        }
      });
    }
  }

  deleteTeam(team: TeamTecnico) {
    this.confirmationService.confirm({
      message: `Sei sicuro di voler eliminare il team tecnico "${team.nome}"?`,
      header: 'Conferma Eliminazione',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Elimina',
      rejectLabel: 'Annulla',
      accept: () => {
        this.lookupService.deleteTeamTecnico(team.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successo',
              detail: 'Team tecnico eliminato con successo'
            });
            this.loadTeamTecnici();
          },
          error: (error: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Errore',
              detail: 'Errore nell\'eliminazione del team tecnico'
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
    this.teamForm.reset();
    this.isEdit = false;
  }
}

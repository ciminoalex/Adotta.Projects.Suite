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
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LookupService } from '../../services/lookup.service';
import { ServiceProviderService } from '../../services/service-provider.service';
import { SquadraInstallazione } from '../../models/lookup.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';

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
    IconFieldModule,
    InputIconModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    TranslatePipe,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="card">
      <!-- Toolbar -->
      <p-toolbar>
        <ng-template pTemplate="left">
          <div class="flex gap-2">
          <p-button icon="pi pi-plus" [label]="'lookup.newInstallationTeam' | translate" (click)="openDialog()">
            </p-button>
          </div>
        </ng-template>
        <ng-template pTemplate="right">
          <p-iconfield iconPosition="left">
              <input pInputText type="text" [placeholder]="'lookup.searchInstallationTeams' | translate" [(ngModel)]="globalFilter" (input)="filterGlobal($event)" />
              <p-inputicon class="pi pi-search" />
          </p-iconfield>
        </ng-template>
      </p-toolbar>

      <!-- Tabella Squadre Installazione -->
      <p-table 
        [value]="squadreInstallazione" 
        [paginator]="true" 
        [rows]="25"
        [rowHover]="true"
        [showGridlines]="false"
        stripedRows
        [showCurrentPageReport]="true"
        [currentPageReportTemplate]="currentPageReportTemplate"
        [globalFilterFields]="['nome','capoSquadra','specializzazione']"
        [loading]="loading"
        styleClass="p-datatable-sm">
        
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="nome">
              {{ 'lookup.teamName' | translate }}
              <p-sortIcon field="nome"></p-sortIcon>
            </th>
            <th pSortableColumn="capoSquadra">
              {{ 'lookup.teamLeader' | translate }}
              <p-sortIcon field="capoSquadra"></p-sortIcon>
            </th>
            <th pSortableColumn="specializzazione">
              {{ 'lookup.specialization' | translate }}
              <p-sortIcon field="specializzazione"></p-sortIcon>
            </th>
            <th pSortableColumn="numeroMembri">
              {{ 'lookup.numberOfMembers' | translate }}
              <p-sortIcon field="numeroMembri"></p-sortIcon>
            </th>
            <th pSortableColumn="zonaOperativa">
              {{ 'lookup.operationalZone' | translate }}
              <p-sortIcon field="zonaOperativa"></p-sortIcon>
            </th>
            <th style="width: 120px">{{ 'common.actions' | translate }}</th>
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
                        [pTooltip]="'common.edit' | translate" tooltipPosition="top">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="p-button p-button-text p-button-sm p-button-danger" 
                        (click)="deleteSquadra(squadra)"
                        [pTooltip]="'common.delete' | translate" tooltipPosition="top">
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
                {{ 'lookup.noInstallationTeamsFound' | translate }}
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialog Squadra Installazione -->
    <p-dialog 
      [header]="isEdit ? ('lookup.editInstallationTeam' | translate) : ('lookup.newInstallationTeam' | translate)" 
      [(visible)]="showDialog" 
      [modal]="true" 
      [style]="{width: '500px'}"
      (onHide)="onDialogHide()">
      
      <form [formGroup]="squadraForm" (ngSubmit)="saveSquadra()">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12">
            <label class="block text-900 font-medium mb-2">{{ 'lookup.teamName' | translate }} *</label>
            <input type="text" 
                   pInputText 
                   formControlName="nome"
                   [placeholder]="'lookup.installationTeamName' | translate"
                   class="w-full">
            <small *ngIf="squadraForm.get('nome')?.invalid && squadraForm.get('nome')?.touched" 
                   class="text-red-500">
              {{ 'validation.required' | translate }}
            </small>
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">{{ 'lookup.teamLeader' | translate }}</label>
            <input type="text" 
                   pInputText 
                   formControlName="capoSquadra"
                   [placeholder]="'lookup.teamLeaderName' | translate"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">{{ 'lookup.numberOfMembers' | translate }}</label>
            <input type="number" 
                   pInputText 
                   formControlName="numeroMembri"
                   [placeholder]="'lookup.numberOfMembers' | translate"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">{{ 'lookup.specialization' | translate }}</label>
            <input type="text" 
                   pInputText 
                   formControlName="specializzazione"
                   [placeholder]="'lookup.specialization' | translate"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">{{ 'lookup.operationalZone' | translate }}</label>
            <input type="text" 
                   pInputText 
                   formControlName="zonaOperativa"
                   [placeholder]="'lookup.operationalZone' | translate"
                   class="w-full">
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
                (click)="saveSquadra()"
                [disabled]="!squadraForm.valid || loading">
          {{ loading ? ('projects.saving' | translate) : ('common.save' | translate) }}
        </button>
      </ng-template>
    </p-dialog>

    <!-- Dialog di conferma -->
    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `
})
export class SquadreInstallazione implements OnInit, OnDestroy {
  squadreInstallazione: SquadraInstallazione[] = [];
  loading = false;
  showDialog = false;
  isEdit = false;
  globalFilter = '';
  currentPageReportTemplate = '';

  squadraForm!: FormGroup;
  private lookupService!: LookupService | any;
  private translationSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private serviceProvider: ServiceProviderService,
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {
    this.updatePageReportTemplate();
    this.translationSubscription = this.translationService.language$.subscribe(() => {
      this.updatePageReportTemplate();
      this.cdr.markForCheck();
    });
  }

  private updatePageReportTemplate() {
    this.currentPageReportTemplate = this.translationService.translate('lookup.showing', { entity: this.translationService.translate('lookup.installationTeams') });
  }

  ngOnInit() {
    // Use services based on configuration (mock or real API)
    this.lookupService = this.serviceProvider.provideLookupService();
    this.squadraForm = this.fb.group({
      id: [''],
      nome: ['', Validators.required],
      capoSquadra: [''],
      numeroMembri: [''],
      specializzazione: [''],
      zonaOperativa: [''],
      note: ['']
    });
    this.loadSquadreInstallazione();
  }

  loadSquadreInstallazione() {
    this.loading = true;
    this.lookupService.getSquadreInstallazione().subscribe({
      next: (squadreInstallazione: SquadraInstallazione[]) => {
        this.squadreInstallazione = squadreInstallazione;
        this.loading = false;
      },
      error: (error: any) => {
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
            summary: this.translationService.translate('messages.success'),
            detail: this.translationService.translate(this.isEdit ? 'lookup.installationTeamUpdated' : 'lookup.installationTeamCreated')
          });
          this.showDialog = false;
          this.loadSquadreInstallazione();
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translationService.translate('messages.error'),
            detail: this.translationService.translate('lookup.installationTeamSaveError')
          });
          this.loading = false;
        }
      });
    }
  }

  deleteSquadra(squadra: SquadraInstallazione) {
    this.confirmationService.confirm({
      message: this.translationService.translate('lookup.confirmDeleteInstallationTeam', { name: squadra.nome }),
      header: this.translationService.translate('lookup.confirmDelete'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translationService.translate('common.delete'),
      rejectLabel: this.translationService.translate('common.cancel'),
      accept: () => {
        this.lookupService.deleteSquadraInstallazione(squadra.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.translationService.translate('messages.success'),
              detail: this.translationService.translate('lookup.installationTeamDeleted')
            });
            this.loadSquadreInstallazione();
          },
          error: (error: any) => {
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

  ngOnDestroy() {
    if (this.translationSubscription) {
      this.translationSubscription.unsubscribe();
    }
  }
}

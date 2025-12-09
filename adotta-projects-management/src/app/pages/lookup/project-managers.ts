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
import { ProjectManager } from '../../models/lookup.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';

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
          <p-button icon="pi pi-plus" [label]="'lookup.newProjectManager' | translate" (click)="openDialog()">
            </p-button>
          </div>
        </ng-template>
        <ng-template pTemplate="right">
          <p-iconfield iconPosition="left">
              <input pInputText type="text" [placeholder]="'lookup.searchProjectManagers' | translate" [(ngModel)]="globalFilter" (input)="filterGlobal($event)" />
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
        [currentPageReportTemplate]="currentPageReportTemplate"
        [globalFilterFields]="['nome','email','specializzazione']"
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
            <th pSortableColumn="specializzazione">
              {{ 'lookup.specialization' | translate }}
              <p-sortIcon field="specializzazione"></p-sortIcon>
            </th>
            <th pSortableColumn="esperienza">
              {{ 'lookup.experience' | translate }}
              <p-sortIcon field="esperienza"></p-sortIcon>
            </th>
            <th style="width: 120px">{{ 'common.actions' | translate }}</th>
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
                        [pTooltip]="'common.edit' | translate" tooltipPosition="top">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="p-button p-button-text p-button-sm p-button-danger" 
                        (click)="deletePM(pm)"
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
                {{ 'lookup.noProjectManagersFound' | translate }}
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialog Project Manager -->
    <p-dialog 
      [header]="isEdit ? ('lookup.editProjectManager' | translate) : ('lookup.newProjectManager' | translate)" 
      [(visible)]="showDialog" 
      [modal]="true" 
      [style]="{width: '500px'}"
      (onHide)="onDialogHide()">
      
      <form [formGroup]="pmForm" (ngSubmit)="savePM()">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12">
            <label class="block text-900 font-medium mb-2">{{ 'lookup.name' | translate }} *</label>
            <input type="text" 
                   pInputText 
                   formControlName="nome"
                   [placeholder]="'lookup.projectManagerName' | translate"
                   class="w-full">
            <small *ngIf="pmForm.get('nome')?.invalid && pmForm.get('nome')?.touched" 
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
            <label class="block text-900 font-medium mb-2">{{ 'lookup.specialization' | translate }}</label>
            <input type="text" 
                   pInputText 
                   formControlName="specializzazione"
                   [placeholder]="'lookup.specialization' | translate"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">{{ 'lookup.experience' | translate }}</label>
            <input type="number" 
                   pInputText 
                   formControlName="esperienza"
                   [placeholder]="'lookup.experience' | translate"
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
                (click)="savePM()"
                [disabled]="!pmForm.valid || loading">
          {{ loading ? ('projects.saving' | translate) : ('common.save' | translate) }}
        </button>
      </ng-template>
    </p-dialog>

    <!-- Dialog di conferma -->
    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `
})
export class ProjectManagers implements OnInit, OnDestroy {
  projectManagers: ProjectManager[] = [];
  loading = false;
  showDialog = false;
  isEdit = false;
  globalFilter = '';
  currentPageReportTemplate = '';

  pmForm!: FormGroup;
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
    this.currentPageReportTemplate = this.translationService.translate('lookup.showing', { entity: this.translationService.translate('lookup.projectManagers') });
  }

  ngOnInit() {
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
            summary: this.translationService.translate('messages.success'),
            detail: this.translationService.translate(this.isEdit ? 'lookup.projectManagerUpdated' : 'lookup.projectManagerCreated')
          });
          this.showDialog = false;
          this.loadProjectManagers();
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translationService.translate('messages.error'),
            detail: this.translationService.translate('lookup.projectManagerSaveError')
          });
          this.loading = false;
        }
      });
    }
  }

  deletePM(pm: ProjectManager) {
    this.confirmationService.confirm({
      message: this.translationService.translate('lookup.confirmDeleteProjectManager', { name: pm.nome }),
      header: this.translationService.translate('lookup.confirmDelete'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translationService.translate('common.delete'),
      rejectLabel: this.translationService.translate('common.cancel'),
      accept: () => {
        this.lookupService.deleteProjectManager(pm.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.translationService.translate('messages.success'),
              detail: this.translationService.translate('lookup.projectManagerDeleted')
            });
            this.loadProjectManagers();
          },
          error: (error: any) => {
            this.messageService.add({
              severity: 'error',
              summary: this.translationService.translate('messages.error'),
              detail: this.translationService.translate('lookup.projectManagerDeleteError')
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

  ngOnDestroy() {
    if (this.translationSubscription) {
      this.translationSubscription.unsubscribe();
    }
  }
}

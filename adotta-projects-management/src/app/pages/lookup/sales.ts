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
import { Sales } from '../../models/lookup.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sales',
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
          <p-button icon="pi pi-plus" [label]="'lookup.newSales' | translate" (click)="openDialog()">
            </p-button>
          </div>
        </ng-template>
        <ng-template pTemplate="right">
          <p-iconfield iconPosition="left">
              <input pInputText type="text" [placeholder]="'lookup.searchSales' | translate" [(ngModel)]="globalFilter" (input)="filterGlobal($event)" />
              <p-inputicon class="pi pi-search" />
          </p-iconfield>
        </ng-template>
      </p-toolbar>

      <!-- Tabella Sales -->
      <p-table 
        [value]="sales" 
        [paginator]="true" 
        [rows]="25"
        [rowHover]="true"
        [showGridlines]="false"
        stripedRows
        [showCurrentPageReport]="true"
        [currentPageReportTemplate]="currentPageReportTemplate"
        [globalFilterFields]="['nome','email','area']"
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
            <th pSortableColumn="area">
              {{ 'lookup.area' | translate }}
              <p-sortIcon field="area"></p-sortIcon>
            </th>
            <th pSortableColumn="livello">
              {{ 'lookup.level' | translate }}
              <p-sortIcon field="livello"></p-sortIcon>
            </th>
            <th style="width: 120px">{{ 'common.actions' | translate }}</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-salesItem>
          <tr>
            <td class="font-bold">{{ salesItem.nome }}</td>
            <td>{{ salesItem.email || '-' }}</td>
            <td>{{ salesItem.telefono || '-' }}</td>
            <td>{{ salesItem.area || '-' }}</td>
            <td>{{ salesItem.livello || '-' }}</td>
            <td>
              <div class="flex gap-1">
                <button class="p-button p-button-text p-button-sm" 
                        (click)="editSales(salesItem)"
                        [pTooltip]="'common.edit' | translate" tooltipPosition="top">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="p-button p-button-text p-button-sm p-button-danger" 
                        (click)="deleteSales(salesItem)"
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
                {{ 'lookup.noSalesFound' | translate }}
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialog Sales -->
    <p-dialog 
      [header]="isEdit ? ('lookup.editSales' | translate) : ('lookup.newSales' | translate)" 
      [(visible)]="showDialog" 
      [modal]="true" 
      [style]="{width: '500px'}"
      (onHide)="onDialogHide()">
      
      <form [formGroup]="salesForm" (ngSubmit)="saveSales()">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12">
            <label class="block text-900 font-medium mb-2">{{ 'lookup.name' | translate }} *</label>
            <input type="text" 
                   pInputText 
                   formControlName="nome"
                   [placeholder]="'lookup.salesName' | translate"
                   class="w-full">
            <small *ngIf="salesForm.get('nome')?.invalid && salesForm.get('nome')?.touched" 
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
            <label class="block text-900 font-medium mb-2">{{ 'lookup.area' | translate }}</label>
            <input type="text" 
                   pInputText 
                   formControlName="area"
                   [placeholder]="'lookup.area' | translate"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">{{ 'lookup.level' | translate }}</label>
            <input type="text" 
                   pInputText 
                   formControlName="livello"
                   [placeholder]="'lookup.level' | translate"
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
                (click)="saveSales()"
                [disabled]="!salesForm.valid || loading">
          {{ loading ? ('projects.saving' | translate) : ('common.save' | translate) }}
        </button>
      </ng-template>
    </p-dialog>

    <!-- Dialog di conferma -->
    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `
})
export class SalesComponent implements OnInit, OnDestroy {
  sales: Sales[] = [];
  loading = false;
  showDialog = false;
  isEdit = false;
  globalFilter = '';
  currentPageReportTemplate = '';

  salesForm!: FormGroup;
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
    this.currentPageReportTemplate = this.translationService.translate('lookup.showing', { entity: this.translationService.translate('lookup.sales') });
  }

  ngOnInit() {
    // Use services based on configuration (mock or real API)
    this.lookupService = this.serviceProvider.provideLookupService();
    this.salesForm = this.fb.group({
      id: [''],
      nome: ['', Validators.required],
      email: [''],
      telefono: [''],
      area: [''],
      livello: [''],
      note: ['']
    });
    this.loadSales();
  }

  loadSales() {
    this.loading = true;
    this.lookupService.getSales().subscribe({
      next: (sales: Sales[]) => {
        this.sales = sales;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Errore nel caricamento sales:', error);
        this.loading = false;
      }
    });
  }

  openDialog() {
    this.isEdit = false;
    this.salesForm.reset();
    this.showDialog = true;
  }

  editSales(salesItem: Sales) {
    this.isEdit = true;
    this.salesForm.patchValue(salesItem);
    this.showDialog = true;
  }

  saveSales() {
    if (this.salesForm.valid) {
      this.loading = true;
      const salesData = this.salesForm.value;

      const saveOperation = this.isEdit 
        ? this.lookupService.updateSales(salesData.id, salesData)
        : this.lookupService.createSales(salesData);

      saveOperation.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translationService.translate('messages.success'),
            detail: this.translationService.translate(this.isEdit ? 'lookup.salesUpdated' : 'lookup.salesCreated')
          });
          this.showDialog = false;
          this.loadSales();
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translationService.translate('messages.error'),
            detail: this.translationService.translate('lookup.salesSaveError')
          });
          this.loading = false;
        }
      });
    }
  }

  deleteSales(salesItem: Sales) {
    this.confirmationService.confirm({
      message: this.translationService.translate('lookup.confirmDeleteSales', { name: salesItem.nome }),
      header: this.translationService.translate('lookup.confirmDelete'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translationService.translate('common.delete'),
      rejectLabel: this.translationService.translate('common.cancel'),
      accept: () => {
        this.lookupService.deleteSales(salesItem.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.translationService.translate('messages.success'),
              detail: this.translationService.translate('lookup.salesDeleted')
            });
            this.loadSales();
          },
          error: (error: any) => {
            this.messageService.add({
              severity: 'error',
              summary: this.translationService.translate('messages.error'),
              detail: this.translationService.translate('lookup.salesDeleteError')
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
    this.salesForm.reset();
    this.isEdit = false;
  }

  ngOnDestroy() {
    if (this.translationSubscription) {
      this.translationSubscription.unsubscribe();
    }
  }
}

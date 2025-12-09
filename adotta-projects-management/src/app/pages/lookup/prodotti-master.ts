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
import { ProdottoMaster } from '../../models/lookup.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';

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
            <p-button icon="pi pi-plus" [label]="'lookup.newMasterProduct' | translate" (click)="openDialog()">
            </p-button>
          </div>
        </ng-template>
        <ng-template pTemplate="right">
          <p-iconfield iconPosition="left">
              <input pInputText type="text" [placeholder]="'lookup.searchMasterProducts' | translate" [(ngModel)]="globalFilter" (input)="filterGlobal($event)" />
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
        [currentPageReportTemplate]="currentPageReportTemplate"
        [globalFilterFields]="['nome','categoria','codiceSAP','unitaMisura']"
        [loading]="loading"
        styleClass="p-datatable-sm">
        
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="nome">
              {{ 'lookup.productName' | translate }}
              <p-sortIcon field="nome"></p-sortIcon>
            </th>
            <th pSortableColumn="codiceSAP">
              {{ 'projects.sapCode' | translate }}
              <p-sortIcon field="codiceSAP"></p-sortIcon>
            </th>
            <th pSortableColumn="categoria">
              {{ 'lookup.category' | translate }}
              <p-sortIcon field="categoria"></p-sortIcon>
            </th>
            <th pSortableColumn="unitaMisura">
              {{ 'lookup.unitOfMeasure' | translate }}
              <p-sortIcon field="unitaMisura"></p-sortIcon>
            </th>
            <th>{{ 'projects.description' | translate }}</th>
            <th style="width: 120px">{{ 'common.actions' | translate }}</th>
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
                        [pTooltip]="'common.edit' | translate" tooltipPosition="top">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="p-button p-button-text p-button-sm p-button-danger" 
                        (click)="deleteProdotto(prodotto)"
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
                {{ 'lookup.noMasterProductsFound' | translate }}
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialog Prodotto Master -->
    <p-dialog 
      [header]="isEdit ? ('lookup.editMasterProduct' | translate) : ('lookup.newMasterProduct' | translate)" 
      [(visible)]="showDialog" 
      [modal]="true" 
      [style]="{width: '500px'}"
      (onHide)="onDialogHide()">
      
      <form [formGroup]="prodottoForm" (ngSubmit)="saveProdotto()">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12">
            <label class="block text-900 font-medium mb-2">{{ 'lookup.productName' | translate }} *</label>
            <input type="text" 
                   pInputText 
                   formControlName="nome"
                   [placeholder]="'lookup.productNamePlaceholder' | translate"
                   class="w-full">
            <small *ngIf="prodottoForm.get('nome')?.invalid && prodottoForm.get('nome')?.touched" 
                   class="text-red-500">
              {{ 'validation.required' | translate }}
            </small>
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">{{ 'projects.sapCode' | translate }}</label>
            <input type="text" 
                   pInputText 
                   formControlName="codiceSAP"
                   [placeholder]="'projects.sapCodePlaceholder' | translate"
                   class="w-full">
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">{{ 'lookup.category' | translate }} *</label>
            <input type="text" 
                   pInputText 
                   formControlName="categoria"
                   [placeholder]="'lookup.categoryPlaceholder' | translate"
                   class="w-full">
            <small *ngIf="prodottoForm.get('categoria')?.invalid && prodottoForm.get('categoria')?.touched" 
                   class="text-red-500">
              {{ 'lookup.categoryRequired' | translate }}
            </small>
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">{{ 'lookup.unitOfMeasure' | translate }} *</label>
            <input type="text" 
                   pInputText 
                   formControlName="unitaMisura"
                   [placeholder]="'lookup.unitOfMeasurePlaceholder' | translate"
                   class="w-full">
            <small *ngIf="prodottoForm.get('unitaMisura')?.invalid && prodottoForm.get('unitaMisura')?.touched" 
                   class="text-red-500">
              {{ 'lookup.unitOfMeasureRequired' | translate }}
            </small>
          </div>

          <div class="col-span-12">
            <label class="block text-900 font-medium mb-2">{{ 'projects.description' | translate }}</label>
            <textarea 
              formControlName="descrizione"
              [placeholder]="'lookup.productDescription' | translate"
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
                (click)="saveProdotto()"
                [disabled]="!prodottoForm.valid || loading">
          {{ loading ? ('projects.saving' | translate) : ('common.save' | translate) }}
        </button>
      </ng-template>
    </p-dialog>

    <!-- Dialog di conferma -->
    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `
})
export class ProdottiMaster implements OnInit, OnDestroy {
  prodottiMaster: ProdottoMaster[] = [];
  loading = false;
  showDialog = false;
  isEdit = false;
  globalFilter = '';
  currentPageReportTemplate = '';

  prodottoForm!: FormGroup;
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
    this.currentPageReportTemplate = this.translationService.translate('lookup.showing', { entity: this.translationService.translate('lookup.masterProducts') });
  }

  ngOnInit() {
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
            summary: this.translationService.translate('messages.error'),
            detail: this.translationService.translate('lookup.masterProductSaveError')
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
            summary: this.translationService.translate('messages.success'),
            detail: this.translationService.translate(this.isEdit ? 'lookup.masterProductUpdated' : 'lookup.masterProductCreated')
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
            summary: this.translationService.translate('messages.error'),
            detail: errorDetail || this.translationService.translate('lookup.masterProductSaveError'),
            life: 10000
          });
          this.loading = false;
        }
      });
    }
  }

  deleteProdotto(prodotto: ProdottoMaster) {
    this.confirmationService.confirm({
      message: this.translationService.translate('lookup.confirmDeleteMasterProduct', { name: prodotto.nome }),
      header: this.translationService.translate('lookup.confirmDelete'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translationService.translate('common.delete'),
      rejectLabel: this.translationService.translate('common.cancel'),
      accept: () => {
        this.lookupService.deleteProdottoMaster(prodotto.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.translationService.translate('messages.success'),
              detail: this.translationService.translate('lookup.masterProductDeleted')
            });
            this.loadProdottiMaster();
          },
          error: (error: any) => {
            this.messageService.add({
              severity: 'error',
              summary: this.translationService.translate('messages.error'),
              detail: this.translationService.translate('lookup.masterProductDeleteError')
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

  ngOnDestroy() {
    if (this.translationSubscription) {
      this.translationSubscription.unsubscribe();
    }
  }
}

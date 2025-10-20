import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProjectService } from '../../services/project.service';
import { LookupService } from '../../services/lookup.service';
import { MockProjectService } from '../../services/mock/mock-project.service';
import { MockLookupService } from '../../services/mock/mock-lookup.service';
import { Project, LivelloProgetto, ProdottoProgetto, ProjectStatus } from '../../models/project.model';
import { Cliente, Stato, Citta, TeamTecnico, TeamAPL, Sales, ProjectManager, SquadraInstallazione, ProdottoMaster } from '../../models/lookup.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    ButtonModule,
    AutoCompleteModule,
    MultiSelectModule,
    TableModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    SkeletonModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-900 font-bold text-2xl">
          {{ isEdit ? 'Modifica Progetto' : 'Nuovo Progetto' }}
        </h2>
        <div class="flex gap-2">
          <button class="p-button p-button-outlined" routerLink="/projects">
            <i class="pi pi-times mr-2"></i>
            Annulla
          </button>
          <button class="p-button p-button-primary" 
                  (click)="saveProject()" 
                  [disabled]="!projectForm.valid || loading">
            <i class="pi pi-save mr-2"></i>
            {{ loading ? 'Salvataggio...' : 'Salva' }}
          </button>
        </div>
      </div>

      <form [formGroup]="projectForm" (ngSubmit)="saveProject()">
        <!-- Informazioni Base -->
        <div class="card mb-4">
          <h3 class="text-900 font-bold text-xl mb-4">Informazioni Base</h3>
          
          <!-- Skeleton loader for project data -->
          <div *ngIf="loadingProject" class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-6">
              <p-skeleton height="2rem" class="mb-2"></p-skeleton>
              <p-skeleton height="3rem"></p-skeleton>
            </div>
            <div class="col-span-12 md:col-span-6">
              <p-skeleton height="2rem" class="mb-2"></p-skeleton>
              <p-skeleton height="3rem"></p-skeleton>
            </div>
            <div class="col-span-12 md:col-span-6">
              <p-skeleton height="2rem" class="mb-2"></p-skeleton>
              <p-skeleton height="3rem"></p-skeleton>
            </div>
            <div class="col-span-12 md:col-span-3">
              <p-skeleton height="2rem" class="mb-2"></p-skeleton>
              <p-skeleton height="3rem"></p-skeleton>
            </div>
            <div class="col-span-12 md:col-span-3">
              <p-skeleton height="2rem" class="mb-2"></p-skeleton>
              <p-skeleton height="3rem"></p-skeleton>
            </div>
            <div class="col-span-12 md:col-span-6">
              <p-skeleton height="2rem" class="mb-2"></p-skeleton>
              <p-skeleton height="3rem"></p-skeleton>
            </div>
            <div class="col-span-12 md:col-span-6">
              <p-skeleton height="2rem" class="mb-2"></p-skeleton>
              <p-skeleton height="3rem"></p-skeleton>
            </div>
            <div class="col-span-12 md:col-span-6">
              <p-skeleton height="2rem" class="mb-2"></p-skeleton>
              <p-skeleton height="3rem"></p-skeleton>
            </div>
            <div class="col-span-12 md:col-span-6">
              <p-skeleton height="2rem" class="mb-2"></p-skeleton>
              <p-skeleton height="3rem"></p-skeleton>
            </div>
            <div class="col-span-12">
              <p-skeleton height="2rem" class="mb-2"></p-skeleton>
              <p-skeleton height="5rem"></p-skeleton>
            </div>
          </div>
          
          <!-- Actual form fields -->
          <div *ngIf="!loadingProject" class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-6">
              <label class="block text-900 font-medium mb-2">Numero Progetto *</label>
              <input type="text" 
                     pInputText 
                     formControlName="numeroProgetto"
                     placeholder="es. 25.087"
                     class="w-full">
              <small *ngIf="projectForm.get('numeroProgetto')?.invalid && projectForm.get('numeroProgetto')?.touched" 
                     class="text-red-500">
                Numero progetto obbligatorio
              </small>
            </div>

            <div class="col-span-12 md:col-span-6">
              <label class="block text-900 font-medium mb-2">Nome Progetto *</label>
              <input type="text" 
                     pInputText 
                     formControlName="nomeProgetto"
                     placeholder="Nome del progetto"
                     class="w-full">
              <small *ngIf="projectForm.get('nomeProgetto')?.invalid && projectForm.get('nomeProgetto')?.touched" 
                     class="text-red-500">
                Nome progetto obbligatorio
              </small>
            </div>

            <div class="col-span-12 md:col-span-6">
              <label class="block text-900 font-medium mb-2">Cliente *</label>
              <p-skeleton *ngIf="loadingLookupData" height="3rem"></p-skeleton>
              <p-autoComplete 
                *ngIf="!loadingLookupData"
                formControlName="cliente"
                [suggestions]="clientiNames"
                (completeMethod)="filterClienti($event)"
                placeholder="Cerca cliente..."
                field="nome"
                [minLength]="1" 
                class="w-full"
                inputStyleClass="w-full">
              </p-autoComplete>
            </div>

            <div class="col-span-12 md:col-span-3">
              <label class="block text-900 font-medium mb-2">Stato</label>
              <p-skeleton *ngIf="loadingLookupData" height="3rem"></p-skeleton>
              <p-select 
                *ngIf="!loadingLookupData"
                [options]="stati" 
                formControlName="stato"
                placeholder="Seleziona stato"
                optionLabel="nome"
                [showClear]="true"
                class="w-full"
                inputStyleClass="w-full">
              </p-select>
            </div>

            <div class="col-span-12 md:col-span-3">
              <label class="block text-900 font-medium mb-2">Città</label>
              <p-skeleton *ngIf="loadingLookupData" height="3rem"></p-skeleton>
              <p-select 
                *ngIf="!loadingLookupData"
                [options]="citta" 
                formControlName="citta"
                placeholder="Seleziona città"
                optionLabel="nome"
                [showClear]="true"
                [disabled]="!projectForm.get('stato')?.value"
                class="w-full"
                inputStyleClass="w-full">
              </p-select>
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
              <label class="block text-900 font-medium mb-2">Stato Progetto</label>
              <p-select 
                [options]="statusOptions" 
                formControlName="statoProgetto"
                placeholder="Seleziona stato"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                inputStyleClass="w-full">
              </p-select>
            </div>

            <div class="col-span-12 md:col-span-6">
              <label class="block text-900 font-medium mb-2">Data Inizio Installazione</label>
              <input type="date" 
                     pInputText 
                     formControlName="dataInizioInstallazione"
                     class="w-full">
            </div>

            <div class="col-span-12 md:col-span-6">
              <label class="block text-900 font-medium mb-2">Data Fine Installazione</label>
              <input type="date" 
                     pInputText 
                     formControlName="dataFineInstallazione"
                     class="w-full">
            </div>

            <div class="col-span-12">
              <label class="block text-900 font-medium mb-2">Note</label>
              <textarea 
                formControlName="note"
                placeholder="Note generali sul progetto"
                rows="3"
                class="w-full p-3 border-1 surface-border rounded">
              </textarea>
            </div>
          </div>
        </div>

        <!-- Team e Responsabilità -->
        <div class="card mb-4">
          <h3 class="text-900 font-bold text-xl mb-4">Team e Responsabilità</h3>
          
          <!-- Skeleton loader for team data -->
          <div *ngIf="loadingProject" class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-6">
              <p-skeleton height="2rem" class="mb-2"></p-skeleton>
              <p-skeleton height="3rem"></p-skeleton>
            </div>
            <div class="col-span-12 md:col-span-6">
              <p-skeleton height="2rem" class="mb-2"></p-skeleton>
              <p-skeleton height="3rem"></p-skeleton>
            </div>
            <div class="col-span-12 md:col-span-6">
              <p-skeleton height="2rem" class="mb-2"></p-skeleton>
              <p-skeleton height="3rem"></p-skeleton>
            </div>
            <div class="col-span-12 md:col-span-6">
              <p-skeleton height="2rem" class="mb-2"></p-skeleton>
              <p-skeleton height="3rem"></p-skeleton>
            </div>
            <div class="col-span-12">
              <p-skeleton height="2rem" class="mb-2"></p-skeleton>
              <p-skeleton height="3rem"></p-skeleton>
            </div>
          </div>
          
          <!-- Actual team fields -->
          <div *ngIf="!loadingProject" class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-6">
              <label class="block text-900 font-medium mb-2">Team Tecnico</label>
              <p-skeleton *ngIf="loadingLookupData" height="3rem"></p-skeleton>
              <p-select 
                *ngIf="!loadingLookupData"
                [options]="teamTecnici" 
                formControlName="teamTecnico"
                placeholder="Seleziona team tecnico"
                optionLabel="nome"
                [showClear]="true"
                class="w-full"
                inputStyleClass="w-full">
              </p-select>
            </div>

            <div class="col-span-12 md:col-span-6">
              <label class="block text-900 font-medium mb-2">Team APL</label>
              <p-skeleton *ngIf="loadingLookupData" height="3rem"></p-skeleton>
              <p-select 
                *ngIf="!loadingLookupData"
                [options]="teamAPL" 
                formControlName="teamAPL"
                placeholder="Seleziona team APL"
                optionLabel="nome"
                [showClear]="true"
                class="w-full"
                inputStyleClass="w-full">
              </p-select>
            </div>

            <div class="col-span-12 md:col-span-6">
              <label class="block text-900 font-medium mb-2">Rappresentante Vendite</label>
              <p-skeleton *ngIf="loadingLookupData" height="3rem"></p-skeleton>
              <p-select 
                *ngIf="!loadingLookupData"
                [options]="sales" 
                formControlName="sales"
                placeholder="Seleziona sales"
                optionLabel="nome"
                [showClear]="true"
                class="w-full"
                inputStyleClass="w-full">
              </p-select>
            </div>

            <div class="col-span-12 md:col-span-6">
              <label class="block text-900 font-medium mb-2">Project Manager</label>
              <p-skeleton *ngIf="loadingLookupData" height="3rem"></p-skeleton>
              <p-select 
                *ngIf="!loadingLookupData"
                [options]="projectManagers" 
                formControlName="projectManager"
                placeholder="Seleziona PM"
                optionLabel="nome"
                [showClear]="true"
                class="w-full"
                inputStyleClass="w-full">
              </p-select>
            </div>

            <div class="col-span-12">
              <label class="block text-900 font-medium mb-2">Team Installazione</label>
              <p-skeleton *ngIf="loadingLookupData" height="3rem"></p-skeleton>
              <p-select 
                *ngIf="!loadingLookupData"
                [options]="squadreInstallazione" 
                formControlName="teamInstallazione"
                placeholder="Seleziona squadra installazione"
                optionLabel="nome"
                [showClear]="true"
                class="w-full"
                inputStyleClass="w-full">
              </p-select>
            </div>
          </div>
        </div>

        <!-- Dati Finanziari -->
        <div class="card mb-4">
          <h3 class="text-900 font-bold text-xl mb-4">Dati Finanziari</h3>
          
          <!-- Skeleton loader for financial data -->
          <div *ngIf="loadingProject" class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-4">
              <p-skeleton height="2rem" class="mb-2"></p-skeleton>
              <p-skeleton height="3rem"></p-skeleton>
            </div>
            <div class="col-span-12 md:col-span-4">
              <p-skeleton height="2rem" class="mb-2"></p-skeleton>
              <p-skeleton height="3rem"></p-skeleton>
            </div>
            <div class="col-span-12 md:col-span-4">
              <p-skeleton height="2rem" class="mb-2"></p-skeleton>
              <p-skeleton height="3rem"></p-skeleton>
            </div>
          </div>
          
          <!-- Actual financial fields -->
          <div *ngIf="!loadingProject" class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-4">
              <label class="block text-900 font-medium mb-2">Valore Progetto</label>
              <p-inputNumber 
                formControlName="valoreProgetto"
                mode="currency"
                currency="EUR"
                locale="it-IT"
                placeholder="Valore progetto"
                class="w-full">
              </p-inputNumber>
            </div>

            <div class="col-span-12 md:col-span-4">
              <label class="block text-900 font-medium mb-2">Margine Previsto (%)</label>
              <p-inputNumber 
                formControlName="marginePrevisto"
                suffix="%"
                placeholder="Margine previsto"
                class="w-full">
              </p-inputNumber>
            </div>

            <div class="col-span-12 md:col-span-4">
              <label class="block text-900 font-medium mb-2">Costi Sostenuti</label>
              <p-inputNumber 
                formControlName="costiSostenuti"
                mode="currency"
                currency="EUR"
                locale="it-IT"
                placeholder="Costi sostenuti"
                [readonly]="true"
                class="w-full">
              </p-inputNumber>
            </div>
          </div>
        </div>

        <!-- Livelli Progetto -->
        <div class="card mb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-900 font-bold text-xl">Livelli Progetto</h3>
            <button *ngIf="!loadingProject" type="button" class="p-button p-button-outlined p-button-sm" (click)="addLevel()">
              <i class="pi pi-plus mr-2"></i>
              Aggiungi Livello
            </button>
          </div>
          
          <!-- Skeleton loader for levels table -->
          <div *ngIf="loadingProject">
            <p-skeleton height="2rem" class="mb-2"></p-skeleton>
            <p-skeleton height="3rem" class="mb-2"></p-skeleton>
            <p-skeleton height="3rem" class="mb-2"></p-skeleton>
            <p-skeleton height="3rem" class="mb-2"></p-skeleton>
            <p-skeleton height="3rem"></p-skeleton>
          </div>
          
          <!-- Actual levels table -->
          <p-table *ngIf="!loadingProject" [value]="livelli" [paginator]="false" [rows]="10" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>Nome</th>
                <th>Ordine</th>
                <th>Descrizione</th>
                <th>Data Inizio</th>
                <th>Data Fine</th>
                <th style="width: 120px">Azioni</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-livello>
              <tr>
                <td>{{ livello.nome }}</td>
                <td>{{ livello.ordine }}</td>
                <td>{{ livello.descrizione }}</td>
                <td>{{ livello.dataInizioInstallazione | date:'dd/MM/yyyy' }}</td>
                <td>{{ livello.dataFineInstallazione | date:'dd/MM/yyyy' }}</td>
                <td>
                  <button type="button" class="p-button p-button-text p-button-sm" (click)="editLevel(livello)">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button type="button" class="p-button p-button-text p-button-sm p-button-danger" (click)="deleteLevel(livello)">
                    <i class="pi pi-trash"></i>
                  </button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="text-center text-500">Nessun livello aggiunto</td>
              </tr>
            </ng-template>
          </p-table>
        </div>

        <!-- Prodotti Progetto -->
        <div class="card mb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-900 font-bold text-xl">Prodotti Progetto</h3>
            <button *ngIf="!loadingProject" type="button" class="p-button p-button-outlined p-button-sm" (click)="addProduct()">
              <i class="pi pi-plus mr-2"></i>
              Aggiungi Prodotto
            </button>
          </div>
          
          <!-- Skeleton loader for products table -->
          <div *ngIf="loadingProject">
            <p-skeleton height="2rem" class="mb-2"></p-skeleton>
            <p-skeleton height="3rem" class="mb-2"></p-skeleton>
            <p-skeleton height="3rem" class="mb-2"></p-skeleton>
            <p-skeleton height="3rem" class="mb-2"></p-skeleton>
            <p-skeleton height="3rem"></p-skeleton>
          </div>
          
          <!-- Actual products table -->
          <p-table *ngIf="!loadingProject" [value]="prodotti" [paginator]="false" [rows]="10" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>Tipo Prodotto</th>
                <th>Variante</th>
                <th>Quantità (m²)</th>
                <th>Quantità (ft)</th>
                <th style="width: 120px">Azioni</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-prodotto>
              <tr>
                <td>{{ prodotto.tipoProdotto.descrizione }}</td>
                <td>{{ prodotto.variante }}</td>
                <td>{{ prodotto.qMq }}</td>
                <td>{{ prodotto.qFt }}</td>
                <td>
                  <button type="button" class="p-button p-button-text p-button-sm" (click)="editProduct(prodotto)">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button type="button" class="p-button p-button-text p-button-sm p-button-danger" (click)="deleteProduct(prodotto)">
                    <i class="pi pi-trash"></i>
                  </button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="5" class="text-center text-500">Nessun prodotto aggiunto</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </form>
    </div>

    <!-- Dialog per Livello -->
    <p-dialog header="{{ editingLevel ? 'Modifica Livello' : 'Nuovo Livello' }}" 
              [(visible)]="showLevelDialog" 
              [modal]="true" 
              [style]="{width: '600px'}"
              [closable]="true">
      <form [formGroup]="levelForm" *ngIf="levelForm">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Nome Livello *</label>
            <input type="text" 
                   pInputText 
                   formControlName="nome"
                   placeholder="Nome del livello"
                   class="w-full">
          </div>
          
          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Ordine *</label>
            <p-inputNumber 
              formControlName="ordine"
              placeholder="Ordine"
              class="w-full">
            </p-inputNumber>
          </div>
          
          <div class="col-span-12">
            <label class="block text-900 font-medium mb-2">Descrizione</label>
            <textarea 
              formControlName="descrizione"
              placeholder="Descrizione del livello"
              rows="3"
              class="w-full p-3 border-1 surface-border rounded">
            </textarea>
          </div>
          
          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Data Inizio Installazione</label>
            <input type="date" 
                   pInputText 
                   formControlName="dataInizioInstallazione"
                   class="w-full">
          </div>
          
          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Data Fine Installazione</label>
            <input type="date" 
                   pInputText 
                   formControlName="dataFineInstallazione"
                   class="w-full">
          </div>
        </div>
      </form>
      
      <ng-template pTemplate="footer">
        <button type="button" class="p-button p-button-text" (click)="cancelLevelEdit()">
          Annulla
        </button>
        <button type="button" class="p-button p-button-primary" (click)="saveLevel()" [disabled]="!levelForm?.valid">
          Salva
        </button>
      </ng-template>
    </p-dialog>

    <!-- Dialog per Prodotto -->
    <p-dialog header="{{ editingProduct ? 'Modifica Prodotto' : 'Nuovo Prodotto' }}" 
              [(visible)]="showProductDialog" 
              [modal]="true" 
              [style]="{width: '600px'}"
              [closable]="true">
      <form [formGroup]="productForm" *ngIf="productForm">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Tipo Prodotto *</label>
            <p-skeleton *ngIf="loadingLookupData" height="3rem"></p-skeleton>
            <p-select 
              *ngIf="!loadingLookupData"
              [options]="prodottiMaster" 
              formControlName="tipoProdotto"
              placeholder="Seleziona tipo prodotto"
              optionLabel="nome"
              [showClear]="true">
            </p-select>
          </div>
          
          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Variante *</label>
            <input type="text" 
                   pInputText 
                   formControlName="variante"
                   placeholder="Variante del prodotto"
                   class="w-full">
          </div>
          
          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Quantità (m²) *</label>
            <p-inputNumber 
              formControlName="qMq"
              placeholder="Metri quadri"
              [min]="0"
              [step]="0.01"
              class="w-full">
            </p-inputNumber>
          </div>
          
          <div class="col-span-12 md:col-span-6">
            <label class="block text-900 font-medium mb-2">Quantità (ft) *</label>
            <p-inputNumber 
              formControlName="qFt"
              placeholder="Piedi quadri"
              [min]="0"
              [step]="0.01"
              class="w-full">
            </p-inputNumber>
          </div>
        </div>
      </form>
      
      <ng-template pTemplate="footer">
        <button type="button" class="p-button p-button-text" (click)="cancelProductEdit()">
          Annulla
        </button>
        <button type="button" class="p-button p-button-primary" (click)="saveProduct()" [disabled]="!productForm?.valid">
          Salva
        </button>
      </ng-template>
    </p-dialog>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `
})
export class ProjectForm implements OnInit {
  projectForm: FormGroup;
  levelForm?: FormGroup;
  productForm?: FormGroup;
  loading = false;
  isEdit = false;
  projectId?: string;
  
  // Loading states
  loadingProject = false;
  loadingLookupData = false;

  // Services
  private projectService: ProjectService;
  private lookupService: LookupService;

  // Levels and Products management
  livelli: LivelloProgetto[] = [];
  prodotti: ProdottoProgetto[] = [];
  showLevelDialog = false;
  showProductDialog = false;
  editingLevel?: LivelloProgetto;
  editingProduct?: ProdottoProgetto;

  // Lookup data
  clienti: Cliente[] = [];
  filteredClienti: Cliente[] = [];
  stati: Stato[] = [];
  citta: Citta[] = [];
  teamTecnici: TeamTecnico[] = [];
  teamAPL: TeamAPL[] = [];
  sales: Sales[] = [];
  projectManagers: ProjectManager[] = [];
  squadreInstallazione: SquadraInstallazione[] = [];
  prodottiMaster: ProdottoMaster[] = [];

  // Form options
  statusOptions = [
    { label: 'CRITICAL', value: ProjectStatus.CRITICAL },
    { label: 'HOLD ON', value: ProjectStatus.HOLD_ON },
    { label: 'RUSH', value: ProjectStatus.RUSH },
    { label: 'TO CHECK', value: ProjectStatus.TO_CHECK },
    { label: 'UPCOMING', value: ProjectStatus.UPCOMING },
    { label: 'PUSHED OUT', value: ProjectStatus.PUSHED_OUT },
    { label: 'ON BID', value: ProjectStatus.ON_BID }
  ];

  // Priority options removed - not part of simplified model

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    // Usa servizi mock in assenza di backend
    this.projectService = new MockProjectService() as any;
    this.lookupService = new MockLookupService() as any;
    this.projectForm = this.fb.group({
      numeroProgetto: ['', Validators.required],
      nomeProgetto: ['', Validators.required],
      cliente: ['', Validators.required],
      citta: [''],
      stato: [''],
      codiceSAP: [''],
      teamTecnico: [''],
      teamAPL: [''],
      sales: [''],
      projectManager: [''],
      teamInstallazione: [''],
      dataCreazione: [new Date()],
      dataInizioInstallazione: [''],
      dataFineInstallazione: [''],
      ultimaModifica: [''],
      valoreProgetto: [''],
      marginePrevisto: [''],
      costiSostenuti: [0],
      statoProgetto: [ProjectStatus.UPCOMING],
      note: [''],
      livelli: [[]],
      prodotti: [[]]
    });
  }

  ngOnInit() {
    this.loadingLookupData = true;
    this.loadLookupData();
    
    // Check if editing
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.projectId = params['id'];
        this.loadingProject = true;
        // Wait a bit for lookup data to load before loading project
        setTimeout(() => {
          this.loadProject();
        }, 500);
      }
    });

    // Watch for stato changes to load citta
    this.projectForm.get('stato')?.valueChanges.subscribe(statoId => {
      if (statoId) {
        this.lookupService.getCittaByStato(statoId).subscribe(citta => {
          this.citta = citta;
        });
      } else {
        this.citta = [];
        this.projectForm.get('citta')?.setValue(null);
      }
    });
  }

  loadLookupData() {
    let completedRequests = 0;
    const totalRequests = 8;

    const checkAllLoaded = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.loadingLookupData = false;
      }
    };

    this.lookupService.getClienti().subscribe({
      next: (clienti) => {
        this.clienti = clienti;
        console.log('Clienti loaded:', clienti);
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error loading clienti:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getStati().subscribe({
      next: (stati) => {
        this.stati = stati;
        console.log('Stati loaded:', stati);
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error loading stati:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getTeamTecnici().subscribe({
      next: (teams) => {
        this.teamTecnici = teams;
        console.log('Team Tecnici loaded:', teams);
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error loading team tecnici:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getTeamAPL().subscribe({
      next: (teams) => {
        this.teamAPL = teams;
        console.log('Team APL loaded:', teams);
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error loading team APL:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getSales().subscribe({
      next: (sales) => {
        this.sales = sales;
        console.log('Sales loaded:', sales);
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error loading sales:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getProjectManagers().subscribe({
      next: (pms) => {
        this.projectManagers = pms;
        console.log('Project Managers loaded:', pms);
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error loading project managers:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getSquadreInstallazione().subscribe({
      next: (squadre) => {
        this.squadreInstallazione = squadre;
        console.log('Squadre Installazione loaded:', squadre);
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error loading squadre installazione:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getProdottiMaster().subscribe({
      next: (prodotti) => {
        this.prodottiMaster = prodotti;
        console.log('Prodotti Master loaded:', prodotti);
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error loading prodotti master:', error);
        checkAllLoaded();
      }
    });
  }

  loadProject() {
    if (this.projectId) {
      this.projectService.getProject(this.projectId).subscribe({
        next: (project) => {
          console.log('Project loaded:', project);
          this.projectForm.patchValue(project);
          
          // Load levels and products from project data
          this.livelli = project.livelli || [];
          this.prodotti = project.prodotti || [];
          
          console.log('Livelli loaded:', this.livelli);
          console.log('Prodotti loaded:', this.prodotti);
          
          // Hide loading skeleton
          this.loadingProject = false;
        },
        error: (error) => {
          console.error('Error loading project:', error);
          this.loadingProject = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Errore',
            detail: 'Errore nel caricamento del progetto'
          });
        }
      });
    }
  }

  get clientiNames(): string[] {
    return this.clienti.map(c => c.nome || '');
  }

  filterClienti(event: any) {
    const query = event.query.toLowerCase();
    this.filteredClienti = this.clienti.filter(cliente => 
      cliente.nome.toLowerCase().includes(query)
    );
  }

  saveProject() {
    if (this.projectForm.valid) {
      this.loading = true;
      const projectData = {
        ...this.projectForm.value,
        livelli: this.livelli,
        prodotti: this.prodotti
      };

      const saveOperation = this.isEdit 
        ? this.projectService.updateProject(this.projectId!, projectData)
        : this.projectService.createProject(projectData);

      saveOperation.subscribe({
        next: (project) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successo',
            detail: `Progetto ${this.isEdit ? 'aggiornato' : 'creato'} con successo`
          });
          this.router.navigate(['/projects']);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Errore',
            detail: 'Errore nel salvataggio del progetto'
          });
          this.loading = false;
        }
      });
    }
  }

  // Levels Management Methods
  addLevel() {
    this.editingLevel = undefined;
    this.levelForm = this.fb.group({
      nome: ['', Validators.required],
      ordine: [this.livelli.length + 1, Validators.required],
      descrizione: [''],
      dataInizioInstallazione: [''],
      dataFineInstallazione: ['']
    });
    this.showLevelDialog = true;
  }

  editLevel(livello: LivelloProgetto) {
    this.editingLevel = livello;
    this.levelForm = this.fb.group({
      nome: [livello.nome, Validators.required],
      ordine: [livello.ordine, Validators.required],
      descrizione: [livello.descrizione],
      dataInizioInstallazione: [livello.dataInizioInstallazione],
      dataFineInstallazione: [livello.dataFineInstallazione]
    });
    this.showLevelDialog = true;
  }

  saveLevel() {
    if (this.levelForm?.valid) {
      const levelData = this.levelForm.value;
      
      if (this.editingLevel) {
        // Update existing level
        const index = this.livelli.findIndex(l => l === this.editingLevel);
        if (index !== -1) {
          this.livelli[index] = { ...this.editingLevel, ...levelData };
        }
      } else {
        // Add new level
        const newLevel: LivelloProgetto = {
          ...levelData,
          id: Math.max(...this.livelli.map(l => l.id || 0), 0) + 1,
          progettoId: this.projectId ? parseInt(this.projectId) : 0,
          dataCaricamento: new Date()
        };
        this.livelli.push(newLevel);
      }
      
      this.showLevelDialog = false;
      this.levelForm = undefined;
      this.editingLevel = undefined;
      
      this.messageService.add({
        severity: 'success',
        summary: 'Successo',
        detail: 'Livello salvato con successo'
      });
    }
  }

  cancelLevelEdit() {
    this.showLevelDialog = false;
    this.levelForm = undefined;
    this.editingLevel = undefined;
  }

  deleteLevel(livello: LivelloProgetto) {
    this.confirmationService.confirm({
      message: 'Sei sicuro di voler eliminare questo livello?',
      header: 'Conferma Eliminazione',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.livelli = this.livelli.filter(l => l !== livello);
        this.messageService.add({
          severity: 'success',
          summary: 'Successo',
          detail: 'Livello eliminato con successo'
        });
      }
    });
  }

  // Products Management Methods
  addProduct() {
    this.editingProduct = undefined;
    this.productForm = this.fb.group({
      tipoProdotto: ['', Validators.required],
      variante: ['', Validators.required],
      qMq: [0, [Validators.required, Validators.min(0)]],
      qFt: [0, [Validators.required, Validators.min(0)]]
    });
    this.showProductDialog = true;
  }

  editProduct(prodotto: ProdottoProgetto) {
    this.editingProduct = prodotto;
    this.productForm = this.fb.group({
      tipoProdotto: [prodotto.tipoProdotto, Validators.required],
      variante: [prodotto.variante, Validators.required],
      qMq: [prodotto.qMq, [Validators.required, Validators.min(0)]],
      qFt: [prodotto.qFt, [Validators.required, Validators.min(0)]]
    });
    this.showProductDialog = true;
  }

  saveProduct() {
    if (this.productForm?.valid) {
      const productData = this.productForm.value;
      
      if (this.editingProduct) {
        // Update existing product
        const index = this.prodotti.findIndex(p => p === this.editingProduct);
        if (index !== -1) {
          this.prodotti[index] = { ...this.editingProduct, ...productData };
        }
      } else {
        // Add new product
        const newProduct: ProdottoProgetto = {
          ...productData,
          id: Math.max(...this.prodotti.map(p => p.id || 0), 0) + 1,
          progettoId: this.projectId ? parseInt(this.projectId) : 0
        };
        this.prodotti.push(newProduct);
      }
      
      this.showProductDialog = false;
      this.productForm = undefined;
      this.editingProduct = undefined;
      
      this.messageService.add({
        severity: 'success',
        summary: 'Successo',
        detail: 'Prodotto salvato con successo'
      });
    }
  }

  cancelProductEdit() {
    this.showProductDialog = false;
    this.productForm = undefined;
    this.editingProduct = undefined;
  }

  deleteProduct(prodotto: ProdottoProgetto) {
    this.confirmationService.confirm({
      message: 'Sei sicuro di voler eliminare questo prodotto?',
      header: 'Conferma Eliminazione',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.prodotti = this.prodotti.filter(p => p !== prodotto);
        this.messageService.add({
          severity: 'success',
          summary: 'Successo',
          detail: 'Prodotto eliminato con successo'
        });
      }
    });
  }
}
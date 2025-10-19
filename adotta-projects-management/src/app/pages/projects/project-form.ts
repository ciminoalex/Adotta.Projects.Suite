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
import { MessageService } from 'primeng/api';
import { ProjectService } from '../../services/project.service';
import { LookupService } from '../../services/lookup.service';
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
    ToastModule
  ],
  providers: [MessageService],
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
          <div class="grid grid-cols-12 gap-4">
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
              <p-autoComplete 
                formControlName="cliente"
                [suggestions]="filteredClienti"
                (completeMethod)="filterClienti($event)"
                placeholder="Cerca cliente..."
                field="nome"
                [minLength]="1">
              </p-autoComplete>
            </div>

            <div class="col-span-12 md:col-span-3">
              <label class="block text-900 font-medium mb-2">Stato</label>
              <p-select 
                [options]="stati" 
                formControlName="stato"
                placeholder="Seleziona stato"
                optionLabel="nome"
                [showClear]="true">
              </p-select>
            </div>

            <div class="col-span-12 md:col-span-3">
              <label class="block text-900 font-medium mb-2">Città</label>
              <p-select 
                [options]="citta" 
                formControlName="citta"
                placeholder="Seleziona città"
                optionLabel="nome"
                [showClear]="true"
                [disabled]="!projectForm.get('stato')?.value">
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
                optionValue="value">
              </p-select>
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
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-6">
              <label class="block text-900 font-medium mb-2">Team Tecnico</label>
              <p-select 
                [options]="teamTecnici" 
                formControlName="teamTecnico"
                placeholder="Seleziona team tecnico"
                optionLabel="nome"
                [showClear]="true">
              </p-select>
            </div>

            <div class="col-span-12 md:col-span-6">
              <label class="block text-900 font-medium mb-2">Team APL</label>
              <p-select 
                [options]="teamAPL" 
                formControlName="teamAPL"
                placeholder="Seleziona team APL"
                optionLabel="nome"
                [showClear]="true">
              </p-select>
            </div>

            <div class="col-span-12 md:col-span-6">
              <label class="block text-900 font-medium mb-2">Rappresentante Vendite</label>
              <p-select 
                [options]="sales" 
                formControlName="rappresentanteVendite"
                placeholder="Seleziona sales"
                optionLabel="nome"
                [showClear]="true">
              </p-select>
            </div>

            <div class="col-span-12 md:col-span-6">
              <label class="block text-900 font-medium mb-2">Project Manager</label>
              <p-select 
                [options]="projectManagers" 
                formControlName="projectManager"
                placeholder="Seleziona PM"
                optionLabel="nome"
                [showClear]="true">
              </p-select>
            </div>

            <div class="col-span-12">
              <label class="block text-900 font-medium mb-2">Team Installazione</label>
              <p-multiSelect 
                [options]="squadreInstallazione" 
                formControlName="teamInstallazione"
                placeholder="Seleziona squadre installazione"
                optionLabel="nome"
                [showClear]="true">
              </p-multiSelect>
            </div>
          </div>
        </div>

        <!-- Dati Finanziari -->
        <div class="card mb-4">
          <h3 class="text-900 font-bold text-xl mb-4">Dati Finanziari</h3>
          <div class="grid grid-cols-12 gap-4">
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
      </form>
    </div>

    <p-toast></p-toast>
  `
})
export class ProjectForm implements OnInit {
  projectForm: FormGroup;
  loading = false;
  isEdit = false;
  projectId?: string;

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
    private projectService: ProjectService,
    private lookupService: LookupService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {
    this.projectForm = this.fb.group({
      numeroProgetto: ['', Validators.required],
      nomeProgetto: ['', Validators.required],
      cliente: ['', Validators.required],
      citta: [''],
      stato: [''],
      codiceSAP: [''],
      teamTecnico: [''],
      teamAPL: [''],
      rappresentanteVendite: [''],
      projectManager: [''],
      teamInstallazione: [[]],
      dataCreazione: [new Date()],
      dataInizioPrevista: [''],
      dataInstallazione: [''],
      dataFinePrevista: [''],
      dataCompletamento: [''],
      valoreProgetto: [''],
      marginePrevisto: [''],
      costiSostenuti: [0],
      statoProgetto: [ProjectStatus.UPCOMING]
    });
  }

  ngOnInit() {
    this.loadLookupData();
    
    // Check if editing
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.projectId = params['id'];
        this.loadProject();
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
    this.lookupService.getClienti().subscribe(clienti => {
      this.clienti = clienti;
    });

    this.lookupService.getStati().subscribe(stati => {
      this.stati = stati;
    });

    this.lookupService.getTeamTecnici().subscribe(teams => {
      this.teamTecnici = teams;
    });

    this.lookupService.getTeamAPL().subscribe(teams => {
      this.teamAPL = teams;
    });

    this.lookupService.getSales().subscribe(sales => {
      this.sales = sales;
    });

    this.lookupService.getProjectManagers().subscribe(pms => {
      this.projectManagers = pms;
    });

    this.lookupService.getSquadreInstallazione().subscribe(squadre => {
      this.squadreInstallazione = squadre;
    });
  }

  loadProject() {
    if (this.projectId) {
      this.projectService.getProject(this.projectId).subscribe(project => {
        this.projectForm.patchValue(project);
      });
    }
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
      const projectData = this.projectForm.value;

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
}
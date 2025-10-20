import { ChangeDetectorRef, Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProjectService } from '../../services/project.service';
import { LookupService } from '../../services/lookup.service';
import { MockProjectService } from '../../services/mock/mock-project.service';
import { MockLookupService } from '../../services/mock/mock-lookup.service';
import { Project, ProjectStatus } from '../../models/project.model';
import { Cliente, ProjectManager } from '../../models/lookup.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    MultiSelectModule,
    TagModule,
    ToolbarModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="card">
      <!-- Toolbar -->
      <p-toolbar>
        <ng-template pTemplate="left">
          <div class="flex gap-2">
            <p-button severity="primary" routerLink="/projects/new">
              <i class="pi pi-plus mr-2"></i>
              Nuovo Progetto
            </p-button>
            <p-button outlined=true (click)="exportData()">
              <i class="pi pi-download mr-2"></i>
              Export
            </p-button>
          </div>
        </ng-template>
        <ng-template pTemplate="right">
          <p-iconfield iconPosition="left">
            <input pInputText type="text" placeholder="Cerca progetti..." [(ngModel)]="globalFilter" (input)="filterGlobal($event)" />
            <p-inputicon class="pi pi-search" />
          </p-iconfield>
        </ng-template>
      </p-toolbar>

      <!-- Spacer per migliorare la spaziatura -->
      <div class="mb-4"></div>

      <!-- Tabella Progetti -->
      <p-table 
        [value]="projects" 
        [paginator]="true" 
        [rows]="100"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Mostrando {first} a {last} di {totalRecords} progetti"
        [globalFilterFields]="['numeroProgetto','cliente','nomeProgetto','citta','stato','teamTecnico','teamAPL','sales','projectManager','teamInstallazione']"
        [loading]="loading"
        rowGroupMode="subheader" groupRowsBy="statoProgetto"
        [scrollable]="true" [scrollHeight]="tableHeight"
        [rowHover]="true"
        [showGridlines]="true"
        styleClass="p-datatable-sm">
        
        <ng-template #header>
          <tr>
            <th pSortableColumn="numeroProgetto" style="width: 120px">
              #
            </th>
            <th pSortableColumn="nomeProgetto">
              Project
            </th>
            <th pSortableColumn="cliente">
              Customer
            </th>
            <th pSortableColumn="citta">
              City
            </th>
            <th pSortableColumn="stato">
              Country
            </th>
            <th pSortableColumn="teamTecnico">
              Tech. Team
            </th>
            <th pSortableColumn="teamAPL">
              APL Team
            </th>
            <th pSortableColumn="sales">
              Sales
            </th>
            <th pSortableColumn="projectManager">
              PM
            </th>
            <th pSortableColumn="teamInstallazione">
              Install. Team
            </th>
            <th pSortableColumn="dataInizioInstallazione">
              Start Install.
            </th>
            <th pSortableColumn="dataFineInstallazione">
              End Install.
            </th>
            <th style="width: 80px">
              
            </th>
          </tr>
        </ng-template>
        <ng-template #groupheader let-project>
                    <tr pRowGroupHeader>
                        <td colspan="13">
                            <div class="flex items-center gap-2">
                            <p-tag [value]="project?.statoProgetto" 
                              [severity]="getStatusSeverity(project?.statoProgetto)">
                            </p-tag>
                            </div>
                        </td>
                    </tr>
                </ng-template>

        <ng-template pTemplate="body" let-project>
          <tr>
            <td>
              <a [routerLink]="['/projects', project.numeroProgetto]" class="font-bold text-blue-500 hover:text-blue-700">
                {{ project.numeroProgetto }}
              </a>
            </td>
            <td>{{ project.nomeProgetto || '-' }}</td>
            <td>{{ project.cliente || '-' }}</td>
            <td>{{ project.citta || '-' }}</td>
            <td>
              <div class="flex items-center gap-2">
                <img src="https://primefaces.org/cdn/primeng/images/demo/flag/flag_placeholder.png" [class]="'flag flag-' + project.stato.toLowerCase()" style="width: 20px" />
                <span>{{ project.stato || '-' }}</span>
              </div>
            </td>
            <td>{{ project.teamTecnico || '-' }}</td>
            <td>{{ project.teamAPL || '-' }}</td>
            <td>{{ project.sales || '-' }}</td>
            <td>{{ project.projectManager || '-' }}</td>
            <td>{{ project.teamInstallazione || '-' }}</td>
            <td>
              <span *ngIf="project.dataInizioInstallazione" [ngClass]="getDateClass(project.dataInizioInstallazione)">
                {{ project.dataInizioInstallazione | date:'dd/MM/yyyy' }}
              </span>
              <span *ngIf="!project.dataInizioInstallazione">-</span>
            </td>
            <td>
              <span *ngIf="project.dataFineInstallazione" [ngClass]="getDateClass(project.dataFineInstallazione)">
                {{ project.dataFineInstallazione | date:'dd/MM/yyyy' }}
              </span>
              <span *ngIf="!project.dataFineInstallazione">-</span>
            </td>
            <td>
              <div class="flex gap-1">
                <button class="p-button p-button-text p-button-sm" 
                        [routerLink]="['/projects', project.numeroProgetto, 'edit']">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="p-button p-button-text p-button-sm p-button-danger" 
                        (click)="deleteProject(project)">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="13" class="text-center p-4">
              <div class="text-500">
                <i class="pi pi-info-circle mr-2"></i>
                Nessun progetto trovato
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialog di conferma -->
    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `
})
export class ProjectList implements OnInit {
  projects: Project[] = [];
  loading = false;
  globalFilter = '';
  tableHeight = '500px';

  // Opzioni per i dropdown
  statusOptions = [
    { label: 'CRITICAL', value: ProjectStatus.CRITICAL },
    { label: 'HOLD ON', value: ProjectStatus.HOLD_ON },
    { label: 'RUSH', value: ProjectStatus.RUSH },
    { label: 'TO CHECK', value: ProjectStatus.TO_CHECK },
    { label: 'UPCOMING', value: ProjectStatus.UPCOMING },
    { label: 'PUSHED OUT', value: ProjectStatus.PUSHED_OUT },
    { label: 'ON BID', value: ProjectStatus.ON_BID }
  ];

  clienti: Cliente[] = [];
  projectManagers: ProjectManager[] = [];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    // Use mock services for development
    this.projectService = new MockProjectService() as any;
    this.lookupService = new MockLookupService() as any;
  }

  private projectService: ProjectService;
  private lookupService: LookupService;

  ngOnInit() {
    this.calculateTableHeight();
    this.loadLookupData();
    this.loadProjects();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.calculateTableHeight();
  }

  calculateTableHeight() {
    // Calcola l'altezza disponibile sottraendo header, toolbar, padding e margini
    const viewportHeight = window.innerHeight;
    const headerHeight = 150; // Altezza approssimativa dell'header
    const toolbarHeight = 60; // Altezza della toolbar
    const paddingMargin = 100; // Padding e margini vari
    const footerHeight = 40; // Altezza del footer se presente
    
    const availableHeight = viewportHeight - headerHeight - toolbarHeight - paddingMargin - footerHeight;
    
    // Imposta un'altezza minima di 300px e massima di 800px
    const calculatedHeight = Math.max(300, Math.min(800, availableHeight));
    this.tableHeight = `${calculatedHeight}px`;
    
    this.cdr.detectChanges();
  }

  loadLookupData() {
    this.lookupService.getClienti().subscribe(clienti => {
      this.clienti = clienti;
    });

    this.lookupService.getProjectManagers().subscribe(pms => {
      this.projectManagers = pms;
    });
  }

  loadProjects() {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loading = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento progetti:', error);
        this.loading = false;
      }
    });
  }

  filterGlobal(event: any) {
    this.globalFilter = event.target.value;
    // Implementare filtro globale se necessario
  }

  deleteProject(project: Project) {
    this.confirmationService.confirm({
      message: `Sei sicuro di voler eliminare il progetto ${project.numeroProgetto}?`,
      header: 'Conferma Eliminazione',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Elimina',
      rejectLabel: 'Annulla',
      accept: () => {
        this.projectService.deleteProject(project.numeroProgetto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successo',
              detail: 'Progetto eliminato con successo'
            });
            this.loadProjects();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Errore',
              detail: 'Errore nell\'eliminazione del progetto'
            });
          }
        });
      }
    });
  }

  exportData() {
    this.projectService.exportProjects('excel').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `progetti_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Errore nell\'export dei dati'
        });
      }
    });
  }

  getStatusSeverity(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.CRITICAL: return 'danger';
      case ProjectStatus.HOLD_ON: return 'danger';
      case ProjectStatus.RUSH: return 'warning';
      case ProjectStatus.TO_CHECK: return 'info';
      case ProjectStatus.UPCOMING: return 'info';
      case ProjectStatus.PUSHED_OUT: return 'success';
      case ProjectStatus.ON_BID: return 'warning';
      default: return 'secondary';
    }
  }

  getStatusStyle(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.CRITICAL: return 'background-color: #000000; color: white;';
      case ProjectStatus.HOLD_ON: return 'background-color: #dc3545; color: white;';
      case ProjectStatus.RUSH: return 'background-color: #6f42c1; color: white;';
      case ProjectStatus.TO_CHECK: return 'background-color: #f8d7da; color: #721c24;';
      case ProjectStatus.UPCOMING: return 'background-color: #d1ecf1; color: #0c5460;';
      case ProjectStatus.PUSHED_OUT: return 'background-color: #d4edda; color: #155724;';
      case ProjectStatus.ON_BID: return 'background-color: #6f42c1; color: white;';
      default: return '';
    }
  }

  getDateClass(data: Date): string {
    const oggi = new Date();
    const dataInstallazione = new Date(data);
    const diffTime = dataInstallazione.getTime() - oggi.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-500 font-bold';
    if (diffDays <= 3) return 'text-orange-500 font-bold';
    return 'text-green-500';
  }
}
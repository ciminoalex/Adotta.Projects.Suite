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
  templateUrl: './project-list.html'
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
    const headerHeight = 85; // Altezza approssimativa dell'header
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
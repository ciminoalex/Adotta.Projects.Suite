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
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ProjectService } from '../../services/project.service';
import { LookupService } from '../../services/lookup.service';
import { ServiceProviderService } from '../../services/service-provider.service';
import { Project, ProjectStatus } from '../../models/project.model';
import { Cliente, ProjectManager } from '../../models/lookup.model';

interface Column {
  field: string;
  header: string;
}

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
    ToastModule,
    DialogModule,
    TooltipModule,
    DragDropModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './project-list.html'
})
export class ProjectList implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  loading = false;
  globalFilter = '';
  tableHeight = '500px';
  cols!: Column[];
  selectedColumns!: Column[];
  showColumnOrderDialog = false;


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

  private projectService: ProjectService | any;
  private lookupService: LookupService | any;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private serviceProvider: ServiceProviderService
  ) {
    // Use services based on configuration (mock or real API)
    this.projectService = this.serviceProvider.provideProjectService();
    this.lookupService = this.serviceProvider.provideLookupService();
  }

  ngOnInit() {
    this.calculateTableHeight();
    this.loadLookupData();
    this.loadProjects();

    this.cols = [
      { field: 'nomeProgetto', header: 'Project' },
      { field: 'cliente', header: 'Customer' },
      { field: 'citta', header: 'City' },
      { field: 'stato', header: 'Country' },
      { field: 'teamTecnico', header: 'Tech. Team' },
      { field: 'teamAPL', header: 'APL Team' },
      { field: 'sales', header: 'Sales' },
      { field: 'projectManager', header: 'PM' },
      { field: 'teamInstallazione', header: 'Install. Team' },
      { field: 'dataInizioInstallazione', header: 'Start Install.' },
      { field: 'dataFineInstallazione', header: 'End Install.' },
      { field: 'quantitaTotaleMq', header: 'Total Mq' },
      { field: 'quantitaTotaleFt', header: 'Total Ft' }
    ];

    // Carica la selezione delle colonne salvata o usa tutte le colonne come default
    this.loadSelectedColumns();
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
    this.lookupService.getClienti().subscribe((clienti: Cliente[]) => {
      this.clienti = clienti;
    });

    this.lookupService.getProjectManagers().subscribe((pms: ProjectManager[]) => {
      this.projectManagers = pms;
    });
  }

  loadProjects() {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (projects: Project[]) => {
        this.projects = projects;
        this.filteredProjects = projects;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Errore nel caricamento progetti:', error);
        this.loading = false;
      }
    });
  }

  filterGlobal(event: any) {
    const filterValue = event.target.value.toLowerCase();
    if (!filterValue) {
      this.filteredProjects = this.projects;
      return;
    }
    
    this.filteredProjects = this.projects.filter(project => {
      return (
        project.numeroProgetto?.toLowerCase().includes(filterValue) ||
        project.cliente?.toLowerCase().includes(filterValue) ||
        project.nomeProgetto?.toLowerCase().includes(filterValue) ||
        project.citta?.toLowerCase().includes(filterValue) ||
        project.stato?.toLowerCase().includes(filterValue) ||
        project.teamTecnico?.toLowerCase().includes(filterValue) ||
        project.teamAPL?.toLowerCase().includes(filterValue) ||
        project.sales?.toLowerCase().includes(filterValue) ||
        project.projectManager?.toLowerCase().includes(filterValue) ||
        project.teamInstallazione?.toLowerCase().includes(filterValue)
      );
    });
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
          error: (error: any) => {
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

  exportExcel() {
    if (!this.filteredProjects || this.filteredProjects.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attenzione',
        detail: 'Nessun dato da esportare'
      });
      return;
    }

    // Funzione per formattare i valori CSV (gestisce virgole e virgolette)
    const formatCsvValue = (value: any): string => {
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      // Se il valore contiene virgole, virgolette o ritorni a capo, va quotato
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Prepara l'header CSV
    const headers = ['#', ...this.selectedColumns.map(col => col.header)];
    const csvContent: string[] = [headers.map(formatCsvValue).join(',')];

    // Prepara i dati
    this.filteredProjects.forEach(project => {
      const row: string[] = [
        formatCsvValue(project.numeroProgetto || ''),
        ...this.selectedColumns.map(col => {
          const value = project[col.field as keyof Project];
          
          // Gestisci le date
          if (col.field === 'dataInizioInstallazione' || col.field === 'dataFineInstallazione') {
            if (value && typeof value === 'string') {
              try {
                const date = new Date(value);
                return formatCsvValue(date.toLocaleDateString('it-IT'));
              } catch {
                return '';
              }
            }
            return '';
          }
          
          // Gestisci le quantità totali calcolate
          if (col.field === 'quantitaTotaleMq') {
            return formatCsvValue(this.getTotalMq(project).toString());
          }
          
          if (col.field === 'quantitaTotaleFt') {
            return formatCsvValue(this.getTotalFt(project).toString());
          }
          
          // Gestisci valori null/undefined
          return value ? formatCsvValue(value) : '';
        })
      ];
      csvContent.push(row.join(','));
    });

    // Crea il file CSV con BOM UTF-8 per Excel
    const csv = csvContent.join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `progetti_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    this.messageService.add({
      severity: 'success',
      summary: 'Successo',
      detail: 'Export completato'
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

  /**
   * Calcola la quantità totale Mq dai prodotti del progetto
   */
  getTotalMq(project: Project): number {
    if (!project.prodotti || project.prodotti.length === 0) {
      return 0;
    }
    return project.prodotti.reduce((sum, prodotto) => sum + (prodotto.qMq || 0), 0);
  }

  /**
   * Calcola la quantità totale Ft dai prodotti del progetto
   */
  getTotalFt(project: Project): number {
    if (!project.prodotti || project.prodotti.length === 0) {
      return 0;
    }
    return project.prodotti.reduce((sum, prodotto) => sum + (prodotto.qFt || 0), 0);
  }

  /**
   * Carica la selezione delle colonne salvata dal localStorage
   */
  private loadSelectedColumns(): void {
    try {
      const savedColumns = localStorage.getItem('project-list-selected-columns');
      if (savedColumns) {
        const parsedColumns = JSON.parse(savedColumns);
        // Verifica che le colonne salvate siano ancora valide
        const validColumns = parsedColumns.filter((savedCol: Column) => 
          this.cols.some(col => col.field === savedCol.field)
        );
        
        if (validColumns.length > 0) {
          this.selectedColumns = validColumns;
          // Applica l'ordine salvato
          this.applyColumnOrder();
        } else {
          this.selectedColumns = [...this.cols];
        }
      } else {
        this.selectedColumns = [...this.cols];
      }
    } catch (error) {
      console.warn('Errore nel caricamento delle colonne salvate:', error);
      this.selectedColumns = [...this.cols];
    }
  }

  /**
   * Salva la selezione delle colonne nel localStorage
   */
  private saveSelectedColumns(): void {
    try {
      localStorage.setItem('project-list-selected-columns', JSON.stringify(this.selectedColumns));
      // Salva anche l'ordine
      this.saveColumnOrder();
    } catch (error) {
      console.warn('Errore nel salvataggio delle colonne:', error);
    }
  }

  /**
   * Gestisce il cambio di selezione delle colonne
   */
  onColumnsChange(): void {
    this.saveSelectedColumns();
  }

  /**
   * Apre il dialog per l'ordinamento delle colonne
   */
  openColumnOrderDialog(): void {
    this.showColumnOrderDialog = true;
  }

  /**
   * Chiude il dialog per l'ordinamento delle colonne
   */
  closeColumnOrderDialog(): void {
    this.showColumnOrderDialog = false;
  }

  /**
   * Gestisce il drag and drop delle colonne
   */
  dropColumn(event: any): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    
    const prevIndex = event.previousIndex;
    const currentIndex = event.currentIndex;
    
    // Sposta l'elemento nell'array
    const movedItem = this.selectedColumns.splice(prevIndex, 1)[0];
    this.selectedColumns.splice(currentIndex, 0, movedItem);
    
    // Salva il nuovo ordine
    this.saveSelectedColumns();
  }

  /**
   * Applica l'ordine delle colonne salvato
   */
  private applyColumnOrder(): void {
    try {
      const savedOrder = localStorage.getItem('project-list-column-order');
      if (savedOrder) {
        const orderArray = JSON.parse(savedOrder);
        // Ordina selectedColumns secondo l'ordine salvato
        this.selectedColumns.sort((a, b) => {
          const indexA = orderArray.indexOf(a.field);
          const indexB = orderArray.indexOf(b.field);
          return indexA - indexB;
        });
      }
    } catch (error) {
      console.warn('Errore nell\'applicazione dell\'ordine colonne:', error);
    }
  }

  /**
   * Salva l'ordine delle colonne nel localStorage
   */
  private saveColumnOrder(): void {
    try {
      const orderArray = this.selectedColumns.map(col => col.field);
      localStorage.setItem('project-list-column-order', JSON.stringify(orderArray));
    } catch (error) {
      console.warn('Errore nel salvataggio dell\'ordine colonne:', error);
    }
  }
}
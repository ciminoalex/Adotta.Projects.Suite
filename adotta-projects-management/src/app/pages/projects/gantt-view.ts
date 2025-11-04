import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { ProjectService } from '../../services/project.service';
import { ServiceProviderService } from '../../services/service-provider.service';
import { Project, LivelloProgetto } from '../../models/project.model';

interface GanttRow {
  numeroProgetto: string;
  nomeLivello: string;
  teamTecnico?: string;
  dataInizio?: Date;
  dataFine?: Date;
  progetto?: Project;
  livello?: LivelloProgetto;
}

@Component({
  selector: 'app-gantt-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DatePickerModule,
    TooltipModule
  ],
  templateUrl: './gantt-view.html',
  styleUrl: './gantt-view.css'
})
export class GanttView implements OnInit {
  projects: Project[] = [];
  ganttRows: GanttRow[] = [];
  filteredRows: GanttRow[] = [];
  loading = false;

  // Filtri periodo
  dataInizio: Date | null = null;
  dataFine: Date | null = null;

  // Calcolo timeline
  minDate: Date = new Date();
  maxDate: Date = new Date();
  daysInRange: number = 0;
  dayWidth: number = 2; // pixel per giorno

  private projectService: ProjectService | any;

  constructor(
    private serviceProvider: ServiceProviderService,
    private cdr: ChangeDetectorRef
  ) {
    this.projectService = this.serviceProvider.provideProjectService();
    
    // Imposta periodo di default: ultimi 3 mesi e prossimi 3 mesi
    const today = new Date();
    this.dataInizio = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    this.dataFine = new Date(today.getFullYear(), today.getMonth() + 3, 0);
  }

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (projects: Project[]) => {
        this.projects = projects;
        this.buildGanttRows();
        this.updateTimeline();
        this.applyFilters();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Errore nel caricamento progetti:', error);
        this.loading = false;
      }
    });
  }

  buildGanttRows() {
    this.ganttRows = [];
    
    for (const project of this.projects) {
      if (project.livelli && project.livelli.length > 0) {
        for (const livello of project.livelli) {
          if (livello.dataInizioInstallazione || livello.dataFineInstallazione) {
            this.ganttRows.push({
              numeroProgetto: project.numeroProgetto,
              nomeLivello: livello.nome,
              teamTecnico: project.teamTecnico,
              dataInizio: livello.dataInizioInstallazione ? new Date(livello.dataInizioInstallazione) : undefined,
              dataFine: livello.dataFineInstallazione ? new Date(livello.dataFineInstallazione) : undefined,
              progetto: project,
              livello: livello
            });
          }
        }
      }
    }

    // Ordina per numero progetto e poi per nome livello
    this.ganttRows.sort((a, b) => {
      if (a.numeroProgetto !== b.numeroProgetto) {
        return a.numeroProgetto.localeCompare(b.numeroProgetto);
      }
      return (a.nomeLivello || '').localeCompare(b.nomeLivello || '');
    });
  }

  updateTimeline() {
    // Calcola il range minimo e massimo dalle date dei progetti
    let minDate = this.dataInizio ? new Date(this.dataInizio) : new Date();
    let maxDate = this.dataFine ? new Date(this.dataFine) : new Date();

    // Se ci sono date nei progetti, espandi il range
    for (const row of this.ganttRows) {
      if (row.dataInizio) {
        const date = new Date(row.dataInizio);
        if (date < minDate) minDate = date;
        if (date > maxDate) maxDate = date;
      }
      if (row.dataFine) {
        const date = new Date(row.dataFine);
        if (date < minDate) minDate = date;
        if (date > maxDate) maxDate = date;
      }
    }

    // Assicurati che il range includa almeno il periodo selezionato
    if (this.dataInizio && this.dataInizio < minDate) {
      minDate = new Date(this.dataInizio);
    }
    if (this.dataFine && this.dataFine > maxDate) {
      maxDate = new Date(this.dataFine);
    }

    // Aggiungi un po' di padding
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    this.minDate = minDate;
    this.maxDate = maxDate;
    
    // Calcola giorni nel range
    const diffTime = maxDate.getTime() - minDate.getTime();
    this.daysInRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  applyFilters() {
    if (!this.dataInizio || !this.dataFine) {
      this.filteredRows = [...this.ganttRows];
      return;
    }

    this.filteredRows = this.ganttRows.filter(row => {
      // Mostra il livello se:
      // 1. Ha una data inizio/fine nel range
      // 2. Il periodo del livello si sovrappone al range selezionato
      if (row.dataInizio && row.dataFine) {
        const rowStart = new Date(row.dataInizio);
        const rowEnd = new Date(row.dataFine);
        const filterStart = new Date(this.dataInizio!);
        const filterEnd = new Date(this.dataFine!);
        
        // Sovrapposizione: rowStart <= filterEnd && rowEnd >= filterStart
        return rowStart <= filterEnd && rowEnd >= filterStart;
      }
      
      // Se ha solo data inizio, mostra se è nel range
      if (row.dataInizio) {
        const rowStart = new Date(row.dataInizio);
        return rowStart >= new Date(this.dataInizio!) && rowStart <= new Date(this.dataFine!);
      }
      
      // Se ha solo data fine, mostra se è nel range
      if (row.dataFine) {
        const rowEnd = new Date(row.dataFine);
        return rowEnd >= new Date(this.dataInizio!) && rowEnd <= new Date(this.dataFine!);
      }
      
      return false;
    });

    this.updateTimeline();
  }

  onPeriodChange() {
    this.applyFilters();
  }

  // Calcola la posizione left della barra in percentuale
  getBarLeft(row: GanttRow): number {
    const dateToUse = row.dataInizio || row.dataFine;
    if (!dateToUse) return 0;
    
    const startDate = new Date(dateToUse);
    const diffTime = startDate.getTime() - this.minDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, Math.min(100, (diffDays / this.daysInRange) * 100));
  }

  // Calcola la larghezza della barra in percentuale
  getBarWidth(row: GanttRow): number {
    if (!row.dataInizio || !row.dataFine) {
      // Se manca una data, usa una larghezza fissa piccola
      return 5; // Larghezza minima se manca una data
    }
    
    const startDate = new Date(row.dataInizio);
    const endDate = new Date(row.dataFine);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const widthPercent = (diffDays / this.daysInRange) * 100;
    return Math.max(2, Math.min(100, widthPercent)); // Minimo 2% per visibilità, massimo 100%
  }

  // Verifica se la barra è in ritardo (data fine passata)
  isOverdue(row: GanttRow): boolean {
    if (!row.dataFine) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(row.dataFine);
    endDate.setHours(0, 0, 0, 0);
    return endDate < today;
  }

  // Formatta data per display
  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // Genera etichette per la timeline
  getTimelineDays(): Date[] {
    const days: Date[] = [];
    const current = new Date(this.minDate);
    
    while (current <= this.maxDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }

  // Ottiene le etichette principali per la timeline (ogni settimana)
  getTimelineLabels(): { date: Date; label: string }[] {
    const labels: { date: Date; label: string }[] = [];
    const current = new Date(this.minDate);
    
    // Primo giorno
    labels.push({
      date: new Date(current),
      label: current.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
    });
    
    // Ogni settimana
    while (current <= this.maxDate) {
      current.setDate(current.getDate() + 7);
      if (current <= this.maxDate) {
        labels.push({
          date: new Date(current),
          label: current.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
        });
      }
    }
    
    return labels;
  }

  // Reset filtri
  resetFilters() {
    const today = new Date();
    this.dataInizio = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    this.dataFine = new Date(today.getFullYear(), today.getMonth() + 3, 0);
    this.applyFilters();
  }
}


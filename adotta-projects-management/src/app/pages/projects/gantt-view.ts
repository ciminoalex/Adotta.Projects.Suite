import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ProjectService } from '../../services/project.service';
import { ServiceProviderService } from '../../services/service-provider.service';
import { Project, LivelloProgetto } from '../../models/project.model';

interface GanttRow {
  numeroProgetto: string;
  nomeProgetto?: string;
  nomeLivello: string;
  teamTecnico?: string;
  teamInstallazione?: string;
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
    RouterModule,
    CardModule,
    ButtonModule,
    DatePickerModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
    TranslatePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './gantt-view.html',
  styleUrl: './gantt-view.css'
})
export class GanttView implements OnInit, AfterViewInit {
  @ViewChild('timelineScroll') timelineScroll?: ElementRef;
  @ViewChild('rowsScroll') rowsScroll?: ElementRef;

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
  dayWidth: number = 25; // pixel minimi per giorno (larghezza colonna)
  
  // Mappa dei colori per team
  private teamColors: Map<string, string> = new Map();

  private projectService: ProjectService | any;

  constructor(
    private serviceProvider: ServiceProviderService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.projectService = this.serviceProvider.provideProjectService();
    
    // Carica le date salvate dal localStorage o usa i valori di default
    this.loadSavedDates();
  }

  ngAfterViewInit() {
    // Nessuna inizializzazione aggiuntiva necessaria
    // Lo scroll è gestito tramite event handlers nel template
  }

  ngOnInit() {
    this.loadProjects();
  }

  // Carica le date salvate dal localStorage
  private loadSavedDates(): void {
    try {
      const savedDataInizio = localStorage.getItem('gantt-view-data-inizio');
      const savedDataFine = localStorage.getItem('gantt-view-data-fine');
      
      if (savedDataInizio) {
        const dateInizio = new Date(savedDataInizio);
        if (!isNaN(dateInizio.getTime())) {
          this.dataInizio = dateInizio;
        }
      }
      
      if (savedDataFine) {
        const dateFine = new Date(savedDataFine);
        if (!isNaN(dateFine.getTime())) {
          this.dataFine = dateFine;
        }
      }
      
      // Se non ci sono date salvate, usa i valori di default
      if (!this.dataInizio || !this.dataFine) {
        const today = new Date();
        this.dataInizio = this.dataInizio || new Date(today.getFullYear(), today.getMonth() - 3, 1);
        this.dataFine = this.dataFine || new Date(today.getFullYear(), today.getMonth() + 3, 0);
      }
    } catch (error) {
      console.warn('Errore nel caricamento delle date salvate:', error);
      // In caso di errore, usa i valori di default
      const today = new Date();
      this.dataInizio = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      this.dataFine = new Date(today.getFullYear(), today.getMonth() + 3, 0);
    }
  }

  // Salva le date nel localStorage
  private saveDates(): void {
    try {
      if (this.dataInizio) {
        localStorage.setItem('gantt-view-data-inizio', this.dataInizio.toISOString());
      } else {
        localStorage.removeItem('gantt-view-data-inizio');
      }
      
      if (this.dataFine) {
        localStorage.setItem('gantt-view-data-fine', this.dataFine.toISOString());
      } else {
        localStorage.removeItem('gantt-view-data-fine');
      }
    } catch (error) {
      console.warn('Errore nel salvataggio delle date:', error);
    }
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
    const teamsSet = new Set<string>();
    
    // Raccogli tutti i team unici (team installazione)
    for (const project of this.projects) {
      if (project.teamInstallazione) {
        teamsSet.add(project.teamInstallazione);
      }
      // Gestisci anche progetti senza livelli ma con date progetto
      if (!project.livelli || project.livelli.length === 0) {
        if (project.dataInizioInstallazione || project.dataFineInstallazione) {
          if (project.teamInstallazione) {
            teamsSet.add(project.teamInstallazione);
          }
        }
      }
    }
    
    // Assegna colori ai team
    teamsSet.forEach(team => {
      if (!this.teamColors.has(team)) {
        this.teamColors.set(team, this.generateTeamColor(team));
      }
    });
    
    for (const project of this.projects) {
      if (project.livelli && project.livelli.length > 0) {
        // Progetto con livelli: crea una riga per ogni livello
        for (const livello of project.livelli) {
          if (livello.dataInizioInstallazione || livello.dataFineInstallazione) {
            this.ganttRows.push({
              numeroProgetto: project.numeroProgetto,
              nomeProgetto: project.nomeProgetto,
              nomeLivello: livello.nome,
              teamTecnico: project.teamTecnico,
              teamInstallazione: project.teamInstallazione,
              dataInizio: livello.dataInizioInstallazione ? new Date(livello.dataInizioInstallazione) : undefined,
              dataFine: livello.dataFineInstallazione ? new Date(livello.dataFineInstallazione) : undefined,
              progetto: project,
              livello: livello
            });
          }
        }
      } else {
        // Progetto senza livelli: usa le date del progetto stesso
        if (project.dataInizioInstallazione || project.dataFineInstallazione) {
          this.ganttRows.push({
            numeroProgetto: project.numeroProgetto,
            nomeProgetto: project.nomeProgetto,
            nomeLivello: 'Progetto completo',
            teamTecnico: project.teamTecnico,
            teamInstallazione: project.teamInstallazione,
            dataInizio: project.dataInizioInstallazione ? new Date(project.dataInizioInstallazione) : undefined,
            dataFine: project.dataFineInstallazione ? new Date(project.dataFineInstallazione) : undefined,
            progetto: project
          });
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

  // Genera un colore random ma determinato per un team (basato su hash del nome)
  private generateTeamColor(teamName: string): string {
    // Usa un hash del nome del team per generare un colore determinato
    let hash = 0;
    for (let i = 0; i < teamName.length; i++) {
      hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Genera colori pastello vivaci evitando marroni/ocra (hue 20-50)
    // Usa hue distribuiti evitando la zona marrone/ocra
    let hue = Math.abs(hash) % 360;
    
    // Evita la zona marrone/ocra (circa 20-50 gradi) e riposiziona questi valori
    if (hue >= 20 && hue <= 50) {
      // Rimappa questa zona su altre tonalità vivaci
      hue = ((hue - 20) % 30) + 150; // Sposta su blu/verde/ciano
    }
    
    // Colori pastello vivaci: saturazione alta (75-95%) e luminosità media-alta (65-75%)
    const saturation = 75 + (Math.abs(hash) % 20); // 75-95%
    const lightness = 65 + (Math.abs(hash) % 10); // 65-75% (pastello ma vivace)
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  // Ottiene il colore per un team (ora usa team installazione)
  getTeamColor(team: string | undefined): string {
    if (!team) {
      return 'var(--p-primary-color)'; // Colore di default se non c'è team
    }
    
    // Se il colore non esiste ancora, generalo
    if (!this.teamColors.has(team)) {
      this.teamColors.set(team, this.generateTeamColor(team));
    }
    
    return this.teamColors.get(team) || 'var(--p-primary-color)';
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
    this.validateDateRange();
    this.saveDates();
    this.applyFilters();
  }

  // Valida l'intervallo delle date (massimo 6 mesi)
  validateDateRange() {
    if (!this.dataInizio || !this.dataFine) {
      return;
    }

    const startDate = new Date(this.dataInizio);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(this.dataFine);
    endDate.setHours(0, 0, 0, 0);
    
    // Calcola la differenza in mesi
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
    
    // Se l'intervallo è maggiore di 6 mesi, correggi
    if (monthsDiff > 6) {
      // Calcola la data massima (6 mesi dopo l'inizio)
      const maxEndDate = new Date(startDate);
      maxEndDate.setMonth(maxEndDate.getMonth() + 6);
      this.dataFine = maxEndDate;
      
      this.messageService.add({
        severity: 'warn',
        summary: 'Intervallo limitato',
        detail: 'L\'intervallo massimo consentito è di 6 mesi. La data fine è stata impostata a 6 mesi dopo la data di inizio.',
        life: 5000
      });
    }
  }


  // Handler per cambio data inizio
  onStartDateChange() {
    if (!this.dataInizio) {
      this.onPeriodChange();
      return;
    }

    // Se c'è una data fine e supera i 6 mesi, correggi automaticamente
    if (this.dataFine) {
      const startDate = new Date(this.dataInizio);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(this.dataFine);
      endDate.setHours(0, 0, 0, 0);
      
      // Calcola la differenza in mesi
      const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (endDate.getMonth() - startDate.getMonth());
      
      // Se l'intervallo è maggiore di 6 mesi, imposta la data fine a 6 mesi dopo l'inizio
      if (monthsDiff > 6) {
        const maxEndDate = new Date(startDate);
        maxEndDate.setMonth(maxEndDate.getMonth() + 6);
        this.dataFine = maxEndDate;
        
        this.messageService.add({
          severity: 'warn',
          summary: 'Intervallo limitato',
          detail: 'La data fine è stata impostata automaticamente a 6 mesi dopo la data di inizio.',
          life: 5000
        });
      }
    }
    
    this.saveDates();
    this.onPeriodChange();
  }

  // Handler per cambio data fine
  onEndDateChange() {
    if (!this.dataFine) {
      this.onPeriodChange();
      return;
    }

    // Se c'è una data inizio e precede più di 6 mesi, correggi automaticamente
    if (this.dataInizio) {
      const startDate = new Date(this.dataInizio);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(this.dataFine);
      endDate.setHours(0, 0, 0, 0);
      
      // Calcola la differenza in mesi
      const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (endDate.getMonth() - startDate.getMonth());
      
      // Se l'intervallo è maggiore di 6 mesi, imposta la data inizio a 6 mesi prima della fine
      if (monthsDiff > 6) {
        const minStartDate = new Date(endDate);
        minStartDate.setMonth(minStartDate.getMonth() - 6);
        this.dataInizio = minStartDate;
        
        this.messageService.add({
          severity: 'warn',
          summary: 'Intervallo limitato',
          detail: 'La data inizio è stata impostata automaticamente a 6 mesi prima della data di fine.',
          life: 5000
        });
      }
    }
    
    this.saveDates();
    this.onPeriodChange();
  }

  // Calcola la posizione left della barra in pixel
  getBarLeft(row: GanttRow): number {
    const dateToUse = row.dataInizio || row.dataFine;
    if (!dateToUse) return 0;
    
    const startDate = new Date(dateToUse);
    const diffTime = startDate.getTime() - this.minDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays * this.dayWidth);
  }

  // Calcola la larghezza della barra in pixel
  getBarWidth(row: GanttRow): number {
    if (!row.dataInizio || !row.dataFine) {
      // Se manca una data, usa una larghezza fissa piccola
      return this.dayWidth; // Larghezza minima se manca una data
    }
    
    const startDate = new Date(row.dataInizio);
    const endDate = new Date(row.dataFine);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return Math.max(this.dayWidth, diffDays * this.dayWidth); // Minimo dayWidth pixel
  }

  // Calcola la larghezza totale della timeline in pixel
  getTimelineWidth(): number {
    return this.daysInRange * this.dayWidth;
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

  // Genera etichette per la timeline - tutti i giorni
  getTimelineDays(): Date[] {
    const days: Date[] = [];
    const current = new Date(this.minDate);
    
    while (current <= this.maxDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }

  // Ottiene l'etichetta del giorno della settimana (M, T, W, T, F, S, S)
  getWeekdayLabel(date: Date): string {
    const dayOfWeek = date.getDay();
    const labels = ['D', 'L', 'M', 'M', 'G', 'V', 'S']; // Domenica, Lunedì, Martedì, Mercoledì, Giovedì, Venerdì, Sabato
    return labels[dayOfWeek];
  }

  // Ottiene le etichette principali per la timeline (ogni settimana o ogni giorno se range piccolo)
  getTimelineLabels(): { date: Date; label: string; isWeekend: boolean }[] {
    const labels: { date: Date; label: string; isWeekend: boolean }[] = [];
    const current = new Date(this.minDate);
    const daysCount = this.daysInRange;
    
    // Se ci sono meno di 60 giorni, mostra ogni giorno
    // Altrimenti mostra ogni settimana
    const interval = daysCount <= 60 ? 1 : 7;
    
    while (current <= this.maxDate) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      labels.push({
        date: new Date(current),
        label: current.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
        isWeekend: isWeekend
      });
      
      current.setDate(current.getDate() + interval);
    }
    
    return labels;
  }

  // Ottiene la posizione left per una data nella timeline (in pixel)
  getDateLeft(date: Date): number {
    const diffTime = date.getTime() - this.minDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * this.dayWidth;
  }

  // Reset filtri
  resetFilters() {
    const today = new Date();
    this.dataInizio = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    this.dataFine = new Date(today.getFullYear(), today.getMonth() + 3, 0);
    this.saveDates();
    this.applyFilters();
  }

  // Sincronizza scroll orizzontale
  onTimelineScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (this.rowsScroll) {
      this.rowsScroll.nativeElement.scrollLeft = target.scrollLeft;
    }
  }

  onRowsScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (this.timelineScroll) {
      this.timelineScroll.nativeElement.scrollLeft = target.scrollLeft;
    }
  }

  // Gestisce il click sulla barra GANTT
  onBarClick(row: GanttRow, event: Event) {
    event.stopPropagation();
    
    if (!row.numeroProgetto) {
      return;
    }

    this.confirmationService.confirm({
      message: `Vuoi accedere all'anagrafica del progetto ${row.numeroProgetto}?`,
      header: 'Navigazione Progetto',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sì',
      rejectLabel: 'No',
      accept: () => {
        this.router.navigate(['/projects', row.numeroProgetto]);
      }
    });
  }
}


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
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { ProjectService } from '../../services/project.service';
import { ServiceProviderService } from '../../services/service-provider.service';
import { LookupService } from '../../services/lookup.service';
import { Project, LivelloProgetto, ProjectStatus } from '../../models/project.model';
import { SquadraInstallazione, TeamTecnico } from '../../models/lookup.model';

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

interface GanttTask {
  id: string;
  name: string;
  assignee: string;
  assigneeCode: string; // Codice originale del team
  assigneeName: string | null; // Nome del team (null durante il caricamento)
  assigneeLoading: boolean; // Indica se il nome è in caricamento
  start: Date | null;
  end: Date | null;
  duration: number; // Giorni
  color: string;
  row: GanttRow;
}

interface GanttProject {
  id: string;
  code: string;
  name: string;
  status: ProjectStatus | string;
  statusColor: string;
  tasks: GanttTask[];
}

interface MonthData {
  name: string; // Es: "Dicembre 2025"
  year: number;
  daysCount: number;
  width: number; // pixels
}

interface DayData {
  dayNum: number;
  date: Date;
  isWeekend: boolean;
  dayLetter: string;
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
    SkeletonModule,
    TranslatePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './gantt-view.html',
  styleUrl: './gantt-view.css'
})
export class GanttView implements OnInit, AfterViewInit {
  @ViewChild('timelineScroll') timelineScroll?: ElementRef;
  @ViewChild('rowsScroll') rowsScroll?: ElementRef;

  // Espone l'enum per uso nel template
  ProjectStatus = ProjectStatus;

  projects: Project[] = [];
  ganttRows: GanttRow[] = [];
  filteredRows: GanttRow[] = [];
  ganttProjects: GanttProject[] = [];
  loading = false;

  // Filtri periodo
  dataInizio: Date | null = null;
  dataFine: Date | null = null;

  // Calcolo timeline
  minDate: Date = new Date();
  maxDate: Date = new Date();
  daysInRange: number = 0;
  dayWidth: number = 36; // pixel per giorno (larghezza colonna) - aumentato per migliore visualizzazione
  colWidth: number = 36; // alias per dayWidth
  
  // Dati timeline
  months: MonthData[] = [];
  allDays: DayData[] = [];
  
  // Mappa dei colori per team
  private teamColors: Map<string, string> = new Map();
  
  // Dati lookup per team
  squadreInstallazione: SquadraInstallazione[] = [];
  teamTecnici: TeamTecnico[] = [];
  teamNamesMap: Map<string, string> = new Map(); // Mappa codice -> nome

  private projectService: ProjectService | any;

  constructor(
    private serviceProvider: ServiceProviderService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private translationService: TranslationService,
    private lookupService: LookupService
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
    // Carica prima i dati lookup (team), poi i progetti
    this.loadLookupData();
    this.loadProjects();
    
    // Sottoscrivi ai cambiamenti di lingua per aggiornare i giorni della settimana e i mesi
    this.translationService.language$.subscribe(() => {
      // Rigenera la timeline quando cambia la lingua per aggiornare traduzioni
      if (this.allDays.length > 0 || this.months.length > 0) {
        this.generateTimeline();
      }
      this.cdr.markForCheck();
    });
  }

  loadLookupData() {
    // Carica squadre installazione
    this.lookupService.getSquadreInstallazione().subscribe({
      next: (squadre: SquadraInstallazione[]) => {
        this.squadreInstallazione = squadre;
        // Popola la mappa codice -> nome
        squadre.forEach(squadra => {
          if (squadra.id) {
            this.teamNamesMap.set(squadra.id, squadra.nome);
          }
        });
        // Aggiorna i nomi dei task esistenti
        this.updateTaskTeamNames();
      },
      error: (error: any) => {
        console.error('Errore nel caricamento squadre installazione:', error);
      }
    });

    // Carica team tecnici
    this.lookupService.getTeamTecnici().subscribe({
      next: (teams: TeamTecnico[]) => {
        this.teamTecnici = teams;
        // Popola la mappa codice -> nome
        teams.forEach(team => {
          if (team.id) {
            this.teamNamesMap.set(team.id, team.nome);
          }
        });
        // Aggiorna i nomi dei task esistenti
        this.updateTaskTeamNames();
      },
      error: (error: any) => {
        console.error('Errore nel caricamento team tecnici:', error);
      }
    });
  }

  // Aggiorna i nomi dei team nei task dopo il caricamento
  updateTaskTeamNames() {
    let hasChanges = false;
    
    for (const project of this.ganttProjects) {
      for (const task of project.tasks) {
        // Se il task ha un codice assignee valido
        if (task.assigneeCode && task.assigneeCode !== 'N/A') {
          // Cerca il nome nella mappa
          const teamName = this.teamNamesMap.get(task.assigneeCode);
          
          if (teamName) {
            // Se troviamo il nome nella mappa, aggiorniamo sempre se:
            // 1. assigneeName è null (non ancora impostato)
            // 2. assigneeName è diverso dal nome trovato (potrebbe essere il codice)
            // 3. assigneeLoading è true (in attesa del caricamento)
            if (task.assigneeName === null || 
                task.assigneeName !== teamName || 
                task.assigneeLoading) {
              task.assigneeName = teamName;
              task.assignee = teamName;
              task.assigneeLoading = false;
              hasChanges = true;
            }
          } else {
            // Se non troviamo il nome nella mappa
            // Controlla se i dati lookup sono stati caricati
            const lookupLoaded = this.squadreInstallazione.length > 0 || this.teamTecnici.length > 0;
            
            if (lookupLoaded) {
              // I dati sono stati caricati ma il team non è stato trovato
              // Usa il codice come fallback
              if (task.assigneeName !== task.assigneeCode) {
                task.assigneeName = task.assigneeCode;
                task.assignee = task.assigneeCode;
                task.assigneeLoading = false;
                hasChanges = true;
              } else if (task.assigneeLoading) {
                task.assigneeLoading = false;
                hasChanges = true;
              }
            } else {
              // I dati lookup non sono ancora stati caricati, mantieni il loading
              if (!task.assigneeLoading) {
                task.assigneeLoading = true;
                hasChanges = true;
              }
            }
          }
        } else {
          // Se non c'è codice assignee valido
          if (task.assigneeLoading || task.assigneeName !== 'N/A') {
            task.assigneeName = 'N/A';
            task.assignee = 'N/A';
            task.assigneeLoading = false;
            hasChanges = true;
          }
        }
      }
    }
    
    if (hasChanges) {
      this.cdr.markForCheck();
    }
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
            nomeLivello: this.translationService.translate('projects.fullProject'),
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

    // Costruisci la struttura raggruppata per progetti
    this.buildGanttProjects();
  }

  buildGanttProjects() {
    const projectsMap = new Map<string, GanttProject>();
    
    for (const row of this.filteredRows) {
      const projectKey = row.numeroProgetto;
      
      if (!projectsMap.has(projectKey)) {
        // Determina lo stato del progetto dal progetto stesso
        const projectStatus = this.getProjectStatus(row.progetto);
        const statusColor = this.getStatusColor(projectStatus, row.teamInstallazione);
        
        projectsMap.set(projectKey, {
          id: projectKey,
          code: row.numeroProgetto,
          name: row.nomeProgetto || row.numeroProgetto,
          status: projectStatus,
          statusColor: statusColor,
          tasks: []
        });
      }
      
      const project = projectsMap.get(projectKey)!;
      const assigneeCode = row.teamInstallazione || row.teamTecnico || 'N/A';
      
      // Cerca il nome del team nella mappa
      let assigneeName: string | null = null;
      let assigneeLoading = false;
      
      if (assigneeCode && assigneeCode !== 'N/A') {
        assigneeName = this.teamNamesMap.get(assigneeCode) || null;
        // Se non è nella mappa e i dati lookup non sono ancora caricati, mostra loading
        if (!assigneeName && (this.squadreInstallazione.length === 0 && this.teamTecnici.length === 0)) {
          assigneeLoading = true;
        } else if (!assigneeName) {
          // Se i dati sono caricati ma non si trova, usa il codice
          assigneeName = assigneeCode;
        }
      } else {
        assigneeName = 'N/A';
      }
      
      // Calcola la durata
      let duration = 0;
      if (row.dataInizio && row.dataFine) {
        const diffTime = new Date(row.dataFine).getTime() - new Date(row.dataInizio).getTime();
        duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      } else if (row.dataInizio) {
        duration = 1; // Durata minima se manca la data fine
      } else if (row.dataFine) {
        duration = 1;
      }
      
      // Determina il colore basato sullo stato del progetto (tutti i task ereditano lo stesso colore)
      const color = project.statusColor;
      
      project.tasks.push({
        id: `${row.numeroProgetto}-${row.nomeLivello}`,
        name: row.nomeLivello,
        assignee: assigneeName || assigneeCode, // Usa il nome se disponibile, altrimenti il codice
        assigneeCode: assigneeCode,
        assigneeName: assigneeName,
        assigneeLoading: assigneeLoading,
        start: row.dataInizio ? new Date(row.dataInizio) : null,
        end: row.dataFine ? new Date(row.dataFine) : null,
        duration: duration,
        color: color,
        row: row
      });
    }
    
    this.ganttProjects = Array.from(projectsMap.values());
  }

  // Restituisce direttamente lo statoProgetto del progetto (enum ProjectStatus)
  getProjectStatus(project: Project | undefined): ProjectStatus | string {
    if (!project || !project.statoProgetto) {
      return ProjectStatus.UPCOMING; // Default se non c'è stato
    }
    
    // Restituisce direttamente lo stato del progetto
    return project.statoProgetto;
  }

  getInitials(name: string): string {
    if (!name || name === 'N/A') return 'N/A';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  determineTaskStatus(row: GanttRow): 'completed' | 'progress' | 'delayed' | 'planned' {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!row.dataInizio && !row.dataFine) {
      return 'planned';
    }
    
    // Se ha data fine e è passata
    if (row.dataFine) {
      const endDate = new Date(row.dataFine);
      endDate.setHours(0, 0, 0, 0);
      
      if (endDate < today) {
        // Se ha anche data inizio e è passata, è completato
        if (row.dataInizio) {
          const startDate = new Date(row.dataInizio);
          startDate.setHours(0, 0, 0, 0);
          if (startDate <= today) {
            return 'completed';
          }
        }
        // Altrimenti è in ritardo
        return 'delayed';
      }
    }
    
    // Se ha data inizio e siamo nel periodo
    if (row.dataInizio) {
      const startDate = new Date(row.dataInizio);
      startDate.setHours(0, 0, 0, 0);
      
      if (startDate <= today) {
        // Se ha data fine futura, è in progress
        if (row.dataFine) {
          const endDate = new Date(row.dataFine);
          endDate.setHours(0, 0, 0, 0);
          if (endDate >= today) {
            return 'progress';
          }
        } else {
          return 'progress';
        }
      }
    }
    
    return 'planned';
  }

  getStatusColor(status: ProjectStatus | string, team?: string): string {
    const statusStr = status.toString().toUpperCase();
    
    // Usa la stessa mappatura colori di getStatusColorClass per coerenza
    // Ignora i colori del team, usa solo i colori degli stati
    const colors: Record<string, string> = {
      'ON_GOING': 'bg-blue-600',
      'CRITICAL': 'bg-rose-600',
      'RUSH': 'bg-red-700',
      'HOLD_ON': 'bg-amber-500',
      'ON_HOLD': 'bg-amber-600',
      'TO_CHECK': 'bg-violet-600',
      'UPCOMING': 'bg-slate-500',
      'PUSHED_OUT': 'bg-zinc-400',
      'TO_BE_ASSIGNED': 'bg-slate-400',
      'COMPLETED': 'bg-emerald-600'
    };
    
    return colors[statusStr] || 'bg-slate-500';
  }

  // Ottiene il colore del team come stringa CSS (per uso inline)
  getTeamColorString(team: string | undefined): string {
    if (!team) {
      return '#3b82f6'; // blue-500 default
    }
    return this.getTeamColor(team);
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
    // Usa direttamente le date selezionate dall'utente come inizio e fine della timeline
    if (!this.dataInizio || !this.dataFine) {
      // Se non ci sono date selezionate, usa le date dei progetti
      let minDate = new Date();
      let maxDate = new Date();

      for (const row of this.ganttRows) {
        if (row.dataInizio) {
          const date = new Date(row.dataInizio);
          if (date < minDate) minDate = date;
        }
        if (row.dataFine) {
          const date = new Date(row.dataFine);
          if (date > maxDate) maxDate = date;
        }
      }

      this.minDate = minDate;
      this.maxDate = maxDate;
    } else {
      // Usa esattamente le date selezionate, senza padding
      this.minDate = new Date(this.dataInizio);
      this.minDate.setHours(0, 0, 0, 0);
      
      this.maxDate = new Date(this.dataFine);
      this.maxDate.setHours(23, 59, 59, 999);
    }
    
    // Calcola giorni nel range
    const diffTime = this.maxDate.getTime() - this.minDate.getTime();
    this.daysInRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 per includere anche l'ultimo giorno
    
    // Genera i dati per mesi e giorni
    this.generateTimeline();
  }

  generateTimeline() {
    const monthsData: MonthData[] = [];
    const daysData: DayData[] = [];
    
    // Inizia dal primo giorno del mese che contiene minDate
    const startDate = new Date(this.minDate);
    startDate.setDate(1); // Primo giorno del mese
    startDate.setHours(0, 0, 0, 0);
    
    // Termina all'ultimo giorno del mese che contiene maxDate
    const endDate = new Date(this.maxDate);
    endDate.setDate(new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate()); // Ultimo giorno del mese
    endDate.setHours(23, 59, 59, 999);
    
    let current = new Date(startDate);
    const monthsMap = new Map<string, { days: DayData[], width: number }>();

    // Genera tutti i giorni dal minDate al maxDate
    while (current <= endDate) {
      const year = current.getFullYear();
      const monthIndex = current.getMonth();
      const dayNum = current.getDate();
      
      // Controlla se il giorno è nel range
      const dateObj = new Date(year, monthIndex, dayNum);
      dateObj.setHours(0, 0, 0, 0);
      const minDateNormalized = new Date(this.minDate);
      minDateNormalized.setHours(0, 0, 0, 0);
      const maxDateNormalized = new Date(this.maxDate);
      maxDateNormalized.setHours(0, 0, 0, 0);
      
      if (dateObj >= minDateNormalized && dateObj <= maxDateNormalized) {
        const dayOfWeek = dateObj.getDay();
        // Usa il servizio di traduzione per ottenere la lettera del giorno
        const dayLetter = this.getWeekdayLabel(dateObj);
        
        const dayData: DayData = {
          dayNum: dayNum,
          date: new Date(dateObj),
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
          dayLetter: dayLetter
        };
        
        daysData.push(dayData);
        
        // Raggruppa per mese per calcolare la larghezza
        const monthKey = `${year}-${monthIndex}`;
        if (!monthsMap.has(monthKey)) {
          monthsMap.set(monthKey, { days: [], width: 0 });
        }
        monthsMap.get(monthKey)!.days.push(dayData);
      }
      
      // Passa al giorno successivo
      current.setDate(current.getDate() + 1);
    }

    // Genera i dati dei mesi basandosi sui giorni effettivamente inclusi
    monthsMap.forEach((value, monthKey) => {
      const [year, monthIndex] = monthKey.split('-').map(Number);
      // Usa il servizio di traduzione per ottenere il nome del mese
      const monthDate = new Date(year, monthIndex, 1);
      const monthNameTranslated = this.getMonthLabel(monthDate);
      // Aggiungi l'anno al nome del mese tradotto
      const monthName = `${monthNameTranslated} ${year}`;
      
      // Conta solo i giorni inclusi nel range per questo mese
      const daysInRange = value.days.length;
      
      monthsData.push({
        name: monthName,
        year,
        daysCount: daysInRange,
        width: daysInRange * this.colWidth
      });
    });

    this.months = monthsData;
    this.allDays = daysData;
  }

  applyFilters() {
    if (!this.dataInizio || !this.dataFine) {
      this.filteredRows = [...this.ganttRows];
    } else {
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
    }

    this.updateTimeline();
    this.buildGanttProjects();
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
        summary: this.translationService.translate('projects.rangeLimited'),
        detail: this.translationService.translate('projects.maxRange6Months'),
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
          summary: this.translationService.translate('projects.rangeLimited'),
          detail: this.translationService.translate('projects.endDateAutoSet'),
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
          summary: this.translationService.translate('projects.rangeLimited'),
          detail: this.translationService.translate('projects.startDateAutoSet'),
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

  // Helper per posizionare i task nella timeline
  getTaskLeft(startDate: Date | null): number {
    if (!startDate) return 0;
    const diffTime = startDate.getTime() - this.minDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays * this.colWidth);
  }

  getTaskWidth(duration: number): number {
    return duration * this.colWidth;
  }

  formatDateForDisplay(date: Date | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getDateRangeLabel(): string {
    if (!this.dataInizio || !this.dataFine) {
      return '';
    }
    const start = this.dataInizio.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    const end = this.dataFine.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    return `${start} - ${end}`;
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

  // Ottiene l'etichetta del giorno della settimana (tradotto)
  getWeekdayLabel(date: Date): string {
    const dayOfWeek = date.getDay();
    const dayKeys = [
      'projects.weekdaySunday',
      'projects.weekdayMonday',
      'projects.weekdayTuesday',
      'projects.weekdayWednesday',
      'projects.weekdayThursday',
      'projects.weekdayFriday',
      'projects.weekdaySaturday'
    ];
    return this.translationService.translate(dayKeys[dayOfWeek]);
  }

  // Ottiene l'etichetta del mese abbreviato (tradotto)
  getMonthLabel(date: Date): string {
    const month = date.getMonth(); // 0-11
    const monthKeys = [
      'projects.monthJanuary',
      'projects.monthFebruary',
      'projects.monthMarch',
      'projects.monthApril',
      'projects.monthMay',
      'projects.monthJune',
      'projects.monthJuly',
      'projects.monthAugust',
      'projects.monthSeptember',
      'projects.monthOctober',
      'projects.monthNovember',
      'projects.monthDecember'
    ];
    return this.translationService.translate(monthKeys[month]);
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

    const header = this.translationService.translate('projects.navigationDialogTitle');
    const message = this.translationService.translate('projects.navigationDialogMessage', { projectNumber: row.numeroProgetto });
    const acceptLabel = this.translationService.translate('common.yes') || 'Yes';
    const rejectLabel = this.translationService.translate('common.no') || 'No';

    this.confirmationService.confirm({
      message,
      header,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel,
      rejectLabel,
      accept: () => {
        this.router.navigate(['/projects', row.numeroProgetto]);
      }
    });
  }

  // Track by functions per performance
  trackByProject(index: number, project: GanttProject): string {
    return project.id;
  }

  trackByTask(index: number, task: GanttTask): string {
    return task.id;
  }

  trackByMonth(index: number, month: MonthData): string {
    return `${month.year}-${month.name}`;
  }

  trackByDay(index: number, day: DayData): number {
    return day.date.getTime();
  }

  // Helper per etichette stato - restituisce direttamente il valore come stringa
  getStatusLabel(status: ProjectStatus | string): string {
    return status.toString();
  }

  // Ottiene la classe colore per lo stato (per testo o background)
  // Restituisce una classe CSS compatibile con PrimeFlex/Tailwind
  getStatusColorClass(status: ProjectStatus | string, type: 'text' | 'bg' = 'text'): string {
    const statusStr = status.toString().toUpperCase();
    const colors: Record<string, string> = {
      'ON_GOING': 'blue-600',
      'CRITICAL': 'rose-600',
      'RUSH': 'red-700',
      'HOLD_ON': 'amber-500',
      'ON_HOLD': 'amber-600',
      'TO_CHECK': 'violet-600',
      'UPCOMING': 'slate-500',
      'PUSHED_OUT': 'zinc-400',
      'TO_BE_ASSIGNED': 'slate-400',
      'COMPLETED': 'emerald-600'
    };
    
    const color = colors[statusStr] || 'slate-500';
    // Restituisce classi Tailwind-style che dovrebbero funzionare se Tailwind è configurato
    // Altrimenti, questi colori possono essere gestiti via CSS custom
    if (type === 'text') {
      return `text-${color}`;
    } else {
      return `bg-${color}`;
    }
  }

  // Tooltip per le barre
  getTaskTooltip(task: GanttTask): string {
    const start = task.start ? this.formatDateForDisplay(task.start) : '-';
    const end = task.end ? this.formatDateForDisplay(task.end) : '-';
    return `${task.name}\nInizio: ${start}\nDurata: ${task.duration} giorni`;
  }

  // Navigazione timeline
  navigateTimeline(direction: number) {
    // Implementazione base - può essere estesa
    if (direction < 0) {
      // Naviga indietro
    } else {
      // Naviga avanti
    }
  }
}


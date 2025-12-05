import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { TimesheetService } from '../../services/timesheet.service';
import { LookupService } from '../../services/lookup.service';
import { ServiceProviderService } from '../../services/service-provider.service';
import { ServiceConfigurationService } from '../../services/service-configuration.service';
import { MockTimesheetService } from '../../services/mock/mock-timesheet.service';
import { Project, LivelloProgetto, ProdottoProgetto, StoricoModifica, ProjectStatus, MessaggioProgetto } from '../../models/project.model';
import { TimesheetOverview } from '../../models/timesheet.model';
import { TeamTecnico, TeamAPL, Sales, ProjectManager, SquadraInstallazione } from '../../models/lookup.model';

export interface ChatMessage {
  id: string;
  backendId?: number;
  utente: string;
  messaggio: string;
  dataOra: Date;
  avatar?: string;
}

export interface ModificaRaggruppata {
  id: string;
  dataModifica: Date;
  utenteModifica: string;
  modifiche: StoricoModifica[];
  expanded: boolean;
}

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    TableModule,
    TextareaModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    SkeletonModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css'
})
export class ProjectDetail implements OnInit {
  project?: Project;
  livelli: LivelloProgetto[] = []; // Ora ogni livello contiene i suoi prodotti
  prodotti: ProdottoProgetto[] = []; // Mantenuto per retrocompatibilità
  storicoModifiche: StoricoModifica[] = [];
  loading = false;
  
  // Timesheet properties
  timesheetOverview?: TimesheetOverview;
  totaleOreRendicontate: number = 0;
  numeroRendicontazioni: number = 0;
  
  // Chat properties
  chatMessages: ChatMessage[] = [];
  newMessage = '';
  currentUser = '';
  
  // Registro modifiche properties
  registroModifiche: StoricoModifica[] = [];
  modificheRaggruppate: ModificaRaggruppata[] = [];
  filtroModifiche: string = 'ultime10';
  opzioniFiltroModifiche = [
    { label: 'Ultime 10', value: 'ultime10' },
    { label: 'Ultime 50', value: 'ultime50' },
    { label: 'Tutte', value: 'tutte' }
  ];

  // Lookup data for displaying names
  teamTecnici: TeamTecnico[] = [];
  teamAPL: TeamAPL[] = [];
  sales: Sales[] = [];
  projectManagers: ProjectManager[] = [];
  squadreInstallazione: SquadraInstallazione[] = [];
  loadingLookupData = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private serviceProvider: ServiceProviderService,
    private serviceConfig: ServiceConfigurationService,
    private http: HttpClient
  ) {
    // Use services based on configuration (mock or real API)
    this.projectService = this.serviceProvider.provideProjectService();
    // TimesheetService: usa mock solo se configurato, altrimenti chiama le API reali
    this.timesheetService = this.serviceConfig.getUseMockServices()
      ? new MockTimesheetService()
      : new TimesheetService(this.http);
  }

  private projectService: ProjectService | any;
  private timesheetService: TimesheetService | MockTimesheetService;
  private lookupService: LookupService | any;

  ngOnInit() {
    // Use services based on configuration (mock or real API)
    this.lookupService = this.serviceProvider.provideLookupService();
    
    // Load lookup data for displaying names
    this.loadLookupData();
    
    // Get current user from auth service
    const user = this.authService.getCurrentUser();
    this.currentUser = user ? this.authService.getFullName() : 'Utente Anonimo';
    
    this.route.params.subscribe(params => {
      const numeroProgetto = params['id'];
      if (numeroProgetto) {
        this.loadProject(numeroProgetto);
      }
    });
  }

  loadLookupData() {
    this.loadingLookupData = true;
    let completedRequests = 0;
    const totalRequests = 5;

    // Helper function to extract array from either direct array or paginated response
    const extractArray = <T>(response: T[] | { items: T[] } | any): T[] => {
      if (Array.isArray(response)) {
        return response;
      }
      if (response && typeof response === 'object' && 'items' in response && Array.isArray(response.items)) {
        return response.items;
      }
      return [];
    };

    const checkAllLoaded = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.loadingLookupData = false;
      }
    };

    this.lookupService.getTeamTecnici().subscribe({
      next: (response: any) => {
        this.teamTecnici = extractArray<TeamTecnico>(response);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading team tecnici:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getTeamAPL().subscribe({
      next: (response: any) => {
        this.teamAPL = extractArray<TeamAPL>(response);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading team APL:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getSales().subscribe({
      next: (response: any) => {
        this.sales = extractArray<Sales>(response);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading sales:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getProjectManagers().subscribe({
      next: (response: any) => {
        this.projectManagers = extractArray<ProjectManager>(response);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading project managers:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getSquadreInstallazione().subscribe({
      next: (response: any) => {
        this.squadreInstallazione = extractArray<SquadraInstallazione>(response);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading squadre installazione:', error);
        checkAllLoaded();
      }
    });
  }

  // Helper functions to convert ID to name
  getTeamTecnicoName(id?: string): string {
    if (!id) return '-';
    // Handle backward compatibility: if id is actually a name, return it
    if (this.teamTecnici.length === 0) return id;
    const team = this.teamTecnici.find(t => t.id === id || t.nome === id);
    return team?.nome || id;
  }

  getTeamAPLName(id?: string): string {
    if (!id) return '-';
    if (this.teamAPL.length === 0) return id;
    const team = this.teamAPL.find(t => t.id === id || t.nome === id);
    return team?.nome || id;
  }

  getSalesName(id?: string): string {
    if (!id) return '-';
    if (this.sales.length === 0) return id;
    const salesItem = this.sales.find(s => s.id === id || s.nome === id);
    return salesItem?.nome || id;
  }

  getProjectManagerName(id?: string): string {
    if (!id) return '-';
    if (this.projectManagers.length === 0) return id;
    const pm = this.projectManagers.find(p => p.id === id || p.nome === id);
    return pm?.nome || id;
  }

  getTeamInstallazioneName(id?: string): string {
    if (!id) return '-';
    if (this.squadreInstallazione.length === 0) return id;
    const squadra = this.squadreInstallazione.find(s => s.id === id || s.nome === id);
    return squadra?.nome || id;
  }

  loadProject(numeroProgetto: string) {
    this.loading = true;
    
    this.projectService.getProject(numeroProgetto).subscribe({
      next: (project: Project) => {
        this.project = project;
        this.loadRelatedData(numeroProgetto);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Errore nel caricamento progetto:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Progetto non trovato',
          detail: `Il progetto ${numeroProgetto} non esiste. Verrai reindirizzato alla lista progetti.`
        });
        // Redirect to project list after a short delay
        setTimeout(() => {
          this.router.navigate(['/projects']);
        }, 2000);
      }
    });
  }

  loadRelatedData(numeroProgetto: string) {
    // Load livelli (ora includono già i prodotti)
    this.projectService.getLivelliProgetto(numeroProgetto).subscribe((livelli: LivelloProgetto[]) => {
      // Aggiungi proprietà expanded a ogni livello
      this.livelli = livelli.map(livello => ({
        ...livello,
        expanded: false
      }));
      // Calcola il totale dei prodotti per retrocompatibilità
      this.prodotti = livelli.flatMap(livello => livello.prodotti || []);
    });

    // Load timesheet overview - use getTimesheetByProject and calculate overview
    this.timesheetService.getTimesheetByProject(numeroProgetto).subscribe({
      next: (entries: any[]) => {
        // Calculate overview from entries
        const totaleOre = entries.reduce((sum: number, entry: any) => sum + entry.oreLavorate, 0);
        this.totaleOreRendicontate = totaleOre;
        this.numeroRendicontazioni = entries.length;
        
        // Create overview object if needed
        if (entries.length > 0) {
          this.timesheetOverview = {
            numeroProgetto: entries[0].numeroProgetto,
            nomeProgetto: entries[0].nomeProgetto,
            cliente: entries[0].cliente || '',
            totaleOre: totaleOre,
            numeroRendicontazioni: entries.length,
            ultimaRendicontazione: entries.length > 0 ? entries[entries.length - 1].dataRendicontazione : undefined,
            rendicontazioni: entries
          };
        }
      },
      error: (error: any) => {
        console.error('Error loading timesheet overview:', error);
        this.totaleOreRendicontate = 0;
        this.numeroRendicontazioni = 0;
      }
    });

    // Load storico modifiche dal servizio (endpoint /storico)
    // L'API può restituire già StoricoModifica oppure un payload "tipo ChangeLog":
    // in entrambi i casi normalizziamo al formato StoricoModifica usato dalla UI.
    this.projectService.getStoricoModifiche(numeroProgetto).subscribe({
      next: (storicoRaw: any[]) => {
        const storico = this.normalizeStorico(storicoRaw || []);
        this.storicoModifiche = storico;
        this.registroModifiche = storico || [];
        this.modificheRaggruppate = this.raggruppaModifiche(this.registroModifiche);
      },
      error: (error: any) => {
        console.error('Error loading storico modifiche:', error);
        this.registroModifiche = [];
        this.modificheRaggruppate = [];
      }
    });

    // Load chat messages
    this.loadChatMessages(numeroProgetto);
  }

  loadChatMessages(numeroProgetto: string) {
    // Load messages from service
    this.projectService.getMessaggiProgetto(numeroProgetto).subscribe({
      next: (messaggi: MessaggioProgetto[]) => {
        // Convert MessaggioProgetto to ChatMessage
        this.chatMessages = messaggi.map((msg: MessaggioProgetto) => {
          const data = msg.data ? new Date(msg.data) : new Date();
          return {
            id: msg.id?.toString() || data.getTime().toString(),
            backendId: msg.id,
            utente: msg.utente,
            messaggio: msg.messaggio,
            // Ensure we always work with a Date instance (API returns ISO string)
            dataOra: data,
            avatar: this.getInitials(msg.utente)
          };
        });
      },
      error: (error: any) => {
        console.error('Error loading chat messages:', error);
        this.chatMessages = [];
      }
    });
  }

  sendMessage(event?: Event) {
    if (event && event instanceof KeyboardEvent && event.key === 'Enter' && !event.ctrlKey) {
      event.preventDefault();
    }
    
    if (this.newMessage.trim() && this.project?.numeroProgetto) {
      const messaggio: MessaggioProgetto = {
        numeroProgetto: this.project.numeroProgetto,
        data: new Date(),
        utente: this.currentUser,
        messaggio: this.newMessage.trim(),
        tipo: 'info'
      };
      
      // Save message via service
      this.projectService.addMessaggioProgetto(this.project.numeroProgetto, messaggio).subscribe({
        next: (savedMessage: MessaggioProgetto) => {
          // Add to local array for immediate display
          const data = savedMessage.data ? new Date(savedMessage.data) : new Date();
          const chatMsg: ChatMessage = {
            id: savedMessage.id?.toString() || Date.now().toString(),
            backendId: savedMessage.id,
            utente: savedMessage.utente,
            messaggio: savedMessage.messaggio,
            dataOra: data,
            avatar: this.getInitials(savedMessage.utente)
          };
          
          this.chatMessages.unshift(chatMsg);
          this.newMessage = '';
        },
        error: (error: any) => {
          console.error('Error saving message:', error);
        }
      });
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getSortedMessages(): ChatMessage[] {
    return [...this.chatMessages].sort((a, b) => {
      const aTime = a.dataOra ? new Date(a.dataOra).getTime() : 0;
      const bTime = b.dataOra ? new Date(b.dataOra).getTime() : 0;
      return bTime - aTime;
    });
  }

  // Un messaggio è cancellabile solo se:
  // - è dell'utente corrente
  // - è l'ultimo in ordine cronologico (nessun messaggio con data successiva)
  canDeleteMessage(message: ChatMessage): boolean {
    if (!this.project || !this.currentUser) {
      return false;
    }

    if (message.utente !== this.currentUser) {
      return false;
    }

    const messageTime = message.dataOra ? new Date(message.dataOra).getTime() : 0;
    return !this.chatMessages.some(m => {
      const time = m.dataOra ? new Date(m.dataOra).getTime() : 0;
      return time > messageTime;
    });
  }

  deleteMessage(message: ChatMessage): void {
    if (!this.project?.numeroProgetto || !message.backendId) {
      return;
    }

    const numeroProgetto = this.project.numeroProgetto;

    this.confirmationService.confirm({
      message: 'Sei sicuro di eliminare il messaggio?',
      header: 'Conferma Eliminazione',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Elimina',
      rejectLabel: 'Annulla',
      accept: () => {
        // L'API backend costruisce la chiave come `${numeroProgetto}-MSG${idNumerico}`.
        // L'ID che leggiamo dal backend è del tipo "250001-MSG1602981324".
        // Per la DELETE dobbiamo passare solo la parte numerica finale: "1602981324".
        let rawId = message.backendId!.toString();

        // Se contiene il numero progetto, rimuovo il prefisso "250001-"
        const prefix = `${numeroProgetto}-`;
        if (rawId.startsWith(prefix)) {
          rawId = rawId.substring(prefix.length);
        }

        // Se ora inizia con "MSG", tolgo il prefisso "MSG"
        if (rawId.startsWith('MSG')) {
          rawId = rawId.substring(3);
        }

        const apiMessageId = rawId;

        // Chiamata API per cancellare il messaggio
        this.projectService.deleteMessaggioProgetto(numeroProgetto, apiMessageId).subscribe({
          next: () => {
            // Rimuovo il messaggio dalla lista locale
            this.chatMessages = this.chatMessages.filter(m => m.id !== message.id);
          },
          error: (error: any) => {
            console.error('Error deleting message:', error);
          }
        });
      }
    });
  }

  getStatusSeverity(status?: ProjectStatus | string): string {
    if (!status) return 'secondary';
    const value = typeof status === 'string' ? status as ProjectStatus : status;
    switch (value) {
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

  getDateClass(data?: Date): string {
    if (!data) return '';
    
    const oggi = new Date();
    const dataInstallazione = new Date(data);
    const diffTime = dataInstallazione.getTime() - oggi.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-500 font-bold';
    if (diffDays <= 3) return 'text-orange-500 font-bold';
    return 'text-green-500';
  }

  getTipoProdottoSeverity(tipo: string): string {
    switch (tipo) {
      case 'Metafora': return 'success';
      case 'Wallen': return 'info';
      case 'Armonica': return 'warning';
      default: return 'secondary';
    }
  }

  // Metodi per il registro modifiche
  getModificheFiltrate(): ModificaRaggruppata[] {
    let modificheFiltrate = this.modificheRaggruppate;
    
    if (this.filtroModifiche === 'ultime10') {
      modificheFiltrate = this.modificheRaggruppate.slice(0, 10);
    } else if (this.filtroModifiche === 'ultime50') {
      modificheFiltrate = this.modificheRaggruppate.slice(0, 50);
    }
    
    return modificheFiltrate;
  }

  onFiltroModificheChange() {
    // Metodo per gestire il cambio del filtro
    // Eventuali logiche aggiuntive possono essere aggiunte qui
  }

  toggleExpanded(modifica: ModificaRaggruppata) {
    modifica.expanded = !modifica.expanded;
  }

  /**
   * Normalizza il payload restituito dall'endpoint /storico
   * in una lista di StoricoModifica usabile dalla UI.
   *
   * Supporta:
   * - elementi già nel formato StoricoModifica;
   * - elementi "tipo ChangeLog" con proprietà { id, numeroProgetto, data, utente, azione, descrizione, dettagli }.
   */
  private normalizeStorico(items: any[]): StoricoModifica[] {
    const result: StoricoModifica[] = [];

    items.forEach(item => {
      // Caso 1: è già uno StoricoModifica (ha campoModificato)
      if (item && item.campoModificato) {
        result.push({
          id: item.id,
          numeroProgetto: item.numeroProgetto,
          dataModifica: item.dataModifica ? new Date(item.dataModifica) : new Date(),
          utenteModifica: item.utenteModifica,
          campoModificato: item.campoModificato,
          valorePrecedente: item.valorePrecedente,
          nuovoValore: item.nuovoValore,
          versioneWIC: item.versioneWIC,
          descrizione: item.descrizione
        });
        return;
      }

      // Caso 2: formato "tipo ChangeLog"
      const log = item;
      const dettagli: any = log?.dettagli;

      if (dettagli && typeof dettagli === 'object') {
        // 2a) mock: { campo, vecchioValore, nuovoValore }
        if ('campo' in dettagli) {
          result.push({
            id: log.id,
            numeroProgetto: log.numeroProgetto,
            dataModifica: new Date(log.data),
            utenteModifica: log.utente,
            campoModificato: String(dettagli.campo),
            valorePrecedente: dettagli.vecchioValore != null ? String(dettagli.vecchioValore) : '-',
            nuovoValore: dettagli.nuovoValore != null ? String(dettagli.nuovoValore) : '-'
          });
        } else {
          // 2b) backend reale: dizionario { NomeCampo: "Da: ... -> A: ..." }
          Object.keys(dettagli).forEach((campo: string) => {
            const rawValue = dettagli[campo];
            let valorePrecedente = '';
            let nuovoValore = '';

            if (typeof rawValue === 'string') {
              const match = rawValue.match(/Da:\s*(.*?)\s*->\s*A:\s*(.*)/);
              if (match) {
                valorePrecedente = match[1].trim();
                nuovoValore = match[2].trim();
              } else {
                nuovoValore = rawValue;
              }
            } else if (rawValue && typeof rawValue === 'object') {
              valorePrecedente = rawValue.vecchioValore != null ? String(rawValue.vecchioValore) : '-';
              nuovoValore = rawValue.nuovoValore != null ? String(rawValue.nuovoValore) : '-';
            }

            result.push({
              id: log.id,
              numeroProgetto: log.numeroProgetto,
              dataModifica: new Date(log.data),
              utenteModifica: log.utente,
              campoModificato: campo,
              valorePrecedente,
              nuovoValore
            });
          });

          // Abbiamo già creato tutte le voci di dettaglio per questo log,
          // quindi non deve essere aggiunta anche una riga generica "updated".
          return;
        }
      } else if (log?.descrizione && typeof log.descrizione === 'string' && log.descrizione.includes('→')) {
        // 2c) fallback: descrizione "Campo: \"vecchio\" → \"nuovo\""
        const match = log.descrizione.match(/([^:]+):\s*"([^"]*)"\s*→\s*"([^"]*)"/);
        if (match) {
          result.push({
            id: log.id,
            numeroProgetto: log.numeroProgetto,
            dataModifica: new Date(log.data),
            utenteModifica: log.utente,
            campoModificato: match[1].trim(),
            valorePrecedente: match[2] || '-',
            nuovoValore: match[3] || '-'
          });
          return;
        }
      }

      // 2d) ultimo fallback: voce generica
      if (log) {
        result.push({
          id: log.id,
          numeroProgetto: log.numeroProgetto,
          dataModifica: log.data ? new Date(log.data) : new Date(),
          utenteModifica: log.utente,
          campoModificato: log.azione || 'Modifica',
          valorePrecedente: '',
          nuovoValore: log.descrizione || ''
        });
      }
    });

    return result;
  }

  raggruppaModifiche(modifiche: StoricoModifica[]): ModificaRaggruppata[] {
    const raggruppate = new Map<string, ModificaRaggruppata>();
    
    modifiche.forEach(modifica => {
      // Crea una chiave unica basata su data e utente (arrotondata al minuto)
      const dataArrotondata = new Date(modifica.dataModifica);
      dataArrotondata.setSeconds(0, 0); // Arrotonda ai minuti
      
      const chiave = `${dataArrotondata.getTime()}_${modifica.utenteModifica}`;
      
      if (!raggruppate.has(chiave)) {
        raggruppate.set(chiave, {
          id: chiave,
          dataModifica: dataArrotondata,
          utenteModifica: modifica.utenteModifica,
          modifiche: [],
          expanded: false
        });
      }
      
      raggruppate.get(chiave)!.modifiche.push(modifica);
    });
    
    // Ordina per data decrescente
    return Array.from(raggruppate.values())
      .sort((a, b) => b.dataModifica.getTime() - a.dataModifica.getTime());
  }

  loadMockRegistroModifiche() {
    // Mock data per testare la resa estetica del registro modifiche
    // Creo istanze con più campi modificati per sessione
    this.registroModifiche = [
      // Istanza 1: Mario Rossi - 20/01/2024 14:30 - Aggiornamento stato progetto
      {
        id: 1,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-20T14:30:00'),
        utenteModifica: 'Mario Rossi',
        campoModificato: 'Stato Progetto',
        valorePrecedente: 'In Corso',
        nuovoValore: 'Completato'
      },
      {
        id: 2,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-20T14:30:00'),
        utenteModifica: 'Mario Rossi',
        campoModificato: 'Data Fine Installazione',
        valorePrecedente: '30/03/2024',
        nuovoValore: '25/03/2024'
      },
      {
        id: 3,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-20T14:30:00'),
        utenteModifica: 'Mario Rossi',
        campoModificato: 'Versione WIC',
        valorePrecedente: '2.1.0',
        nuovoValore: '2.2.0'
      },

      // Istanza 2: Giulia Bianchi - 19/01/2024 10:15 - Modifica pianificazione
      {
        id: 4,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-19T10:15:00'),
        utenteModifica: 'Giulia Bianchi',
        campoModificato: 'Data Inizio Installazione',
        valorePrecedente: '15/02/2024',
        nuovoValore: '20/02/2024'
      },
      {
        id: 5,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-19T10:15:00'),
        utenteModifica: 'Giulia Bianchi',
        campoModificato: 'Data Fine Installazione',
        valorePrecedente: '30/03/2024',
        nuovoValore: '05/04/2024'
      },
      {
        id: 6,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-19T10:15:00'),
        utenteModifica: 'Giulia Bianchi',
        campoModificato: 'Team Installazione',
        valorePrecedente: 'Squadra 1',
        nuovoValore: 'Squadra 2'
      },

      // Istanza 3: Luca Verdi - 18/01/2024 16:45 - Cambio team
      {
        id: 7,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-18T16:45:00'),
        utenteModifica: 'Luca Verdi',
        campoModificato: 'Project Manager',
        valorePrecedente: 'Anna Neri',
        nuovoValore: 'Marco Blu'
      },
      {
        id: 8,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-18T16:45:00'),
        utenteModifica: 'Luca Verdi',
        campoModificato: 'Team Tecnico',
        valorePrecedente: 'Team A',
        nuovoValore: 'Team B'
      },
      {
        id: 9,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-18T16:45:00'),
        utenteModifica: 'Luca Verdi',
        campoModificato: 'Team APL',
        valorePrecedente: 'Team APL-1',
        nuovoValore: 'Team APL-2'
      },
      {
        id: 10,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-18T16:45:00'),
        utenteModifica: 'Luca Verdi',
        campoModificato: 'Sales',
        valorePrecedente: 'Giovanni Bianchi',
        nuovoValore: 'Maria Rossi'
      },

      // Istanza 4: Sofia Rossi - 17/01/2024 09:20 - Aggiornamento cliente
      {
        id: 11,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-17T09:20:00'),
        utenteModifica: 'Sofia Rossi',
        campoModificato: 'Cliente',
        valorePrecedente: 'Azienda ABC',
        nuovoValore: 'Azienda XYZ'
      },
      {
        id: 12,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-17T09:20:00'),
        utenteModifica: 'Sofia Rossi',
        campoModificato: 'Città',
        valorePrecedente: 'Milano',
        nuovoValore: 'Roma'
      },
      {
        id: 13,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-17T09:20:00'),
        utenteModifica: 'Sofia Rossi',
        campoModificato: 'Stato',
        valorePrecedente: 'Lombardia',
        nuovoValore: 'Lazio'
      },

      // Istanza 5: Paolo Bianchi - 16/01/2024 13:10 - Aggiornamento tecnico
      {
        id: 14,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-16T13:10:00'),
        utenteModifica: 'Paolo Bianchi',
        campoModificato: 'Versione WIC',
        valorePrecedente: '2.1.0',
        nuovoValore: '2.2.0'
      },
      {
        id: 15,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-16T13:10:00'),
        utenteModifica: 'Paolo Bianchi',
        campoModificato: 'Nome Progetto',
        valorePrecedente: 'Progetto Alpha',
        nuovoValore: 'Progetto Beta'
      },
      {
        id: 16,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-16T13:10:00'),
        utenteModifica: 'Paolo Bianchi',
        campoModificato: 'Numero Progetto',
        valorePrecedente: '24001',
        nuovoValore: '24002'
      },

      // Istanza 6: Elena Verde - 15/01/2024 11:30 - Riorganizzazione team
      {
        id: 17,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-15T11:30:00'),
        utenteModifica: 'Elena Verde',
        campoModificato: 'Team Tecnico',
        valorePrecedente: 'Team A',
        nuovoValore: 'Team B'
      },
      {
        id: 18,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-15T11:30:00'),
        utenteModifica: 'Elena Verde',
        campoModificato: 'Team APL',
        valorePrecedente: 'Team APL-1',
        nuovoValore: 'Team APL-2'
      },
      {
        id: 19,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-15T11:30:00'),
        utenteModifica: 'Elena Verde',
        campoModificato: 'Team Installazione',
        valorePrecedente: 'Squadra 1',
        nuovoValore: 'Squadra 2'
      },
      {
        id: 20,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-15T11:30:00'),
        utenteModifica: 'Elena Verde',
        campoModificato: 'Sales',
        valorePrecedente: 'Giovanni Bianchi',
        nuovoValore: 'Maria Rossi'
      },

      // Istanza 7: Roberto Nero - 14/01/2024 15:25 - Modifica localizzazione
      {
        id: 21,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-14T15:25:00'),
        utenteModifica: 'Roberto Nero',
        campoModificato: 'Città',
        valorePrecedente: 'Milano',
        nuovoValore: 'Roma'
      },
      {
        id: 22,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-14T15:25:00'),
        utenteModifica: 'Roberto Nero',
        campoModificato: 'Stato',
        valorePrecedente: 'Lombardia',
        nuovoValore: 'Lazio'
      },

      // Istanza 8: Francesca Gialli - 13/01/2024 08:45 - Aggiornamento date
      {
        id: 23,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-13T08:45:00'),
        utenteModifica: 'Francesca Gialli',
        campoModificato: 'Data Inizio Installazione',
        valorePrecedente: '15/02/2024',
        nuovoValore: '20/02/2024'
      },
      {
        id: 24,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-13T08:45:00'),
        utenteModifica: 'Francesca Gialli',
        campoModificato: 'Data Fine Installazione',
        valorePrecedente: '30/03/2024',
        nuovoValore: '05/04/2024'
      },
      {
        id: 25,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-13T08:45:00'),
        utenteModifica: 'Francesca Gialli',
        campoModificato: 'Data Creazione',
        valorePrecedente: '01/01/2024',
        nuovoValore: '02/01/2024'
      },

      // Istanza 9: Antonio Rossi - 12/01/2024 12:15 - Cambio responsabili
      {
        id: 26,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-12T12:15:00'),
        utenteModifica: 'Antonio Rossi',
        campoModificato: 'Sales',
        valorePrecedente: 'Giovanni Bianchi',
        nuovoValore: 'Maria Rossi'
      },
      {
        id: 27,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-12T12:15:00'),
        utenteModifica: 'Antonio Rossi',
        campoModificato: 'Project Manager',
        valorePrecedente: 'Marco Blu',
        nuovoValore: 'Anna Neri'
      },

      // Istanza 10: Chiara Blu - 11/01/2024 14:50 - Aggiornamento team APL
      {
        id: 28,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-11T14:50:00'),
        utenteModifica: 'Chiara Blu',
        campoModificato: 'Team APL',
        valorePrecedente: 'Team APL-1',
        nuovoValore: 'Team APL-2'
      },
      {
        id: 29,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-11T14:50:00'),
        utenteModifica: 'Chiara Blu',
        campoModificato: 'Versione WIC',
        valorePrecedente: '2.0.5',
        nuovoValore: '2.1.0'
      },

      // Istanza 11: Davide Verde - 10/01/2024 10:30 - Rinomina progetto
      {
        id: 30,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-10T10:30:00'),
        utenteModifica: 'Davide Verde',
        campoModificato: 'Nome Progetto',
        valorePrecedente: 'Progetto Alpha',
        nuovoValore: 'Progetto Beta'
      },
      {
        id: 31,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-10T10:30:00'),
        utenteModifica: 'Davide Verde',
        campoModificato: 'Numero Progetto',
        valorePrecedente: '24001',
        nuovoValore: '24002'
      },
      {
        id: 32,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-10T10:30:00'),
        utenteModifica: 'Davide Verde',
        campoModificato: 'Stato Progetto',
        valorePrecedente: 'In Corso',
        nuovoValore: 'In Revisione'
      },

      // Istanza 12: Valentina Neri - 09/01/2024 16:20 - Modifica squadre
      {
        id: 33,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-09T16:20:00'),
        utenteModifica: 'Valentina Neri',
        campoModificato: 'Team Installazione',
        valorePrecedente: 'Squadra 1',
        nuovoValore: 'Squadra 2'
      },
      {
        id: 34,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-09T16:20:00'),
        utenteModifica: 'Valentina Neri',
        campoModificato: 'Team Tecnico',
        valorePrecedente: 'Team A',
        nuovoValore: 'Team C'
      },

      // Istanza 13: Simone Gialli - 08/01/2024 09:10 - Cambio stato
      {
        id: 35,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-08T09:10:00'),
        utenteModifica: 'Simone Gialli',
        campoModificato: 'Stato',
        valorePrecedente: 'Lombardia',
        nuovoValore: 'Emilia-Romagna'
      },
      {
        id: 36,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-08T09:10:00'),
        utenteModifica: 'Simone Gialli',
        campoModificato: 'Città',
        valorePrecedente: 'Milano',
        nuovoValore: 'Bologna'
      },

      // Istanza 14: Laura Rossi - 07/01/2024 13:40 - Aggiornamento date progetto
      {
        id: 37,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-07T13:40:00'),
        utenteModifica: 'Laura Rossi',
        campoModificato: 'Data Creazione',
        valorePrecedente: '01/01/2024',
        nuovoValore: '02/01/2024'
      },
      {
        id: 38,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-07T13:40:00'),
        utenteModifica: 'Laura Rossi',
        campoModificato: 'Data Inizio Installazione',
        valorePrecedente: '15/02/2024',
        nuovoValore: '20/02/2024'
      },
      {
        id: 39,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-07T13:40:00'),
        utenteModifica: 'Laura Rossi',
        campoModificato: 'Data Fine Installazione',
        valorePrecedente: '30/03/2024',
        nuovoValore: '05/04/2024'
      },

      // Istanza 15: Marco Bianchi - 06/01/2024 11:25 - Cambio numerazione
      {
        id: 40,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-06T11:25:00'),
        utenteModifica: 'Marco Bianchi',
        campoModificato: 'Numero Progetto',
        valorePrecedente: '24001',
        nuovoValore: '24002'
      },
      {
        id: 41,
        numeroProgetto: this.project?.numeroProgetto || '',
        dataModifica: new Date('2024-01-06T11:25:00'),
        utenteModifica: 'Marco Bianchi',
        campoModificato: 'Nome Progetto',
        valorePrecedente: 'Progetto Alpha',
        nuovoValore: 'Progetto Gamma'
      }
    ];
    
    // Raggruppa le modifiche per istanza di salvataggio
    this.modificheRaggruppate = this.raggruppaModifiche(this.registroModifiche);
  }

}
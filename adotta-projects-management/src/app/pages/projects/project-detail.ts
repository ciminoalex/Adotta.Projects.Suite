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
import { MessageService } from 'primeng/api';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { TimesheetService } from '../../services/timesheet.service';
import { MockTimesheetService } from '../../services/mock/mock-timesheet.service';
import { ServiceProviderService } from '../../services/service-provider.service';
import { ServiceConfigurationService } from '../../services/service-configuration.service';
import { Project, LivelloProgetto, ProdottoProgetto, StoricoModifica, ProjectStatus, MessaggioProgetto } from '../../models/project.model';
import { TimesheetOverview } from '../../models/timesheet.model';

export interface ChatMessage {
  id: string;
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
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css'
})
export class ProjectDetail implements OnInit {
  project?: Project;
  livelli: LivelloProgetto[] = [];
  prodotti: ProdottoProgetto[] = [];
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService,
    private serviceProvider: ServiceProviderService,
    private serviceConfig: ServiceConfigurationService,
    private http: HttpClient
  ) {
    // Use services based on configuration (mock or real API)
    this.projectService = this.serviceProvider.provideProjectService();
    // TimesheetService: use mock if configured, otherwise use real service
    if (this.serviceConfig.getUseMockServices()) {
      this.timesheetService = new MockTimesheetService() as any;
    } else {
      this.timesheetService = new TimesheetService(this.http);
    }
  }

  private projectService: ProjectService | any;
  private timesheetService: TimesheetService | any;
  

  ngOnInit() {
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
    // Load livelli
    this.projectService.getLivelliProgetto(numeroProgetto).subscribe((livelli: LivelloProgetto[]) => {
      this.livelli = livelli;
    });

    // Load prodotti
    this.projectService.getProdottiProgetto(numeroProgetto).subscribe((prodotti: ProdottoProgetto[]) => {
      this.prodotti = prodotti;
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

    // Load storico modifiche
    this.projectService.getStoricoModifiche(numeroProgetto).subscribe((storico: StoricoModifica[]) => {
      this.storicoModifiche = storico;
      // Solo se non ci sono dati reali, usa i mock per test estetico
      if (!storico || storico.length === 0) {
        this.loadMockRegistroModifiche();
      } else {
        this.registroModifiche = storico; // Copia per il filtro
        this.modificheRaggruppate = this.raggruppaModifiche(this.registroModifiche);
      }
    });

    // Mock data per il registro modifiche (per test estetico) - fallback
    if (!this.registroModifiche || this.registroModifiche.length === 0) {
      this.loadMockRegistroModifiche();
    }

    // Load chat messages
    this.loadChatMessages(numeroProgetto);
  }

  loadChatMessages(numeroProgetto: string) {
    // Load messages from service
    this.projectService.getMessaggiProgetto(numeroProgetto).subscribe({
      next: (messaggi: MessaggioProgetto[]) => {
        // Convert MessaggioProgetto to ChatMessage
        this.chatMessages = messaggi.map((msg: MessaggioProgetto) => ({
          id: msg.id?.toString() || '0',
          utente: msg.utente,
          messaggio: msg.messaggio,
          dataOra: msg.data,
          avatar: this.getInitials(msg.utente)
        }));
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
      // Get project ID (simple implementation for mock)
      const projectId = 1; // This will be mapped correctly by the service
      
      const messaggio: MessaggioProgetto = {
        progettoId: projectId,
        data: new Date(),
        utente: this.currentUser,
        messaggio: this.newMessage.trim(),
        tipo: 'info'
      };
      
      // Save message via service
      this.projectService.addMessaggioProgetto(messaggio).subscribe({
        next: (savedMessage: MessaggioProgetto) => {
          // Add to local array for immediate display
          const chatMsg: ChatMessage = {
            id: savedMessage.id?.toString() || Date.now().toString(),
            utente: savedMessage.utente,
            messaggio: savedMessage.messaggio,
            dataOra: savedMessage.data,
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
    return [...this.chatMessages].sort((a, b) => b.dataOra.getTime() - a.dataOra.getTime());
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
        progettoId: 1,
        dataModifica: new Date('2024-01-20T14:30:00'),
        utenteModifica: 'Mario Rossi',
        campoModificato: 'Stato Progetto',
        valorePrecedente: 'In Corso',
        nuovoValore: 'Completato'
      },
      {
        id: 2,
        progettoId: 1,
        dataModifica: new Date('2024-01-20T14:30:00'),
        utenteModifica: 'Mario Rossi',
        campoModificato: 'Data Fine Installazione',
        valorePrecedente: '30/03/2024',
        nuovoValore: '25/03/2024'
      },
      {
        id: 3,
        progettoId: 1,
        dataModifica: new Date('2024-01-20T14:30:00'),
        utenteModifica: 'Mario Rossi',
        campoModificato: 'Versione WIC',
        valorePrecedente: '2.1.0',
        nuovoValore: '2.2.0'
      },

      // Istanza 2: Giulia Bianchi - 19/01/2024 10:15 - Modifica pianificazione
      {
        id: 4,
        progettoId: 1,
        dataModifica: new Date('2024-01-19T10:15:00'),
        utenteModifica: 'Giulia Bianchi',
        campoModificato: 'Data Inizio Installazione',
        valorePrecedente: '15/02/2024',
        nuovoValore: '20/02/2024'
      },
      {
        id: 5,
        progettoId: 1,
        dataModifica: new Date('2024-01-19T10:15:00'),
        utenteModifica: 'Giulia Bianchi',
        campoModificato: 'Data Fine Installazione',
        valorePrecedente: '30/03/2024',
        nuovoValore: '05/04/2024'
      },
      {
        id: 6,
        progettoId: 1,
        dataModifica: new Date('2024-01-19T10:15:00'),
        utenteModifica: 'Giulia Bianchi',
        campoModificato: 'Team Installazione',
        valorePrecedente: 'Squadra 1',
        nuovoValore: 'Squadra 2'
      },

      // Istanza 3: Luca Verdi - 18/01/2024 16:45 - Cambio team
      {
        id: 7,
        progettoId: 1,
        dataModifica: new Date('2024-01-18T16:45:00'),
        utenteModifica: 'Luca Verdi',
        campoModificato: 'Project Manager',
        valorePrecedente: 'Anna Neri',
        nuovoValore: 'Marco Blu'
      },
      {
        id: 8,
        progettoId: 1,
        dataModifica: new Date('2024-01-18T16:45:00'),
        utenteModifica: 'Luca Verdi',
        campoModificato: 'Team Tecnico',
        valorePrecedente: 'Team A',
        nuovoValore: 'Team B'
      },
      {
        id: 9,
        progettoId: 1,
        dataModifica: new Date('2024-01-18T16:45:00'),
        utenteModifica: 'Luca Verdi',
        campoModificato: 'Team APL',
        valorePrecedente: 'Team APL-1',
        nuovoValore: 'Team APL-2'
      },
      {
        id: 10,
        progettoId: 1,
        dataModifica: new Date('2024-01-18T16:45:00'),
        utenteModifica: 'Luca Verdi',
        campoModificato: 'Sales',
        valorePrecedente: 'Giovanni Bianchi',
        nuovoValore: 'Maria Rossi'
      },

      // Istanza 4: Sofia Rossi - 17/01/2024 09:20 - Aggiornamento cliente
      {
        id: 11,
        progettoId: 1,
        dataModifica: new Date('2024-01-17T09:20:00'),
        utenteModifica: 'Sofia Rossi',
        campoModificato: 'Cliente',
        valorePrecedente: 'Azienda ABC',
        nuovoValore: 'Azienda XYZ'
      },
      {
        id: 12,
        progettoId: 1,
        dataModifica: new Date('2024-01-17T09:20:00'),
        utenteModifica: 'Sofia Rossi',
        campoModificato: 'Città',
        valorePrecedente: 'Milano',
        nuovoValore: 'Roma'
      },
      {
        id: 13,
        progettoId: 1,
        dataModifica: new Date('2024-01-17T09:20:00'),
        utenteModifica: 'Sofia Rossi',
        campoModificato: 'Stato',
        valorePrecedente: 'Lombardia',
        nuovoValore: 'Lazio'
      },

      // Istanza 5: Paolo Bianchi - 16/01/2024 13:10 - Aggiornamento tecnico
      {
        id: 14,
        progettoId: 1,
        dataModifica: new Date('2024-01-16T13:10:00'),
        utenteModifica: 'Paolo Bianchi',
        campoModificato: 'Versione WIC',
        valorePrecedente: '2.1.0',
        nuovoValore: '2.2.0'
      },
      {
        id: 15,
        progettoId: 1,
        dataModifica: new Date('2024-01-16T13:10:00'),
        utenteModifica: 'Paolo Bianchi',
        campoModificato: 'Nome Progetto',
        valorePrecedente: 'Progetto Alpha',
        nuovoValore: 'Progetto Beta'
      },
      {
        id: 16,
        progettoId: 1,
        dataModifica: new Date('2024-01-16T13:10:00'),
        utenteModifica: 'Paolo Bianchi',
        campoModificato: 'Numero Progetto',
        valorePrecedente: 'PRJ-2024-001',
        nuovoValore: 'PRJ-2024-002'
      },

      // Istanza 6: Elena Verde - 15/01/2024 11:30 - Riorganizzazione team
      {
        id: 17,
        progettoId: 1,
        dataModifica: new Date('2024-01-15T11:30:00'),
        utenteModifica: 'Elena Verde',
        campoModificato: 'Team Tecnico',
        valorePrecedente: 'Team A',
        nuovoValore: 'Team B'
      },
      {
        id: 18,
        progettoId: 1,
        dataModifica: new Date('2024-01-15T11:30:00'),
        utenteModifica: 'Elena Verde',
        campoModificato: 'Team APL',
        valorePrecedente: 'Team APL-1',
        nuovoValore: 'Team APL-2'
      },
      {
        id: 19,
        progettoId: 1,
        dataModifica: new Date('2024-01-15T11:30:00'),
        utenteModifica: 'Elena Verde',
        campoModificato: 'Team Installazione',
        valorePrecedente: 'Squadra 1',
        nuovoValore: 'Squadra 2'
      },
      {
        id: 20,
        progettoId: 1,
        dataModifica: new Date('2024-01-15T11:30:00'),
        utenteModifica: 'Elena Verde',
        campoModificato: 'Sales',
        valorePrecedente: 'Giovanni Bianchi',
        nuovoValore: 'Maria Rossi'
      },

      // Istanza 7: Roberto Nero - 14/01/2024 15:25 - Modifica localizzazione
      {
        id: 21,
        progettoId: 1,
        dataModifica: new Date('2024-01-14T15:25:00'),
        utenteModifica: 'Roberto Nero',
        campoModificato: 'Città',
        valorePrecedente: 'Milano',
        nuovoValore: 'Roma'
      },
      {
        id: 22,
        progettoId: 1,
        dataModifica: new Date('2024-01-14T15:25:00'),
        utenteModifica: 'Roberto Nero',
        campoModificato: 'Stato',
        valorePrecedente: 'Lombardia',
        nuovoValore: 'Lazio'
      },

      // Istanza 8: Francesca Gialli - 13/01/2024 08:45 - Aggiornamento date
      {
        id: 23,
        progettoId: 1,
        dataModifica: new Date('2024-01-13T08:45:00'),
        utenteModifica: 'Francesca Gialli',
        campoModificato: 'Data Inizio Installazione',
        valorePrecedente: '15/02/2024',
        nuovoValore: '20/02/2024'
      },
      {
        id: 24,
        progettoId: 1,
        dataModifica: new Date('2024-01-13T08:45:00'),
        utenteModifica: 'Francesca Gialli',
        campoModificato: 'Data Fine Installazione',
        valorePrecedente: '30/03/2024',
        nuovoValore: '05/04/2024'
      },
      {
        id: 25,
        progettoId: 1,
        dataModifica: new Date('2024-01-13T08:45:00'),
        utenteModifica: 'Francesca Gialli',
        campoModificato: 'Data Creazione',
        valorePrecedente: '01/01/2024',
        nuovoValore: '02/01/2024'
      },

      // Istanza 9: Antonio Rossi - 12/01/2024 12:15 - Cambio responsabili
      {
        id: 26,
        progettoId: 1,
        dataModifica: new Date('2024-01-12T12:15:00'),
        utenteModifica: 'Antonio Rossi',
        campoModificato: 'Sales',
        valorePrecedente: 'Giovanni Bianchi',
        nuovoValore: 'Maria Rossi'
      },
      {
        id: 27,
        progettoId: 1,
        dataModifica: new Date('2024-01-12T12:15:00'),
        utenteModifica: 'Antonio Rossi',
        campoModificato: 'Project Manager',
        valorePrecedente: 'Marco Blu',
        nuovoValore: 'Anna Neri'
      },

      // Istanza 10: Chiara Blu - 11/01/2024 14:50 - Aggiornamento team APL
      {
        id: 28,
        progettoId: 1,
        dataModifica: new Date('2024-01-11T14:50:00'),
        utenteModifica: 'Chiara Blu',
        campoModificato: 'Team APL',
        valorePrecedente: 'Team APL-1',
        nuovoValore: 'Team APL-2'
      },
      {
        id: 29,
        progettoId: 1,
        dataModifica: new Date('2024-01-11T14:50:00'),
        utenteModifica: 'Chiara Blu',
        campoModificato: 'Versione WIC',
        valorePrecedente: '2.0.5',
        nuovoValore: '2.1.0'
      },

      // Istanza 11: Davide Verde - 10/01/2024 10:30 - Rinomina progetto
      {
        id: 30,
        progettoId: 1,
        dataModifica: new Date('2024-01-10T10:30:00'),
        utenteModifica: 'Davide Verde',
        campoModificato: 'Nome Progetto',
        valorePrecedente: 'Progetto Alpha',
        nuovoValore: 'Progetto Beta'
      },
      {
        id: 31,
        progettoId: 1,
        dataModifica: new Date('2024-01-10T10:30:00'),
        utenteModifica: 'Davide Verde',
        campoModificato: 'Numero Progetto',
        valorePrecedente: 'PRJ-2024-001',
        nuovoValore: 'PRJ-2024-002'
      },
      {
        id: 32,
        progettoId: 1,
        dataModifica: new Date('2024-01-10T10:30:00'),
        utenteModifica: 'Davide Verde',
        campoModificato: 'Stato Progetto',
        valorePrecedente: 'In Corso',
        nuovoValore: 'In Revisione'
      },

      // Istanza 12: Valentina Neri - 09/01/2024 16:20 - Modifica squadre
      {
        id: 33,
        progettoId: 1,
        dataModifica: new Date('2024-01-09T16:20:00'),
        utenteModifica: 'Valentina Neri',
        campoModificato: 'Team Installazione',
        valorePrecedente: 'Squadra 1',
        nuovoValore: 'Squadra 2'
      },
      {
        id: 34,
        progettoId: 1,
        dataModifica: new Date('2024-01-09T16:20:00'),
        utenteModifica: 'Valentina Neri',
        campoModificato: 'Team Tecnico',
        valorePrecedente: 'Team A',
        nuovoValore: 'Team C'
      },

      // Istanza 13: Simone Gialli - 08/01/2024 09:10 - Cambio stato
      {
        id: 35,
        progettoId: 1,
        dataModifica: new Date('2024-01-08T09:10:00'),
        utenteModifica: 'Simone Gialli',
        campoModificato: 'Stato',
        valorePrecedente: 'Lombardia',
        nuovoValore: 'Emilia-Romagna'
      },
      {
        id: 36,
        progettoId: 1,
        dataModifica: new Date('2024-01-08T09:10:00'),
        utenteModifica: 'Simone Gialli',
        campoModificato: 'Città',
        valorePrecedente: 'Milano',
        nuovoValore: 'Bologna'
      },

      // Istanza 14: Laura Rossi - 07/01/2024 13:40 - Aggiornamento date progetto
      {
        id: 37,
        progettoId: 1,
        dataModifica: new Date('2024-01-07T13:40:00'),
        utenteModifica: 'Laura Rossi',
        campoModificato: 'Data Creazione',
        valorePrecedente: '01/01/2024',
        nuovoValore: '02/01/2024'
      },
      {
        id: 38,
        progettoId: 1,
        dataModifica: new Date('2024-01-07T13:40:00'),
        utenteModifica: 'Laura Rossi',
        campoModificato: 'Data Inizio Installazione',
        valorePrecedente: '15/02/2024',
        nuovoValore: '20/02/2024'
      },
      {
        id: 39,
        progettoId: 1,
        dataModifica: new Date('2024-01-07T13:40:00'),
        utenteModifica: 'Laura Rossi',
        campoModificato: 'Data Fine Installazione',
        valorePrecedente: '30/03/2024',
        nuovoValore: '05/04/2024'
      },

      // Istanza 15: Marco Bianchi - 06/01/2024 11:25 - Cambio numerazione
      {
        id: 40,
        progettoId: 1,
        dataModifica: new Date('2024-01-06T11:25:00'),
        utenteModifica: 'Marco Bianchi',
        campoModificato: 'Numero Progetto',
        valorePrecedente: 'PRJ-2024-001',
        nuovoValore: 'PRJ-2024-002'
      },
      {
        id: 41,
        progettoId: 1,
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
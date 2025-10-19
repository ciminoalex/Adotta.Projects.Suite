import { Injectable } from '@angular/core';
import { Observable, of, delay, BehaviorSubject } from 'rxjs';
import { Project, ProjectStatus, LivelloProgetto, ProdottoProgetto, StoricoModifica } from '../../models/project.model';
// Import rimossi per semplificazione - utilizziamo solo i modelli principali

@Injectable({
  providedIn: 'root'
})
export class MockProjectService {
  private apiUrl = '/api/projects';
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  public projects$ = this.projectsSubject.asObservable();
  private http: any = null; // Mock http client
  private mockProjects: Project[] = [
    // ON_GOING Projects
    {
      numeroProgetto: 'PRJ-2024-001',
      cliente: 'TechCorp Italia',
      nomeProgetto: 'Installazione HVAC Uffici Milano',
      citta: 'Milano',
      stato: 'Italia', 
      teamTecnico: 'Team Alpha',
      teamAPL: 'APL Team 1',
      sales: 'Giuseppe Verdi',
      projectManager: 'Mario Rossi',
      teamInstallazione: 'Install Team A',
      dataCreazione: new Date('2024-01-15'),
      dataInizioInstallazione: new Date('2024-02-01'),
      dataFineInstallazione: new Date('2024-03-20'),
      versioneWIC: 'WIC-1.0',
      ultimaModifica: new Date('2024-01-20'),
      statoProgetto: ProjectStatus.ON_GOING,
      isInRitardo: false
    },
    {
      numeroProgetto: 'PRJ-2024-002',
      cliente: 'Roma Tech',
      nomeProgetto: 'Upgrade Server Room',
      citta: 'Roma',
      stato: 'Italia',
      teamTecnico: 'Team Beta',
      teamAPL: 'APL Team 2',
      sales: 'Anna Rossi',
      projectManager: 'Luca Bianchi',
      teamInstallazione: 'Install Team B',
      dataCreazione: new Date('2024-01-20'),
      dataInizioInstallazione: new Date('2024-02-15'),
      dataFineInstallazione: new Date('2024-04-01'),
      versioneWIC: 'WIC-1.1',
      ultimaModifica: new Date('2024-01-25'),
      statoProgetto: ProjectStatus.ON_GOING,
      isInRitardo: false
    },
    {
      numeroProgetto: 'PRJ-2024-003',
      cliente: 'Napoli Industries',
      nomeProgetto: 'Data Center Cooling',
      citta: 'Napoli',
      stato: 'Italia',
      teamTecnico: 'Team Gamma',
      teamAPL: 'APL Team 3',
      sales: 'Marco Verdi',
      projectManager: 'Sofia Russo',
      teamInstallazione: 'Install Team C',
      dataCreazione: new Date('2024-01-25'),
      dataInizioInstallazione: new Date('2024-03-01'),
      dataFineInstallazione: new Date('2024-04-15'),
      versioneWIC: 'WIC-1.0',
      ultimaModifica: new Date('2024-01-30'),
      statoProgetto: ProjectStatus.ON_GOING,
      isInRitardo: true
    },
    {
      numeroProgetto: 'PRJ-2024-004',
      cliente: 'Torino Solutions',
      nomeProgetto: 'Office Renovation',
      citta: 'Torino',
      stato: 'Italia',
      teamTecnico: 'Team Delta',
      teamAPL: 'APL Team 1',
      sales: 'Paolo Neri',
      projectManager: 'Elena Conti',
      teamInstallazione: 'Install Team A',
      dataCreazione: new Date('2024-02-01'),
      dataInizioInstallazione: new Date('2024-03-15'),
      dataFineInstallazione: new Date('2024-05-01'),
      versioneWIC: 'WIC-1.2',
      ultimaModifica: new Date('2024-02-05'),
      statoProgetto: ProjectStatus.ON_GOING,
      isInRitardo: false
    },
    {
      numeroProgetto: 'PRJ-2024-005',
      cliente: 'Firenze Tech',
      nomeProgetto: 'Smart Building Implementation',
      citta: 'Firenze',
      stato: 'Italia',
      teamTecnico: 'Team Epsilon',
      teamAPL: 'APL Team 2',
      sales: 'Laura Bianchi',
      projectManager: 'Andrea Moretti',
      teamInstallazione: 'Install Team B',
      dataCreazione: new Date('2024-02-05'),
      dataInizioInstallazione: new Date('2024-03-20'),
      dataFineInstallazione: new Date('2024-05-15'),
      versioneWIC: 'WIC-1.1',
      ultimaModifica: new Date('2024-02-10'),
      statoProgetto: ProjectStatus.ON_GOING,
      isInRitardo: false
    },

    // CRITICAL Projects
    {
      numeroProgetto: 'PRJ-2024-006',
      cliente: 'Bologna Corp',
      nomeProgetto: 'Emergency HVAC Repair',
      citta: 'Bologna',
      stato: 'Italia',
      teamTecnico: 'Team Alpha',
      teamAPL: 'APL Team 3',
      sales: 'Roberto Ferrari',
      projectManager: 'Chiara Rossi',
      teamInstallazione: 'Install Team C',
      dataCreazione: new Date('2024-01-10'),
      dataInizioInstallazione: new Date('2024-02-01'),
      dataFineInstallazione: new Date('2024-03-15'),
      versioneWIC: 'WIC-1.0',
      ultimaModifica: new Date('2024-01-15'),
      statoProgetto: ProjectStatus.CRITICAL,
      isInRitardo: true
    },
    {
      numeroProgetto: 'PRJ-2024-007',
      cliente: 'Genova Industries',
      nomeProgetto: 'Critical Infrastructure Update',
      citta: 'Genova',
      stato: 'Italia',
      teamTecnico: 'Team Beta',
      teamAPL: 'APL Team 1',
      sales: 'Marco Esposito',
      projectManager: 'Valentina Conti',
      teamInstallazione: 'Install Team A',
      dataCreazione: new Date('2024-01-15'),
      dataInizioInstallazione: new Date('2024-02-15'),
      dataFineInstallazione: new Date('2024-04-01'),
      versioneWIC: 'WIC-1.1',
      ultimaModifica: new Date('2024-01-20'),
      statoProgetto: ProjectStatus.CRITICAL,
      isInRitardo: true
    },
    {
      numeroProgetto: 'PRJ-2024-008',
      cliente: 'Palermo Tech',
      nomeProgetto: 'Server Room Emergency',
      citta: 'Palermo',
      stato: 'Italia',
      teamTecnico: 'Team Gamma',
      teamAPL: 'APL Team 2',
      sales: 'Giuseppe Romano',
      projectManager: 'Francesca Marino',
      teamInstallazione: 'Install Team B',
      dataCreazione: new Date('2024-01-20'),
      dataInizioInstallazione: new Date('2024-03-01'),
      dataFineInstallazione: new Date('2024-04-15'),
      versioneWIC: 'WIC-1.2',
      ultimaModifica: new Date('2024-01-25'),
      statoProgetto: ProjectStatus.CRITICAL,
      isInRitardo: true
    },
    {
      numeroProgetto: 'PRJ-2024-009',
      cliente: 'Venezia Solutions',
      nomeProgetto: 'Urgent Cooling System',
      citta: 'Venezia',
      stato: 'Italia',
      teamTecnico: 'Team Delta',
      teamAPL: 'APL Team 3',
      sales: 'Antonio Russo',
      projectManager: 'Maria Ferrari',
      teamInstallazione: 'Install Team C',
      dataCreazione: new Date('2024-01-25'),
      dataInizioInstallazione: new Date('2024-03-15'),
      dataFineInstallazione: new Date('2024-05-01'),
      versioneWIC: 'WIC-1.0',
      ultimaModifica: new Date('2024-01-30'),
      statoProgetto: ProjectStatus.CRITICAL,
      isInRitardo: false
    },
    {
      numeroProgetto: 'PRJ-2024-010',
      cliente: 'Bari Corp',
      nomeProgetto: 'Critical Maintenance',
      citta: 'Bari',
      stato: 'Italia',
      teamTecnico: 'Team Epsilon',
      teamAPL: 'APL Team 1',
      sales: 'Luigi Marino',
      projectManager: 'Sara Conti',
      teamInstallazione: 'Install Team A',
      dataCreazione: new Date('2024-02-01'),
      dataInizioInstallazione: new Date('2024-03-20'),
      dataFineInstallazione: new Date('2024-05-15'),
      versioneWIC: 'WIC-1.1',
      ultimaModifica: new Date('2024-02-05'),
      statoProgetto: ProjectStatus.CRITICAL,
      isInRitardo: true
    },

    // HOLD_ON Projects
    {
      numeroProgetto: 'PRJ-2024-011',
      cliente: 'Verona Tech',
      nomeProgetto: 'Suspended Installation',
      citta: 'Verona',
      stato: 'Italia',
      teamTecnico: 'Team Alpha',
      teamAPL: 'APL Team 2',
      sales: 'Andrea Moretti',
      projectManager: 'Laura Romano',
      teamInstallazione: 'Install Team B',
      dataCreazione: new Date('2024-01-05'),
      dataInizioInstallazione: new Date('2024-02-01'),
      dataFineInstallazione: new Date('2024-03-15'),
      versioneWIC: 'WIC-1.2',
      ultimaModifica: new Date('2024-01-10'),
      statoProgetto: ProjectStatus.HOLD_ON,
      isInRitardo: false
    },
    {
      numeroProgetto: 'PRJ-2024-012',
      cliente: 'Padova Industries',
      nomeProgetto: 'Paused Project',
      citta: 'Padova',
      stato: 'Italia',
      teamTecnico: 'Team Beta',
      teamAPL: 'APL Team 3',
      sales: 'Marco Rossi',
      projectManager: 'Elena Bianchi',
      teamInstallazione: 'Install Team C',
      dataCreazione: new Date('2024-01-10'),
      dataInizioInstallazione: new Date('2024-02-15'),
      dataFineInstallazione: new Date('2024-04-01'),
      versioneWIC: 'WIC-1.0',
      ultimaModifica: new Date('2024-01-15'),
      statoProgetto: ProjectStatus.HOLD_ON,
      isInRitardo: false
    },
    {
      numeroProgetto: 'PRJ-2024-013',
      cliente: 'Trieste Solutions',
      nomeProgetto: 'On Hold Installation',
      citta: 'Trieste',
      stato: 'Italia',
      teamTecnico: 'Team Gamma',
      teamAPL: 'APL Team 1',
      sales: 'Paolo Verdi',
      projectManager: 'Anna Neri',
      teamInstallazione: 'Install Team A',
      dataCreazione: new Date('2024-01-15'),
      dataInizioInstallazione: new Date('2024-03-01'),
      dataFineInstallazione: new Date('2024-04-15'),
      versioneWIC: 'WIC-1.1',
      ultimaModifica: new Date('2024-01-20'),
      statoProgetto: ProjectStatus.HOLD_ON,
      isInRitardo: false
    },
    {
      numeroProgetto: 'PRJ-2024-014',
      cliente: 'Brescia Tech',
      nomeProgetto: 'Delayed Implementation',
      citta: 'Brescia',
      stato: 'Italia',
      teamTecnico: 'Team Delta',
      teamAPL: 'APL Team 2',
      sales: 'Giuseppe Marino',
      projectManager: 'Sofia Esposito',
      teamInstallazione: 'Install Team B',
      dataCreazione: new Date('2024-01-20'),
      dataInizioInstallazione: new Date('2024-03-15'),
      dataFineInstallazione: new Date('2024-05-01'),
      versioneWIC: 'WIC-1.2',
      ultimaModifica: new Date('2024-01-25'),
      statoProgetto: ProjectStatus.HOLD_ON,
      isInRitardo: false
    },
    {
      numeroProgetto: 'PRJ-2024-015',
      cliente: 'Prato Corp',
      nomeProgetto: 'Suspended Upgrade',
      citta: 'Prato',
      stato: 'Italia',
      teamTecnico: 'Team Epsilon',
      teamAPL: 'APL Team 3',
      sales: 'Roberto Conti',
      projectManager: 'Maria Ferrari',
      teamInstallazione: 'Install Team C',
      dataCreazione: new Date('2024-01-25'),
      dataInizioInstallazione: new Date('2024-03-20'),
      dataFineInstallazione: new Date('2024-05-15'),
      versioneWIC: 'WIC-1.0',
      ultimaModifica: new Date('2024-01-30'),
      statoProgetto: ProjectStatus.HOLD_ON,
      isInRitardo: false
    },

    // PUSHED_OUT Projects
    {
      numeroProgetto: 'PRJ-2024-016',
      cliente: 'Modena Tech',
      nomeProgetto: 'Postponed Installation',
      citta: 'Modena',
      stato: 'Italia',
      teamTecnico: 'Team Alpha',
      teamAPL: 'APL Team 1',
      sales: 'Luigi Russo',
      projectManager: 'Chiara Moretti',
      teamInstallazione: 'Install Team A',
      dataCreazione: new Date('2024-01-01'),
      dataInizioInstallazione: new Date('2024-02-01'),
      dataFineInstallazione: new Date('2024-03-15'),
      versioneWIC: 'WIC-1.1',
      ultimaModifica: new Date('2024-01-05'),
      statoProgetto: ProjectStatus.PUSHED_OUT,
      isInRitardo: true
    },
    {
      numeroProgetto: 'PRJ-2024-017',
      cliente: 'Parma Industries',
      nomeProgetto: 'Delayed Project',
      citta: 'Parma',
      stato: 'Italia',
      teamTecnico: 'Team Beta',
      teamAPL: 'APL Team 2',
      sales: 'Andrea Romano',
      projectManager: 'Valentina Esposito',
      teamInstallazione: 'Install Team B',
      dataCreazione: new Date('2024-01-05'),
      dataInizioInstallazione: new Date('2024-02-15'),
      dataFineInstallazione: new Date('2024-04-01'),
      versioneWIC: 'WIC-1.2',
      ultimaModifica: new Date('2024-01-10'),
      statoProgetto: ProjectStatus.PUSHED_OUT,
      isInRitardo: true
    },
    {
      numeroProgetto: 'PRJ-2024-018',
      cliente: 'Reggio Solutions',
      nomeProgetto: 'Pushed Implementation',
      citta: 'Reggio Emilia',
      stato: 'Italia',
      teamTecnico: 'Team Gamma',
      teamAPL: 'APL Team 3',
      sales: 'Marco Ferrari',
      projectManager: 'Laura Marino',
      teamInstallazione: 'Install Team C',
      dataCreazione: new Date('2024-01-10'),
      dataInizioInstallazione: new Date('2024-03-01'),
      dataFineInstallazione: new Date('2024-04-15'),
      versioneWIC: 'WIC-1.0',
      ultimaModifica: new Date('2024-01-15'),
      statoProgetto: ProjectStatus.PUSHED_OUT,
      isInRitardo: true
    },
    {
      numeroProgetto: 'PRJ-2024-019',
      cliente: 'Perugia Tech',
      nomeProgetto: 'Extended Timeline',
      citta: 'Perugia',
      stato: 'Italia',
      teamTecnico: 'Team Delta',
      teamAPL: 'APL Team 1',
      sales: 'Giuseppe Conti',
      projectManager: 'Sofia Russo',
      teamInstallazione: 'Install Team A',
      dataCreazione: new Date('2024-01-15'),
      dataInizioInstallazione: new Date('2024-03-15'),
      dataFineInstallazione: new Date('2024-05-01'),
      versioneWIC: 'WIC-1.1',
      ultimaModifica: new Date('2024-01-20'),
      statoProgetto: ProjectStatus.PUSHED_OUT,
      isInRitardo: true
    },
    {
      numeroProgetto: 'PRJ-2024-020',
      cliente: 'Livorno Corp',
      nomeProgetto: 'Rescheduled Project',
      citta: 'Livorno',
      stato: 'Italia',
      teamTecnico: 'Team Epsilon',
      teamAPL: 'APL Team 2',
      sales: 'Paolo Moretti',
      projectManager: 'Elena Romano',
      teamInstallazione: 'Install Team B',
      dataCreazione: new Date('2024-01-20'),
      dataInizioInstallazione: new Date('2024-03-20'),
      dataFineInstallazione: new Date('2024-05-15'),
      versioneWIC: 'WIC-1.2',
      ultimaModifica: new Date('2024-01-25'),
      statoProgetto: ProjectStatus.PUSHED_OUT,
      isInRitardo: true
    },

    // RUSH Projects
    {
      numeroProgetto: 'PRJ-2024-021',
      cliente: 'Ravenna Tech',
      nomeProgetto: 'Urgent Implementation',
      citta: 'Ravenna',
      stato: 'Italia',
      teamTecnico: 'Team Alpha',
      teamAPL: 'APL Team 3',
      sales: 'Marco Bianchi',
      projectManager: 'Anna Ferrari',
      teamInstallazione: 'Install Team C',
      dataCreazione: new Date('2024-02-01'),
      dataInizioInstallazione: new Date('2024-02-15'),
      dataFineInstallazione: new Date('2024-03-15'),
      versioneWIC: 'WIC-1.0',
      ultimaModifica: new Date('2024-02-05'),
      statoProgetto: ProjectStatus.RUSH,
      isInRitardo: false
    },
    {
      numeroProgetto: 'PRJ-2024-022',
      cliente: 'Ferrara Industries',
      nomeProgetto: 'Fast Track Project',
      citta: 'Ferrara',
      stato: 'Italia',
      teamTecnico: 'Team Beta',
      teamAPL: 'APL Team 1',
      sales: 'Luigi Esposito',
      projectManager: 'Chiara Conti',
      teamInstallazione: 'Install Team A',
      dataCreazione: new Date('2024-02-05'),
      dataInizioInstallazione: new Date('2024-02-20'),
      dataFineInstallazione: new Date('2024-03-20'),
      versioneWIC: 'WIC-1.1',
      ultimaModifica: new Date('2024-02-10'),
      statoProgetto: ProjectStatus.RUSH,
      isInRitardo: false
    },
    {
      numeroProgetto: 'PRJ-2024-023',
      cliente: 'Rimini Solutions',
      nomeProgetto: 'Priority Installation',
      citta: 'Rimini',
      stato: 'Italia',
      teamTecnico: 'Team Gamma',
      teamAPL: 'APL Team 2',
      sales: 'Roberto Marino',
      projectManager: 'Valentina Rossi',
      teamInstallazione: 'Install Team B',
      dataCreazione: new Date('2024-02-10'),
      dataInizioInstallazione: new Date('2024-02-25'),
      dataFineInstallazione: new Date('2024-03-25'),
      versioneWIC: 'WIC-1.2',
      ultimaModifica: new Date('2024-02-15'),
      statoProgetto: ProjectStatus.RUSH,
      isInRitardo: false
    },
    {
      numeroProgetto: 'PRJ-2024-024',
      cliente: 'Pisa Tech',
      nomeProgetto: 'Expedited Upgrade',
      citta: 'Pisa',
      stato: 'Italia',
      teamTecnico: 'Team Delta',
      teamAPL: 'APL Team 3',
      sales: 'Andrea Ferrari',
      projectManager: 'Maria Russo',
      teamInstallazione: 'Install Team C',
      dataCreazione: new Date('2024-02-15'),
      dataInizioInstallazione: new Date('2024-03-01'),
      dataFineInstallazione: new Date('2024-03-30'),
      versioneWIC: 'WIC-1.0',
      ultimaModifica: new Date('2024-02-20'),
      statoProgetto: ProjectStatus.RUSH,
      isInRitardo: false
    },
    {
      numeroProgetto: 'PRJ-2024-025',
      cliente: 'Siena Corp',
      nomeProgetto: 'Rush Implementation',
      citta: 'Siena',
      stato: 'Italia',
      teamTecnico: 'Team Epsilon',
      teamAPL: 'APL Team 1',
      sales: 'Paolo Romano',
      projectManager: 'Sofia Moretti',
      teamInstallazione: 'Install Team A',
      dataCreazione: new Date('2024-02-20'),
      dataInizioInstallazione: new Date('2024-03-05'),
      dataFineInstallazione: new Date('2024-04-05'),
      versioneWIC: 'WIC-1.1',
      ultimaModifica: new Date('2024-02-25'),
      statoProgetto: ProjectStatus.RUSH,
      isInRitardo: false
    },

    // ON_BID Projects
    {
      numeroProgetto: 'PRJ-2024-026',
      cliente: 'Latina Tech',
      nomeProgetto: 'New Bid Project',
      citta: 'Latina',
      stato: 'Italia',
      teamTecnico: 'Team Alpha',
      teamAPL: 'APL Team 2',
      sales: 'Giuseppe Esposito',
      projectManager: 'Laura Bianchi',
      teamInstallazione: 'Install Team B',
      dataCreazione: new Date('2024-03-01'),
      dataInizioInstallazione: new Date('2024-04-01'),
      dataFineInstallazione: new Date('2024-05-15'),
      versioneWIC: 'WIC-1.2',
      ultimaModifica: new Date('2024-03-05'),
      statoProgetto: ProjectStatus.ON_BID,
      isInRitardo: false
    },
    {
      numeroProgetto: 'PRJ-2024-027',
      cliente: 'Vicenza Industries',
      nomeProgetto: 'Proposal Phase',
      citta: 'Vicenza',
      stato: 'Italia',
      teamTecnico: 'Team Beta',
      teamAPL: 'APL Team 3',
      sales: 'Marco Conti',
      projectManager: 'Elena Marino',
      teamInstallazione: 'Install Team C',
      dataCreazione: new Date('2024-03-05'),
      dataInizioInstallazione: new Date('2024-04-05'),
      dataFineInstallazione: new Date('2024-05-20'),
      versioneWIC: 'WIC-1.0',
      ultimaModifica: new Date('2024-03-10'),
      statoProgetto: ProjectStatus.ON_BID,
      isInRitardo: false
    },
    {
      numeroProgetto: 'PRJ-2024-028',
      cliente: 'Terni Solutions',
      nomeProgetto: 'Bidding Process',
      citta: 'Terni',
      stato: 'Italia',
      teamTecnico: 'Team Gamma',
      teamAPL: 'APL Team 1',
      sales: 'Luigi Ferrari',
      projectManager: 'Anna Moretti',
      teamInstallazione: 'Install Team A',
      dataCreazione: new Date('2024-03-10'),
      dataInizioInstallazione: new Date('2024-04-10'),
      dataFineInstallazione: new Date('2024-05-25'),
      versioneWIC: 'WIC-1.1',
      ultimaModifica: new Date('2024-03-15'),
      statoProgetto: ProjectStatus.ON_BID,
      isInRitardo: false
    },
    {
      numeroProgetto: 'PRJ-2024-029',
      cliente: 'Forlì Tech',
      nomeProgetto: 'Tender Submission',
      citta: 'Forlì',
      stato: 'Italia',
      teamTecnico: 'Team Delta',
      teamAPL: 'APL Team 2',
      sales: 'Roberto Rossi',
      projectManager: 'Chiara Ferrari',
      teamInstallazione: 'Install Team B',
      dataCreazione: new Date('2024-03-15'),
      dataInizioInstallazione: new Date('2024-04-15'),
      dataFineInstallazione: new Date('2024-05-30'),
      versioneWIC: 'WIC-1.2',
      ultimaModifica: new Date('2024-03-20'),
      statoProgetto: ProjectStatus.ON_BID,
      isInRitardo: false
    },
    {
      numeroProgetto: 'PRJ-2024-030',
      cliente: 'Cesena Corp',
      nomeProgetto: 'Bid Evaluation',
      citta: 'Cesena',
      stato: 'Italia',
      teamTecnico: 'Team Epsilon',
      teamAPL: 'APL Team 3',
      sales: 'Andrea Russo',
      projectManager: 'Valentina Romano',
      teamInstallazione: 'Install Team C',
      dataCreazione: new Date('2024-03-20'),
      dataInizioInstallazione: new Date('2024-04-20'),
      dataFineInstallazione: new Date('2024-06-05'),
      versioneWIC: 'WIC-1.0',
      ultimaModifica: new Date('2024-03-25'),
      statoProgetto: ProjectStatus.ON_BID,
      isInRitardo: false
    }
  ];

  // CRUD Operations
  getProjects(): Observable<Project[]> {
    return of([...this.mockProjects]).pipe(delay(500));
  }

  getProject(numeroProgetto: string): Observable<Project> {
    const project = this.mockProjects.find(p => p.numeroProgetto === numeroProgetto);
    if (project) {
      return of({ ...project }).pipe(delay(300));
    }
    throw new Error(`Project with numero ${numeroProgetto} not found`);
  }

  createProject(project: Project): Observable<Project> {
    const newProject = { ...project };
    this.mockProjects.push(newProject);
    return of(newProject).pipe(delay(400));
  }

  updateProject(numeroProgetto: string, project: Project): Observable<Project> {
    const index = this.mockProjects.findIndex(p => p.numeroProgetto === numeroProgetto);
    if (index !== -1) {
      this.mockProjects[index] = { ...project };
      return of(this.mockProjects[index]).pipe(delay(400));
    }
    throw new Error(`Project with numero ${numeroProgetto} not found`);
  }

  deleteProject(numeroProgetto: string): Observable<void> {
    const index = this.mockProjects.findIndex(p => p.numeroProgetto === numeroProgetto);
    if (index !== -1) {
      this.mockProjects.splice(index, 1);
      return of(undefined).pipe(delay(300));
    }
    throw new Error(`Project with numero ${numeroProgetto} not found`);
  }

  // Statistiche e KPI
  getProjectStats(): Observable<any> {
    const stats = {
      progettiAttivi: this.mockProjects.filter(p => p.statoProgetto === ProjectStatus.RUSH || p.statoProgetto === ProjectStatus.CRITICAL).length,
      valorePortfolio: 0, // Campo rimosso dal modello
      installazioniMese: this.mockProjects.filter(p => {
        const installDate = p.dataCreazione;
        if (!installDate) return false;
        const now = new Date();
        return installDate.getMonth() === now.getMonth() && installDate.getFullYear() === now.getFullYear();
      }).length,
      progettiRitardo: this.mockProjects.filter(p => {
        return p.isInRitardo === true;
      }).length
    };
    return of(stats).pipe(delay(300));
  }

  getProjectsByStatus(): Observable<any> {
    const byStatus = this.mockProjects.reduce((acc, project) => {
      const status = project.statoProgetto;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return of(byStatus).pipe(delay(300));
  }

  getProjectsByMonth(): Observable<any> {
    const byMonth = this.mockProjects.reduce((acc, project) => {
      const month = project.dataCreazione.getMonth();
      const monthName = project.dataCreazione.toLocaleDateString('it-IT', { month: 'short' });
      acc[monthName] = (acc[monthName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return of(byMonth).pipe(delay(300));
  }

  // Ricerca e Filtri
  searchProjects(searchTerm: string): Observable<Project[]> {
    const filtered = this.mockProjects.filter(project =>
      project.nomeProgetto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.numeroProgetto.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return of(filtered).pipe(delay(300));
  }

  filterProjects(filters: any): Observable<Project[]> {
    let filtered = [...this.mockProjects];
    
    if (filters.stato) {
      filtered = filtered.filter(p => p.statoProgetto === filters.stato);
    }
    
    if (filters.cliente) {
      filtered = filtered.filter(p => p.cliente.toLowerCase().includes(filters.cliente.toLowerCase()));
    }
    
    if (filters.projectManager) {
      filtered = filtered.filter(p => p.projectManager?.toLowerCase().includes(filters.projectManager.toLowerCase()));
    }
    
    return of(filtered).pipe(delay(300));
  }

  // Export
  exportProjects(format: 'excel' | 'pdf' | 'csv', filters?: any): Observable<Blob> {
    // Simula il download di un file
    const data = JSON.stringify(this.mockProjects, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    return of(blob).pipe(delay(500));
  }

  // Livelli Progetto
  getLivelliProgetto(numeroProgetto: string): Observable<LivelloProgetto[]> {
    return of([]).pipe(delay(300));
  }

  addLivelloProgetto(projectId: number, livello: LivelloProgetto): Observable<LivelloProgetto> {
    return of(livello).pipe(delay(400));
  }

  updateLivelloProgetto(projectId: number, livelloId: number, livello: LivelloProgetto): Observable<LivelloProgetto> {
    return of(livello).pipe(delay(400));
  }

  deleteLivelloProgetto(projectId: number, livelloId: number): Observable<void> {
    return of(undefined).pipe(delay(300));
  }

  // Prodotti Progetto
  getProdottiProgetto(numeroProgetto: string): Observable<ProdottoProgetto[]> {
    return of([]).pipe(delay(300));
  }

  addProdottoProgetto(projectId: number, prodotto: ProdottoProgetto): Observable<ProdottoProgetto> {
    return of(prodotto).pipe(delay(400));
  }

  updateProdottoProgetto(projectId: number, prodottoId: number, prodotto: ProdottoProgetto): Observable<ProdottoProgetto> {
    return of(prodotto).pipe(delay(400));
  }

  deleteProdottoProgetto(projectId: number, prodottoId: number): Observable<void> {
    return of(undefined).pipe(delay(300));
  }

  // Storico Modifiche WIC
  getStoricoModifiche(numeroProgetto: string): Observable<StoricoModifica[]> {
    return of([]).pipe(delay(300));
  }

  createSnapshotWIC(projectId: number): Observable<StoricoModifica[]> {
    return of([]).pipe(delay(400));
  }
}

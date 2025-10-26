import { Injectable } from '@angular/core';
import { Cliente, TeamTecnico, TeamAPL, Sales, ProjectManager, SquadraInstallazione, ProdottoMaster } from '../../models/lookup.model';
import { Project, MessaggioProgetto, ChangeLog, LivelloProgetto, ProdottoProgetto, ProjectStatus } from '../../models/project.model';

// Singleton instance
let mockDataInstance: MockDataService | null = null;

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  // In-memory storage
  private clienti: Cliente[] = [];
  private teamTecnici: TeamTecnico[] = [];
  private teamAPL: TeamAPL[] = [];
  private sales: Sales[] = [];
  private projectManagers: ProjectManager[] = [];
  private squadreInstallazione: SquadraInstallazione[] = [];
  private prodottiMaster: ProdottoMaster[] = [];
  private projects: Project[] = [];
  private messaggi: MessaggioProgetto[] = [];
  private changeLogs: ChangeLog[] = [];

  private constructor() {
    this.initializeData();
  }

  /**
   * Get the singleton instance of MockDataService
   */
  static getInstance(): MockDataService {
    if (!mockDataInstance) {
      mockDataInstance = new MockDataService();
    }
    return mockDataInstance;
  }

  private initializeData() {
    // Initialize sample projects
    this.initializeSampleProjects();
    
    // Initialize Clienti
    this.clienti = [
      {
        id: 1,
        nome: 'TechCorp Italia',
        email: 'info@techcorp.it',
        telefono: '+39 02 1234567',
        partitaIVA: 'IT12345678901',
        contatto: 'Mario Rossi',
        indirizzoCompleto: 'Via Roma 123, 20100 Milano',
        note: 'Cliente principale per progetti HVAC'
      },
      {
        id: 2,
        nome: 'Immobiliare Roma SRL',
        email: 'contatti@immobiliare-roma.it',
        telefono: '+39 06 7654321',
        partitaIVA: 'IT98765432109',
        contatto: 'Giulia Bianchi',
        indirizzoCompleto: 'Piazza Navona 45, 00186 Roma',
        note: 'Specializzati in ristrutturazioni'
      },
      {
        id: 3,
        nome: 'Napoli Centro',
        email: 'info@napolicentro.it',
        telefono: '+39 081 5555555',
        partitaIVA: 'IT55555555555',
        contatto: 'Antonio Verdi',
        indirizzoCompleto: 'Via Chiaia 78, 80132 Napoli',
        note: 'Cliente storico del sud Italia'
      }
    ];

    // Initialize Team Tecnici
    this.teamTecnici = [
      {
        id: 1,
        nome: 'Team Elettrico Milano',
        specializzazione: 'Impianti Elettrici',
        email: 'elettrico.milano@adotta.it',
        telefono: '+39 02 1111111',
        disponibilita: true,
        membri: ['Marco Rossi', 'Paolo Bianchi', 'Luca Verdi']
      },
      {
        id: 2,
        nome: 'Team HVAC Roma',
        specializzazione: 'Climatizzazione',
        email: 'hvac.roma@adotta.it',
        telefono: '+39 06 2222222',
        disponibilita: true,
        membri: ['Francesco Neri', 'Giuseppe Blu', 'Roberto Gialli']
      },
      {
        id: 3,
        nome: 'Team Idraulico Napoli',
        specializzazione: 'Impianti Idraulici',
        email: 'idraulico.napoli@adotta.it',
        telefono: '+39 081 3333333',
        disponibilita: false,
        membri: ['Salvatore Rossi', 'Vincenzo Bianchi']
      }
    ];

    // Initialize Team APL
    this.teamAPL = [
      {
        id: 1,
        nome: 'Team APL Nord',
        email: 'apl.nord@adotta.it',
        telefono: '+39 02 4444444',
        area: 'Nord Italia',
        competenze: ['Progettazione HVAC', 'Calcoli Termici', 'Dimensionamento Impianti']
      },
      {
        id: 2,
        nome: 'Team APL Centro',
        email: 'apl.centro@adotta.it',
        telefono: '+39 06 5555555',
        area: 'Centro Italia',
        competenze: ['Progettazione Elettrica', 'Sicurezza Impianti', 'Normative']
      },
      {
        id: 3,
        nome: 'Team APL Sud',
        email: 'apl.sud@adotta.it',
        telefono: '+39 081 6666666',
        area: 'Sud Italia',
        competenze: ['Progettazione Idraulica', 'Ristrutturazioni', 'Efficienza Energetica']
      }
    ];

    // Initialize Sales
    this.sales = [
      {
        id: 1,
        nome: 'Marco Vendite',
        email: 'marco.vendite@adotta.it',
        telefono: '+39 02 7777777',
        zona: 'Nord Italia',
        regioneDiCompetenza: 'Lombardia, Piemonte, Veneto',
        progettiGestiti: 15
      },
      {
        id: 2,
        nome: 'Laura Commerciale',
        email: 'laura.commerciale@adotta.it',
        telefono: '+39 06 8888888',
        zona: 'Centro Italia',
        regioneDiCompetenza: 'Lazio, Toscana, Umbria',
        progettiGestiti: 12
      },
      {
        id: 3,
        nome: 'Giuseppe Sud',
        email: 'giuseppe.sud@adotta.it',
        telefono: '+39 081 9999999',
        zona: 'Sud Italia',
        regioneDiCompetenza: 'Campania, Puglia, Sicilia',
        progettiGestiti: 18
      }
    ];

    // Initialize Project Managers
    this.projectManagers = [
      {
        id: 1,
        nome: 'Mario Rossi',
        email: 'mario.rossi@adotta.it',
        telefono: '+39 02 1010101',
        progettiAttivi: 8,
        esperienza: 'Senior',
        certificazioni: ['PMP', 'PRINCE2', 'Agile']
      },
      {
        id: 2,
        nome: 'Giulia Bianchi',
        email: 'giulia.bianchi@adotta.it',
        telefono: '+39 06 2020202',
        progettiAttivi: 6,
        esperienza: 'Senior',
        certificazioni: ['PMP', 'Scrum Master']
      },
      {
        id: 3,
        nome: 'Antonio Verdi',
        email: 'antonio.verdi@adotta.it',
        telefono: '+39 081 3030303',
        progettiAttivi: 10,
        esperienza: 'Senior',
        certificazioni: ['PMP', 'ITIL']
      },
      {
        id: 4,
        nome: 'Francesca Neri',
        email: 'francesca.neri@adotta.it',
        telefono: '+39 011 4040404',
        progettiAttivi: 4,
        esperienza: 'Junior',
        certificazioni: ['Agile']
      }
    ];

    // Initialize Squadre Installazione
    this.squadreInstallazione = [
      {
        id: 1,
        nome: 'Squadra Installazione Milano',
        tipo: 'HVAC',
        contatto: 'Marco Installatore',
        disponibilita: true,
        competenze: ['Installazione HVAC', 'Manutenzione'],
        numeroMembri: 4
      },
      {
        id: 2,
        nome: 'Squadra Elettrica Roma',
        tipo: 'Elettrico',
        contatto: 'Paolo Elettricista',
        disponibilita: true,
        competenze: ['Impianti Elettrici', 'Domotica'],
        numeroMembri: 3
      },
      {
        id: 3,
        nome: 'Squadra Idraulica Napoli',
        tipo: 'Idraulico',
        contatto: 'Salvatore Idraulico',
        disponibilita: false,
        competenze: ['Impianti Idraulici', 'Riscaldamento'],
        numeroMembri: 5
      }
    ];

    // Initialize Prodotti Master
    this.prodottiMaster = [
      {
        id: 1,
        nome: 'Metafora Standard',
        categoria: 'Metafora',
        unitaMisura: 'pz',
        codiceSAP: 'META001',
        descrizione: 'Sistema Metafora standard per uffici',
        variantiDisponibili: ['Bianco', 'Grigio', 'Nero']
      },
      {
        id: 2,
        nome: 'Wallen Premium',
        categoria: 'Wallen',
        unitaMisura: 'mq',
        codiceSAP: 'WALL001',
        descrizione: 'Sistema Wallen premium per ambienti commerciali',
        variantiDisponibili: ['Legno', 'Metallo', 'Vetro']
      },
      {
        id: 3,
        nome: 'Armonica Comfort',
        categoria: 'Armonica',
        unitaMisura: 'pz',
        codiceSAP: 'ARMO001',
        descrizione: 'Sistema Armonica per massimo comfort',
        variantiDisponibili: ['Standard', 'Premium', 'Luxury']
      },
      {
        id: 4,
        nome: 'Condotto Ventilazione',
        categoria: 'Accessori',
        unitaMisura: 'ml',
        codiceSAP: 'COND001',
        descrizione: 'Condotti per ventilazione industriale',
        variantiDisponibili: ['Diametro 100mm', 'Diametro 150mm', 'Diametro 200mm']
      }
    ];
  }

  private initializeSampleProjects() {
    // Only add sample projects if the data service is empty
    if (this.projects.length === 0) {
      const sampleProjects: Project[] = [
        {
          numeroProgetto: 'PRJ-2024-001',
          cliente: 'TechCorp Italia',
          nomeProgetto: 'Installazione HVAC Uffici Milano',
          citta: 'Milano',
          stato: 'IT',
          teamTecnico: 'Team Elettrico Milano',
          teamAPL: 'Team APL Nord',
          sales: 'Marco Vendite',
          projectManager: 'Mario Rossi',
          teamInstallazione: 'Squadra Installazione Milano',
          dataCreazione: new Date('2024-01-15'),
          dataInizioInstallazione: new Date('2024-02-01'),
          dataFineInstallazione: new Date('2024-03-20'),
          versioneWIC: 'WIC-1.0',
          ultimaModifica: new Date('2024-01-20'),
          statoProgetto: ProjectStatus.ON_GOING,
          isInRitardo: false,
          livelli: [
            {
              id: 1,
              progettoId: 1,
              nome: 'Livello 1 - Piano Terra',
              ordine: 1,
              descrizione: 'Installazione impianti HVAC piano terra',
              dataInizioInstallazione: new Date('2024-02-01'),
              dataFineInstallazione: new Date('2024-02-15'),
              dataCaricamento: new Date('2024-01-15')
            }
          ],
          prodotti: [
            {
              id: 1,
              progettoId: 1,
              tipoProdotto: 'Metafora Standard',
              variante: 'Standard',
              qMq: 150.5,
              qFt: 1620.0
            }
          ]
        }
      ];

      sampleProjects.forEach(p => this.projects.push(p));
    }
  }

  // Clienti
  getClienti(): Cliente[] {
    return [...this.clienti];
  }

  addCliente(cliente: Cliente): Cliente {
    const newId = Math.max(...this.clienti.map(c => c.id || 0), 0) + 1;
    const newCliente = { ...cliente, id: newId };
    this.clienti.push(newCliente);
    return newCliente;
  }

  updateCliente(id: number, cliente: Cliente): Cliente {
    const index = this.clienti.findIndex(c => c.id === id);
    if (index !== -1) {
      this.clienti[index] = { ...cliente, id };
      return this.clienti[index];
    }
    throw new Error(`Cliente with id ${id} not found`);
  }

  deleteCliente(id: number): void {
    const index = this.clienti.findIndex(c => c.id === id);
    if (index !== -1) {
      this.clienti.splice(index, 1);
    } else {
      throw new Error(`Cliente with id ${id} not found`);
    }
  }

  findCliente(id: number): Cliente | undefined {
    return this.clienti.find(c => c.id === id);
  }

  // Similar methods for other entities...
  getTeamTecnici(): TeamTecnico[] { return [...this.teamTecnici]; }
  addTeamTecnico(team: TeamTecnico): TeamTecnico {
    const newId = Math.max(...this.teamTecnici.map(t => t.id || 0), 0) + 1;
    const newTeam = { ...team, id: newId };
    this.teamTecnici.push(newTeam);
    return newTeam;
  }
  updateTeamTecnico(id: number, team: TeamTecnico): TeamTecnico {
    const index = this.teamTecnici.findIndex(t => t.id === id);
    if (index !== -1) {
      this.teamTecnici[index] = { ...team, id };
      return this.teamTecnici[index];
    }
    throw new Error(`Team Tecnico with id ${id} not found`);
  }
  deleteTeamTecnico(id: number): void {
    const index = this.teamTecnici.findIndex(t => t.id === id);
    if (index !== -1) this.teamTecnici.splice(index, 1);
    else throw new Error(`Team Tecnico with id ${id} not found`);
  }

  getTeamAPL(): TeamAPL[] { return [...this.teamAPL]; }
  addTeamAPL(team: TeamAPL): TeamAPL {
    const newId = Math.max(...this.teamAPL.map(t => t.id || 0), 0) + 1;
    const newTeam = { ...team, id: newId };
    this.teamAPL.push(newTeam);
    return newTeam;
  }
  updateTeamAPL(id: number, team: TeamAPL): TeamAPL {
    const index = this.teamAPL.findIndex(t => t.id === id);
    if (index !== -1) {
      this.teamAPL[index] = { ...team, id };
      return this.teamAPL[index];
    }
    throw new Error(`Team APL with id ${id} not found`);
  }
  deleteTeamAPL(id: number): void {
    const index = this.teamAPL.findIndex(t => t.id === id);
    if (index !== -1) this.teamAPL.splice(index, 1);
    else throw new Error(`Team APL with id ${id} not found`);
  }

  getSales(): Sales[] { return [...this.sales]; }
  addSales(sales: Sales): Sales {
    const newId = Math.max(...this.sales.map(s => s.id || 0), 0) + 1;
    const newSales = { ...sales, id: newId };
    this.sales.push(newSales);
    return newSales;
  }
  updateSales(id: number, sales: Sales): Sales {
    const index = this.sales.findIndex(s => s.id === id);
    if (index !== -1) {
      this.sales[index] = { ...sales, id };
      return this.sales[index];
    }
    throw new Error(`Sales with id ${id} not found`);
  }
  deleteSales(id: number): void {
    const index = this.sales.findIndex(s => s.id === id);
    if (index !== -1) this.sales.splice(index, 1);
    else throw new Error(`Sales with id ${id} not found`);
  }

  getProjectManagers(): ProjectManager[] { return [...this.projectManagers]; }
  addProjectManager(pm: ProjectManager): ProjectManager {
    const newId = Math.max(...this.projectManagers.map(p => p.id || 0), 0) + 1;
    const newPM = { ...pm, id: newId };
    this.projectManagers.push(newPM);
    return newPM;
  }
  updateProjectManager(id: number, pm: ProjectManager): ProjectManager {
    const index = this.projectManagers.findIndex(p => p.id === id);
    if (index !== -1) {
      this.projectManagers[index] = { ...pm, id };
      return this.projectManagers[index];
    }
    throw new Error(`Project Manager with id ${id} not found`);
  }
  deleteProjectManager(id: number): void {
    const index = this.projectManagers.findIndex(p => p.id === id);
    if (index !== -1) this.projectManagers.splice(index, 1);
    else throw new Error(`Project Manager with id ${id} not found`);
  }

  getSquadreInstallazione(): SquadraInstallazione[] { return [...this.squadreInstallazione]; }
  addSquadraInstallazione(squadra: SquadraInstallazione): SquadraInstallazione {
    const newId = Math.max(...this.squadreInstallazione.map(s => s.id || 0), 0) + 1;
    const newSquadra = { ...squadra, id: newId };
    this.squadreInstallazione.push(newSquadra);
    return newSquadra;
  }
  updateSquadraInstallazione(id: number, squadra: SquadraInstallazione): SquadraInstallazione {
    const index = this.squadreInstallazione.findIndex(s => s.id === id);
    if (index !== -1) {
      this.squadreInstallazione[index] = { ...squadra, id };
      return this.squadreInstallazione[index];
    }
    throw new Error(`Squadra Installazione with id ${id} not found`);
  }
  deleteSquadraInstallazione(id: number): void {
    const index = this.squadreInstallazione.findIndex(s => s.id === id);
    if (index !== -1) this.squadreInstallazione.splice(index, 1);
    else throw new Error(`Squadra Installazione with id ${id} not found`);
  }

  getProdottiMaster(): ProdottoMaster[] { return [...this.prodottiMaster]; }
  addProdottoMaster(prodotto: ProdottoMaster): ProdottoMaster {
    const newId = Math.max(...this.prodottiMaster.map(p => p.id || 0), 0) + 1;
    const newProdotto = { ...prodotto, id: newId };
    this.prodottiMaster.push(newProdotto);
    return newProdotto;
  }
  updateProdottoMaster(id: number, prodotto: ProdottoMaster): ProdottoMaster {
    const index = this.prodottiMaster.findIndex(p => p.id === id);
    if (index !== -1) {
      this.prodottiMaster[index] = { ...prodotto, id };
      return this.prodottiMaster[index];
    }
    throw new Error(`Prodotto Master with id ${id} not found`);
  }
  deleteProdottoMaster(id: number): void {
    const index = this.prodottiMaster.findIndex(p => p.id === id);
    if (index !== -1) this.prodottiMaster.splice(index, 1);
    else throw new Error(`Prodotto Master with id ${id} not found`);
  }

  // Projects
  getProjects(): Project[] {
    return [...this.projects];
  }

  addProject(project: Project): Project {
    const newProject = { ...project };
    this.projects.push(newProject);
    return newProject;
  }

  updateProject(numeroProgetto: string, project: Project): Project {
    const index = this.projects.findIndex(p => p.numeroProgetto === numeroProgetto);
    if (index !== -1) {
      this.projects[index] = { ...project };
      return this.projects[index];
    }
    throw new Error(`Project with numero ${numeroProgetto} not found`);
  }

  patchProject(numeroProgetto: string, partial: Partial<Project>): Project {
    const index = this.projects.findIndex(p => p.numeroProgetto === numeroProgetto);
    if (index !== -1) {
      this.projects[index] = { ...this.projects[index], ...partial };
      return this.projects[index];
    }
    throw new Error(`Project with numero ${numeroProgetto} not found`);
  }

  deleteProject(numeroProgetto: string): void {
    const index = this.projects.findIndex(p => p.numeroProgetto === numeroProgetto);
    if (index !== -1) {
      this.projects.splice(index, 1);
    } else {
      throw new Error(`Project with numero ${numeroProgetto} not found`);
    }
  }

  findProject(numeroProgetto: string): Project | undefined {
    return this.projects.find(p => p.numeroProgetto === numeroProgetto);
  }

  // Messages
  getMessaggiByProgetto(progettoId: number): MessaggioProgetto[] {
    return this.messaggi.filter(m => m.progettoId === progettoId);
  }

  addMessaggio(messaggio: MessaggioProgetto): MessaggioProgetto {
    const newId = Math.max(...this.messaggi.map(m => m.id || 0), 0) + 1;
    const newMessaggio = { ...messaggio, id: newId };
    this.messaggi.push(newMessaggio);
    return newMessaggio;
  }

  updateMessaggio(id: number, messaggio: MessaggioProgetto): MessaggioProgetto {
    const index = this.messaggi.findIndex(m => m.id === id);
    if (index !== -1) {
      this.messaggi[index] = { ...messaggio, id };
      return this.messaggi[index];
    }
    throw new Error(`Messaggio with id ${id} not found`);
  }

  deleteMessaggio(id: number): void {
    const index = this.messaggi.findIndex(m => m.id === id);
    if (index !== -1) this.messaggi.splice(index, 1);
    else throw new Error(`Messaggio with id ${id} not found`);
  }

  // Change Log
  getChangeLogByProgetto(progettoId: number): ChangeLog[] {
    return this.changeLogs.filter(cl => cl.progettoId === progettoId);
  }

  addChangeLog(changeLog: ChangeLog): ChangeLog {
    const newId = Math.max(...this.changeLogs.map(cl => cl.id || 0), 0) + 1;
    const newChangeLog = { ...changeLog, id: newId };
    this.changeLogs.push(newChangeLog);
    return newChangeLog;
  }
}


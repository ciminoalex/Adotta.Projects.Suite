import { Injectable } from '@angular/core';
import { Cliente, Stato, TeamTecnico, TeamAPL, Sales, ProjectManager, SquadraInstallazione, ProdottoMaster } from '../../models/lookup.model';
import { Project, MessaggioProgetto, ChangeLog, LivelloProgetto, ProdottoProgetto, ProjectStatus } from '../../models/project.model';

// Extended User interface with password for mock data
interface UserWithPassword {
  id?: number;
  username: string;
  password: string;
  email: string;
  nome: string;
  cognome: string;
  ruolo?: string;
  isActive?: boolean;
}

// Singleton instance
let mockDataInstance: MockDataService | null = null;

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  // In-memory storage
  private clienti: Cliente[] = [];
  private stati: Stato[] = [];
  private teamTecnici: TeamTecnico[] = [];
  private teamAPL: TeamAPL[] = [];
  private sales: Sales[] = [];
  private projectManagers: ProjectManager[] = [];
  private squadreInstallazione: SquadraInstallazione[] = [];
  private prodottiMaster: ProdottoMaster[] = [];
  private projects: Project[] = [];
  private messaggi: MessaggioProgetto[] = [];
  private changeLogs: ChangeLog[] = [];
  private users: UserWithPassword[] = [];

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
    // Initialize users
    this.initializeUsers();
    
    // Initialize sample projects
    this.initializeSampleProjects();
    
    // Initialize Stati (Stati europei e principali)
    this.stati = [
      { id: 1, nome: 'Italia', codiceISO: 'IT', continente: 'Europa' },
      { id: 2, nome: 'USA', codiceISO: 'US', continente: 'Nord America' },
      { id: 3, nome: 'Germania', codiceISO: 'DE', continente: 'Europa' },
      { id: 4, nome: 'Francia', codiceISO: 'FR', continente: 'Europa' },
      { id: 5, nome: 'Spagna', codiceISO: 'ES', continente: 'Europa' },
      { id: 6, nome: 'Regno Unito', codiceISO: 'GB', continente: 'Europa' },
      { id: 7, nome: 'Austria', codiceISO: 'AT', continente: 'Europa' },
      { id: 8, nome: 'Svizzera', codiceISO: 'CH', continente: 'Europa' },
      { id: 9, nome: 'Belgio', codiceISO: 'BE', continente: 'Europa' },
      { id: 10, nome: 'Paesi Bassi', codiceISO: 'NL', continente: 'Europa' },
      { id: 11, nome: 'Polonia', codiceISO: 'PL', continente: 'Europa' },
      { id: 12, nome: 'Portogallo', codiceISO: 'PT', continente: 'Europa' },
      { id: 13, nome: 'Grecia', codiceISO: 'GR', continente: 'Europa' },
      { id: 14, nome: 'Svezia', codiceISO: 'SE', continente: 'Europa' },
      { id: 15, nome: 'Norvegia', codiceISO: 'NO', continente: 'Europa' },
      { id: 16, nome: 'Danimarca', codiceISO: 'DK', continente: 'Europa' },
      { id: 17, nome: 'Finlandia', codiceISO: 'FI', continente: 'Europa' }
    ];
    
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

  private initializeUsers() {
    this.users = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
        email: 'admin@adotta.it',
        nome: 'Mario',
        cognome: 'Rossi',
        ruolo: 'Administrator',
        isActive: true
      },
      {
        id: 2,
        username: 'manager',
        password: 'manager123',
        email: 'manager@adotta.it',
        nome: 'Giulia',
        cognome: 'Bianchi',
        ruolo: 'Project Manager',
        isActive: true
      },
      {
        id: 3,
        username: 'user',
        password: 'user123',
        email: 'user@adotta.it',
        nome: 'Antonio',
        cognome: 'Verdi',
        ruolo: 'User',
        isActive: true
      }
    ];
  }

  private initializeSampleProjects() {
    // Only add sample projects if the data service is empty
    if (this.projects.length === 0) {
      const sampleProjects: Project[] = [
        // ON GOING (Italia e città estere)
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
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-002',
          cliente: 'Costruzioni SRL',
          nomeProgetto: 'Energia Sostenibile Barcellona',
          citta: 'Barcelona',
          stato: 'ES',
          teamTecnico: 'Team Fotovoltaico Catalano',
          teamAPL: 'Team APL Spagna',
          sales: 'Carlos Garcia',
          projectManager: 'Elena Costa',
          teamInstallazione: 'Squadra Installazione Barcelona',
          dataCreazione: new Date('2024-03-05'),
          dataInizioInstallazione: new Date('2024-03-10'),
          dataFineInstallazione: new Date('2024-04-15'),
          versioneWIC: 'WIC-1.3',
          ultimaModifica: new Date('2024-03-12'),
          statoProgetto: ProjectStatus.ON_GOING,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-003',
          cliente: 'Global Offices',
          nomeProgetto: 'Upgrade IT - New York',
          citta: 'New York',
          stato: 'US',
          teamTecnico: 'Team IT NY',
          teamAPL: 'Team APL USA',
          sales: 'John Smith',
          projectManager: 'Laura West',
          teamInstallazione: 'NY Office Team',
          dataCreazione: new Date('2024-02-11'),
          dataInizioInstallazione: new Date('2024-02-15'),
          dataFineInstallazione: new Date('2024-05-01'),
          versioneWIC: 'WIC-2.0',
          ultimaModifica: new Date('2024-02-26'),
          statoProgetto: ProjectStatus.ON_GOING,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-004',
          cliente: 'Innovatech',
          nomeProgetto: 'Tec Lab Francoforte',
          citta: 'Frankfurt',
          stato: 'DE',
          teamTecnico: 'Team Innovazione DE',
          teamAPL: 'Team APL Europa Centrale',
          sales: 'Max Mustermann',
          projectManager: 'Claudia Celeste',
          teamInstallazione: 'Frankfurt Installers',
          dataCreazione: new Date('2024-01-27'),
          dataInizioInstallazione: new Date('2024-02-09'),
          dataFineInstallazione: new Date('2024-03-19'),
          versioneWIC: 'WIC-1.6',
          ultimaModifica: new Date('2024-02-10'),
          statoProgetto: ProjectStatus.ON_GOING,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-005',
          cliente: 'Metro Rail',
          nomeProgetto: 'Rifacimento Segnaletica Chicago',
          citta: 'Chicago',
          stato: 'US',
          teamTecnico: 'Team Segnaletica Midwest',
          teamAPL: 'Team APL USA',
          sales: 'Michael Brown',
          projectManager: 'Sara O\'Connell',
          teamInstallazione: 'Chicago Installers',
          dataCreazione: new Date('2024-02-03'),
          dataInizioInstallazione: new Date('2024-03-01'),
          dataFineInstallazione: new Date('2024-03-25'),
          versioneWIC: 'WIC-1.1',
          ultimaModifica: new Date('2024-02-20'),
          statoProgetto: ProjectStatus.ON_GOING,
          isInRitardo: false
        },

        // CRITICAL (almeno 5, anche città estere)
        {
          numeroProgetto: 'PRJ-2024-006',
          cliente: 'Hospital Group',
          nomeProgetto: 'Rete Elettrica Reparto A',
          citta: 'Bologna',
          stato: 'IT',
          teamTecnico: 'Team Emergenza Emilia',
          teamAPL: 'Team APL Centro',
          sales: 'Andrea Bonetti',
          projectManager: 'Valerio Caputo',
          teamInstallazione: 'Squadra Emergenza',
          dataCreazione: new Date('2024-01-02'),
          dataInizioInstallazione: new Date('2024-01-10'),
          dataFineInstallazione: new Date('2024-01-30'),
          versioneWIC: 'WIC-0.9',
          ultimaModifica: new Date('2024-01-15'),
          statoProgetto: ProjectStatus.CRITICAL,
          isInRitardo: true,
          note: 'Intervento d\'urgenza, scadenza ravvicinata'
        },
        {
          numeroProgetto: 'PRJ-2024-007',
          cliente: 'MegaLogistics',
          nomeProgetto: 'Blocchi doganali Rotterdam',
          citta: 'Rotterdam',
          stato: 'NL',
          teamTecnico: 'Team Logistica Olanda',
          teamAPL: 'Team APL BeNeLux',
          sales: 'Hans Jansen',
          projectManager: 'Sara Mini',
          teamInstallazione: 'Installers NL',
          dataCreazione: new Date('2024-01-15'),
          dataInizioInstallazione: new Date('2024-02-03'),
          dataFineInstallazione: new Date('2024-03-19'),
          versioneWIC: 'WIC-1.5',
          ultimaModifica: new Date('2024-02-20'),
          statoProgetto: ProjectStatus.CRITICAL,
          isInRitardo: true
        },
        {
          numeroProgetto: 'PRJ-2024-008',
          cliente: 'Capital Hotel',
          nomeProgetto: 'Antincendio Boston',
          citta: 'Boston',
          stato: 'US',
          teamTecnico: 'Team Safety US',
          teamAPL: 'Team APL USA',
          sales: 'Kevin Smith',
          projectManager: 'Mary Jo',
          teamInstallazione: 'Boston Fire Team',
          dataCreazione: new Date('2024-01-22'),
          dataInizioInstallazione: new Date('2024-01-29'),
          dataFineInstallazione: new Date('2024-02-12'),
          versioneWIC: 'WIC-2.2',
          ultimaModifica: new Date('2024-01-29'),
          statoProgetto: ProjectStatus.CRITICAL,
          isInRitardo: true
        },
        {
          numeroProgetto: 'PRJ-2024-009',
          cliente: 'EdilVita',
          nomeProgetto: 'Mancanza Materiali Oslo',
          citta: 'Oslo',
          stato: 'NO',
          teamTecnico: 'Team Materiali Scandinavia',
          teamAPL: 'Team APL Nordics',
          sales: 'Frederik Larsen',
          projectManager: 'Simone Rosso',
          teamInstallazione: 'Oslo Team',
          dataCreazione: new Date('2024-02-07'),
          dataInizioInstallazione: new Date('2024-02-19'),
          dataFineInstallazione: new Date('2024-03-14'),
          versioneWIC: 'WIC-1.8',
          ultimaModifica: new Date('2024-02-18'),
          statoProgetto: ProjectStatus.CRITICAL,
          isInRitardo: true,
          note: 'Blocchi su forniture in Norvegia'
        },
        {
          numeroProgetto: 'PRJ-2024-010',
          cliente: 'Energía Renovable',
          nomeProgetto: 'Subentro gruppo Madrid',
          citta: 'Madrid',
          stato: 'ES',
          teamTecnico: 'Team Emergenza ES',
          teamAPL: 'Team APL Spagna',
          sales: 'Juan Martinez',
          projectManager: 'Pedro Lopez',
          teamInstallazione: 'Madrid Rapid Team',
          dataCreazione: new Date('2024-03-13'),
          dataInizioInstallazione: new Date('2024-03-20'),
          dataFineInstallazione: new Date('2024-04-02'),
          versioneWIC: 'WIC-3.0',
          ultimaModifica: new Date('2024-03-20'),
          statoProgetto: ProjectStatus.CRITICAL,
          isInRitardo: true
        },

        // HOLD ON
        {
          numeroProgetto: 'PRJ-2024-011',
          cliente: 'ASL Milano',
          nomeProgetto: 'Blocco Amministrazione Digitale',
          citta: 'Milano',
          stato: 'IT',
          teamTecnico: 'Team Informatica Nord',
          teamAPL: 'Team APL Nord',
          sales: 'Greta Admin',
          projectManager: 'Riccardo Gallo',
          teamInstallazione: 'Installatori Digitale',
          dataCreazione: new Date('2024-01-19'),
          dataInizioInstallazione: new Date('2024-02-14'),
          dataFineInstallazione: new Date('2024-02-28'),
          versioneWIC: 'WIC-2.1',
          ultimaModifica: new Date('2024-01-22'),
          statoProgetto: ProjectStatus.HOLD_ON,
          isInRitardo: false,
          note: 'In attesa di approvazione'
        },
        {
          numeroProgetto: 'PRJ-2024-012',
          cliente: 'AcquaSana',
          nomeProgetto: 'Pausa impianto Parigi',
          citta: 'Paris',
          stato: 'FR',
          teamTecnico: 'Team Acque Francia',
          teamAPL: 'Team APL Europa Occidentale',
          sales: 'Jean Petit',
          projectManager: 'Francois Bleu',
          teamInstallazione: 'Parigi Installers',
          dataCreazione: new Date('2024-02-10'),
          dataInizioInstallazione: new Date('2024-03-04'),
          dataFineInstallazione: new Date('2024-03-18'),
          versioneWIC: 'WIC-1.7',
          ultimaModifica: new Date('2024-02-18'),
          statoProgetto: ProjectStatus.HOLD_ON,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-013',
          cliente: 'Azienda Agricola Sole',
          nomeProgetto: 'Blocco lavori Miami',
          citta: 'Miami',
          stato: 'US',
          teamTecnico: 'Team AG Florida',
          teamAPL: 'Team APL USA Sud',
          sales: 'Linda Latin',
          projectManager: 'Serena Piras',
          teamInstallazione: 'Florida Team',
          dataCreazione: new Date('2024-03-01'),
          dataInizioInstallazione: new Date('2024-03-14'),
          dataFineInstallazione: new Date('2024-04-10'),
          versioneWIC: 'WIC-2.0',
          ultimaModifica: new Date('2024-03-10'),
          statoProgetto: ProjectStatus.HOLD_ON,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-014',
          cliente: 'Farmacia Belvedere',
          nomeProgetto: 'Attesa autorizzazione sanitaria',
          citta: 'Brescia',
          stato: 'IT',
          teamTecnico: 'Team Autorizzazioni',
          teamAPL: 'Team APL Nord',
          sales: 'Luca Farmacista',
          projectManager: 'Beatrice Medico',
          teamInstallazione: 'Installatori Brescia',
          dataCreazione: new Date('2024-03-16'),
          dataInizioInstallazione: new Date('2024-04-01'),
          dataFineInstallazione: new Date('2024-04-24'),
          versioneWIC: 'WIC-2.2',
          ultimaModifica: new Date('2024-03-22'),
          statoProgetto: ProjectStatus.HOLD_ON,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-015',
          cliente: 'Farmacia Neuer Markt',
          nomeProgetto: 'Blocco lavori Berlino',
          citta: 'Berlin',
          stato: 'DE',
          teamTecnico: 'Team Salute DE',
          teamAPL: 'Team APL Europa Centrale',
          sales: 'Klaus Müller',
          projectManager: 'Ute Schwarz',
          teamInstallazione: 'Berlin Installers',
          dataCreazione: new Date('2024-03-06'),
          dataInizioInstallazione: new Date('2024-04-05'),
          dataFineInstallazione: new Date('2024-04-25'),
          versioneWIC: 'WIC-2.4',
          ultimaModifica: new Date('2024-03-19'),
          statoProgetto: ProjectStatus.HOLD_ON,
          isInRitardo: false
        },

        // RUSH
        {
          numeroProgetto: 'PRJ-2024-016',
          cliente: 'Immobiliare Roma SRL',
          nomeProgetto: 'Sistema Climatizzazione Roma Centro',
          citta: 'Roma',
          stato: 'IT',
          teamTecnico: 'Team HVAC Roma',
          teamAPL: 'Team APL Centro',
          sales: 'Laura Commerciale',
          projectManager: 'Giulia Bianchi',
          teamInstallazione: 'Squadra Elettrica Roma',
          dataCreazione: new Date('2024-04-10'),
          dataInizioInstallazione: new Date('2024-04-20'),
          dataFineInstallazione: new Date('2024-06-10'),
          versioneWIC: 'WIC-1.5',
          ultimaModifica: new Date('2024-04-15'),
          statoProgetto: ProjectStatus.RUSH,
          isInRitardo: false,
          note: 'Progetto prioritario per cliente'
        },
        {
          numeroProgetto: 'PRJ-2024-017',
          cliente: 'Wind Solution',
          nomeProgetto: 'Turbina Replacement',
          citta: 'Trieste',
          stato: 'IT',
          teamTecnico: 'Team Eolico NordEst',
          teamAPL: 'Team APL Nord',
          sales: 'Bruno Vento',
          projectManager: 'Daniela Brezza',
          teamInstallazione: 'Installatori Trieste',
          dataCreazione: new Date('2024-03-11'),
          dataInizioInstallazione: new Date('2024-03-22'),
          dataFineInstallazione: new Date('2024-04-04'),
          versioneWIC: 'WIC-2.0',
          ultimaModifica: new Date('2024-03-17'),
          statoProgetto: ProjectStatus.RUSH,
          isInRitardo: true
        },
        {
          numeroProgetto: 'PRJ-2024-018',
          cliente: 'Università Pisa',
          nomeProgetto: 'Aula Magna Restyling',
          citta: 'Pisa',
          stato: 'IT',
          teamTecnico: 'Team Architettura Toscana',
          teamAPL: 'Team APL Centro',
          sales: 'Matteo Studenti',
          projectManager: 'Rebecca Docente',
          teamInstallazione: 'Installatori Pisa',
          dataCreazione: new Date('2024-03-07'),
          dataInizioInstallazione: new Date('2024-03-13'),
          dataFineInstallazione: new Date('2024-03-21'),
          versioneWIC: 'WIC-1.8',
          ultimaModifica: new Date('2024-03-11'),
          statoProgetto: ProjectStatus.RUSH,
          isInRitardo: true
        },
        {
          numeroProgetto: 'PRJ-2024-019',
          cliente: 'Delta Stores',
          nomeProgetto: 'Ampliamento Centro Logistico Londra',
          citta: 'London',
          stato: 'UK',
          teamTecnico: 'Team Logistica UK',
          teamAPL: 'Team APL UK',
          sales: 'William Baker',
          projectManager: 'Michele Rossi',
          teamInstallazione: 'Installatori London',
          dataCreazione: new Date('2024-04-01'),
          dataInizioInstallazione: new Date('2024-04-18'),
          dataFineInstallazione: new Date('2024-05-31'),
          versioneWIC: 'WIC-2.2',
          ultimaModifica: new Date('2024-04-10'),
          statoProgetto: ProjectStatus.RUSH,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-020',
          cliente: 'Skyline Corp',
          nomeProgetto: 'Urgent Security Upgrade - Dallas',
          citta: 'Dallas',
          stato: 'US',
          teamTecnico: 'Team Security TX',
          teamAPL: 'Team APL USA',
          sales: 'Melissa White',
          projectManager: 'Ron Johnson',
          teamInstallazione: 'Dallas Installers',
          dataCreazione: new Date('2024-03-28'),
          dataInizioInstallazione: new Date('2024-03-31'),
          dataFineInstallazione: new Date('2024-04-10'),
          versioneWIC: 'WIC-2.6',
          ultimaModifica: new Date('2024-03-29'),
          statoProgetto: ProjectStatus.RUSH,
          isInRitardo: true
        },

        // TO CHECK
        {
          numeroProgetto: 'PRJ-2024-021',
          cliente: 'Supermercato Verde',
          nomeProgetto: 'Controllo Impianto Frigo',
          citta: 'Parma',
          stato: 'IT',
          teamTecnico: 'Team Frigoristi',
          teamAPL: 'Team APL Nord',
          sales: 'Valentina Fresca',
          projectManager: 'Mirko Neo',
          teamInstallazione: 'Installatori Parma',
          dataCreazione: new Date('2024-02-17'),
          dataInizioInstallazione: new Date('2024-03-01'),
          dataFineInstallazione: new Date('2024-03-03'),
          versioneWIC: 'WIC-2.1',
          ultimaModifica: new Date('2024-02-18'),
          statoProgetto: ProjectStatus.TO_CHECK,
          isInRitardo: false,
          note: 'Richiesta verifica finale'
        },
        {
          numeroProgetto: 'PRJ-2024-022',
          cliente: 'Hotel Solemar',
          nomeProgetto: 'Check clima camere - Bruxelles',
          citta: 'Brussels',
          stato: 'BE',
          teamTecnico: 'Team Clima BE',
          teamAPL: 'Team APL Benelux',
          sales: 'Lieve Janssens',
          projectManager: 'Marco Salini',
          teamInstallazione: 'Brussels Team',
          dataCreazione: new Date('2024-03-16'),
          dataInizioInstallazione: new Date('2024-03-22'),
          dataFineInstallazione: new Date('2024-03-27'),
          versioneWIC: 'WIC-2.0',
          ultimaModifica: new Date('2024-03-20'),
          statoProgetto: ProjectStatus.TO_CHECK,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-023',
          cliente: 'Parco Verde',
          nomeProgetto: 'Controllo irrigazione Barcellona',
          citta: 'Barcelona',
          stato: 'ES',
          teamTecnico: 'Team Verde ES',
          teamAPL: 'Team APL Spagna',
          sales: 'Josep Jordi',
          projectManager: 'Chiara Lago',
          teamInstallazione: 'Barcelona Team',
          dataCreazione: new Date('2024-02-25'),
          dataInizioInstallazione: new Date('2024-03-10'),
          dataFineInstallazione: new Date('2024-03-20'),
          versioneWIC: 'WIC-1.6',
          ultimaModifica: new Date('2024-03-11'),
          statoProgetto: ProjectStatus.TO_CHECK,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-024',
          cliente: 'Spazio Cultura',
          nomeProgetto: 'Verifica impianti sicurezza',
          citta: 'Roma',
          stato: 'IT',
          teamTecnico: 'Team Sicurezza Roma',
          teamAPL: 'Team APL Centro',
          sales: 'Francesca Terni',
          projectManager: 'Alberto Sicilia',
          teamInstallazione: 'Installatori Roma Centro',
          dataCreazione: new Date('2024-01-29'),
          dataInizioInstallazione: new Date('2024-02-10'),
          dataFineInstallazione: new Date('2024-02-23'),
          versioneWIC: 'WIC-1.8',
          ultimaModifica: new Date('2024-02-19'),
          statoProgetto: ProjectStatus.TO_CHECK,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-025',
          cliente: 'School of Dublin',
          nomeProgetto: 'Safety check gym',
          citta: 'Dublin',
          stato: 'IE',
          teamTecnico: 'Team Sicurezza IE',
          teamAPL: 'Team APL Irlanda',
          sales: 'Amanda Green',
          projectManager: 'Robert Kelly',
          teamInstallazione: 'Dublin Installers',
          dataCreazione: new Date('2024-03-03'),
          dataInizioInstallazione: new Date('2024-03-20'),
          dataFineInstallazione: new Date('2024-04-01'),
          versioneWIC: 'WIC-2.3',
          ultimaModifica: new Date('2024-03-17'),
          statoProgetto: ProjectStatus.TO_CHECK,
          isInRitardo: false
        },

        // UPCOMING
        {
          numeroProgetto: 'PRJ-2024-026',
          cliente: 'Napoli Centro',
          nomeProgetto: 'Ristrutturazione Impianti',
          citta: 'Napoli',
          stato: 'IT',
          teamTecnico: 'Team Idraulico Napoli',
          teamAPL: 'Team APL Sud',
          sales: 'Giuseppe Sud',
          projectManager: 'Antonio Verdi',
          teamInstallazione: 'Squadra Idraulica Napoli',
          dataCreazione: new Date('2024-01-20'),
          dataInizioInstallazione: new Date('2024-03-15'),
          dataFineInstallazione: new Date('2024-05-20'),
          versioneWIC: 'WIC-1.2',
          ultimaModifica: new Date('2024-02-01'),
          statoProgetto: ProjectStatus.UPCOMING,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-027',
          cliente: 'ItalGas',
          nomeProgetto: 'Nuova gas line - Amsterdam',
          citta: 'Amsterdam',
          stato: 'NL',
          teamTecnico: 'Team Gas NL',
          teamAPL: 'Team APL BeNeLux',
          sales: 'Tom Hoogland',
          projectManager: 'Silvio Explora',
          teamInstallazione: 'Installatori Amsterdam',
          dataCreazione: new Date('2024-03-10'),
          dataInizioInstallazione: new Date('2024-04-10'),
          dataFineInstallazione: new Date('2024-05-18'),
          versioneWIC: 'WIC-2.0',
          ultimaModifica: new Date('2024-03-20'),
          statoProgetto: ProjectStatus.UPCOMING,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-028',
          cliente: 'Sun Energy',
          nomeProgetto: 'Solar Impianto Phoenix',
          citta: 'Phoenix',
          stato: 'US',
          teamTecnico: 'Team Solar US',
          teamAPL: 'Team APL USA',
          sales: 'Chris Johnson',
          projectManager: 'Lucia Pugliese',
          teamInstallazione: 'Phoenix Installers',
          dataCreazione: new Date('2024-03-22'),
          dataInizioInstallazione: new Date('2024-04-01'),
          dataFineInstallazione: new Date('2024-04-25'),
          versioneWIC: 'WIC-2.2',
          ultimaModifica: new Date('2024-03-30'),
          statoProgetto: ProjectStatus.UPCOMING,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-029',
          cliente: 'St. Patrick School',
          nomeProgetto: 'Digital classrooms',
          citta: 'Edinburgh',
          stato: 'UK',
          teamTecnico: 'Team Digital Scozia',
          teamAPL: 'Team APL UK',
          sales: 'Roy Stewart',
          projectManager: 'Cecilia Digitale',
          teamInstallazione: 'Installatori Edinburgo',
          dataCreazione: new Date('2024-03-10'),
          dataInizioInstallazione: new Date('2024-04-14'),
          dataFineInstallazione: new Date('2024-05-18'),
          versioneWIC: 'WIC-2.3',
          ultimaModifica: new Date('2024-03-19'),
          statoProgetto: ProjectStatus.UPCOMING,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-030',
          cliente: 'Scuola Media Zara',
          nomeProgetto: 'Adeguamento classi digitali',
          citta: 'Pescara',
          stato: 'IT',
          teamTecnico: 'Team Digital Abruzzo',
          teamAPL: 'Team APL Centro',
          sales: 'Alessandro Infanzia',
          projectManager: 'Cecilia Digitale',
          teamInstallazione: 'Installatori Pescara',
          dataCreazione: new Date('2024-02-21'),
          dataInizioInstallazione: new Date('2024-04-07'),
          dataFineInstallazione: new Date('2024-05-02'),
          versioneWIC: 'WIC-2.0',
          ultimaModifica: new Date('2024-03-01'),
          statoProgetto: ProjectStatus.UPCOMING,
          isInRitardo: false
        },

        // PUSHED OUT
        {
          numeroProgetto: 'PRJ-2024-031',
          cliente: 'Biblioteca Comunale',
          nomeProgetto: 'Espansione sala lettura',
          citta: 'Frosinone',
          stato: 'IT',
          teamTecnico: 'Team Edilizia Lazio',
          teamAPL: 'Team APL Centro',
          sales: 'Sara Libro',
          projectManager: 'Antonietta Pagina',
          teamInstallazione: 'Installatori Frosinone',
          dataCreazione: new Date('2024-01-28'),
          dataInizioInstallazione: new Date('2024-03-25'),
          dataFineInstallazione: new Date('2024-04-19'),
          versioneWIC: 'WIC-1.6',
          ultimaModifica: new Date('2024-02-10'),
          statoProgetto: ProjectStatus.PUSHED_OUT,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-032',
          cliente: 'Comune di Trieste',
          nomeProgetto: 'Rinnovamento Palazzo Civico',
          citta: 'Trieste',
          stato: 'IT',
          teamTecnico: 'Team Rinnovo Triveneto',
          teamAPL: 'Team APL Nord',
          sales: 'Daniele Trieste',
          projectManager: 'Valeria Borghi',
          teamInstallazione: 'Installatori Triveneto',
          dataCreazione: new Date('2024-03-02'),
          dataInizioInstallazione: new Date('2024-04-01'),
          dataFineInstallazione: new Date('2024-06-19'),
          versioneWIC: 'WIC-2.2',
          ultimaModifica: new Date('2024-03-19'),
          statoProgetto: ProjectStatus.PUSHED_OUT,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-033',
          cliente: 'Istituto Tecnico Pisa',
          nomeProgetto: 'Laboratori Informatica Monaco',
          citta: 'Munich',
          stato: 'DE',
          teamTecnico: 'Team Tecnologia DE',
          teamAPL: 'Team APL Germania',
          sales: 'Markus Becker',
          projectManager: 'Simona Lab',
          teamInstallazione: 'Munich Team',
          dataCreazione: new Date('2024-02-22'),
          dataInizioInstallazione: new Date('2024-03-20'),
          dataFineInstallazione: new Date('2024-05-21'),
          versioneWIC: 'WIC-1.7',
          ultimaModifica: new Date('2024-03-11'),
          statoProgetto: ProjectStatus.PUSHED_OUT,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-034',
          cliente: 'Residenza Stella',
          nomeProgetto: 'Garage Coperto Zurigo',
          citta: 'Zurich',
          stato: 'CH',
          teamTecnico: 'Team Parcheggi CH',
          teamAPL: 'Team APL Svizzera',
          sales: 'Alina Huber',
          projectManager: 'Gabriella Luna',
          teamInstallazione: 'Zurich Installers',
          dataCreazione: new Date('2024-01-24'),
          dataInizioInstallazione: new Date('2024-04-18'),
          dataFineInstallazione: new Date('2024-05-28'),
          versioneWIC: 'WIC-1.9',
          ultimaModifica: new Date('2024-02-28'),
          statoProgetto: ProjectStatus.PUSHED_OUT,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-035',
          cliente: 'City Offices',
          nomeProgetto: 'Expansion project Toronto',
          citta: 'Toronto',
          stato: 'CA',
          teamTecnico: 'Team Edilizia CA',
          teamAPL: 'Team APL Canada',
          sales: 'Emily Scott',
          projectManager: 'Peter Carter',
          teamInstallazione: 'Toronto Builders',
          dataCreazione: new Date('2024-02-02'),
          dataInizioInstallazione: new Date('2024-03-23'),
          dataFineInstallazione: new Date('2024-05-15'),
          versioneWIC: 'WIC-3.1',
          ultimaModifica: new Date('2024-02-19'),
          statoProgetto: ProjectStatus.PUSHED_OUT,
          isInRitardo: false
        },

        // ON BID
        {
          numeroProgetto: 'PRJ-2024-036',
          cliente: 'Cooperativa Ovest',
          nomeProgetto: 'Nuovo Centro Commerciale',
          citta: 'Bologna',
          stato: 'IT',
          teamTecnico: 'Team Bid Ovest',
          teamAPL: 'Team APL Centro',
          sales: 'Luca Bid',
          projectManager: 'Stefania Gara',
          teamInstallazione: 'Installatori Ovest',
          dataCreazione: new Date('2024-03-14'),
          dataInizioInstallazione: new Date('2024-04-20'),
          dataFineInstallazione: new Date('2024-11-11'),
          versioneWIC: 'WIC-2.2',
          ultimaModifica: new Date('2024-03-18'),
          statoProgetto: ProjectStatus.ON_BID,
          isInRitardo: false,
          note: 'Fase gara - valutazione'
        },
        {
          numeroProgetto: 'PRJ-2024-037',
          cliente: 'Aeroporto Linate',
          nomeProgetto: 'Espansione Terminal',
          citta: 'Milano',
          stato: 'IT',
          teamTecnico: 'Team Aeroporto Milano',
          teamAPL: 'Team APL Nord',
          sales: 'Martina Fiume',
          projectManager: 'Giulio Scala',
          teamInstallazione: 'Installatori Linate',
          dataCreazione: new Date('2024-03-11'),
          dataInizioInstallazione: new Date('2024-05-07'),
          dataFineInstallazione: new Date('2024-12-15'),
          versioneWIC: 'WIC-2.5',
          ultimaModifica: new Date('2024-03-15'),
          statoProgetto: ProjectStatus.ON_BID,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-038',
          cliente: 'Sanità AV',
          nomeProgetto: 'Rinnovamento sale operatorie Parigi',
          citta: 'Paris',
          stato: 'FR',
          teamTecnico: 'Team Sale FR',
          teamAPL: 'Team APL Francia',
          sales: 'Pierre Dubois',
          projectManager: 'Vittoria Clinica',
          teamInstallazione: 'Paris Health Team',
          dataCreazione: new Date('2024-03-26'),
          dataInizioInstallazione: new Date('2024-07-18'),
          dataFineInstallazione: new Date('2024-10-24'),
          versioneWIC: 'WIC-2.1',
          ultimaModifica: new Date('2024-03-30'),
          statoProgetto: ProjectStatus.ON_BID,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-039',
          cliente: 'Cinema Alcione',
          nomeProgetto: 'Allestimento Sale 3D - Los Angeles',
          citta: 'Los Angeles',
          stato: 'US',
          teamTecnico: 'Team Cinema US',
          teamAPL: 'Team APL USA',
          sales: 'Samantha Movie',
          projectManager: 'Enrico Proiezione',
          teamInstallazione: 'LA Installers',
          dataCreazione: new Date('2024-03-16'),
          dataInizioInstallazione: new Date('2024-05-20'),
          dataFineInstallazione: new Date('2024-07-30'),
          versioneWIC: 'WIC-3.0',
          ultimaModifica: new Date('2024-03-18'),
          statoProgetto: ProjectStatus.ON_BID,
          isInRitardo: false
        },
        {
          numeroProgetto: 'PRJ-2024-040',
          cliente: 'EdilFuture',
          nomeProgetto: 'Gara nuovo campus Amburgo',
          citta: 'Hamburg',
          stato: 'DE',
          teamTecnico: 'Team Germany',
          teamAPL: 'Team APL Germania',
          sales: 'Jan Weber',
          projectManager: 'Laura Krause',
          teamInstallazione: 'Hamburg Builders',
          dataCreazione: new Date('2024-03-28'),
          dataInizioInstallazione: new Date('2024-06-01'),
          dataFineInstallazione: new Date('2024-09-25'),
          versioneWIC: 'WIC-3.3',
          ultimaModifica: new Date('2024-04-01'),
          statoProgetto: ProjectStatus.ON_BID,
          isInRitardo: false
        }
      ];
      sampleProjects.forEach(p => this.projects.push(p));
    }
  }
      
  // Stati
  getStati(): Stato[] {
    return [...this.stati];
  }

  findStato(id: number): Stato | undefined {
    return this.stati.find(s => s.id === id);
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

  // Users
  getUsers(): UserWithPassword[] {
    return [...this.users];
  }

  addUser(user: UserWithPassword): UserWithPassword {
    const newId = Math.max(...this.users.map(u => u.id || 0), 0) + 1;
    const newUser = { ...user, id: newId };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: number, user: UserWithPassword): UserWithPassword {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...user, id };
      return this.users[index];
    }
    throw new Error(`User with id ${id} not found`);
  }

  deleteUser(id: number): void {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
    } else {
      throw new Error(`User with id ${id} not found`);
    }
  }

  findUser(id: number): UserWithPassword | undefined {
    return this.users.find(u => u.id === id);
  }
}


import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Cliente, TeamTecnico, TeamAPL, Sales, ProjectManager, SquadraInstallazione, ProdottoMaster, Stato, Citta } from '../../models/lookup.model';

@Injectable({
  providedIn: 'root'
})
export class MockLookupService {
  private apiUrl = '/api/lookup';
  private http: any = null; // Mock http client
  private mockClienti: Cliente[] = [
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

  private mockTeamTecnici: TeamTecnico[] = [
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

  private mockTeamAPL: TeamAPL[] = [
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

  private mockSales: Sales[] = [
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

  private mockProjectManagers: ProjectManager[] = [
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

  private mockSquadreInstallazione: SquadraInstallazione[] = [
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

  private mockProdottiMaster: ProdottoMaster[] = [
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

  // Clienti
  getClienti(): Observable<Cliente[]> {
    return of([...this.mockClienti]).pipe(delay(300));
  }

  getCliente(id: number): Observable<Cliente> {
    const cliente = this.mockClienti.find(c => c.id === id);
    if (cliente) {
      return of({ ...cliente }).pipe(delay(200));
    }
    throw new Error(`Cliente with id ${id} not found`);
  }

  createCliente(cliente: Cliente): Observable<Cliente> {
    const newId = Math.max(...this.mockClienti.map(c => c.id || 0)) + 1;
    const newCliente = { ...cliente, id: newId };
    this.mockClienti.push(newCliente);
    return of(newCliente).pipe(delay(400));
  }

  updateCliente(id: number, cliente: Cliente): Observable<Cliente> {
    const index = this.mockClienti.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockClienti[index] = { ...cliente, id };
      return of(this.mockClienti[index]).pipe(delay(400));
    }
    throw new Error(`Cliente with id ${id} not found`);
  }

  deleteCliente(id: number): Observable<void> {
    const index = this.mockClienti.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockClienti.splice(index, 1);
      return of(undefined).pipe(delay(300));
    }
    throw new Error(`Cliente with id ${id} not found`);
  }

  searchClienti(searchTerm: string): Observable<Cliente[]> {
    const filtered = this.mockClienti.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.contatto?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return of(filtered).pipe(delay(300));
  }

  // Team Tecnici
  getTeamTecnici(): Observable<TeamTecnico[]> {
    return of([...this.mockTeamTecnici]).pipe(delay(300));
  }

  getTeamTecnico(id: number): Observable<TeamTecnico> {
    const team = this.mockTeamTecnici.find(t => t.id === id);
    if (team) {
      return of({ ...team }).pipe(delay(200));
    }
    throw new Error(`Team Tecnico with id ${id} not found`);
  }

  createTeamTecnico(team: TeamTecnico): Observable<TeamTecnico> {
    const newId = Math.max(...this.mockTeamTecnici.map(t => t.id || 0)) + 1;
    const newTeam = { ...team, id: newId };
    this.mockTeamTecnici.push(newTeam);
    return of(newTeam).pipe(delay(400));
  }

  updateTeamTecnico(id: number, team: TeamTecnico): Observable<TeamTecnico> {
    const index = this.mockTeamTecnici.findIndex(t => t.id === id);
    if (index !== -1) {
      this.mockTeamTecnici[index] = { ...team, id };
      return of(this.mockTeamTecnici[index]).pipe(delay(400));
    }
    throw new Error(`Team Tecnico with id ${id} not found`);
  }

  deleteTeamTecnico(id: number): Observable<void> {
    const index = this.mockTeamTecnici.findIndex(t => t.id === id);
    if (index !== -1) {
      this.mockTeamTecnici.splice(index, 1);
      return of(undefined).pipe(delay(300));
    }
    throw new Error(`Team Tecnico with id ${id} not found`);
  }

  // Team APL
  getTeamAPL(): Observable<TeamAPL[]> {
    return of([...this.mockTeamAPL]).pipe(delay(300));
  }

  getTeamAPLById(id: number): Observable<TeamAPL> {
    const team = this.mockTeamAPL.find(t => t.id === id);
    if (team) {
      return of({ ...team }).pipe(delay(200));
    }
    throw new Error(`Team APL with id ${id} not found`);
  }

  createTeamAPL(team: TeamAPL): Observable<TeamAPL> {
    const newId = Math.max(...this.mockTeamAPL.map(t => t.id || 0)) + 1;
    const newTeam = { ...team, id: newId };
    this.mockTeamAPL.push(newTeam);
    return of(newTeam).pipe(delay(400));
  }

  updateTeamAPL(id: number, team: TeamAPL): Observable<TeamAPL> {
    const index = this.mockTeamAPL.findIndex(t => t.id === id);
    if (index !== -1) {
      this.mockTeamAPL[index] = { ...team, id };
      return of(this.mockTeamAPL[index]).pipe(delay(400));
    }
    throw new Error(`Team APL with id ${id} not found`);
  }

  deleteTeamAPL(id: number): Observable<void> {
    const index = this.mockTeamAPL.findIndex(t => t.id === id);
    if (index !== -1) {
      this.mockTeamAPL.splice(index, 1);
      return of(undefined).pipe(delay(300));
    }
    throw new Error(`Team APL with id ${id} not found`);
  }

  // Sales
  getSales(): Observable<Sales[]> {
    return of([...this.mockSales]).pipe(delay(300));
  }

  getSalesById(id: number): Observable<Sales> {
    const sales = this.mockSales.find(s => s.id === id);
    if (sales) {
      return of({ ...sales }).pipe(delay(200));
    }
    throw new Error(`Sales with id ${id} not found`);
  }

  createSales(sales: Sales): Observable<Sales> {
    const newId = Math.max(...this.mockSales.map(s => s.id || 0)) + 1;
    const newSales = { ...sales, id: newId };
    this.mockSales.push(newSales);
    return of(newSales).pipe(delay(400));
  }

  updateSales(id: number, sales: Sales): Observable<Sales> {
    const index = this.mockSales.findIndex(s => s.id === id);
    if (index !== -1) {
      this.mockSales[index] = { ...sales, id };
      return of(this.mockSales[index]).pipe(delay(400));
    }
    throw new Error(`Sales with id ${id} not found`);
  }

  deleteSales(id: number): Observable<void> {
    const index = this.mockSales.findIndex(s => s.id === id);
    if (index !== -1) {
      this.mockSales.splice(index, 1);
      return of(undefined).pipe(delay(300));
    }
    throw new Error(`Sales with id ${id} not found`);
  }

  // Project Managers
  getProjectManagers(): Observable<ProjectManager[]> {
    return of([...this.mockProjectManagers]).pipe(delay(300));
  }

  getProjectManager(id: number): Observable<ProjectManager> {
    const pm = this.mockProjectManagers.find(p => p.id === id);
    if (pm) {
      return of({ ...pm }).pipe(delay(200));
    }
    throw new Error(`Project Manager with id ${id} not found`);
  }

  createProjectManager(pm: ProjectManager): Observable<ProjectManager> {
    const newId = Math.max(...this.mockProjectManagers.map(p => p.id || 0)) + 1;
    const newPM = { ...pm, id: newId };
    this.mockProjectManagers.push(newPM);
    return of(newPM).pipe(delay(400));
  }

  updateProjectManager(id: number, pm: ProjectManager): Observable<ProjectManager> {
    const index = this.mockProjectManagers.findIndex(p => p.id === id);
    if (index !== -1) {
      this.mockProjectManagers[index] = { ...pm, id };
      return of(this.mockProjectManagers[index]).pipe(delay(400));
    }
    throw new Error(`Project Manager with id ${id} not found`);
  }

  deleteProjectManager(id: number): Observable<void> {
    const index = this.mockProjectManagers.findIndex(p => p.id === id);
    if (index !== -1) {
      this.mockProjectManagers.splice(index, 1);
      return of(undefined).pipe(delay(300));
    }
    throw new Error(`Project Manager with id ${id} not found`);
  }

  // Squadre Installazione
  getSquadreInstallazione(): Observable<SquadraInstallazione[]> {
    return of([...this.mockSquadreInstallazione]).pipe(delay(300));
  }

  getSquadraInstallazione(id: number): Observable<SquadraInstallazione> {
    const squadra = this.mockSquadreInstallazione.find(s => s.id === id);
    if (squadra) {
      return of({ ...squadra }).pipe(delay(200));
    }
    throw new Error(`Squadra Installazione with id ${id} not found`);
  }

  createSquadraInstallazione(squadra: SquadraInstallazione): Observable<SquadraInstallazione> {
    const newId = Math.max(...this.mockSquadreInstallazione.map(s => s.id || 0)) + 1;
    const newSquadra = { ...squadra, id: newId };
    this.mockSquadreInstallazione.push(newSquadra);
    return of(newSquadra).pipe(delay(400));
  }

  updateSquadraInstallazione(id: number, squadra: SquadraInstallazione): Observable<SquadraInstallazione> {
    const index = this.mockSquadreInstallazione.findIndex(s => s.id === id);
    if (index !== -1) {
      this.mockSquadreInstallazione[index] = { ...squadra, id };
      return of(this.mockSquadreInstallazione[index]).pipe(delay(400));
    }
    throw new Error(`Squadra Installazione with id ${id} not found`);
  }

  deleteSquadraInstallazione(id: number): Observable<void> {
    const index = this.mockSquadreInstallazione.findIndex(s => s.id === id);
    if (index !== -1) {
      this.mockSquadreInstallazione.splice(index, 1);
      return of(undefined).pipe(delay(300));
    }
    throw new Error(`Squadra Installazione with id ${id} not found`);
  }

  // Prodotti Master
  getProdottiMaster(): Observable<ProdottoMaster[]> {
    return of([...this.mockProdottiMaster]).pipe(delay(300));
  }

  getProdottiMasterByCategoria(categoria: string): Observable<ProdottoMaster[]> {
    const filtered = this.mockProdottiMaster.filter(p => p.categoria === categoria);
    return of(filtered).pipe(delay(300));
  }

  getProdottoMaster(id: number): Observable<ProdottoMaster> {
    const prodotto = this.mockProdottiMaster.find(p => p.id === id);
    if (prodotto) {
      return of({ ...prodotto }).pipe(delay(200));
    }
    throw new Error(`Prodotto Master with id ${id} not found`);
  }

  createProdottoMaster(prodotto: ProdottoMaster): Observable<ProdottoMaster> {
    const newId = Math.max(...this.mockProdottiMaster.map(p => p.id || 0)) + 1;
    const newProdotto = { ...prodotto, id: newId };
    this.mockProdottiMaster.push(newProdotto);
    return of(newProdotto).pipe(delay(400));
  }

  updateProdottoMaster(id: number, prodotto: ProdottoMaster): Observable<ProdottoMaster> {
    const index = this.mockProdottiMaster.findIndex(p => p.id === id);
    if (index !== -1) {
      this.mockProdottiMaster[index] = { ...prodotto, id };
      return of(this.mockProdottiMaster[index]).pipe(delay(400));
    }
    throw new Error(`Prodotto Master with id ${id} not found`);
  }

  deleteProdottoMaster(id: number): Observable<void> {
    const index = this.mockProdottiMaster.findIndex(p => p.id === id);
    if (index !== -1) {
      this.mockProdottiMaster.splice(index, 1);
      return of(undefined).pipe(delay(300));
    }
    throw new Error(`Prodotto Master with id ${id} not found`);
  }

  // Stati
  getStati(): Observable<Stato[]> {
    return of([]).pipe(delay(300));
  }

  getStato(id: number): Observable<Stato> {
    throw new Error(`Stato with id ${id} not found`);
  }

  // Città
  getCitta(): Observable<Citta[]> {
    return of([]).pipe(delay(300));
  }

  getCittaByStato(statoId: number): Observable<Citta[]> {
    return of([]).pipe(delay(300));
  }

  getCittaById(id: number): Observable<Citta> {
    throw new Error(`Citta with id ${id} not found`);
  }
}

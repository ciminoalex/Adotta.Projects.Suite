import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Cliente, Stato, Citta, TeamTecnico, TeamAPL, Sales, ProjectManager, SquadraInstallazione, ProdottoMaster } from '../../models/lookup.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class MockLookupService {
  private apiUrl = '/api/lookup';
  private mockData: MockDataService;

  constructor(mockData?: MockDataService) {
    // Use singleton instance if not provided
    this.mockData = mockData || MockDataService.getInstance();
  }

  // Clienti
  getClienti(): Observable<Cliente[]> {
    return of(this.mockData.getClienti()).pipe(delay(300));
  }

  getCliente(id: number): Observable<Cliente> {
    const cliente = this.mockData.findCliente(id);
    if (cliente) {
      return of({ ...cliente }).pipe(delay(200));
    }
    throw new Error(`Cliente with id ${id} not found`);
  }

  createCliente(cliente: Cliente): Observable<Cliente> {
    const newCliente = this.mockData.addCliente(cliente);
    return of(newCliente).pipe(delay(400));
  }

  updateCliente(id: number, cliente: Cliente): Observable<Cliente> {
    const updated = this.mockData.updateCliente(id, cliente);
    return of(updated).pipe(delay(400));
  }

  deleteCliente(id: number): Observable<void> {
    this.mockData.deleteCliente(id);
    return of(undefined).pipe(delay(300));
  }

  searchClienti(searchTerm: string): Observable<Cliente[]> {
    const filtered = this.mockData.getClienti().filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.contatto?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return of(filtered).pipe(delay(300));
  }

  // Team Tecnici
  getTeamTecnici(): Observable<TeamTecnico[]> {
    return of(this.mockData.getTeamTecnici()).pipe(delay(300));
  }

  getTeamTecnico(id: number): Observable<TeamTecnico> {
    const team = this.mockData.getTeamTecnici().find(t => t.id === id);
    if (team) {
      return of({ ...team }).pipe(delay(200));
    }
    throw new Error(`Team Tecnico with id ${id} not found`);
  }

  createTeamTecnico(team: TeamTecnico): Observable<TeamTecnico> {
    const newTeam = this.mockData.addTeamTecnico(team);
    return of(newTeam).pipe(delay(400));
  }

  updateTeamTecnico(id: number, team: TeamTecnico): Observable<TeamTecnico> {
    const updated = this.mockData.updateTeamTecnico(id, team);
    return of(updated).pipe(delay(400));
  }

  deleteTeamTecnico(id: number): Observable<void> {
    this.mockData.deleteTeamTecnico(id);
    return of(undefined).pipe(delay(300));
  }

  // Team APL
  getTeamAPL(): Observable<TeamAPL[]> {
    return of(this.mockData.getTeamAPL()).pipe(delay(300));
  }

  getTeamAPLById(id: number): Observable<TeamAPL> {
    const team = this.mockData.getTeamAPL().find(t => t.id === id);
    if (team) {
      return of({ ...team }).pipe(delay(200));
    }
    throw new Error(`Team APL with id ${id} not found`);
  }

  createTeamAPL(team: TeamAPL): Observable<TeamAPL> {
    const newTeam = this.mockData.addTeamAPL(team);
    return of(newTeam).pipe(delay(400));
  }

  updateTeamAPL(id: number, team: TeamAPL): Observable<TeamAPL> {
    const updated = this.mockData.updateTeamAPL(id, team);
    return of(updated).pipe(delay(400));
  }

  deleteTeamAPL(id: number): Observable<void> {
    this.mockData.deleteTeamAPL(id);
    return of(undefined).pipe(delay(300));
  }

  // Sales
  getSales(): Observable<Sales[]> {
    return of(this.mockData.getSales()).pipe(delay(300));
  }

  getSalesById(id: number): Observable<Sales> {
    const sales = this.mockData.getSales().find(s => s.id === id);
    if (sales) {
      return of({ ...sales }).pipe(delay(200));
    }
    throw new Error(`Sales with id ${id} not found`);
  }

  createSales(sales: Sales): Observable<Sales> {
    const newSales = this.mockData.addSales(sales);
    return of(newSales).pipe(delay(400));
  }

  updateSales(id: number, sales: Sales): Observable<Sales> {
    const updated = this.mockData.updateSales(id, sales);
    return of(updated).pipe(delay(400));
  }

  deleteSales(id: number): Observable<void> {
    this.mockData.deleteSales(id);
    return of(undefined).pipe(delay(300));
  }

  // Project Managers
  getProjectManagers(): Observable<ProjectManager[]> {
    return of(this.mockData.getProjectManagers()).pipe(delay(300));
  }

  getProjectManager(id: number): Observable<ProjectManager> {
    const pm = this.mockData.getProjectManagers().find(p => p.id === id);
    if (pm) {
      return of({ ...pm }).pipe(delay(200));
    }
    throw new Error(`Project Manager with id ${id} not found`);
  }

  createProjectManager(pm: ProjectManager): Observable<ProjectManager> {
    const newPM = this.mockData.addProjectManager(pm);
    return of(newPM).pipe(delay(400));
  }

  updateProjectManager(id: number, pm: ProjectManager): Observable<ProjectManager> {
    const updated = this.mockData.updateProjectManager(id, pm);
    return of(updated).pipe(delay(400));
  }

  deleteProjectManager(id: number): Observable<void> {
    this.mockData.deleteProjectManager(id);
    return of(undefined).pipe(delay(300));
  }

  // Squadre Installazione
  getSquadreInstallazione(): Observable<SquadraInstallazione[]> {
    return of(this.mockData.getSquadreInstallazione()).pipe(delay(300));
  }

  getSquadraInstallazione(id: number): Observable<SquadraInstallazione> {
    const squadra = this.mockData.getSquadreInstallazione().find(s => s.id === id);
    if (squadra) {
      return of({ ...squadra }).pipe(delay(200));
    }
    throw new Error(`Squadra Installazione with id ${id} not found`);
  }

  createSquadraInstallazione(squadra: SquadraInstallazione): Observable<SquadraInstallazione> {
    const newSquadra = this.mockData.addSquadraInstallazione(squadra);
    return of(newSquadra).pipe(delay(400));
  }

  updateSquadraInstallazione(id: number, squadra: SquadraInstallazione): Observable<SquadraInstallazione> {
    const updated = this.mockData.updateSquadraInstallazione(id, squadra);
    return of(updated).pipe(delay(400));
  }

  deleteSquadraInstallazione(id: number): Observable<void> {
    this.mockData.deleteSquadraInstallazione(id);
    return of(undefined).pipe(delay(300));
  }

  // Prodotti Master
  getProdottiMaster(): Observable<ProdottoMaster[]> {
    return of(this.mockData.getProdottiMaster()).pipe(delay(300));
  }

  getProdottiMasterByCategoria(categoria: string): Observable<ProdottoMaster[]> {
    const filtered = this.mockData.getProdottiMaster().filter(p => p.categoria === categoria);
    return of(filtered).pipe(delay(300));
  }

  getProdottoMaster(id: number): Observable<ProdottoMaster> {
    const prodotto = this.mockData.getProdottiMaster().find(p => p.id === id);
    if (prodotto) {
      return of({ ...prodotto }).pipe(delay(200));
    }
    throw new Error(`Prodotto Master with id ${id} not found`);
  }

  createProdottoMaster(prodotto: ProdottoMaster): Observable<ProdottoMaster> {
    const newProdotto = this.mockData.addProdottoMaster(prodotto);
    return of(newProdotto).pipe(delay(400));
  }

  updateProdottoMaster(id: number, prodotto: ProdottoMaster): Observable<ProdottoMaster> {
    const updated = this.mockData.updateProdottoMaster(id, prodotto);
    return of(updated).pipe(delay(400));
  }

  deleteProdottoMaster(id: number): Observable<void> {
    this.mockData.deleteProdottoMaster(id);
    return of(undefined).pipe(delay(300));
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

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, Stato, Citta, TeamTecnico, TeamAPL, Sales, ProjectManager, SquadraInstallazione, ProdottoMaster } from '../models/lookup.model';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private apiUrl = '/api/lookup';

  constructor(private http: HttpClient) {}

  // Clienti
  getClienti(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/clienti`);
  }

  getCliente(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/clienti/${id}`);
  }

  createCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.apiUrl}/clienti`, cliente);
  }

  updateCliente(id: string, cliente: Cliente): Observable<Cliente> {
    // Note: This endpoint is not in swagger
    return this.http.put<Cliente>(`${this.apiUrl}/clienti/${id}`, cliente);
  }

  deleteCliente(id: string): Observable<void> {
    // Note: This endpoint is not in swagger
    return this.http.delete<void>(`${this.apiUrl}/clienti/${id}`);
  }

  searchClienti(searchTerm: string): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/clienti/search?q=${encodeURIComponent(searchTerm)}`);
  }

  // Stati
  getStati(): Observable<Stato[]> {
    return this.http.get<Stato[]>(`${this.apiUrl}/stati`);
  }

  getStato(id: number): Observable<Stato> {
    return this.http.get<Stato>(`${this.apiUrl}/stati/${id}`);
  }

  // Città
  getCitta(): Observable<Citta[]> {
    return this.http.get<Citta[]>(`${this.apiUrl}/citta`);
  }

  getCittaByStato(statoId: string): Observable<Citta[]> {
    return this.http.get<Citta[]>(`${this.apiUrl}/citta?statoId=${statoId}`);
  }

  getCittaById(id: number): Observable<Citta> {
    return this.http.get<Citta>(`${this.apiUrl}/citta/${id}`);
  }

  // Team Tecnici
  getTeamTecnici(): Observable<TeamTecnico[]> {
    return this.http.get<TeamTecnico[]>(`${this.apiUrl}/team-tecnici`);
  }

  getTeamTecnico(id: number): Observable<TeamTecnico> {
    return this.http.get<TeamTecnico>(`${this.apiUrl}/team-tecnici/${id}`);
  }

  createTeamTecnico(team: TeamTecnico): Observable<TeamTecnico> {
    return this.http.post<TeamTecnico>(`${this.apiUrl}/team-tecnici`, team);
  }

  updateTeamTecnico(id: number, team: TeamTecnico): Observable<TeamTecnico> {
    return this.http.put<TeamTecnico>(`${this.apiUrl}/team-tecnici/${id}`, team);
  }

  deleteTeamTecnico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/team-tecnici/${id}`);
  }

  // Team APL
  getTeamAPL(): Observable<TeamAPL[]> {
    return this.http.get<TeamAPL[]>(`${this.apiUrl}/team-apl`);
  }

  getTeamAPLById(id: number): Observable<TeamAPL> {
    return this.http.get<TeamAPL>(`${this.apiUrl}/team-apl/${id}`);
  }

  createTeamAPL(team: TeamAPL): Observable<TeamAPL> {
    return this.http.post<TeamAPL>(`${this.apiUrl}/team-apl`, team);
  }

  updateTeamAPL(id: number, team: TeamAPL): Observable<TeamAPL> {
    return this.http.put<TeamAPL>(`${this.apiUrl}/team-apl/${id}`, team);
  }

  deleteTeamAPL(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/team-apl/${id}`);
  }

  // Sales
  getSales(): Observable<Sales[]> {
    return this.http.get<Sales[]>(`${this.apiUrl}/sales`);
  }

  getSalesById(id: number): Observable<Sales> {
    return this.http.get<Sales>(`${this.apiUrl}/sales/${id}`);
  }

  createSales(sales: Sales): Observable<Sales> {
    return this.http.post<Sales>(`${this.apiUrl}/sales`, sales);
  }

  updateSales(id: number, sales: Sales): Observable<Sales> {
    return this.http.put<Sales>(`${this.apiUrl}/sales/${id}`, sales);
  }

  deleteSales(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sales/${id}`);
  }

  // Project Managers
  getProjectManagers(): Observable<ProjectManager[]> {
    return this.http.get<ProjectManager[]>(`${this.apiUrl}/project-managers`);
  }

  getProjectManager(id: number): Observable<ProjectManager> {
    return this.http.get<ProjectManager>(`${this.apiUrl}/project-managers/${id}`);
  }

  createProjectManager(pm: ProjectManager): Observable<ProjectManager> {
    return this.http.post<ProjectManager>(`${this.apiUrl}/project-managers`, pm);
  }

  updateProjectManager(id: number, pm: ProjectManager): Observable<ProjectManager> {
    return this.http.put<ProjectManager>(`${this.apiUrl}/project-managers/${id}`, pm);
  }

  deleteProjectManager(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/project-managers/${id}`);
  }

  // Squadre Installazione
  getSquadreInstallazione(): Observable<SquadraInstallazione[]> {
    return this.http.get<SquadraInstallazione[]>(`${this.apiUrl}/squadre-installazione`);
  }

  getSquadraInstallazione(id: number): Observable<SquadraInstallazione> {
    return this.http.get<SquadraInstallazione>(`${this.apiUrl}/squadre-installazione/${id}`);
  }

  createSquadraInstallazione(squadra: SquadraInstallazione): Observable<SquadraInstallazione> {
    return this.http.post<SquadraInstallazione>(`${this.apiUrl}/squadre-installazione`, squadra);
  }

  updateSquadraInstallazione(id: number, squadra: SquadraInstallazione): Observable<SquadraInstallazione> {
    return this.http.put<SquadraInstallazione>(`${this.apiUrl}/squadre-installazione/${id}`, squadra);
  }

  deleteSquadraInstallazione(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/squadre-installazione/${id}`);
  }

  // Prodotti Master
  getProdottiMaster(): Observable<ProdottoMaster[]> {
    return this.http.get<ProdottoMaster[]>(`${this.apiUrl}/prodotti-master`);
  }

  getProdottiMasterByCategoria(categoria: string): Observable<ProdottoMaster[]> {
    return this.http.get<ProdottoMaster[]>(`${this.apiUrl}/prodotti-master?categoria=${categoria}`);
  }

  getProdottoMaster(id: number): Observable<ProdottoMaster> {
    return this.http.get<ProdottoMaster>(`${this.apiUrl}/prodotti-master/${id}`);
  }

  createProdottoMaster(prodotto: ProdottoMaster): Observable<ProdottoMaster> {
    return this.http.post<ProdottoMaster>(`${this.apiUrl}/prodotti-master`, prodotto);
  }

  updateProdottoMaster(id: number, prodotto: ProdottoMaster): Observable<ProdottoMaster> {
    return this.http.put<ProdottoMaster>(`${this.apiUrl}/prodotti-master/${id}`, prodotto);
  }

  deleteProdottoMaster(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/prodotti-master/${id}`);
  }
}

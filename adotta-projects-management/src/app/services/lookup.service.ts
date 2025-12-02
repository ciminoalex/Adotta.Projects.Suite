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
  getClienti(
    page: number = 1,
    pageSize: number = 20,
    search?: string | null,
    sortBy?: string | null,
    sortDirection?: string | null
  ): Observable<any> {
    const queryParams: string[] = [`page=${page}`, `pageSize=${pageSize}`];
    if (search && search.trim() !== '') {
      queryParams.push(`search=${encodeURIComponent(search.trim())}`);
    }
    if (sortBy && sortBy.trim() !== '') {
      queryParams.push(`sortBy=${encodeURIComponent(sortBy.trim())}`);
    }
    if (sortDirection && sortDirection.trim() !== '') {
      queryParams.push(`sortDirection=${encodeURIComponent(sortDirection.trim())}`);
    }
    const params = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    return this.http.get<any>(`${this.apiUrl}/clienti${params}`);
  }

  getCliente(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/clienti/${id}`);
  }

  createCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.apiUrl}/clienti`, cliente);
  }

  updateCliente(id: string, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/clienti/${id}`, cliente);
  }

  deleteCliente(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clienti/${id}`);
  }

  searchClienti(searchTerm: string): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/clienti/search?q=${encodeURIComponent(searchTerm)}`);
  }

  // Stati
  getStati(pageSize?: number): Observable<Stato[]> {
    const params = pageSize ? `?pageSize=${pageSize}` : '';
    return this.http.get<Stato[]>(`${this.apiUrl}/stati${params}`);
  }

  getStato(id: string): Observable<Stato> {
    return this.http.get<Stato>(`${this.apiUrl}/stati/${id}`);
  }

  // Città
  getCitta(): Observable<Citta[]> {
    return this.http.get<Citta[]>(`${this.apiUrl}/citta`);
  }

  getCittaByStato(statoId: string): Observable<Citta[]> {
    return this.http.get<Citta[]>(`${this.apiUrl}/citta?statoId=${statoId}`);
  }

  getCittaById(id: string): Observable<Citta> {
    return this.http.get<Citta>(`${this.apiUrl}/citta/${id}`);
  }

  createCitta(citta: Citta): Observable<Citta> {
    return this.http.post<Citta>(`${this.apiUrl}/citta`, citta);
  }

  updateCitta(id: string, citta: Citta): Observable<Citta> {
    return this.http.put<Citta>(`${this.apiUrl}/citta/${id}`, citta);
  }

  deleteCitta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/citta/${id}`);
  }

  // Team Tecnici
  getTeamTecnici(): Observable<TeamTecnico[]> {
    return this.http.get<TeamTecnico[]>(`${this.apiUrl}/team-tecnici`);
  }

  getTeamTecnico(id: string): Observable<TeamTecnico> {
    return this.http.get<TeamTecnico>(`${this.apiUrl}/team-tecnici/${id}`);
  }

  createTeamTecnico(team: TeamTecnico): Observable<TeamTecnico> {
    return this.http.post<TeamTecnico>(`${this.apiUrl}/team-tecnici`, team);
  }

  updateTeamTecnico(id: string, team: TeamTecnico): Observable<TeamTecnico> {
    return this.http.put<TeamTecnico>(`${this.apiUrl}/team-tecnici/${id}`, team);
  }

  deleteTeamTecnico(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/team-tecnici/${id}`);
  }

  // Team APL
  getTeamAPL(): Observable<TeamAPL[]> {
    return this.http.get<TeamAPL[]>(`${this.apiUrl}/team-apl`);
  }

  getTeamAPLById(id: string): Observable<TeamAPL> {
    return this.http.get<TeamAPL>(`${this.apiUrl}/team-apl/${id}`);
  }

  createTeamAPL(team: TeamAPL): Observable<TeamAPL> {
    return this.http.post<TeamAPL>(`${this.apiUrl}/team-apl`, team);
  }

  updateTeamAPL(id: string, team: TeamAPL): Observable<TeamAPL> {
    return this.http.put<TeamAPL>(`${this.apiUrl}/team-apl/${id}`, team);
  }

  deleteTeamAPL(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/team-apl/${id}`);
  }

  // Sales
  getSales(): Observable<Sales[]> {
    return this.http.get<Sales[]>(`${this.apiUrl}/sales`);
  }

  getSalesById(id: string): Observable<Sales> {
    return this.http.get<Sales>(`${this.apiUrl}/sales/${id}`);
  }

  createSales(sales: Sales): Observable<Sales> {
    return this.http.post<Sales>(`${this.apiUrl}/sales`, sales);
  }

  updateSales(id: string, sales: Sales): Observable<Sales> {
    return this.http.put<Sales>(`${this.apiUrl}/sales/${id}`, sales);
  }

  deleteSales(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sales/${id}`);
  }

  // Project Managers
  getProjectManagers(): Observable<ProjectManager[]> {
    return this.http.get<ProjectManager[]>(`${this.apiUrl}/project-managers`);
  }

  getProjectManager(id: string): Observable<ProjectManager> {
    return this.http.get<ProjectManager>(`${this.apiUrl}/project-managers/${id}`);
  }

  createProjectManager(pm: ProjectManager): Observable<ProjectManager> {
    return this.http.post<ProjectManager>(`${this.apiUrl}/project-managers`, pm);
  }

  updateProjectManager(id: string, pm: ProjectManager): Observable<ProjectManager> {
    return this.http.put<ProjectManager>(`${this.apiUrl}/project-managers/${id}`, pm);
  }

  deleteProjectManager(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/project-managers/${id}`);
  }

  // Squadre Installazione
  getSquadreInstallazione(): Observable<SquadraInstallazione[]> {
    return this.http.get<SquadraInstallazione[]>(`${this.apiUrl}/squadre-installazione`);
  }

  getSquadraInstallazione(id: string): Observable<SquadraInstallazione> {
    return this.http.get<SquadraInstallazione>(`${this.apiUrl}/squadre-installazione/${id}`);
  }

  createSquadraInstallazione(squadra: SquadraInstallazione): Observable<SquadraInstallazione> {
    return this.http.post<SquadraInstallazione>(`${this.apiUrl}/squadre-installazione`, squadra);
  }

  updateSquadraInstallazione(id: string, squadra: SquadraInstallazione): Observable<SquadraInstallazione> {
    return this.http.put<SquadraInstallazione>(`${this.apiUrl}/squadre-installazione/${id}`, squadra);
  }

  deleteSquadraInstallazione(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/squadre-installazione/${id}`);
  }

  // Prodotti Master
  getProdottiMaster(): Observable<ProdottoMaster[]> {
    return this.http.get<ProdottoMaster[]>(`${this.apiUrl}/prodotti-master`);
  }

  getProdottiMasterByCategoria(categoria: string): Observable<ProdottoMaster[]> {
    return this.http.get<ProdottoMaster[]>(`${this.apiUrl}/prodotti-master?categoria=${categoria}`);
  }

  getProdottoMaster(id: string): Observable<ProdottoMaster> {
    return this.http.get<ProdottoMaster>(`${this.apiUrl}/prodotti-master/${id}`);
  }

  createProdottoMaster(prodotto: ProdottoMaster): Observable<ProdottoMaster> {
    return this.http.post<ProdottoMaster>(`${this.apiUrl}/prodotti-master`, prodotto);
  }

  updateProdottoMaster(id: string, prodotto: ProdottoMaster): Observable<ProdottoMaster> {
    return this.http.put<ProdottoMaster>(`${this.apiUrl}/prodotti-master/${id}`, prodotto);
  }

  deleteProdottoMaster(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/prodotti-master/${id}`);
  }
}

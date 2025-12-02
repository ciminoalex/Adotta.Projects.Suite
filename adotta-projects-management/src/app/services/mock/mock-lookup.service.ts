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
  getClienti(
    page: number = 1,
    pageSize: number = 20,
    search?: string | null,
    sortBy?: string | null,
    sortDirection?: string | null
  ): Observable<any> {
    let allClienti = this.mockData.getClienti();

    // Applica filtro di ricerca se presente
    if (search && search.trim() !== '') {
      const term = search.toLowerCase();
      allClienti = allClienti.filter(cliente =>
        cliente.nome.toLowerCase().includes(term) ||
        cliente.email?.toLowerCase().includes(term) ||
        cliente.contatto?.toLowerCase().includes(term)
      );
    }

    // Applica ordinamento se specificato
    if (sortBy && sortBy.trim() !== '') {
      const field = sortBy as keyof Cliente;
      const direction = (sortDirection || 'asc').toLowerCase();
      allClienti = [...allClienti].sort((a: any, b: any) => {
        const va = (a?.[field] ?? '') as any;
        const vb = (b?.[field] ?? '') as any;
        if (va == null && vb == null) return 0;
        if (va == null) return direction === 'asc' ? -1 : 1;
        if (vb == null) return direction === 'asc' ? 1 : -1;
        if (typeof va === 'string' && typeof vb === 'string') {
          const cmp = va.localeCompare(vb, 'it-IT', { sensitivity: 'base' });
          return direction === 'asc' ? cmp : -cmp;
        }
        if (va < vb) return direction === 'asc' ? -1 : 1;
        if (va > vb) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const totalCount = allClienti.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const items = allClienti.slice(startIndex, startIndex + pageSize);

    const pagedResult = {
      items,
      totalCount,
      page: currentPage,
      pageSize,
      totalPages,
      hasPrevious: currentPage > 1,
      hasNext: currentPage < totalPages
    };

    return of(pagedResult).pipe(delay(300));
  }

  getCliente(id: string): Observable<Cliente> {
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

  updateCliente(id: string, cliente: Cliente): Observable<Cliente> {
    const updated = this.mockData.updateCliente(id, cliente);
    return of(updated).pipe(delay(400));
  }

  deleteCliente(id: string): Observable<void> {
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

  getTeamTecnico(id: string): Observable<TeamTecnico> {
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

  updateTeamTecnico(id: string, team: TeamTecnico): Observable<TeamTecnico> {
    const updated = this.mockData.updateTeamTecnico(id, team);
    return of(updated).pipe(delay(400));
  }

  deleteTeamTecnico(id: string): Observable<void> {
    this.mockData.deleteTeamTecnico(id);
    return of(undefined).pipe(delay(300));
  }

  // Team APL
  getTeamAPL(): Observable<TeamAPL[]> {
    return of(this.mockData.getTeamAPL()).pipe(delay(300));
  }

  getTeamAPLById(id: string): Observable<TeamAPL> {
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

  updateTeamAPL(id: string, team: TeamAPL): Observable<TeamAPL> {
    const updated = this.mockData.updateTeamAPL(id, team);
    return of(updated).pipe(delay(400));
  }

  deleteTeamAPL(id: string): Observable<void> {
    this.mockData.deleteTeamAPL(id);
    return of(undefined).pipe(delay(300));
  }

  // Sales
  getSales(): Observable<Sales[]> {
    return of(this.mockData.getSales()).pipe(delay(300));
  }

  getSalesById(id: string): Observable<Sales> {
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

  updateSales(id: string, sales: Sales): Observable<Sales> {
    const updated = this.mockData.updateSales(id, sales);
    return of(updated).pipe(delay(400));
  }

  deleteSales(id: string): Observable<void> {
    this.mockData.deleteSales(id);
    return of(undefined).pipe(delay(300));
  }

  // Project Managers
  getProjectManagers(): Observable<ProjectManager[]> {
    return of(this.mockData.getProjectManagers()).pipe(delay(300));
  }

  getProjectManager(id: string): Observable<ProjectManager> {
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

  updateProjectManager(id: string, pm: ProjectManager): Observable<ProjectManager> {
    const updated = this.mockData.updateProjectManager(id, pm);
    return of(updated).pipe(delay(400));
  }

  deleteProjectManager(id: string): Observable<void> {
    this.mockData.deleteProjectManager(id);
    return of(undefined).pipe(delay(300));
  }

  // Squadre Installazione
  getSquadreInstallazione(): Observable<SquadraInstallazione[]> {
    return of(this.mockData.getSquadreInstallazione()).pipe(delay(300));
  }

  getSquadraInstallazione(id: string): Observable<SquadraInstallazione> {
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

  updateSquadraInstallazione(id: string, squadra: SquadraInstallazione): Observable<SquadraInstallazione> {
    const updated = this.mockData.updateSquadraInstallazione(id, squadra);
    return of(updated).pipe(delay(400));
  }

  deleteSquadraInstallazione(id: string): Observable<void> {
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

  getProdottoMaster(id: string): Observable<ProdottoMaster> {
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

  updateProdottoMaster(id: string, prodotto: ProdottoMaster): Observable<ProdottoMaster> {
    const updated = this.mockData.updateProdottoMaster(id, prodotto);
    return of(updated).pipe(delay(400));
  }

  deleteProdottoMaster(id: string): Observable<void> {
    this.mockData.deleteProdottoMaster(id);
    return of(undefined).pipe(delay(300));
  }

  // Stati
  getStati(): Observable<Stato[]> {
    return of(this.mockData.getStati()).pipe(delay(300));
  }

  getStato(id: string): Observable<Stato> {
    const stato = this.mockData.findStato(id);
    if (stato) {
      return of({ ...stato }).pipe(delay(200));
    }
    throw new Error(`Stato with id ${id} not found`);
  }

  // Città
  getCitta(): Observable<Citta[]> {
    return of([]).pipe(delay(300));
  }

  getCittaByStato(statoId: string): Observable<Citta[]> {
    return of([]).pipe(delay(300));
  }

  getCittaById(id: string): Observable<Citta> {
    throw new Error(`Citta with id ${id} not found`);
  }

  createCitta(citta: Citta): Observable<Citta> {
    return of(citta).pipe(delay(400));
  }

  updateCitta(id: string, citta: Citta): Observable<Citta> {
    return of(citta).pipe(delay(400));
  }

  deleteCitta(id: string): Observable<void> {
    return of(undefined).pipe(delay(300));
  }
}

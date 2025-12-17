import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Project, LivelloProgetto, ProdottoProgetto, StoricoModifica, MessaggioProgetto, ChangeLog, OrdineClienteDto } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = '/api/projects';
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  public projects$ = this.projectsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // CRUD Operations
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getProject(numeroProgetto: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${numeroProgetto}`);
  }

  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  updateProject(numeroProgetto: string, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${numeroProgetto}`, project);
  }

  patchProject(numeroProgetto: string, partial: Partial<Project>): Observable<Project> {
    return this.http.patch<Project>(`${this.apiUrl}/${numeroProgetto}`, partial);
  }

  deleteProject(numeroProgetto: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${numeroProgetto}`);
  }

  // Livelli Progetto
  getLivelliProgetto(numeroProgetto: string): Observable<LivelloProgetto[]> {
    return this.http.get<LivelloProgetto[]>(`${this.apiUrl}/${numeroProgetto}/livelli`);
  }

  addLivelloProgetto(numeroProgetto: string, livello: LivelloProgetto): Observable<LivelloProgetto> {
    return this.http.post<LivelloProgetto>(`${this.apiUrl}/${numeroProgetto}/livelli`, livello);
  }

  updateLivelloProgetto(numeroProgetto: string, livelloId: number, livello: LivelloProgetto): Observable<LivelloProgetto> {
    return this.http.put<LivelloProgetto>(`${this.apiUrl}/${numeroProgetto}/livelli/${livelloId}`, livello);
  }

  deleteLivelloProgetto(numeroProgetto: string, livelloId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${numeroProgetto}/livelli/${livelloId}`);
  }

  // Prodotti Progetto
  getProdottiProgetto(numeroProgetto: string): Observable<ProdottoProgetto[]> {
    return this.http.get<ProdottoProgetto[]>(`${this.apiUrl}/${numeroProgetto}/prodotti`);
  }

  getProdottiByLivello(numeroProgetto: string, livelloId: number): Observable<ProdottoProgetto[]> {
    return this.http.get<ProdottoProgetto[]>(`${this.apiUrl}/${numeroProgetto}/livelli/${livelloId}/prodotti`);
  }

  addProdottoProgetto(numeroProgetto: string, prodotto: ProdottoProgetto): Observable<ProdottoProgetto> {
    if (prodotto.livelloId) {
      return this.http.post<ProdottoProgetto>(`${this.apiUrl}/${numeroProgetto}/livelli/${prodotto.livelloId}/prodotti`, prodotto);
    }
    return this.http.post<ProdottoProgetto>(`${this.apiUrl}/${numeroProgetto}/prodotti`, prodotto);
  }

  updateProdottoProgetto(numeroProgetto: string, prodottoId: number, prodotto: ProdottoProgetto): Observable<ProdottoProgetto> {
    return this.http.put<ProdottoProgetto>(`${this.apiUrl}/${numeroProgetto}/prodotti/${prodottoId}`, prodotto);
  }

  deleteProdottoProgetto(numeroProgetto: string, prodottoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${numeroProgetto}/prodotti/${prodottoId}`);
  }

  // Storico Modifiche WIC
  getStoricoModifiche(numeroProgetto: string): Observable<StoricoModifica[]> {
    return this.http.get<StoricoModifica[]>(`${this.apiUrl}/${numeroProgetto}/storico`);
  }

  createSnapshotWIC(numeroProgetto: string): Observable<StoricoModifica[]> {
    return this.http.post<StoricoModifica[]>(`${this.apiUrl}/${numeroProgetto}/wic-snapshot`, {});
  }

  // Messaggi Progetto
  getMessaggiProgetto(numeroProgetto: string): Observable<MessaggioProgetto[]> {
    return this.http.get<MessaggioProgetto[]>(`${this.apiUrl}/${numeroProgetto}/messaggi`);
  }

  addMessaggioProgetto(numeroProgetto: string, messaggio: MessaggioProgetto): Observable<MessaggioProgetto> {
    return this.http.post<MessaggioProgetto>(`${this.apiUrl}/${numeroProgetto}/messaggi`, messaggio);
  }

  updateMessaggioProgetto(numeroProgetto: string, messaggioId: number, messaggio: MessaggioProgetto): Observable<MessaggioProgetto> {
    return this.http.put<MessaggioProgetto>(`${this.apiUrl}/${numeroProgetto}/messaggi/${messaggioId}`, messaggio);
  }

  deleteMessaggioProgetto(numeroProgetto: string, messaggioId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${numeroProgetto}/messaggi/${messaggioId}`);
  }

  // Change Log
  getChangeLogProgetto(numeroProgetto: string): Observable<ChangeLog[]> {
    return this.http.get<ChangeLog[]>(`${this.apiUrl}/${numeroProgetto}/changelog`);
  }

  addChangeLogProgetto(numeroProgetto: string, changeLog: ChangeLog): Observable<ChangeLog> {
    return this.http.post<ChangeLog>(`${this.apiUrl}/${numeroProgetto}/changelog`, changeLog);
  }

  // Ricerca e Filtri
  searchProjects(searchTerm: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/search?q=${encodeURIComponent(searchTerm)}`);
  }

  filterProjects(filters: any): Observable<Project[]> {
    return this.http.post<Project[]>(`${this.apiUrl}/filter`, filters);
  }

  // Statistiche e KPI
  getProjectStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  getProjectsByStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/by-status`);
  }

  getProjectsByMonth(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/by-month`);
  }

  // Export
  exportProjects(format: 'excel' | 'pdf' | 'csv', filters?: any): Observable<Blob> {
    const body = filters ? { filters: JSON.stringify(filters) } : {};
    return this.http.post(`${this.apiUrl}/export/${format}`, body, { responseType: 'blob' });
  }

  // Ordine Cliente da SAP
  getOrdineCliente(docNum: number): Observable<OrdineClienteDto> {
    return this.http.get<OrdineClienteDto>(`${this.apiUrl}/ordine-cliente/${docNum}`);
  }
}

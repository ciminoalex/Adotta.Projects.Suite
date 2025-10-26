import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Project, LivelloProgetto, ProdottoProgetto, StoricoModifica, MessaggioProgetto, ChangeLog } from '../models/project.model';

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

  addLivelloProgetto(projectId: number, livello: LivelloProgetto): Observable<LivelloProgetto> {
    return this.http.post<LivelloProgetto>(`${this.apiUrl}/${projectId}/livelli`, livello);
  }

  updateLivelloProgetto(projectId: number, livelloId: number, livello: LivelloProgetto): Observable<LivelloProgetto> {
    return this.http.put<LivelloProgetto>(`${this.apiUrl}/${projectId}/livelli/${livelloId}`, livello);
  }

  deleteLivelloProgetto(projectId: number, livelloId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/livelli/${livelloId}`);
  }

  // Prodotti Progetto
  getProdottiProgetto(numeroProgetto: string): Observable<ProdottoProgetto[]> {
    return this.http.get<ProdottoProgetto[]>(`${this.apiUrl}/${numeroProgetto}/prodotti`);
  }

  addProdottoProgetto(projectId: number, prodotto: ProdottoProgetto): Observable<ProdottoProgetto> {
    return this.http.post<ProdottoProgetto>(`${this.apiUrl}/${projectId}/prodotti`, prodotto);
  }

  updateProdottoProgetto(projectId: number, prodottoId: number, prodotto: ProdottoProgetto): Observable<ProdottoProgetto> {
    return this.http.put<ProdottoProgetto>(`${this.apiUrl}/${projectId}/prodotti/${prodottoId}`, prodotto);
  }

  deleteProdottoProgetto(projectId: number, prodottoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/prodotti/${prodottoId}`);
  }

  // Storico Modifiche WIC
  getStoricoModifiche(numeroProgetto: string): Observable<StoricoModifica[]> {
    return this.http.get<StoricoModifica[]>(`${this.apiUrl}/${numeroProgetto}/storico`);
  }

  createSnapshotWIC(projectId: number): Observable<StoricoModifica[]> {
    return this.http.post<StoricoModifica[]>(`${this.apiUrl}/${projectId}/wic-snapshot`, {});
  }

  // Messaggi Progetto
  getMessaggiProgetto(numeroProgetto: string): Observable<MessaggioProgetto[]> {
    return this.http.get<MessaggioProgetto[]>(`${this.apiUrl}/${numeroProgetto}/messaggi`);
  }

  addMessaggioProgetto(messaggio: MessaggioProgetto): Observable<MessaggioProgetto> {
    return this.http.post<MessaggioProgetto>(`${this.apiUrl}/${messaggio.progettoId}/messaggi`, messaggio);
  }

  updateMessaggioProgetto(id: number, messaggio: MessaggioProgetto): Observable<MessaggioProgetto> {
    return this.http.put<MessaggioProgetto>(`${this.apiUrl}/${messaggio.progettoId}/messaggi/${id}`, messaggio);
  }

  deleteMessaggioProgetto(progettoId: number, messaggioId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${progettoId}/messaggi/${messaggioId}`);
  }

  // Change Log
  getChangeLogProgetto(numeroProgetto: string): Observable<ChangeLog[]> {
    return this.http.get<ChangeLog[]>(`${this.apiUrl}/${numeroProgetto}/changelog`);
  }

  addChangeLogProgetto(changeLog: ChangeLog): Observable<ChangeLog> {
    return this.http.post<ChangeLog>(`${this.apiUrl}/${changeLog.progettoId}/changelog`, changeLog);
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
    const params = filters ? { filters: JSON.stringify(filters) } : {};
    return this.http.post(`${this.apiUrl}/export/${format}`, params, { responseType: 'blob' });
  }
}

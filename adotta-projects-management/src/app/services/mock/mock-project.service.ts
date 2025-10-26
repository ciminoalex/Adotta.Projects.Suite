import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Project, ProjectStatus, LivelloProgetto, ProdottoProgetto, StoricoModifica, MessaggioProgetto, ChangeLog } from '../../models/project.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class MockProjectService {
  private apiUrl = '/api/projects';
  private mockData: MockDataService;

  constructor(mockData?: MockDataService) {
    // Use singleton instance if not provided
    this.mockData = mockData || MockDataService.getInstance();
  }

  // Field labels mapping for user-friendly display
  private getFieldLabel(fieldName: string): string {
    const fieldLabels: Record<string, string> = {
      'nomeProgetto': 'Nome Progetto',
      'cliente': 'Cliente',
      'citta': 'Città',
      'stato': 'Stato',
      'teamTecnico': 'Team Tecnico',
      'teamAPL': 'Team APL',
      'sales': 'Sales',
      'projectManager': 'Project Manager',
      'teamInstallazione': 'Team Installazione',
      'dataCreazione': 'Data Creazione',
      'dataInizioInstallazione': 'Data Inizio Installazione',
      'dataFineInstallazione': 'Data Fine Installazione',
      'versioneWIC': 'Versione WIC',
      'statoProgetto': 'Stato Progetto',
      'note': 'Note',
      'numeroProgetto': 'Numero Progetto'
    };
    return fieldLabels[fieldName] || fieldName;
  }

  // CRUD Operations
  getProjects(): Observable<Project[]> {
    return of(this.mockData.getProjects()).pipe(delay(500));
  }

  getProject(numeroProgetto: string): Observable<Project> {
    const project = this.mockData.findProject(numeroProgetto);
    if (project) {
      // Load related data
      const projectWithRelations = { ...project };
      const numericId = this.getProjectNumericId(numeroProgetto);
      projectWithRelations.messaggi = this.mockData.getMessaggiByProgetto(numericId);
      projectWithRelations.changeLog = this.mockData.getChangeLogByProgetto(numericId);
      return of(projectWithRelations).pipe(delay(300));
    }
    throw new Error(`Project with numero ${numeroProgetto} not found`);
  }

  createProject(project: Project): Observable<Project> {
    const newProject = this.mockData.addProject(project);
    const numericId = this.getProjectNumericId(newProject.numeroProgetto);
    
    // Add change log entry
    this.mockData.addChangeLog({
      progettoId: numericId,
      data: new Date(),
      utente: 'System',
      azione: 'created',
      descrizione: `Progetto ${newProject.numeroProgetto} creato`
    });
    
    return of(newProject).pipe(delay(400));
  }

  updateProject(numeroProgetto: string, project: Project): Observable<Project> {
    const numericId = this.getProjectNumericId(numeroProgetto);
    
    // Get the current project to compare
    const currentProject = this.mockData.findProject(numeroProgetto);
    if (!currentProject) {
    throw new Error(`Project with numero ${numeroProgetto} not found`);
  }

    // Helper function to safely format dates
    const formatDate = (date: any): string => {
      if (!date) return '-';
      if (date instanceof Date) {
        return date.toLocaleDateString();
      }
      if (typeof date === 'string') {
        return new Date(date).toLocaleDateString();
      }
      return String(date);
    };

    // Fields to track with their handlers
    const fieldsToTrack: Array<{field: string, isDate?: boolean}> = [
      { field: 'nomeProgetto' },
      { field: 'cliente' },
      { field: 'citta' },
      { field: 'stato' },
      { field: 'teamTecnico' },
      { field: 'teamAPL' },
      { field: 'sales' },
      { field: 'projectManager' },
      { field: 'teamInstallazione' },
      { field: 'dataCreazione', isDate: true },
      { field: 'dataInizioInstallazione', isDate: true },
      { field: 'dataFineInstallazione', isDate: true },
      { field: 'versioneWIC' },
      { field: 'statoProgetto' },
      { field: 'note' }
    ];
    
    // Track changes dynamically
    const changes: Array<{ campo: string; vecchioValore: any; nuovoValore: any }> = [];
    
    fieldsToTrack.forEach(({ field, isDate }) => {
      const oldValue = (currentProject as any)[field];
      const newValue = (project as any)[field];
      
      let oldVal: any;
      let newVal: any;
      
      if (isDate) {
        // For dates, compare using JSON stringify
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          oldVal = formatDate(oldValue);
          newVal = formatDate(newValue);
        } else {
          return; // No change
        }
      } else {
        // For other fields, simple comparison
        if (oldValue !== newValue) {
          oldVal = oldValue || '-';
          newVal = newValue || '-';
        } else {
          return; // No change
        }
      }
      
      changes.push({ 
        campo: this.getFieldLabel(field), 
        vecchioValore: oldVal, 
        nuovoValore: newVal 
      });
    });
    
    // Update the project
    const updatedProject = this.mockData.updateProject(numeroProgetto, project);
    
    // Add change log entries for each changed field
    changes.forEach(change => {
      this.mockData.addChangeLog({
        progettoId: numericId,
        data: new Date(),
        utente: 'System',
        azione: 'updated',
        descrizione: `${change.campo}: "${change.vecchioValore || '-'}" → "${change.nuovoValore || '-'}"`,
        dettagli: { campo: change.campo, vecchioValore: change.vecchioValore, nuovoValore: change.nuovoValore }
      });
    });
    
    // If no specific fields changed, add a general update entry
    if (changes.length === 0) {
      this.mockData.addChangeLog({
        progettoId: numericId,
        data: new Date(),
        utente: 'System',
        azione: 'updated',
        descrizione: 'Progetto aggiornato (nessuna modifica rilevata)'
      });
    }
    
    return of(updatedProject).pipe(delay(400));
  }

  patchProject(numeroProgetto: string, partial: Partial<Project>): Observable<Project> {
    const updatedProject = this.mockData.patchProject(numeroProgetto, partial);
    const numericId = this.getProjectNumericId(numeroProgetto);
    
    // Add change log entry
    const changedFields = Object.keys(partial).join(', ');
    this.mockData.addChangeLog({
      progettoId: numericId,
      data: new Date(),
      utente: 'System',
      azione: 'updated',
      descrizione: `Campi modificati: ${changedFields}`
    });
    
    return of(updatedProject).pipe(delay(400));
  }

  deleteProject(numeroProgetto: string): Observable<void> {
    const numericId = this.getProjectNumericId(numeroProgetto);
    
    // Add change log entry before deletion
    this.mockData.addChangeLog({
      progettoId: numericId,
      data: new Date(),
      utente: 'System',
      azione: 'deleted',
      descrizione: `Progetto ${numeroProgetto} eliminato`
    });
    
    this.mockData.deleteProject(numeroProgetto);
      return of(undefined).pipe(delay(300));
  }

  // Messaggi Progetto
  getMessaggiProgetto(numeroProgetto: string): Observable<MessaggioProgetto[]> {
    const numericId = this.getProjectNumericId(numeroProgetto);
    return of(this.mockData.getMessaggiByProgetto(numericId)).pipe(delay(300));
  }

  addMessaggioProgetto(messaggio: MessaggioProgetto): Observable<MessaggioProgetto> {
    const newMessaggio = this.mockData.addMessaggio(messaggio);
    // Messages are not tracked in change log
    return of(newMessaggio).pipe(delay(400));
  }

  updateMessaggioProgetto(id: number, messaggio: MessaggioProgetto): Observable<MessaggioProgetto> {
    const updated = this.mockData.updateMessaggio(id, messaggio);
    // Messages are not tracked in change log
    return of(updated).pipe(delay(400));
  }

  deleteMessaggioProgetto(id: number): Observable<void> {
    const messaggio = this.mockData.getMessaggiByProgetto(0).find(m => m.id === id);
    if (messaggio) {
      this.mockData.deleteMessaggio(id);
      // Messages are not tracked in change log
    }
    return of(undefined).pipe(delay(300));
  }

  // Change Log
  getChangeLogProgetto(numeroProgetto: string): Observable<ChangeLog[]> {
    const numericId = this.getProjectNumericId(numeroProgetto);
    return of(this.mockData.getChangeLogByProgetto(numericId)).pipe(delay(300));
  }

  addChangeLogProgetto(changeLog: ChangeLog): Observable<ChangeLog> {
    return of(this.mockData.addChangeLog(changeLog)).pipe(delay(400));
  }

  // Livelli Progetto
  getLivelliProgetto(numeroProgetto: string): Observable<LivelloProgetto[]> {
    const project = this.mockData.findProject(numeroProgetto);
    if (project && project.livelli) {
      return of(project.livelli).pipe(delay(300));
    }
    return of([]).pipe(delay(300));
  }

  addLivelloProgetto(numeroProgetto: string, livello: LivelloProgetto): Observable<LivelloProgetto> {
    const project = this.mockData.findProject(numeroProgetto);
    if (!project) {
      throw new Error(`Project ${numeroProgetto} not found`);
    }
    
      if (!project.livelli) {
        project.livelli = [];
      }
    
    const numericId = this.getProjectNumericId(numeroProgetto);
      const newLivello = {
        ...livello,
        id: Math.max(...project.livelli.map(l => l.id || 0), 0) + 1,
      progettoId: numericId
      };
    
      project.livelli.push(newLivello);
    this.mockData.updateProject(numeroProgetto, project);
    
    // Add change log
    this.mockData.addChangeLog({
      progettoId: numericId,
      data: new Date(),
      utente: 'System',
      azione: 'livello_added',
      descrizione: `Livello "${newLivello.nome}" aggiunto`
    });
    
      return of(newLivello).pipe(delay(400));
    }

  updateLivelloProgetto(numeroProgetto: string, livelloId: number, livello: LivelloProgetto): Observable<LivelloProgetto> {
    const project = this.mockData.findProject(numeroProgetto);
    if (!project || !project.livelli) {
      throw new Error(`Livello not found`);
    }
    
    const numericId = this.getProjectNumericId(numeroProgetto);
      const index = project.livelli.findIndex(l => l.id === livelloId);
      if (index !== -1) {
      project.livelli[index] = { ...livello, id: livelloId, progettoId: numericId };
      this.mockData.updateProject(numeroProgetto, project);
      
      // Add change log
      this.mockData.addChangeLog({
        progettoId: numericId,
        data: new Date(),
        utente: 'System',
        azione: 'livello_updated',
        descrizione: `Livello aggiornato`
      });
      
        return of(project.livelli[index]).pipe(delay(400));
    }
    throw new Error(`Livello with ID ${livelloId} not found`);
  }

  deleteLivelloProgetto(numeroProgetto: string, livelloId: number): Observable<void> {
    const project = this.mockData.findProject(numeroProgetto);
    if (!project || !project.livelli) {
      throw new Error(`Project not found`);
    }
    
    const numericId = this.getProjectNumericId(numeroProgetto);
      const index = project.livelli.findIndex(l => l.id === livelloId);
      if (index !== -1) {
        project.livelli.splice(index, 1);
      this.mockData.updateProject(numeroProgetto, project);
      
      // Add change log
      this.mockData.addChangeLog({
        progettoId: numericId,
        data: new Date(),
        utente: 'System',
        azione: 'livello_deleted',
        descrizione: `Livello eliminato`
      });
      
        return of(undefined).pipe(delay(300));
    }
    throw new Error(`Livello with ID ${livelloId} not found`);
  }

  // Prodotti Progetto
  getProdottiProgetto(numeroProgetto: string): Observable<ProdottoProgetto[]> {
    const project = this.mockData.findProject(numeroProgetto);
    if (project && project.prodotti) {
      return of(project.prodotti).pipe(delay(300));
    }
    return of([]).pipe(delay(300));
  }

  addProdottoProgetto(numeroProgetto: string, prodotto: ProdottoProgetto): Observable<ProdottoProgetto> {
    const project = this.mockData.findProject(numeroProgetto);
    if (!project) {
      throw new Error(`Project ${numeroProgetto} not found`);
    }
    
      if (!project.prodotti) {
        project.prodotti = [];
      }
    
    const numericId = this.getProjectNumericId(numeroProgetto);
      const newProdotto = {
        ...prodotto,
        id: Math.max(...project.prodotti.map(p => p.id || 0), 0) + 1,
      progettoId: numericId
      };
    
      project.prodotti.push(newProdotto);
    this.mockData.updateProject(numeroProgetto, project);
    
    // Add change log
    this.mockData.addChangeLog({
      progettoId: numericId,
      data: new Date(),
      utente: 'System',
      azione: 'prodotto_added',
      descrizione: `Prodotto "${newProdotto.tipoProdotto}" aggiunto`
    });
    
      return of(newProdotto).pipe(delay(400));
    }

  updateProdottoProgetto(numeroProgetto: string, prodottoId: number, prodotto: ProdottoProgetto): Observable<ProdottoProgetto> {
    const project = this.mockData.findProject(numeroProgetto);
    if (!project || !project.prodotti) {
      throw new Error(`Prodotti not found`);
    }
    
    const numericId = this.getProjectNumericId(numeroProgetto);
      const index = project.prodotti.findIndex(p => p.id === prodottoId);
      if (index !== -1) {
      project.prodotti[index] = { ...prodotto, id: prodottoId, progettoId: numericId };
      this.mockData.updateProject(numeroProgetto, project);
      
      // Add change log
      this.mockData.addChangeLog({
        progettoId: numericId,
        data: new Date(),
        utente: 'System',
        azione: 'prodotto_updated',
        descrizione: `Prodotto aggiornato`
      });
      
        return of(project.prodotti[index]).pipe(delay(400));
    }
    throw new Error(`Prodotto with ID ${prodottoId} not found`);
  }

  deleteProdottoProgetto(numeroProgetto: string, prodottoId: number): Observable<void> {
    const project = this.mockData.findProject(numeroProgetto);
    if (!project || !project.prodotti) {
      throw new Error(`Project not found`);
    }
    
    const numericId = this.getProjectNumericId(numeroProgetto);
      const index = project.prodotti.findIndex(p => p.id === prodottoId);
      if (index !== -1) {
        project.prodotti.splice(index, 1);
      this.mockData.updateProject(numeroProgetto, project);
      
      // Add change log
      this.mockData.addChangeLog({
        progettoId: numericId,
        data: new Date(),
        utente: 'System',
        azione: 'prodotto_deleted',
        descrizione: `Prodotto eliminato`
      });
      
        return of(undefined).pipe(delay(300));
    }
    throw new Error(`Prodotto with ID ${prodottoId} not found`);
  }

  // Storico Modifiche WIC
  getStoricoModifiche(numeroProgetto: string): Observable<StoricoModifica[]> {
    // Convert ChangeLog to StoricoModifica format for compatibility
    const numericId = this.getProjectNumericId(numeroProgetto);
    const changeLogs = this.mockData.getChangeLogByProgetto(numericId);
    
    // Convert ChangeLog[] to StoricoModifica[]
    const storicoModifiche: StoricoModifica[] = changeLogs.map(log => {
      // Use dettagli if available
      if (log.dettagli && typeof log.dettagli === 'object' && log.dettagli['campo']) {
        // Return one StoricoModifica per field change with dettagli
        return {
          id: log.id,
          progettoId: log.progettoId,
          dataModifica: log.data,
          utenteModifica: log.utente,
          campoModificato: log.dettagli['campo'],
          valorePrecedente: String(log.dettagli['vecchioValore'] || '-'),
          nuovoValore: String(log.dettagli['nuovoValore'] || '-')
        };
      } else if (log.descrizione && log.descrizione.includes('→')) {
        // Try to parse the description format: "Campo: "vecchio" → "nuovo""
        const match = log.descrizione.match(/([^:]+):\s*"([^"]*)"\s*→\s*"([^"]*)"/);
        if (match) {
          return {
            id: log.id,
            progettoId: log.progettoId,
            dataModifica: log.data,
            utenteModifica: log.utente,
            campoModificato: match[1].trim(),
            valorePrecedente: match[2] || '-',
            nuovoValore: match[3] || '-'
          };
        }
      }
      // For entries without proper dettagli or unrecognized format - skip or use action
      return {
        id: log.id,
        progettoId: log.progettoId,
        dataModifica: log.data,
        utenteModifica: log.utente,
        campoModificato: log.azione === 'updated' && log.descrizione ? 'Generale' : log.azione,
        valorePrecedente: '',
        nuovoValore: log.descrizione || ''
      };
    });
    
    return of(storicoModifiche).pipe(delay(300));
  }

  createSnapshotWIC(projectId: number): Observable<StoricoModifica[]> {
    // Find project by ID
    const project = this.mockData.getProjects()[projectId - 1];
    if (!project) {
    return of([]).pipe(delay(400));
    }
    
    return this.getStoricoModifiche(project.numeroProgetto);
  }

  // Ricerca e Filtri
  searchProjects(searchTerm: string): Observable<Project[]> {
    const filtered = this.mockData.getProjects().filter(project =>
      project.nomeProgetto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.numeroProgetto.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return of(filtered).pipe(delay(300));
  }

  filterProjects(filters: any): Observable<Project[]> {
    let filtered = [...this.mockData.getProjects()];
    
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

  // Statistiche e KPI
  getProjectStats(): Observable<any> {
    const projects = this.mockData.getProjects();
    const stats = {
      progettiAttivi: projects.filter(p => p.statoProgetto === ProjectStatus.ON_GOING || p.statoProgetto === ProjectStatus.RUSH || p.statoProgetto === ProjectStatus.CRITICAL).length,
      installazioniMese: projects.filter(p => {
        const installDate = p.dataCreazione;
        if (!installDate) return false;
        const now = new Date();
        return installDate.getMonth() === now.getMonth() && installDate.getFullYear() === now.getFullYear();
      }).length,
      progettiRitardo: projects.filter(p => p.isInRitardo === true).length
    };
    return of(stats).pipe(delay(300));
  }

  getProjectsByStatus(): Observable<any[]> {
    const byStatus = this.mockData.getProjects().reduce((acc, project) => {
      const status = project.statoProgetto;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const statusArray = Object.keys(byStatus).map(stato => ({
      stato: stato,
      count: byStatus[stato]
    }));
    
    return of(statusArray).pipe(delay(300));
  }

  getProjectsByMonth(): Observable<any[]> {
    const byMonth = this.mockData.getProjects().reduce((acc, project) => {
      const month = project.dataCreazione.getMonth();
      const monthName = project.dataCreazione.toLocaleDateString('it-IT', { month: 'short' });
      acc[monthName] = (acc[monthName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const monthArray = Object.keys(byMonth).map(monthName => ({
      label: monthName,
      value: byMonth[monthName]
    }));
    
    return of(monthArray).pipe(delay(300));
  }

  // Export
  exportProjects(format: 'excel' | 'pdf' | 'csv', filters?: any): Observable<Blob> {
    const data = JSON.stringify(this.mockData.getProjects(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    return of(blob).pipe(delay(500));
  }

  // Helper methods
  private getProjectNumericId(numeroProgetto: string): number {
    // Convert numeroProgetto to numeric ID for relations
    // This is a simple implementation - in production, this would be a proper ID mapping
    const project = this.mockData.findProject(numeroProgetto);
    return project ? this.mockData.getProjects().indexOf(project) + 1 : 0;
  }
}

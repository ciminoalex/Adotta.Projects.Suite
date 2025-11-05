import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TimesheetEntry, TimesheetOverview, TimesheetSummary, TimesheetOverviewResponse, TimesheetProjectDto } from '../../models/timesheet.model';

@Injectable()
export class MockTimesheetService {
  private mockTimesheetEntries: TimesheetEntry[] = [
    {
      id: 1,
      progettoId: '24001',
      numeroProgetto: '24001',
      nomeProgetto: 'Installazione HVAC Uffici Milano',
      cliente: 'TechCorp Italia',
      dataRendicontazione: new Date('2024-01-15'),
      oreLavorate: 8,
      note: 'Installazione componenti HVAC',
      utente: 'user1',
      dataCreazione: new Date('2024-01-15'),
      ultimaModifica: new Date('2024-01-15')
    },
    {
      id: 2,
      progettoId: '24001',
      numeroProgetto: '24001',
      nomeProgetto: 'Installazione HVAC Uffici Milano',
      cliente: 'TechCorp Italia',
      dataRendicontazione: new Date('2024-01-16'),
      oreLavorate: 6,
      note: 'Configurazione sistema di ventilazione',
      utente: 'user1',
      dataCreazione: new Date('2024-01-16'),
      ultimaModifica: new Date('2024-01-16')
    },
    {
      id: 3,
      progettoId: '24002',
      numeroProgetto: '24002',
      nomeProgetto: 'Energia Sostenibile Barcellona',
      cliente: 'Costruzioni SRL',
      dataRendicontazione: new Date('2024-01-17'),
      oreLavorate: 7,
      note: 'Verifica e test sistema',
      utente: 'user2',
      dataCreazione: new Date('2024-01-17'),
      ultimaModifica: new Date('2024-01-17')
    }
  ];

  getTimesheetEntries(): Observable<TimesheetEntry[]> {
    return of([...this.mockTimesheetEntries]).pipe(delay(500));
  }

  getTimesheetEntry(id: number): Observable<TimesheetEntry> {
    const entry = this.mockTimesheetEntries.find(e => e.id === id);
    if (entry) {
      return of({ ...entry }).pipe(delay(300));
    }
    throw new Error(`Timesheet entry with id ${id} not found`);
  }

  createTimesheetEntry(timesheet: TimesheetEntry): Observable<TimesheetEntry> {
    const newEntry = {
      ...timesheet,
      id: this.mockTimesheetEntries.length + 1,
      dataCreazione: new Date(),
      ultimaModifica: new Date()
    };
    this.mockTimesheetEntries.push(newEntry);
    return of(newEntry).pipe(delay(500));
  }

  updateTimesheetEntry(id: number, timesheet: TimesheetEntry): Observable<TimesheetEntry> {
    const index = this.mockTimesheetEntries.findIndex(e => e.id === id);
    if (index !== -1) {
      this.mockTimesheetEntries[index] = {
        ...timesheet,
        id: id,
        ultimaModifica: new Date()
      };
      return of(this.mockTimesheetEntries[index]).pipe(delay(500));
    }
    throw new Error(`Timesheet entry with id ${id} not found`);
  }

  deleteTimesheetEntry(id: number): Observable<void> {
    const index = this.mockTimesheetEntries.findIndex(e => e.id === id);
    if (index !== -1) {
      this.mockTimesheetEntries.splice(index, 1);
      return of(undefined).pipe(delay(300));
    }
    throw new Error(`Timesheet entry with id ${id} not found`);
  }

  getTimesheetOverview(): Observable<TimesheetOverviewResponse> {
    const overview = this.groupByProject(this.mockTimesheetEntries);
    const timesheets: TimesheetProjectDto[] = overview.map(o => ({
      numeroProgetto: o.numeroProgetto,
      nomeProgetto: o.nomeProgetto,
      cliente: o.cliente,
      totaleOre: o.totaleOre,
      numeroRendicontazioni: o.numeroRendicontazioni,
      ultimaRendicontazione: o.ultimaRendicontazione,
      rendicontazioni: o.rendicontazioni
    }));

    const summary = this.calculateSummary(this.mockTimesheetEntries);

    return of({ timesheets, summary }).pipe(delay(400));
  }

  getTimesheetSummary(): Observable<TimesheetSummary> {
    return of(this.calculateSummary(this.mockTimesheetEntries)).pipe(delay(300));
  }

  getTimesheetOverviewByProject(numeroProgetto: string): Observable<TimesheetOverview> {
    const entries = this.mockTimesheetEntries.filter(e => e.numeroProgetto === numeroProgetto);
    
    if (entries.length === 0) {
      return of({
        numeroProgetto,
        nomeProgetto: '',
        cliente: '',
        totaleOre: 0,
        numeroRendicontazioni: 0,
        rendicontazioni: []
      }).pipe(delay(300));
    }

    const totaleOre = entries.reduce((sum, entry) => sum + entry.oreLavorate, 0);
    const ultimeRendicontazioni = [...entries].sort((a, b) => 
      b.dataRendicontazione.getTime() - a.dataRendicontazione.getTime()
    );

    return of({
      numeroProgetto,
      nomeProgetto: entries[0].nomeProgetto,
      cliente: entries[0].cliente,
      totaleOre,
      numeroRendicontazioni: entries.length,
      ultimaRendicontazione: ultimeRendicontazioni[0]?.dataRendicontazione,
      rendicontazioni: entries
    }).pipe(delay(300));
  }

  getTimesheetByProject(numeroProgetto: string): Observable<TimesheetEntry[]> {
    const entries = this.mockTimesheetEntries.filter(e => e.numeroProgetto === numeroProgetto);
    return of([...entries]).pipe(delay(300));
  }

  private groupByProject(entries: TimesheetEntry[]): TimesheetOverview[] {
    const map = new Map<string, TimesheetEntry[]>();
    
    entries.forEach(entry => {
      if (!map.has(entry.numeroProgetto)) {
        map.set(entry.numeroProgetto, []);
      }
      map.get(entry.numeroProgetto)!.push(entry);
    });

    const overviews: TimesheetOverview[] = [];
    map.forEach((rendicontazioni, numeroProgetto) => {
      const totaleOre = rendicontazioni.reduce((sum, entry) => sum + entry.oreLavorate, 0);
      const ultimeRendicontazioni = rendicontazioni.sort((a, b) => 
        b.dataRendicontazione.getTime() - a.dataRendicontazione.getTime()
      );
      
      overviews.push({
        numeroProgetto,
        nomeProgetto: rendicontazioni[0].nomeProgetto,
        cliente: rendicontazioni[0].cliente,
        totaleOre,
        numeroRendicontazioni: rendicontazioni.length,
        ultimaRendicontazione: ultimeRendicontazioni[0]?.dataRendicontazione,
        rendicontazioni
      });
    });

    return overviews;
  }

  private calculateSummary(entries: TimesheetEntry[]): TimesheetSummary {
    const totaleOre = entries.reduce((sum, entry) => sum + entry.oreLavorate, 0);
    const progettiSet = new Set(entries.map(e => e.numeroProgetto));
    const progettiRendicontati = progettiSet.size;
    const mediaOrePerProgetto = progettiRendicontati > 0 ? totaleOre / progettiRendicontati : 0;

    return {
      totaleOre,
      totaleRendicontazioni: entries.length,
      progettiRendicontati,
      mediaOrePerProgetto: Math.round(mediaOrePerProgetto * 100) / 100
    };
  }
}


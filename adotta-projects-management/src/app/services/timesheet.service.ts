import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimesheetEntry, TimesheetOverview, TimesheetSummary } from '../models/timesheet.model';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  private apiUrl = '/api/timesheet';

  constructor(private http: HttpClient) {}

  // CRUD Operations
  getTimesheetEntries(): Observable<TimesheetEntry[]> {
    return this.http.get<TimesheetEntry[]>(this.apiUrl);
  }

  getTimesheetEntry(id: number): Observable<TimesheetEntry> {
    return this.http.get<TimesheetEntry>(`${this.apiUrl}/${id}`);
  }

  createTimesheetEntry(timesheet: TimesheetEntry): Observable<TimesheetEntry> {
    return this.http.post<TimesheetEntry>(this.apiUrl, timesheet);
  }

  updateTimesheetEntry(id: number, timesheet: TimesheetEntry): Observable<TimesheetEntry> {
    return this.http.put<TimesheetEntry>(`${this.apiUrl}/${id}`, timesheet);
  }

  deleteTimesheetEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Overview by Project
  getTimesheetOverview(): Observable<TimesheetOverview[]> {
    return this.http.get<TimesheetOverview[]>(`${this.apiUrl}/overview`);
  }

  getTimesheetOverviewByProject(numeroProgetto: string): Observable<TimesheetOverview> {
    return this.http.get<TimesheetOverview>(`${this.apiUrl}/overview/${numeroProgetto}`);
  }

  // Summary
  getTimesheetSummary(): Observable<TimesheetSummary> {
    return this.http.get<TimesheetSummary>(`${this.apiUrl}/summary`);
  }

  // Filter by date range
  getTimesheetByDateRange(startDate: Date, endDate: Date): Observable<TimesheetEntry[]> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get<TimesheetEntry[]>(`${this.apiUrl}/by-date-range`, { params });
  }

  // Get entries by project
  getTimesheetByProject(numeroProgetto: string): Observable<TimesheetEntry[]> {
    return this.http.get<TimesheetEntry[]>(`${this.apiUrl}/by-project/${numeroProgetto}`);
  }

  // Get entries by user
  getTimesheetByUser(utente: string): Observable<TimesheetEntry[]> {
    return this.http.get<TimesheetEntry[]>(`${this.apiUrl}/by-user/${utente}`);
  }

  // Statistics
  getProjectTimesheetStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/by-project`);
  }

  getUserTimesheetStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/by-user`);
  }

  getDailyStats(date: Date): Observable<any> {
    const params = new HttpParams().set('date', date.toISOString());
    return this.http.get<any>(`${this.apiUrl}/stats/daily`, { params });
  }
}


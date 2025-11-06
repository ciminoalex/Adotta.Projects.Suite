import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface InitResponse {
  log: string;
  success?: boolean;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InitService {
  private apiUrl = '/api/init';

  constructor(private http: HttpClient) {}

  initializeDatabase(): Observable<InitResponse> {
    return this.http.post<InitResponse | string>(this.apiUrl, {}).pipe(
      map((response) => {
        // Se la risposta è una stringa, la convertiamo in un oggetto InitResponse
        if (typeof response === 'string') {
          return {
            log: response,
            success: true,
            timestamp: new Date().toISOString()
          };
        }
        // Se la risposta è già un oggetto, la restituiamo così com'è
        return response;
      })
    );
  }
}


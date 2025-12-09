import { Injectable } from '@angular/core';
import { InjectionToken } from '@angular/core';

export const USE_MOCK_SERVICES = new InjectionToken<boolean>('USE_MOCK_SERVICES');

@Injectable({
  providedIn: 'root'
})
export class ServiceConfigurationService {
  private useMockServices = false; // Set to false to use real API
  private apiBaseUrl = this.initializeApiBaseUrl(); // URL base delle API

  constructor() {
    // In a real application, this could be determined by environment variables
    // or configuration files
    this.useMockServices = this.shouldUseMockServices();
    console.log('ServiceConfigurationService initialized - useMockServices:', this.useMockServices);
  }

  private shouldUseMockServices(): boolean {
    // Check environment variable or configuration
    // Set to false to use real API endpoints
    // You can also check environment: return environment.production === false;
    return false; // Change to true to enable mock services 
  }

  private initializeApiBaseUrl(): string {
    // Puoi configurare l'URL base delle API qui
    // Per sviluppo locale con proxy Angular, usa stringa vuota (usa URL relativi)
    // Per produzione o sviluppo senza proxy, usa l'URL completo del server
    // Esempio: 'http://localhost:5000' o 'https://api.adotta.it'
    
    // Controlla se c'è una variabile d'ambiente (utile per build diverse)
    // In un progetto reale, usa file environment.ts
    return 'https://projects.adotta.net/api'; // Stringa vuota = usa URL relativi (necessita proxy Angular o stesso dominio)
    //return 'http://localhost:5000';
    // Per sviluppo con server API separato, decommenta e modifica:
    // return 'http://localhost:5000';
    
    // Per produzione, usa:
    // return 'https://api.adotta.it';
  }

  getUseMockServices(): boolean {
    return this.useMockServices;
  }

  setUseMockServices(useMock: boolean): void {
    this.useMockServices = useMock;
  }

  getApiBaseUrl(): string {
    return this.apiBaseUrl;
  }

  setApiBaseUrl(url: string): void {
    this.apiBaseUrl = url;
  }
}

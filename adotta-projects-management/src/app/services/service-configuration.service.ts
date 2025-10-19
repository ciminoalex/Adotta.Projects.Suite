import { Injectable } from '@angular/core';
import { InjectionToken } from '@angular/core';

export const USE_MOCK_SERVICES = new InjectionToken<boolean>('USE_MOCK_SERVICES');

@Injectable({
  providedIn: 'root'
})
export class ServiceConfigurationService {
  private useMockServices = true; // Set to false in production

  constructor() {
    // In a real application, this could be determined by environment variables
    // or configuration files
    this.useMockServices = this.shouldUseMockServices();
  }

  private shouldUseMockServices(): boolean {
    // Check environment or configuration
    // For now, always use mock services in development
    return true;
  }

  getUseMockServices(): boolean {
    return this.useMockServices;
  }

  setUseMockServices(useMock: boolean): void {
    this.useMockServices = useMock;
  }
}

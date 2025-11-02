import { inject, Injectable, Provider, Type } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LookupService } from './lookup.service';
import { ProjectService } from './project.service';
import { MockLookupService } from './mock/mock-lookup.service';
import { MockProjectService } from './mock/mock-project.service';
import { ServiceConfigurationService } from './service-configuration.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceProviderService {
  private serviceConfig = inject(ServiceConfigurationService);
  private http = inject(HttpClient);

  /**
   * Returns the appropriate LookupService instance based on configuration
   */
  provideLookupService(): LookupService | MockLookupService {
    const useMock = this.serviceConfig.getUseMockServices();
    console.log('ServiceProviderService.provideLookupService() - useMock:', useMock);
    return useMock
      ? new MockLookupService()
      : new LookupService(this.http);
  }

  /**
   * Returns the appropriate ProjectService instance based on configuration
   */
  provideProjectService(): ProjectService | MockProjectService {
    const useMock = this.serviceConfig.getUseMockServices();
    console.log('ServiceProviderService.provideProjectService() - useMock:', useMock);
    return useMock
      ? new MockProjectService()
      : new ProjectService(this.http);
  }
}

/**
 * Factory functions to provide services based on configuration
 */
export function provideLookupServiceFactory(): Provider {
  return {
    provide: LookupService,
    useFactory: () => {
      const serviceConfig = inject(ServiceConfigurationService);
      const http = inject(HttpClient);
      if (serviceConfig.getUseMockServices()) {
        return new MockLookupService();
      }
      return new LookupService(http);
    }
  };
}

export function provideProjectServiceFactory(): Provider {
  return {
    provide: ProjectService,
    useFactory: () => {
      const serviceConfig = inject(ServiceConfigurationService);
      const http = inject(HttpClient);
      if (serviceConfig.getUseMockServices()) {
        return new MockProjectService();
      }
      return new ProjectService(http);
    }
  };
}


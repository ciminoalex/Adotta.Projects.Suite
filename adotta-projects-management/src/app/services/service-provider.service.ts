import { inject, Injectable, Provider, Type } from '@angular/core';
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

  /**
   * Returns the appropriate LookupService instance based on configuration
   */
  provideLookupService(): LookupService | MockLookupService {
    return this.serviceConfig.getUseMockServices()
      ? new MockLookupService()
      : new LookupService(inject);
  }

  /**
   * Returns the appropriate ProjectService instance based on configuration
   */
  provideProjectService(): ProjectService | MockProjectService {
    return this.serviceConfig.getUseMockServices()
      ? new MockProjectService()
      : new ProjectService(inject);
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
      if (serviceConfig.getUseMockServices()) {
        return new MockLookupService();
      }
      return new LookupService(inject);
    }
  };
}

export function provideProjectServiceFactory(): Provider {
  return {
    provide: ProjectService,
    useFactory: () => {
      const serviceConfig = inject(ServiceConfigurationService);
      if (serviceConfig.getUseMockServices()) {
        return new MockProjectService();
      }
      return new ProjectService(inject);
    }
  };
}


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockProjectService } from '../../services/mock/mock-project.service';
import { Project, ProjectStatus } from '../../models/project.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-12 gap-8">
      <!-- KPI Cards -->
      <div class="col-span-12 lg:col-span-3">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-500 font-medium">Progetti Attivi</span>
              <div class="text-900 font-bold text-xl">{{ stats.progettiAttivi }}</div>
            </div>
            <div class="flex items-center justify-center w-3rem h-3rem bg-blue-100 rounded-full">
              <i class="pi pi-list text-blue-500 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-3">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-500 font-medium">Valore Portfolio</span>
              <div class="text-900 font-bold text-xl">{{ stats.valorePortfolio | currency:'EUR':'symbol':'1.0-0' }}</div>
            </div>
            <div class="flex items-center justify-center w-3rem h-3rem bg-green-100 rounded-full">
              <i class="pi pi-euro text-green-500 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-3">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-500 font-medium">Installazioni Mese</span>
              <div class="text-900 font-bold text-xl">{{ stats.installazioniMese }}</div>
            </div>
            <div class="flex items-center justify-center w-3rem h-3rem bg-orange-100 rounded-full">
              <i class="pi pi-calendar text-orange-500 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-3">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-500 font-medium">Progetti in Ritardo</span>
              <div class="text-900 font-bold text-xl">{{ stats.progettiRitardo }}</div>
            </div>
            <div class="flex items-center justify-center w-3rem h-3rem bg-red-100 rounded-full">
              <i class="pi pi-exclamation-triangle text-red-500 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Grafici -->
      <div class="col-span-12 lg:col-span-6">
        <div class="card">
          <h5 class="text-900 font-bold text-xl mb-4">Progetti per Stato</h5>
          <div class="flex flex-wrap gap-4">
            <div *ngFor="let status of progettiPerStato" class="flex items-center">
              <div class="w-3rem h-3rem rounded-full flex items-center justify-center mr-3" 
                   [ngClass]="getStatusColor(status.stato)">
                <i class="pi pi-circle-fill text-white"></i>
              </div>
              <div>
                <div class="font-bold">{{ status.count }}</div>
                <div class="text-500 text-sm">{{ status.stato }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-6">
        <div class="card">
          <h5 class="text-900 font-bold text-xl mb-4">Trend Mensile</h5>
          <div class="text-center">
            <div class="text-500 mb-2">Progetti creati negli ultimi 6 mesi</div>
            <div class="flex justify-center items-end h-8rem gap-2">
              <div *ngFor="let month of trendMensile" 
                   class="bg-blue-500 rounded-t" 
                   [style.height.%]="month.value * 2"
                   [style.width.px]="30">
                <div class="text-xs text-center text-white mt-1">{{ month.value }}</div>
              </div>
            </div>
            <div class="flex justify-center gap-2 mt-2">
              <span *ngFor="let month of trendMensile" class="text-xs text-500">{{ month.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Progetti Recenti -->
      <div class="col-span-12 lg:col-span-8">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h5 class="text-900 font-bold text-xl">Progetti Recenti</h5>
            <button class="p-button p-button-outlined p-button-sm" routerLink="/projects">
              <i class="pi pi-list mr-2"></i>
              Vedi Tutti
            </button>
          </div>
          <div class="overflow-auto">
            <table class="w-full">
              <thead>
                <tr class="border-bottom-1 surface-border">
                  <th class="text-left p-3">Progetto</th>
                  <th class="text-left p-3">Cliente</th>
                  <th class="text-left p-3">PM</th>
                  <th class="text-left p-3">Data Installazione</th>
                  <th class="text-left p-3">Stato</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let project of progettiRecenti" class="border-bottom-1 surface-border">
                  <td class="p-3">
                    <div class="font-bold">{{ project.numeroProgetto }}</div>
                    <div class="text-500 text-sm">{{ project.nomeProgetto }}</div>
                  </td>
                  <td class="p-3">{{ project.cliente }}</td>
                  <td class="p-3">{{ project.projectManager }}</td>
                  <td class="p-3">
                    <span *ngIf="project.dataCreazione" 
                          [ngClass]="getDateClass(project.dataCreazione)">
                      {{ project.dataCreazione | date:'dd/MM/yyyy' }}
                    </span>
                    <span *ngIf="!project.dataCreazione" class="text-500">-</span>
                  </td>
                  <td class="p-3">
                    <span class="p-tag" [ngClass]="getStatusTagClass(project.statoProgetto)">
                      {{ project.statoProgetto }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Notifiche e Azioni Rapide -->
      <div class="col-span-12 lg:col-span-4">
        <div class="card mb-4">
          <h5 class="text-900 font-bold text-xl mb-4">Azioni Rapide</h5>
          <div class="flex flex-column gap-3">
            <button class="p-button p-button-primary" routerLink="/projects/new">
              <i class="pi pi-plus mr-2"></i>
              Nuovo Progetto
            </button>
            <button class="p-button p-button-outlined">
              <i class="pi pi-calendar mr-2"></i>
              Calendario Installazioni
            </button>
            <button class="p-button p-button-outlined">
              <i class="pi pi-download mr-2"></i>
              Export Dati
            </button>
            <button class="p-button p-button-outlined">
              <i class="pi pi-chart-bar mr-2"></i>
              Report Progetti
            </button>
          </div>
        </div>

        <div class="card">
          <h5 class="text-900 font-bold text-xl mb-4">Notifiche</h5>
          <div class="flex flex-column gap-3">
            <div *ngFor="let notification of notifiche" class="flex items-start gap-3 p-3 border-1 surface-border rounded">
              <i class="pi pi-info-circle text-blue-500 mt-1"></i>
              <div>
                <div class="font-bold text-sm">{{ notification.title }}</div>
                <div class="text-500 text-xs">{{ notification.message }}</div>
                <div class="text-400 text-xs mt-1">{{ notification.time }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Dashboard implements OnInit {
  stats = {
    progettiAttivi: 0,
    valorePortfolio: 0,
    installazioniMese: 0,
    progettiRitardo: 0
  };

  progettiPerStato: any[] = [];
  trendMensile: any[] = [];
  progettiRecenti: Project[] = [];
  notifiche: any[] = [];

  private projectService: MockProjectService;

  constructor() {
    this.projectService = new MockProjectService();
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Carica statistiche
    this.projectService.getProjectStats().subscribe(stats => {
      this.stats = stats;
    });

    // Carica progetti per stato
    this.projectService.getProjectsByStatus().subscribe(data => {
      this.progettiPerStato = data;
    });

    // Carica trend mensile
    this.projectService.getProjectsByMonth().subscribe(data => {
      this.trendMensile = data;
    });

    // Carica progetti recenti
    this.projectService.getProjects().subscribe(projects => {
      this.progettiRecenti = projects.slice(0, 5);
    });

    // Notifiche mock (da implementare con servizio notifiche)
    this.notifiche = [
      {
        title: 'Installazione in ritardo',
        message: 'Progetto 25.087 - Installazione prevista per oggi',
        time: '2 ore fa'
      },
      {
        title: 'Nuovo progetto creato',
        message: 'Progetto 25.090 - ACME Corporation',
        time: '4 ore fa'
      },
      {
        title: 'Sincronizzazione SAP completata',
        message: 'Aggiornati 15 progetti',
        time: '6 ore fa'
      }
    ];
  }

  getStatusColor(stato: string): string {
    switch (stato) {
      case ProjectStatus.CRITICAL: return 'bg-black';
      case ProjectStatus.HOLD_ON: return 'bg-red-500';
      case ProjectStatus.RUSH: return 'bg-purple-500';
      case ProjectStatus.TO_CHECK: return 'bg-pink-200';
      case ProjectStatus.UPCOMING: return 'bg-purple-200';
      case ProjectStatus.PUSHED_OUT: return 'bg-green-500';
      case ProjectStatus.ON_BID: return 'bg-purple-600';
      default: return 'bg-gray-500';
    }
  }

  getStatusTagClass(stato: ProjectStatus): string {
    switch (stato) {
      case ProjectStatus.CRITICAL: return 'p-tag-danger';
      case ProjectStatus.HOLD_ON: return 'p-tag-danger';
      case ProjectStatus.RUSH: return 'p-tag-warning';
      case ProjectStatus.TO_CHECK: return 'p-tag-info';
      case ProjectStatus.UPCOMING: return 'p-tag-info';
      case ProjectStatus.PUSHED_OUT: return 'p-tag-success';
      case ProjectStatus.ON_BID: return 'p-tag-warning';
      default: return 'p-tag-secondary';
    }
  }

  getDateClass(data: Date): string {
    const oggi = new Date();
    const dataInstallazione = new Date(data);
    const diffTime = dataInstallazione.getTime() - oggi.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-500 font-bold';
    if (diffDays <= 3) return 'text-orange-500 font-bold';
    return 'text-green-500';
  }
}
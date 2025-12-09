import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MockProjectService } from '../../services/mock/mock-project.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Project, ProjectStatus } from '../../models/project.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TranslatePipe],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {
  stats = {
    progettiAttivi: 0,
    valorePortfolio: 0,
    installazioniMese: 0,
    progettiRitardo: 0
  };

  progettiPerStato: { stato: string; count: number }[] = [];
  trendMensile: { label: string; value: number }[] = [];
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
      case ProjectStatus.TO_BE_ASSIGNED: return 'bg-yellow-500';
      case ProjectStatus.ON_HOLD: return 'bg-orange-500';
      case ProjectStatus.COMPLETED: return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  }

  getStatusTagClass(stato: ProjectStatus | string | undefined): string {
    const value = typeof stato === 'string' ? stato as ProjectStatus : stato;
    switch (value) {
      case ProjectStatus.CRITICAL: return 'p-tag-danger';
      case ProjectStatus.HOLD_ON: return 'p-tag-danger';
      case ProjectStatus.RUSH: return 'p-tag-warning';
      case ProjectStatus.TO_CHECK: return 'p-tag-info';
      case ProjectStatus.UPCOMING: return 'p-tag-info';
      case ProjectStatus.PUSHED_OUT: return 'p-tag-success';
      case ProjectStatus.TO_BE_ASSIGNED: return 'p-tag-warning';
      case ProjectStatus.ON_HOLD: return 'p-tag-warning';
      case ProjectStatus.COMPLETED: return 'p-tag-success';
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
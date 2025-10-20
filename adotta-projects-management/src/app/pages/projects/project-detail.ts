import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ProjectService } from '../../services/project.service';
import { MockProjectService } from '../../services/mock/mock-project.service';
import { Project, LivelloProgetto, ProdottoProgetto, StoricoModifica, ProjectStatus } from '../../models/project.model';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    TableModule
  ],
  templateUrl: './project-detail.html'
})
export class ProjectDetail implements OnInit {
  project?: Project;
  livelli: LivelloProgetto[] = [];
  prodotti: ProdottoProgetto[] = [];
  storicoModifiche: StoricoModifica[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Usa servizi mock in assenza di backend
    this.projectService = new MockProjectService() as any;
  }

  private projectService: ProjectService;
  

  ngOnInit() {
    this.route.params.subscribe(params => {
      const numeroProgetto = params['id'];
      if (numeroProgetto) {
        this.loadProject(numeroProgetto);
      }
    });
  }

  loadProject(numeroProgetto: string) {
    this.loading = true;
    
    this.projectService.getProject(numeroProgetto).subscribe({
      next: (project) => {
        this.project = project;
        this.loadRelatedData(numeroProgetto);
        this.loading = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento progetto:', error);
        this.loading = false;
      }
    });
  }

  loadRelatedData(numeroProgetto: string) {
    // Load livelli
    this.projectService.getLivelliProgetto(numeroProgetto).subscribe(livelli => {
      this.livelli = livelli;
    });

    // Load prodotti
    this.projectService.getProdottiProgetto(numeroProgetto).subscribe(prodotti => {
      this.prodotti = prodotti;
    });

    // Load storico modifiche
    this.projectService.getStoricoModifiche(numeroProgetto).subscribe(storico => {
      this.storicoModifiche = storico;
    });
  }

  getStatusSeverity(status?: ProjectStatus): string {
    if (!status) return 'secondary';
    
    switch (status) {
      case ProjectStatus.CRITICAL: return 'danger';
      case ProjectStatus.HOLD_ON: return 'danger';
      case ProjectStatus.RUSH: return 'warning';
      case ProjectStatus.TO_CHECK: return 'info';
      case ProjectStatus.UPCOMING: return 'info';
      case ProjectStatus.PUSHED_OUT: return 'success';
      case ProjectStatus.ON_BID: return 'warning';
      default: return 'secondary';
    }
  }

  getDateClass(data?: Date): string {
    if (!data) return '';
    
    const oggi = new Date();
    const dataInstallazione = new Date(data);
    const diffTime = dataInstallazione.getTime() - oggi.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-500 font-bold';
    if (diffDays <= 3) return 'text-orange-500 font-bold';
    return 'text-green-500';
  }

  getTipoProdottoSeverity(tipo: string): string {
    switch (tipo) {
      case 'Metafora': return 'success';
      case 'Wallen': return 'info';
      case 'Armonica': return 'warning';
      default: return 'secondary';
    }
  }

}
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
  template: `
    <div class="grid grid-cols-12 gap-4">
      <!-- Header Info -->
      <div class="col-span-12">
        <div class="card">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <button class="p-button p-button-text" routerLink="/projects">
                <i class="pi pi-arrow-left"></i>
              </button>
              <div>
                <h1 class="text-900 font-bold text-2xl m-0">
                  {{ project?.numeroProgetto }} - {{ project?.nomeProgetto }}
                </h1>
                <div class="flex items-center gap-4 mt-2">
                  <p-tag [value]="project?.statoProgetto" 
                         [severity]="getStatusSeverity(project?.statoProgetto)">
                  </p-tag>
                  <span class="text-500">{{ project?.cliente }}</span>
                  <span class="text-500">{{ project?.citta }}, {{ project?.stato }}</span>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <button class="p-button p-button-outlined" 
                      [routerLink]="['/projects', project?.numeroProgetto, 'edit']">
                <i class="pi pi-pencil mr-2"></i>
                Modifica
              </button>
              <button class="p-button p-button-outlined">
                <i class="pi pi-download mr-2"></i>
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Informazioni Generali -->
      <div class="col-span-12 lg:col-span-6">
        <p-card header="Dati Principali">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-500 text-sm">Numero Progetto</label>
              <div class="font-bold">{{ project?.numeroProgetto }}</div>
            </div>
            <div>
              <label class="text-500 text-sm">Cliente</label>
              <div class="font-bold">{{ project?.cliente }}</div>
            </div>
            <div>
              <label class="text-500 text-sm">Località</label>
              <div class="font-bold">{{ project?.citta }}, {{ project?.stato }}</div>
            </div>
            <div>
              <label class="text-500 text-sm">Stato Progetto</label>
              <div>
                <p-tag [value]="project?.statoProgetto" 
                       [severity]="getStatusSeverity(project?.statoProgetto)">
                </p-tag>
              </div>
            </div>
            <div>
              <label class="text-500 text-sm">Versione WIC</label>
              <div class="font-bold">{{ project?.versioneWIC || '-' }}</div>
            </div>
            <div>
              <label class="text-500 text-sm">Ultima Modifica</label>
              <div class="font-bold">{{ project?.ultimaModifica ? (project?.ultimaModifica | date:'dd/MM/yyyy') : '-' }}</div>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-span-12 lg:col-span-6">
        <p-card header="Team e Responsabilità">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-500 text-sm">Project Manager</label>
              <div class="font-bold">{{ project?.projectManager || '-' }}</div>
            </div>
            <div>
              <label class="text-500 text-sm">Team Tecnico</label>
              <div class="font-bold">{{ project?.teamTecnico || '-' }}</div>
            </div>
            <div>
              <label class="text-500 text-sm">Team APL</label>
              <div class="font-bold">{{ project?.teamAPL || '-' }}</div>
            </div>
            <div>
              <label class="text-500 text-sm">Sales</label>
              <div class="font-bold">{{ project?.sales || '-' }}</div>
            </div>
            <div class="col-span-2">
              <label class="text-500 text-sm">Team Installazione</label>
              <div class="font-bold">{{ project?.teamInstallazione || '-' }}</div>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-span-12 lg:col-span-6">
        <p-card header="Pianificazione">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-500 text-sm">Data Creazione</label>
              <div class="font-bold">{{ project?.dataCreazione | date:'dd/MM/yyyy' }}</div>
            </div>
            <div>
              <label class="text-500 text-sm">Data Inizio Installazione</label>
              <div class="font-bold" [ngClass]="getDateClass(project?.dataInizioInstallazione)">
                {{ project?.dataInizioInstallazione ? (project?.dataInizioInstallazione | date:'dd/MM/yyyy') : '-' }}
              </div>
            </div>
            <div>
              <label class="text-500 text-sm">Data Fine Installazione</label>
              <div class="font-bold">{{ project?.dataFineInstallazione ? (project?.dataFineInstallazione | date:'dd/MM/yyyy') : '-' }}</div>
            </div>
            <div>
              <label class="text-500 text-sm">In Ritardo</label>
              <div class="font-bold">{{ project?.isInRitardo ? 'Sì' : 'No' }}</div>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Livelli -->
      <div class="col-span-12">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-900 font-bold">Livelli del Progetto</h4>
            <span class="p-tag p-tag-info">{{ livelli.length }} livelli</span>
          </div>

          <p-table [value]="livelli" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Descrizione</th>
                <th style="text-align: right">Inizio Installazione</th>
                <th style="text-align: right">Fine Installazione</th>
                <!--th>Caricamento</th-->
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-livello>
              <tr>
                <td>{{ livello.ordine }}</td>
                <td class="font-bold">{{ livello.nome }}</td>
                <td>{{ livello.descrizione }}</td>
                <td style="text-align: right">{{ livello.dataInizioInstallazione ? (livello.dataInizioInstallazione | date:'dd/MM/yyyy') : '-' }}</td>
                <td style="text-align: right">{{ livello.dataFineInstallazione ? (livello.dataFineInstallazione | date:'dd/MM/yyyy') : '-' }}</td>
                <!--td>{{ livello.dataCaricamento ? (livello.dataCaricamento | date:'dd/MM/yyyy') : '-' }}</td-->
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="text-center p-4 text-500">
                  Nessun livello definito
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>

      <!-- Prodotti -->
      <div class="col-span-12">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-900 font-bold">Prodotti del Progetto</h4>
            <span class="p-tag p-tag-info">{{ prodotti.length }} prodotti</span>
          </div>

          <p-table [value]="prodotti" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>Tipo</th>
                <th>Variante</th>
                <th style="text-align: right">Quantità (m²)</th>
                <th style="text-align: right">Quantità (ft)</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-prodotto>
              <tr>
                <td>
                  <p-tag [value]="prodotto.tipoProdotto" 
                         [severity]="getTipoProdottoSeverity(prodotto.tipoProdotto)">
                  </p-tag>
                </td>
                <td>{{ prodotto.variante || '-' }}</td>
                <td class="font-bold" style="text-align: right">{{ prodotto.qMq }}</td>
                <td class="font-bold" style="text-align: right">{{ prodotto.qFt }}</td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4" class="text-center p-4 text-500">
                  Nessun prodotto definito
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
    </div>
  `
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
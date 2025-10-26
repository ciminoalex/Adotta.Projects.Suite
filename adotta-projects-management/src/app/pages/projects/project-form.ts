import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProjectService } from '../../services/project.service';
import { LookupService } from '../../services/lookup.service';
import { MockProjectService } from '../../services/mock/mock-project.service';
import { MockLookupService } from '../../services/mock/mock-lookup.service';
import { Project, LivelloProgetto, ProdottoProgetto, ProjectStatus } from '../../models/project.model';
import { Cliente, Stato, Citta, TeamTecnico, TeamAPL, Sales, ProjectManager, SquadraInstallazione, ProdottoMaster } from '../../models/lookup.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    ButtonModule,
    AutoCompleteModule,
    MultiSelectModule,
    TableModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    SkeletonModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './project-form.html'
})
export class ProjectForm implements OnInit {
  projectForm: FormGroup;
  levelForm?: FormGroup;
  productForm?: FormGroup;
  loading = false;
  isEdit = false;
  projectId?: string;
  
  // Loading states
  loadingProject = false;
  loadingLookupData = false;

  // Services
  private projectService: ProjectService;
  private lookupService: LookupService;

  // Levels and Products management
  livelli: LivelloProgetto[] = [];
  prodotti: ProdottoProgetto[] = [];
  showLevelDialog = false;
  showProductDialog = false;
  editingLevel?: LivelloProgetto;
  editingProduct?: ProdottoProgetto;

  // Lookup data
  clienti: Cliente[] = [];
  filteredClienti: Cliente[] = [];
  stati: Stato[] = [];
  teamTecnici: TeamTecnico[] = [];
  teamAPL: TeamAPL[] = [];
  sales: Sales[] = [];
  projectManagers: ProjectManager[] = [];
  squadreInstallazione: SquadraInstallazione[] = [];
  prodottiMaster: ProdottoMaster[] = [];

  // Form options
  statusOptions = [
    { label: 'CRITICAL', value: ProjectStatus.CRITICAL },
    { label: 'HOLD ON', value: ProjectStatus.HOLD_ON },
    { label: 'RUSH', value: ProjectStatus.RUSH },
    { label: 'TO CHECK', value: ProjectStatus.TO_CHECK },
    { label: 'UPCOMING', value: ProjectStatus.UPCOMING },
    { label: 'PUSHED OUT', value: ProjectStatus.PUSHED_OUT },
    { label: 'ON BID', value: ProjectStatus.ON_BID }
  ];

  // Priority options removed - not part of simplified model

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    // Usa servizi mock in assenza di backend
    this.projectService = new MockProjectService() as any;
    this.lookupService = new MockLookupService() as any;
    this.projectForm = this.fb.group({
      numeroProgetto: ['', Validators.required],
      nomeProgetto: ['', Validators.required],
      cliente: ['', Validators.required],
      citta: [''],
      stato: [''], // Will store the codiceISO as string
      codiceSAP: [''],
      teamTecnico: [''],
      teamAPL: [''],
      sales: [''],
      projectManager: [''],
      teamInstallazione: [''],
      dataCreazione: [new Date()],
      dataInizioInstallazione: [''],
      dataFineInstallazione: [''],
      ultimaModifica: [''],
      valoreProgetto: [''],
      marginePrevisto: [''],
      costiSostenuti: [0],
      statoProgetto: [ProjectStatus.UPCOMING],
      note: [''],
      livelli: [[]],
      prodotti: [[]]
    });
  }

  ngOnInit() {
    this.loadingLookupData = true;
    this.loadLookupData();
    
    // Check if editing
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.projectId = params['id'];
        this.loadingProject = true;
        // Wait a bit for lookup data to load before loading project
        setTimeout(() => {
          this.loadProject();
        }, 500);
      }
    });

  }

  loadLookupData() {
    let completedRequests = 0;
    const totalRequests = 8;

    const checkAllLoaded = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.loadingLookupData = false;
      }
    };

    this.lookupService.getClienti().subscribe({
      next: (clienti) => {
        this.clienti = clienti;
        console.log('Clienti loaded:', clienti);
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error loading clienti:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getStati().subscribe({
      next: (stati) => {
        this.stati = stati;
        console.log('Stati loaded:', stati);
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error loading stati:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getTeamTecnici().subscribe({
      next: (teams) => {
        this.teamTecnici = teams;
        console.log('Team Tecnici loaded:', teams);
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error loading team tecnici:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getTeamAPL().subscribe({
      next: (teams) => {
        this.teamAPL = teams;
        console.log('Team APL loaded:', teams);
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error loading team APL:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getSales().subscribe({
      next: (sales) => {
        this.sales = sales;
        console.log('Sales loaded:', sales);
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error loading sales:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getProjectManagers().subscribe({
      next: (pms) => {
        this.projectManagers = pms;
        console.log('Project Managers loaded:', pms);
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error loading project managers:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getSquadreInstallazione().subscribe({
      next: (squadre) => {
        this.squadreInstallazione = squadre;
        console.log('Squadre Installazione loaded:', squadre);
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error loading squadre installazione:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getProdottiMaster().subscribe({
      next: (prodotti) => {
        this.prodottiMaster = prodotti;
        console.log('Prodotti Master loaded:', prodotti);
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error loading prodotti master:', error);
        checkAllLoaded();
      }
    });
  }

  loadProject() {
    if (this.projectId) {
      this.projectService.getProject(this.projectId).subscribe({
        next: (project) => {
          console.log('Project loaded:', project);
          this.projectForm.patchValue(project);
          
          // Load levels and products from project data
          this.livelli = project.livelli || [];
          this.prodotti = project.prodotti || [];
          
          console.log('Livelli loaded:', this.livelli);
          console.log('Prodotti loaded:', this.prodotti);
          
          // Hide loading skeleton
          this.loadingProject = false;
        },
        error: (error) => {
          console.error('Error loading project:', error);
          this.loadingProject = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Progetto non trovato',
            detail: `Il progetto ${this.projectId} non esiste. Verrai reindirizzato alla lista progetti.`
          });
          // Redirect to project list after a short delay
          setTimeout(() => {
            this.router.navigate(['/projects']);
          }, 2000);
        }
      });
    }
  }

  get clientiNames(): string[] {
    return this.clienti.map(c => c.nome || '');
  }

  filterClienti(event: any) {
    const query = event.query.toLowerCase();
    this.filteredClienti = this.clienti.filter(cliente => 
      cliente.nome.toLowerCase().includes(query)
    );
  }

  saveProject() {
    if (this.projectForm.valid) {
      this.loading = true;
      const projectData = {
        ...this.projectForm.value,
        livelli: this.livelli,
        prodotti: this.prodotti
      };

      const saveOperation = this.isEdit 
        ? this.projectService.updateProject(this.projectId!, projectData)
        : this.projectService.createProject(projectData);

      saveOperation.subscribe({
        next: (project) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successo',
            detail: `Progetto ${this.isEdit ? 'aggiornato' : 'creato'} con successo`
          });
          this.router.navigate(['/projects', project.numeroProgetto]);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Errore',
            detail: 'Errore nel salvataggio del progetto'
          });
          this.loading = false;
        }
      });
    }
  }

  // Levels Management Methods
  addLevel() {
    this.editingLevel = undefined;
    this.levelForm = this.fb.group({
      nome: ['', Validators.required],
      ordine: [this.livelli.length + 1, Validators.required],
      descrizione: [''],
      dataInizioInstallazione: [''],
      dataFineInstallazione: ['']
    });
    this.showLevelDialog = true;
  }

  editLevel(livello: LivelloProgetto) {
    this.editingLevel = livello;
    this.levelForm = this.fb.group({
      nome: [livello.nome, Validators.required],
      ordine: [livello.ordine, Validators.required],
      descrizione: [livello.descrizione],
      dataInizioInstallazione: [livello.dataInizioInstallazione],
      dataFineInstallazione: [livello.dataFineInstallazione]
    });
    this.showLevelDialog = true;
  }

  saveLevel() {
    if (this.levelForm?.valid) {
      const levelData = this.levelForm.value;
      
      if (this.editingLevel) {
        // Update existing level
        const index = this.livelli.findIndex(l => l === this.editingLevel);
        if (index !== -1) {
          this.livelli[index] = { ...this.editingLevel, ...levelData };
        }
      } else {
        // Add new level
        const newLevel: LivelloProgetto = {
          ...levelData,
          id: Math.max(...this.livelli.map(l => l.id || 0), 0) + 1,
          progettoId: this.projectId ? parseInt(this.projectId) : 0,
          dataCaricamento: new Date()
        };
        this.livelli.push(newLevel);
      }
      
      this.showLevelDialog = false;
      this.levelForm = undefined;
      this.editingLevel = undefined;
      
      this.messageService.add({
        severity: 'success',
        summary: 'Successo',
        detail: 'Livello salvato con successo'
      });
    }
  }

  cancelLevelEdit() {
    this.showLevelDialog = false;
    this.levelForm = undefined;
    this.editingLevel = undefined;
  }

  deleteLevel(livello: LivelloProgetto) {
    this.confirmationService.confirm({
      message: 'Sei sicuro di voler eliminare questo livello?',
      header: 'Conferma Eliminazione',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.livelli = this.livelli.filter(l => l !== livello);
        this.messageService.add({
          severity: 'success',
          summary: 'Successo',
          detail: 'Livello eliminato con successo'
        });
      }
    });
  }

  // Products Management Methods
  addProduct() {
    this.editingProduct = undefined;
    this.productForm = this.fb.group({
      tipoProdotto: ['', Validators.required],
      variante: ['', Validators.required],
      qMq: [0, [Validators.required, Validators.min(0)]],
      qFt: [0, [Validators.required, Validators.min(0)]]
    });
    this.showProductDialog = true;
  }

  editProduct(prodotto: ProdottoProgetto) {
    this.editingProduct = prodotto;
    this.productForm = this.fb.group({
      tipoProdotto: [prodotto.tipoProdotto, Validators.required],
      variante: [prodotto.variante, Validators.required],
      qMq: [prodotto.qMq, [Validators.required, Validators.min(0)]],
      qFt: [prodotto.qFt, [Validators.required, Validators.min(0)]]
    });
    this.showProductDialog = true;
  }

  saveProduct() {
    if (this.productForm?.valid) {
      const productData = this.productForm.value;
      
      if (this.editingProduct) {
        // Update existing product
        const index = this.prodotti.findIndex(p => p === this.editingProduct);
        if (index !== -1) {
          this.prodotti[index] = { ...this.editingProduct, ...productData };
        }
      } else {
        // Add new product
        const newProduct: ProdottoProgetto = {
          ...productData,
          id: Math.max(...this.prodotti.map(p => p.id || 0), 0) + 1,
          progettoId: this.projectId ? parseInt(this.projectId) : 0
        };
        this.prodotti.push(newProduct);
      }
      
      this.showProductDialog = false;
      this.productForm = undefined;
      this.editingProduct = undefined;
      
      this.messageService.add({
        severity: 'success',
        summary: 'Successo',
        detail: 'Prodotto salvato con successo'
      });
    }
  }

  cancelProductEdit() {
    this.showProductDialog = false;
    this.productForm = undefined;
    this.editingProduct = undefined;
  }

  deleteProduct(prodotto: ProdottoProgetto) {
    this.confirmationService.confirm({
      message: 'Sei sicuro di voler eliminare questo prodotto?',
      header: 'Conferma Eliminazione',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.prodotti = this.prodotti.filter(p => p !== prodotto);
        this.messageService.add({
          severity: 'success',
          summary: 'Successo',
          detail: 'Prodotto eliminato con successo'
        });
      }
    });
  }
}
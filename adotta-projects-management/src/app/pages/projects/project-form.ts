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
import { ServiceProviderService } from '../../services/service-provider.service';
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
  private projectService: ProjectService | any;
  private lookupService: LookupService | any;

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
    { label: 'ON GOING', value: ProjectStatus.ON_GOING },
    { label: 'CRITICAL', value: ProjectStatus.CRITICAL },
    { label: 'HOLD ON', value: ProjectStatus.HOLD_ON },
    { label: 'RUSH', value: ProjectStatus.RUSH },
    { label: 'TO CHECK', value: ProjectStatus.TO_CHECK },
    { label: 'UPCOMING', value: ProjectStatus.UPCOMING },
    { label: 'PUSHED OUT', value: ProjectStatus.PUSHED_OUT },
    { label: 'ON BID', value: ProjectStatus.ON_BID }
  ];

  // Mapping between ProjectStatus enum string and integer (as per C# enum order)
  private statusToInt(status: ProjectStatus): number {
    const mapping: Record<ProjectStatus, number> = {
      [ProjectStatus.ON_GOING]: 0,
      [ProjectStatus.CRITICAL]: 1,
      [ProjectStatus.HOLD_ON]: 2,
      [ProjectStatus.RUSH]: 3,
      [ProjectStatus.TO_CHECK]: 4,
      [ProjectStatus.UPCOMING]: 5,
      [ProjectStatus.PUSHED_OUT]: 6,
      [ProjectStatus.ON_BID]: 7
    };
    return mapping[status] ?? 0;
  }

  // Mapping between integer and ProjectStatus enum string
  private intToStatus(value: number): ProjectStatus {
    const mapping: Record<number, ProjectStatus> = {
      0: ProjectStatus.ON_GOING,
      1: ProjectStatus.CRITICAL,
      2: ProjectStatus.HOLD_ON,
      3: ProjectStatus.RUSH,
      4: ProjectStatus.TO_CHECK,
      5: ProjectStatus.UPCOMING,
      6: ProjectStatus.PUSHED_OUT,
      7: ProjectStatus.ON_BID
    };
    return mapping[value] ?? ProjectStatus.UPCOMING;
  }

  // Priority options removed - not part of simplified model

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private serviceProvider: ServiceProviderService
  ) {
    // Use services based on configuration (mock or real API)
    this.projectService = this.serviceProvider.provideProjectService();
    this.lookupService = this.serviceProvider.provideLookupService();
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
      next: (clienti: Cliente[]) => {
        this.clienti = clienti;
        console.log('Clienti loaded:', clienti);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading clienti:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getStati().subscribe({
      next: (stati: Stato[]) => {
        this.stati = stati;
        console.log('Stati loaded:', stati);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading stati:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getTeamTecnici().subscribe({
      next: (teams: TeamTecnico[]) => {
        this.teamTecnici = teams;
        console.log('Team Tecnici loaded:', teams);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading team tecnici:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getTeamAPL().subscribe({
      next: (teams: TeamAPL[]) => {
        this.teamAPL = teams;
        console.log('Team APL loaded:', teams);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading team APL:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getSales().subscribe({
      next: (sales: Sales[]) => {
        this.sales = sales;
        console.log('Sales loaded:', sales);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading sales:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getProjectManagers().subscribe({
      next: (pms: ProjectManager[]) => {
        this.projectManagers = pms;
        console.log('Project Managers loaded:', pms);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading project managers:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getSquadreInstallazione().subscribe({
      next: (squadre: SquadraInstallazione[]) => {
        this.squadreInstallazione = squadre;
        console.log('Squadre Installazione loaded:', squadre);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading squadre installazione:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getProdottiMaster().subscribe({
      next: (prodotti: ProdottoMaster[]) => {
        this.prodottiMaster = prodotti;
        console.log('Prodotti Master loaded:', prodotti);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading prodotti master:', error);
        checkAllLoaded();
      }
    });
  }

  loadProject() {
    if (this.projectId) {
      this.projectService.getProject(this.projectId).subscribe({
        next: (project: Project) => {
          console.log('Project loaded:', project);
          
          // Convert statoProgetto from integer to enum string if needed
          const projectData = { ...project };
          
          // Convert statoProgetto from number to enum string if it's a number
          if (projectData.statoProgetto !== undefined && projectData.statoProgetto !== null) {
            if (typeof projectData.statoProgetto === 'number') {
              projectData.statoProgetto = this.intToStatus(projectData.statoProgetto);
            } else if (typeof projectData.statoProgetto === 'string' && /^\d+$/.test(projectData.statoProgetto)) {
              // If it's a string representation of a number, convert it
              projectData.statoProgetto = this.intToStatus(parseInt(projectData.statoProgetto));
            }
            // If it's already a valid enum string, keep it as is
          }
          
          console.log('Project data:', projectData);
          console.log('Project data statoProgetto:', projectData.statoProgetto);
          
          this.projectForm.patchValue(projectData);
          
          // Load levels and products from project data
          this.livelli = project.livelli || [];
          this.prodotti = project.prodotti || [];
          
          console.log('Livelli loaded:', this.livelli);
          console.log('Prodotti loaded:', this.prodotti);
          
          // Hide loading skeleton
          this.loadingProject = false;
        },
        error: (error: any) => {
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
      const formValue = this.projectForm.value;
      
      // Helper function to format dates to ISO string
      const formatDate = (date: any): string | undefined => {
        if (!date) return undefined;
        if (date instanceof Date) {
          return date.toISOString().split('.')[0]; // Remove milliseconds
        }
        if (typeof date === 'string' && date.trim() !== '') {
          // If it's already a string, try to parse and format it
          const parsedDate = new Date(date);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString().split('.')[0];
          }
          return date; // Return as-is if it's already formatted
        }
        return undefined;
      };

      // Helper function to clean empty strings
      const cleanValue = (value: any): any => {
        if (value === '' || value === null) return undefined;
        return value;
      };

      // Build the project data object with proper formatting
      const projectData: any = {
        numeroProgetto: formValue.numeroProgetto,
        cliente: formValue.cliente,
        nomeProgetto: formValue.nomeProgetto,
        citta: cleanValue(formValue.citta),
        stato: cleanValue(formValue.stato),
        codiceSAP: cleanValue(formValue.codiceSAP),
        teamTecnico: cleanValue(formValue.teamTecnico),
        teamAPL: cleanValue(formValue.teamAPL),
        sales: cleanValue(formValue.sales),
        projectManager: cleanValue(formValue.projectManager),
        teamInstallazione: cleanValue(formValue.teamInstallazione),
        dataCreazione: formatDate(formValue.dataCreazione) || new Date().toISOString().split('.')[0],
        dataInizioInstallazione: formatDate(formValue.dataInizioInstallazione),
        dataFineInstallazione: formatDate(formValue.dataFineInstallazione),
        versioneWIC: cleanValue(formValue.versioneWIC),
        ultimaModifica: this.isEdit ? formatDate(new Date()) : undefined,
        valoreProgetto: cleanValue(formValue.valoreProgetto),
        marginePrevisto: cleanValue(formValue.marginePrevisto),
        costiSostenuti: formValue.costiSostenuti || 0,
        statoProgetto: formValue.statoProgetto || ProjectStatus.UPCOMING,
        note: cleanValue(formValue.note)
      };

      // Add livelli and prodotti only if they exist
      if (this.livelli && this.livelli.length > 0) {
        projectData.livelli = this.livelli.map(livello => ({
          ...livello,
          dataInizioInstallazione: formatDate(livello.dataInizioInstallazione),
          dataFineInstallazione: formatDate(livello.dataFineInstallazione),
          dataCaricamento: formatDate(livello.dataCaricamento)
        }));
      }

      if (this.prodotti && this.prodotti.length > 0) {
        projectData.prodotti = this.prodotti;
      }

      // Remove undefined fields to clean up the payload
      Object.keys(projectData).forEach(key => {
        if (projectData[key] === undefined) {
          delete projectData[key];
        }
      });

      // Log the payload being sent for debugging
      console.log('Sending project data:', JSON.stringify(projectData, null, 2));

      const saveOperation = this.isEdit 
        ? this.projectService.updateProject(this.projectId!, projectData)
        : this.projectService.createProject(projectData);

      saveOperation.subscribe({
        next: (project: Project) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successo',
            detail: `Progetto ${this.isEdit ? 'aggiornato' : 'creato'} con successo`
          });
          this.router.navigate(['/projects', project.numeroProgetto]);
        },
        error: (error: any) => {
          console.error('Error saving project:', error);
          console.error('Error response:', error.error);
          
          let errorDetail = 'Errore nel salvataggio del progetto';
          
          // Check for validation errors (ASP.NET Core format)
          if (error.error && error.error.errors) {
            const validationErrors = error.error.errors;
            const errorMessages: string[] = [];
            
            // Extract validation errors for each field
            Object.keys(validationErrors).forEach(field => {
              const fieldErrors = validationErrors[field];
              if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach((msg: string) => {
                  errorMessages.push(`${field}: ${msg}`);
                });
              } else if (typeof fieldErrors === 'string') {
                errorMessages.push(`${field}: ${fieldErrors}`);
              }
            });
            
            if (errorMessages.length > 0) {
              errorDetail = 'Errori di validazione:\n' + errorMessages.join('\n');
            } else if (error.error.title) {
              errorDetail = error.error.title;
            }
          } else if (error.error && error.error.message) {
            errorDetail = error.error.message;
          } else if (error.error && typeof error.error === 'string') {
            errorDetail = error.error;
          } else if (error.error && error.error.title) {
            errorDetail = error.error.title;
          }
          
          // Show multiple messages if there are many validation errors
          if (error.error && error.error.errors && Object.keys(error.error.errors).length > 3) {
            // Show first error as summary
            const firstError = Object.keys(error.error.errors)[0];
            const firstErrorMsg = Array.isArray(error.error.errors[firstError]) 
              ? error.error.errors[firstError][0] 
              : error.error.errors[firstError];
            
            this.messageService.add({
              severity: 'error',
              summary: 'Errori di validazione',
              detail: `${firstError}: ${firstErrorMsg} (e ${Object.keys(error.error.errors).length - 1} altri errori - vedi console)`,
              life: 10000
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Errore',
              detail: errorDetail,
              life: 10000
            });
          }
          
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
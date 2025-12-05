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

  // Helper function to convert ISO date string to YYYY-MM-DD format for HTML date inputs
  private convertDateForInput(dateValue: any): string {
    if (!dateValue) return '';
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0];
    }
    if (typeof dateValue === 'string' && dateValue.trim() !== '') {
      // Parse ISO string and extract date part
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        // Format as YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    return '';
  }

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

  // Helper function to extract array from either direct array or paginated response
  private extractArray<T>(response: T[] | { items: T[] } | any): T[] {
    if (Array.isArray(response)) {
      return response;
    }
    if (response && typeof response === 'object' && 'items' in response && Array.isArray(response.items)) {
      return response.items;
    }
    return [];
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

    // Load clienti with pageSize 100 (will use remote search for autocomplete)
    this.lookupService.getClienti(1, 100).subscribe({
      next: (response: any) => {
        this.clienti = this.extractArray<Cliente>(response);
        console.log('Clienti loaded:', this.clienti);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading clienti:', error);
        checkAllLoaded();
      }
    });

    // Load stati with pageSize 1000
    this.lookupService.getStati(1000).subscribe({
      next: (response: any) => {
        this.stati = this.extractArray<Stato>(response);
        console.log('Stati loaded:', this.stati);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading stati:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getTeamTecnici().subscribe({
      next: (response: any) => {
        this.teamTecnici = this.extractArray<TeamTecnico>(response);
        console.log('Team Tecnici loaded:', this.teamTecnici);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading team tecnici:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getTeamAPL().subscribe({
      next: (response: any) => {
        this.teamAPL = this.extractArray<TeamAPL>(response);
        console.log('Team APL loaded:', this.teamAPL);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading team APL:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getSales().subscribe({
      next: (response: any) => {
        this.sales = this.extractArray<Sales>(response);
        console.log('Sales loaded:', this.sales);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading sales:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getProjectManagers().subscribe({
      next: (response: any) => {
        this.projectManagers = this.extractArray<ProjectManager>(response);
        console.log('Project Managers loaded:', this.projectManagers);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading project managers:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getSquadreInstallazione().subscribe({
      next: (response: any) => {
        this.squadreInstallazione = this.extractArray<SquadraInstallazione>(response);
        console.log('Squadre Installazione loaded:', this.squadreInstallazione);
        checkAllLoaded();
      },
      error: (error: any) => {
        console.error('Error loading squadre installazione:', error);
        checkAllLoaded();
      }
    });

    this.lookupService.getProdottiMaster().subscribe({
      next: (response: any) => {
        this.prodottiMaster = this.extractArray<ProdottoMaster>(response);
        console.log('Prodotti Master loaded:', this.prodottiMaster);
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
          
          // Convert dates to YYYY-MM-DD format for HTML date inputs
          const formData = {
            ...projectData,
            dataCreazione: this.convertDateForInput(projectData.dataCreazione),
            dataInizioInstallazione: this.convertDateForInput(projectData.dataInizioInstallazione),
            dataFineInstallazione: this.convertDateForInput(projectData.dataFineInstallazione),
            ultimaModifica: this.convertDateForInput(projectData.ultimaModifica)
          };
          
          this.projectForm.patchValue(formData);
          
          // Find and set the cliente object for autocomplete if cliente name exists
          if (formData.cliente) {
            // First try to find in loaded clienti
            const clienteObj = this.clienti.find(c => c.nome === formData.cliente);
            if (clienteObj) {
              this.projectForm.patchValue({ cliente: clienteObj });
            } else {
              // If not found in loaded clienti, search remotely
              this.lookupService.searchClienti(formData.cliente).subscribe({
                next: (response: any) => {
                  const searchResults = this.extractArray<Cliente>(response);
                  const foundCliente = searchResults.find(c => c.nome === formData.cliente);
                  if (foundCliente) {
                    this.projectForm.patchValue({ cliente: foundCliente });
                  }
                },
                error: (error: any) => {
                  console.error('Error searching cliente for project load:', error);
                }
              });
            }
          }
          
          // Set lookup IDs in form - if the project has names, find the corresponding IDs
          // This handles backward compatibility: if the project has names instead of IDs,
          // we find the matching lookup by name and set the ID
          if (formData.teamTecnico) {
            const teamTecnico = this.teamTecnici.find(t => t.id === formData.teamTecnico || t.nome === formData.teamTecnico);
            if (teamTecnico?.id) {
              this.projectForm.patchValue({ teamTecnico: teamTecnico.id });
            }
          }
          
          if (formData.teamAPL) {
            const teamAPL = this.teamAPL.find(t => t.id === formData.teamAPL || t.nome === formData.teamAPL);
            if (teamAPL?.id) {
              this.projectForm.patchValue({ teamAPL: teamAPL.id });
            }
          }
          
          if (formData.sales) {
            const sales = this.sales.find(s => s.id === formData.sales || s.nome === formData.sales);
            if (sales?.id) {
              this.projectForm.patchValue({ sales: sales.id });
            }
          }
          
          if (formData.projectManager) {
            const pm = this.projectManagers.find(p => p.id === formData.projectManager || p.nome === formData.projectManager);
            if (pm?.id) {
              this.projectForm.patchValue({ projectManager: pm.id });
            }
          }
          
          if (formData.teamInstallazione) {
            const squadra = this.squadreInstallazione.find(s => s.id === formData.teamInstallazione || s.nome === formData.teamInstallazione);
            if (squadra?.id) {
              this.projectForm.patchValue({ teamInstallazione: squadra.id });
            }
          }
          
          // Load levels and products from project data
          // Ora i prodotti sono subordinati ai livelli
          const livelliWithProdotti = (project.livelli || []).map(livello => {
            // Carica i prodotti per questo livello
            const prodottiDelLivello = (project.prodotti || []).filter(p => p.livelloId === livello.id);
            return {
              ...livello,
              prodotti: prodottiDelLivello || [],
              expanded: false
            };
          });
          
          this.livelli = livelliWithProdotti;
          // Mantieni prodotti per retrocompatibilità
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

  filterClienti(event: any) {
    const query = event.query;
    if (!query || query.length < 1) {
      this.filteredClienti = [];
      return;
    }
    
    // Use remote search API instead of local filtering
    this.lookupService.searchClienti(query).subscribe({
      next: (response: any) => {
        this.filteredClienti = this.extractArray<Cliente>(response);
      },
      error: (error: any) => {
        console.error('Error searching clienti:', error);
        this.filteredClienti = [];
      }
    });
  }

  onClienteSelected(event: any) {
    // When a cliente is selected, set the codiceSAP field with the cardCode
    // The event contains the selected Cliente object in event.value
    const cliente: Cliente = event.value || event;
    if (cliente && cliente.cardCode) {
      this.projectForm.patchValue({ codiceSAP: cliente.cardCode });
    }
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
      // Extract cliente name if it's an object, otherwise use the string value
      const clienteValue = typeof formValue.cliente === 'object' && formValue.cliente?.nome 
        ? formValue.cliente.nome 
        : formValue.cliente;
      
      const projectData: any = {
        numeroProgetto: formValue.numeroProgetto,
        cliente: clienteValue,
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

      // Add livelli and prodotti - sempre includerli se esistono
      // Ora i prodotti sono subordinati ai livelli
      console.log('Livelli before save:', this.livelli);
      console.log('Livelli length:', this.livelli?.length);
      
      if (this.livelli && Array.isArray(this.livelli)) {
        // Mappa sempre i livelli, anche se l'array è vuoto
        projectData.livelli = this.livelli.map(livello => {
          // Build level object with explicit fields to ensure nome is included
          const livelloData: any = {
            id: livello.id,
            numeroProgetto: livello.numeroProgetto || formValue.numeroProgetto,
            nome: livello.nome || '',
            ordine: livello.ordine,
            descrizione: livello.descrizione || '',
            dataInizioInstallazione: formatDate(livello.dataInizioInstallazione),
            dataFineInstallazione: formatDate(livello.dataFineInstallazione),
            dataCaricamento: formatDate(livello.dataCaricamento)
          };
          
          // Remove undefined/null values except for id (which can be 0 for new levels)
          Object.keys(livelloData).forEach(key => {
            if (livelloData[key] === undefined && key !== 'id') {
              delete livelloData[key];
            }
          });
          
          return livelloData;
        });
        
        console.log('Livelli mapped:', projectData.livelli);
        
        // Raccogli tutti i prodotti dai livelli
        const allProdotti = this.livelli.flatMap(livello => {
          const prodottiDelLivello = livello.prodotti || [];
          console.log(`Prodotti del livello ${livello.id} (${livello.nome}):`, prodottiDelLivello);
          return prodottiDelLivello.map(prodotto => ({
            ...prodotto,
            livelloId: livello.id
          }));
        });
        
        console.log('All prodotti collected:', allProdotti);
        
        // Includi sempre i prodotti, anche se l'array è vuoto
        projectData.prodotti = allProdotti;
      } else {
        console.warn('No livelli found or livelli is not an array');
        // Inizializza comunque come array vuoto se non esiste
        projectData.livelli = [];
        projectData.prodotti = [];
      }

      // Remove undefined fields to clean up the payload
      // BUT keep livelli and prodotti arrays even if empty (they might be needed for new projects)
      Object.keys(projectData).forEach(key => {
        if (projectData[key] === undefined && key !== 'livelli' && key !== 'prodotti') {
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
  
  // Helper per inizializzare prodotti vuoti quando si crea un livello
  private initializeLevelProdotti(livello: LivelloProgetto): LivelloProgetto {
    if (!livello.prodotti) {
      livello.prodotti = [];
    }
    return livello;
  }

  editLevel(livello: LivelloProgetto) {
    this.editingLevel = livello;
    this.levelForm = this.fb.group({
      nome: [livello.nome, Validators.required],
      ordine: [livello.ordine, Validators.required],
      descrizione: [livello.descrizione],
      dataInizioInstallazione: [this.convertDateForInput(livello.dataInizioInstallazione)],
      dataFineInstallazione: [this.convertDateForInput(livello.dataFineInstallazione)]
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
          // Mantieni i prodotti esistenti
          const prodottiEsistenti = this.editingLevel.prodotti || [];
          this.livelli[index] = { 
            ...this.editingLevel, 
            ...levelData,
            prodotti: prodottiEsistenti,
            expanded: this.editingLevel.expanded || false
          };
        }
      } else {
        // Add new level
        const newLevel: LivelloProgetto = {
          ...levelData,
          id: Math.max(...this.livelli.map(l => l.id || 0), 0) + 1,
          progettoId: this.projectId ? parseInt(this.projectId) : 0,
          dataCaricamento: new Date(),
          prodotti: [], // Inizializza array prodotti vuoto
          expanded: false
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
    const numProdotti = (livello.prodotti || []).length;
    const message = numProdotti > 0 
      ? `Sei sicuro di voler eliminare questo livello? Verranno eliminati anche ${numProdotti} prodotti associati.`
      : 'Sei sicuro di voler eliminare questo livello?';
    
    this.confirmationService.confirm({
      message: message,
      header: 'Conferma Eliminazione',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Elimina anche i prodotti associati al livello
        if (livello.id) {
          this.prodotti = this.prodotti.filter(p => p.livelloId !== livello.id);
        }
        this.livelli = this.livelli.filter(l => l !== livello);
        this.messageService.add({
          severity: 'success',
          summary: 'Successo',
          detail: numProdotti > 0 
            ? `Livello eliminato con ${numProdotti} prodotti associati`
            : 'Livello eliminato con successo'
        });
      }
    });
  }

  // Products Management Methods
  addProduct(livello?: LivelloProgetto) {
    // Se non viene passato un livello, cerca il primo disponibile o mostra errore
    if (!livello && this.livelli.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attenzione',
        detail: 'Devi prima creare un livello per aggiungere prodotti'
      });
      return;
    }
    
    // Trova il livello target: se viene passato un livello, cerca quello corrispondente nell'array
    // per assicurarsi di avere il riferimento corretto
    let targetLivello: LivelloProgetto | undefined;
    
    if (livello) {
      // Cerca il livello nell'array usando l'id o il riferimento all'oggetto
      if (livello.id) {
        targetLivello = this.livelli.find(l => l.id === livello.id);
      }
      // Se non trovato per id, cerca per riferimento all'oggetto
      if (!targetLivello) {
        const index = this.livelli.findIndex(l => l === livello);
        if (index !== -1) {
          targetLivello = this.livelli[index];
        }
      }
      // Se ancora non trovato, usa il livello passato (potrebbe essere appena creato)
      if (!targetLivello) {
        targetLivello = livello;
      }
    } else {
      // Se non viene passato un livello, usa il primo disponibile
      targetLivello = this.livelli[0];
    }
    
    // Verifica che il livello target esista
    if (!targetLivello) {
      this.messageService.add({
        severity: 'error',
        summary: 'Errore',
        detail: 'Livello non trovato'
      });
      return;
    }
    
    // A questo punto targetLivello è garantito non undefined (dopo il controllo sopra)
    // Se il livello non ha un id, assegna un id temporaneo
    const finalLivello = targetLivello; // TypeScript non riconosce il controllo sopra, usiamo una variabile locale
    if (!finalLivello.id) {
      finalLivello.id = Math.max(...this.livelli.map(l => l.id || 0), 0) + 1;
    }
    
    // Assicurati che il livello sia nell'array livelli
    const livelloIndex = this.livelli.findIndex(l => l === finalLivello || (finalLivello.id && l.id === finalLivello.id));
    if (livelloIndex === -1) {
      // Se il livello non è nell'array, aggiungilo
      this.livelli.push(finalLivello);
    } else {
      // Aggiorna il riferimento per assicurarsi di usare quello nell'array
      targetLivello = this.livelli[livelloIndex];
    }
    
    this.editingProduct = undefined;
    this.productForm = this.fb.group({
      tipoProdotto: ['', Validators.required],
      variante: ['', Validators.required],
      qMq: [0, [Validators.required, Validators.min(0)]],
      qFt: [0, [Validators.required, Validators.min(0)]],
      livelloId: [targetLivello.id, Validators.required] // Memorizza il livelloId
    });
    this.showProductDialog = true;
    // Memorizza il livello target per quando si salva (usa finalLivello se disponibile, altrimenti targetLivello)
    const livelloToStore = livelloIndex !== -1 ? this.livelli[livelloIndex] : finalLivello;
    (this.productForm as any).targetLivello = livelloToStore;
  }

  editProduct(prodotto: ProdottoProgetto) {
    this.editingProduct = prodotto;
    // Trova il livello associato al prodotto
    const livello = this.livelli.find(l => l.id === prodotto.livelloId);
    
    this.productForm = this.fb.group({
      tipoProdotto: [prodotto.tipoProdotto, Validators.required],
      variante: [prodotto.variante, Validators.required],
      qMq: [prodotto.qMq, [Validators.required, Validators.min(0)]],
      qFt: [prodotto.qFt, [Validators.required, Validators.min(0)]],
      livelloId: [prodotto.livelloId, Validators.required]
    });
    this.showProductDialog = true;
    // Memorizza il livello target
    (this.productForm as any).targetLivello = livello;
  }

  saveProduct() {
    if (this.productForm?.valid) {
      const productData = this.productForm.value;
      let targetLivello = (this.productForm as any).targetLivello;
      
      // Se targetLivello non è impostato, prova a trovarlo usando livelloId
      if (!targetLivello && productData.livelloId) {
        targetLivello = this.livelli.find(l => l.id === productData.livelloId);
      }
      
      // Verifica che abbiamo sia il livello che l'id
      if (!targetLivello) {
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Livello non trovato. Assicurati di aver selezionato un livello valido.'
        });
        return;
      }
      
      if (productData.livelloId === undefined || productData.livelloId === null || productData.livelloId === '') {
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'ID livello non specificato nel form'
        });
        return;
      }
      
      // Assicurati che targetLivello.id corrisponda a productData.livelloId
      if (targetLivello.id !== productData.livelloId) {
        // Aggiorna l'id del livello se necessario
        targetLivello.id = productData.livelloId;
      }
      
      // Assicurati che il livello abbia un array prodotti
      if (!targetLivello.prodotti) {
        targetLivello.prodotti = [];
      }
      
      if (this.editingProduct) {
        // Update existing product
        const livelloIndex = this.livelli.findIndex(l => l.id === targetLivello.id);
        if (livelloIndex !== -1) {
          const prodottoIndex = targetLivello.prodotti.findIndex((p: ProdottoProgetto) => p === this.editingProduct);
          if (prodottoIndex !== -1) {
            // Aggiorna il prodotto nel livello
            this.livelli[livelloIndex].prodotti![prodottoIndex] = { 
              ...this.editingProduct, 
              ...productData,
              livelloId: productData.livelloId
            };
            
            // Aggiorna anche nella lista prodotti (per retrocompatibilità)
            const prodottiIndex = this.prodotti.findIndex(p => p === this.editingProduct);
            if (prodottiIndex !== -1) {
              this.prodotti[prodottiIndex] = { 
                ...this.editingProduct, 
                ...productData,
                livelloId: productData.livelloId
              };
            }
          }
        }
      } else {
        // Add new product
        const newProduct: ProdottoProgetto = {
          ...productData,
          id: Math.max(...this.prodotti.map(p => p.id || 0), 0) + 1,
          progettoId: this.projectId ? parseInt(this.projectId) : 0,
          livelloId: productData.livelloId
        };
        
        // Aggiungi al livello
        const livelloIndex = this.livelli.findIndex(l => l.id === targetLivello.id);
        if (livelloIndex !== -1) {
          if (!this.livelli[livelloIndex].prodotti) {
            this.livelli[livelloIndex].prodotti = [];
          }
          this.livelli[livelloIndex].prodotti!.push(newProduct);
        }
        
        // Aggiungi anche alla lista prodotti (per retrocompatibilità)
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
        // Trova il livello e rimuovi il prodotto
        if (prodotto.livelloId) {
          const livello = this.livelli.find(l => l.id === prodotto.livelloId);
          if (livello && livello.prodotti) {
            livello.prodotti = livello.prodotti.filter(p => p !== prodotto);
          }
        }
        
        // Rimuovi anche dalla lista prodotti (per retrocompatibilità)
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
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { MessageService } from 'primeng/api';
import { TimesheetService } from '../../services/timesheet.service';
import { ProjectService } from '../../services/project.service';
import { ServiceProviderService } from '../../services/service-provider.service';
import { ServiceConfigurationService } from '../../services/service-configuration.service';
import { HttpClient } from '@angular/common/http';
import { MockTimesheetService } from '../../services/mock/mock-timesheet.service';
import { AuthService } from '../../services/auth.service';
import { TimesheetEntry } from '../../models/timesheet.model';
import { Project, LivelloProgetto } from '../../models/project.model';

@Component({
  selector: 'app-timesheet-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    InputNumberModule,
    TextareaModule,
    SelectModule,
    ToastModule,
    CardModule,
    FieldsetModule
  ],
  providers: [MessageService],
  templateUrl: './timesheet-form.html'
})
export class TimesheetFormComponent implements OnInit {
  timesheetForm!: FormGroup;
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  selectedProject: Project | null = null;
  selectedProjectSearch: string = '';
  livelli: LivelloProgetto[] = [];
  submitted = false;
  isEditMode = false;
  timesheetId: number | null = null;
  maxDate: Date = new Date();

  private timesheetService: TimesheetService | MockTimesheetService;
  private projectService: ProjectService;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private serviceProvider: ServiceProviderService,
    private serviceConfig: ServiceConfigurationService,
    private http: HttpClient,
    private authService: AuthService
  ) {
    // ProjectService: usa il provider centralizzato (mock o API reali)
    this.projectService = this.serviceProvider.provideProjectService() as ProjectService;

    // TimesheetService: usa mock solo se esplicitamente configurato, altrimenti API reali
    this.timesheetService = this.serviceConfig.getUseMockServices()
      ? new MockTimesheetService()
      : new TimesheetService(this.http);

    this.initForm();
  }

  ngOnInit() {
    // Check if editing
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.timesheetId = +params['id'];
      }
    });

    // Carica i progetti e poi, se siamo in modalità edit, carica il timesheet
    this.loadProjects();
  }

  initForm() {
    this.timesheetForm = this.fb.group({
      dataRendicontazione: [new Date(), Validators.required],
      progettoId: [null, Validators.required],
      livelloId: [null], // Inizialmente non obbligatorio, diventerà obbligatorio quando viene selezionato un progetto
      oreLavorate: [8, [Validators.required, Validators.min(0.5), Validators.max(24)]],
      note: ['', Validators.required]
    });
    
    // Sync selectedProject with form value changes
    this.timesheetForm.get('progettoId')?.valueChanges.subscribe(value => {
      if (value) {
        this.selectedProject = this.projects.find(p => p.numeroProgetto === value) || null;
        // Carica i livelli quando viene selezionato un progetto
        if (this.selectedProject) {
          this.loadLivelli(this.selectedProject.numeroProgetto);
          // Rendi livelloId obbligatorio SOLO se il progetto ha livelli
          // Se il progetto non ha livelli, il campo rimane opzionale
          if (this.selectedProject.livelli && this.selectedProject.livelli.length > 0) {
            this.timesheetForm.get('livelloId')?.setValidators([Validators.required]);
          } else {
            this.timesheetForm.get('livelloId')?.clearValidators();
          }
          this.timesheetForm.get('livelloId')?.updateValueAndValidity();
        }
      } else {
        this.selectedProject = null;
        this.livelli = [];
        // Rimuovi validazione obbligatoria quando non c'è progetto selezionato
        this.timesheetForm.get('livelloId')?.clearValidators();
        this.timesheetForm.get('livelloId')?.setValue(null);
        this.timesheetForm.get('livelloId')?.updateValueAndValidity();
      }
    });
  }

  loadProjects() {
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.filteredProjects = projects;
        // Se siamo in modalità edit, carica il timesheet dopo che i progetti sono stati caricati
        if (this.isEditMode && this.timesheetId) {
          this.loadTimesheet();
        }
      },
      error: (error) => {
        console.error('Errore nel caricamento progetti:', error);
      }
    });
  }

  onProjectChange(event: any) {
    const progettoNumero = event.value;
    this.selectedProject = this.projects.find(p => p.numeroProgetto === progettoNumero) || null;
    if (this.selectedProject) {
      this.loadLivelli(this.selectedProject.numeroProgetto);
    } else {
      this.livelli = [];
      this.timesheetForm.get('livelloId')?.setValue(null);
    }
  }

  loadLivelli(numeroProgetto: string, livelloIdToSet?: number) {
    this.projectService.getLivelliProgetto(numeroProgetto).subscribe({
      next: (livelli) => {
        this.livelli = livelli;
        
        // Aggiorna la validazione: se non ci sono livelli, rendi il campo opzionale
        if (livelli.length === 0) {
          this.timesheetForm.get('livelloId')?.clearValidators();
          this.timesheetForm.get('livelloId')?.setValue(null);
          this.timesheetForm.get('livelloId')?.updateValueAndValidity();
        } else {
          // Se ci sono livelli, rendi il campo obbligatorio
          this.timesheetForm.get('livelloId')?.setValidators([Validators.required]);
          this.timesheetForm.get('livelloId')?.updateValueAndValidity();
        }
        
        // Se è stato passato un livelloId da impostare (ad esempio durante il caricamento di un timesheet esistente)
        if (livelloIdToSet !== undefined) {
          const livelloExists = livelli.find(l => l.id === livelloIdToSet);
          if (livelloExists) {
            this.timesheetForm.patchValue({ livelloId: livelloIdToSet }, { emitEvent: false });
          } else {
            // Se il livello salvato non è più disponibile, resetta il valore
            this.timesheetForm.patchValue({ livelloId: null }, { emitEvent: false });
          }
        } else {
          // Altrimenti, controlla se c'è già un livelloId nel form e verifica che sia ancora valido
          const currentLivelloId = this.timesheetForm.get('livelloId')?.value;
          if (currentLivelloId && !livelli.find(l => l.id === currentLivelloId)) {
            // Se il livello salvato non è più disponibile, resetta il valore
            this.timesheetForm.patchValue({ livelloId: null }, { emitEvent: false });
          }
        }
      },
      error: (error) => {
        console.error('Errore nel caricamento livelli:', error);
        this.livelli = [];
        // In caso di errore, rendi il campo opzionale
        this.timesheetForm.get('livelloId')?.clearValidators();
        this.timesheetForm.get('livelloId')?.updateValueAndValidity();
      }
    });
  }

  loadTimesheet() {
    if (!this.timesheetId) return;

    this.timesheetService.getTimesheetEntry(this.timesheetId).subscribe({
      next: (entry) => {
        // Assicurati che i progetti siano già caricati
        if (this.projects.length === 0) {
          // Se i progetti non sono ancora caricati, attendi
          this.projectService.getProjects().subscribe({
            next: (projects) => {
              this.projects = projects;
              this.filteredProjects = projects;
              this.setupTimesheetData(entry);
            }
          });
        } else {
          this.setupTimesheetData(entry);
        }
      },
      error: (error) => {
        console.error('Errore nel caricamento timesheet:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Errore nel caricamento dei dati'
        });
      }
    });
  }

  private setupTimesheetData(entry: TimesheetEntry) {
    this.selectedProject = this.projects.find(p => p.numeroProgetto === entry.numeroProgetto) || null;
    
    if (!this.selectedProject) {
      console.error('Progetto non trovato:', entry.numeroProgetto);
      return;
    }
    
    // Rendi livelloId obbligatorio SOLO se il progetto ha livelli
    if (this.selectedProject.livelli && this.selectedProject.livelli.length > 0) {
      this.timesheetForm.get('livelloId')?.setValidators([Validators.required]);
    } else {
      this.timesheetForm.get('livelloId')?.clearValidators();
    }
    this.timesheetForm.get('livelloId')?.updateValueAndValidity();
    
    // Imposta i valori del form (eccetto livelloId che verrà impostato dopo il caricamento dei livelli)
    this.timesheetForm.patchValue({
      dataRendicontazione: new Date(entry.dataRendicontazione),
      progettoId: entry.progettoId,
      oreLavorate: entry.oreLavorate,
      note: entry.note
    }, { emitEvent: false });
    
    // Carica i livelli del progetto selezionato e imposta il livelloId se presente
    this.loadLivelli(this.selectedProject.numeroProgetto, entry.livelloId);
  }


  saveTimesheet() {
    this.submitted = true;

    if (this.timesheetForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attenzione',
        detail: 'Compila tutti i campi obbligatori'
      });
      return;
    }

    const formValue = this.timesheetForm.value;
    
    // Il form può contenere sia una stringa che un oggetto Project
    let progettoNumero: string;
    if (typeof formValue.progettoId === 'string') {
      progettoNumero = formValue.progettoId;
    } else if (formValue.progettoId && formValue.progettoId.numeroProgetto) {
      progettoNumero = formValue.progettoId.numeroProgetto;
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Errore',
        detail: 'Seleziona un progetto valido'
      });
      return;
    }
    
    const project = this.projects.find(p => p.numeroProgetto === progettoNumero);
    
    if (!project) {
      this.messageService.add({
        severity: 'error',
        summary: 'Errore',
        detail: 'Progetto non trovato'
      });
      return;
    }

    const timesheetEntry: TimesheetEntry = {
      id: this.timesheetId || undefined,
      progettoId: project.numeroProgetto,
      numeroProgetto: project.numeroProgetto,
      nomeProgetto: project.nomeProgetto,
      cliente: project.cliente,
      livelloId: formValue.livelloId || undefined,
      dataRendicontazione: formValue.dataRendicontazione,
      oreLavorate: formValue.oreLavorate,
      note: formValue.note,
      utente: this.authService.getFullName() || 'current_user' // In production, get from auth service
    };

    if (this.isEditMode && this.timesheetId) {
      this.updateTimesheet(timesheetEntry);
    } else {
      this.createTimesheet(timesheetEntry);
    }
  }

  createTimesheet(entry: TimesheetEntry) {
    this.timesheetService.createTimesheetEntry(entry).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successo',
          detail: 'Timesheet creato con successo'
        });
        this.router.navigate(['/timesheet']);
      },
      error: (error) => {
        console.error('Errore nella creazione timesheet:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Errore nella creazione del timesheet'
        });
      }
    });
  }

  updateTimesheet(entry: TimesheetEntry) {
    if (!this.timesheetId) return;

    this.timesheetService.updateTimesheetEntry(this.timesheetId, entry).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successo',
          detail: 'Timesheet aggiornato con successo'
        });
        this.router.navigate(['/timesheet']);
      },
      error: (error) => {
        console.error('Errore nell\'aggiornamento timesheet:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Errore nell\'aggiornamento del timesheet'
        });
      }
    });
  }

  cancel() {
    this.router.navigate(['/timesheet']);
  }

  get f() {
    return this.timesheetForm.controls;
  }
}


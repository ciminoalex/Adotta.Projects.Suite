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
import { MockTimesheetService } from '../../services/mock/mock-timesheet.service';
import { ProjectService } from '../../services/project.service';
import { MockProjectService } from '../../services/mock/mock-project.service';
import { TimesheetEntry } from '../../models/timesheet.model';
import { Project } from '../../models/project.model';

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
  submitted = false;
  isEditMode = false;
  timesheetId: number | null = null;
  maxDate: Date = new Date();

  private timesheetService: TimesheetService;
  private projectService: ProjectService;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.timesheetService = new MockTimesheetService() as any;
    this.projectService = new MockProjectService() as any;
    
    this.initForm();
  }

  ngOnInit() {
    // Check if editing
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.timesheetId = +params['id'];
        this.loadTimesheet();
      }
    });

    this.loadProjects();
  }

  initForm() {
    this.timesheetForm = this.fb.group({
      dataRendicontazione: [new Date(), Validators.required],
      progettoId: [null, Validators.required],
      oreLavorate: [8, [Validators.required, Validators.min(0.5), Validators.max(24)]],
      note: ['', Validators.required]
    });
    
    // Sync selectedProject with form value changes
    this.timesheetForm.get('progettoId')?.valueChanges.subscribe(value => {
      if (value) {
        this.selectedProject = this.projects.find(p => p.numeroProgetto === value) || null;
      } else {
        this.selectedProject = null;
      }
    });
  }

  loadProjects() {
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.filteredProjects = projects;
      },
      error: (error) => {
        console.error('Errore nel caricamento progetti:', error);
      }
    });
  }

  onProjectChange(event: any) {
    const progettoNumero = event.value;
    this.selectedProject = this.projects.find(p => p.numeroProgetto === progettoNumero) || null;
  }

  loadTimesheet() {
    if (!this.timesheetId) return;

    this.timesheetService.getTimesheetEntry(this.timesheetId).subscribe({
      next: (entry) => {
        this.selectedProject = this.projects.find(p => p.numeroProgetto === entry.numeroProgetto) || null;
        
        this.timesheetForm.patchValue({
          dataRendicontazione: new Date(entry.dataRendicontazione),
          progettoId: entry.progettoId,
          oreLavorate: entry.oreLavorate,
          note: entry.note
        });
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
      dataRendicontazione: formValue.dataRendicontazione,
      oreLavorate: formValue.oreLavorate,
      note: formValue.note,
      utente: 'current_user' // In production, get from auth service
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


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService, UserDto } from '../../services/user.service';
import { MockUserService } from '../../services/mock/mock-user.service';
import { LookupService } from '../../services/lookup.service';
import { MockLookupService } from '../../services/mock/mock-lookup.service';
import { ServiceProviderService } from '../../services/service-provider.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    SelectModule,
    CheckboxModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="card">
      <p-toolbar>
        <ng-template pTemplate="left">
          <p-button severity="primary" (click)="openDialog()">
        <i class="pi pi-plus mr-2"></i>
        Nuovo Utente
      </p-button>
        </ng-template>
        <ng-template pTemplate="right">
        <p-iconfield iconPosition="left">
            <input pInputText type="text" placeholder="Cerca utenti..." [(ngModel)]="globalFilter" (input)="onGlobalFilter($event)" />
            <p-inputicon class="pi pi-search" />
          </p-iconfield>
        </ng-template>
      </p-toolbar>

      <p-table [value]="users" [paginator]="true" [rows]="20" [rowHover]="true" [loading]="loading"
               [globalFilterFields]="['username','email','userName','ruolo','teamTecnico']"
               currentPageReportTemplate="Mostrando {first} a {last} di {totalRecords} utenti"
               styleClass="p-datatable-sm" #dt>
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="username">userCode <p-sortIcon field="username"></p-sortIcon></th>
            <th pSortableColumn="userName">User Name <p-sortIcon field="userName"></p-sortIcon></th>
            <th pSortableColumn="email">Email <p-sortIcon field="email"></p-sortIcon></th>
            <th pSortableColumn="ruolo">Ruolo <p-sortIcon field="ruolo"></p-sortIcon></th>
            <th pSortableColumn="teamTecnico">Team tecnico <p-sortIcon field="teamTecnico"></p-sortIcon></th>
            <th pSortableColumn="isActive">Abilitato <p-sortIcon field="isActive"></p-sortIcon></th>
            <th style="width: 110px">Azioni</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-u>
          <tr>
            <td class="font-bold">{{ u.username }}</td>
            <td>{{ u.userName }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.ruolo || '-' }}</td>
            <td>{{ u.teamTecnico || '-' }}</td>
            <td>
              <span class="px-2 py-1 text-white rounded" [ngClass]="u.isActive ? 'bg-green-500' : 'bg-red-400'">
                {{ u.isActive ? 'Si' : 'No' }}
              </span>
            </td>
            <td>
              <div class="flex gap-1">
                <button class="p-button p-button-text p-button-sm" (click)="editUser(u)" pTooltip="Modifica"><i class="pi pi-pencil"></i></button>
                <button class="p-button p-button-text p-button-sm p-button-danger" (click)="confirmDelete(u)" pTooltip="Elimina"><i class="pi pi-trash"></i></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="text-center p-4">
              <div class="text-500"><i class="pi pi-info-circle mr-2"></i>Nessun utente trovato</div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [header]="isEdit ? 'Modifica Utente' : 'Nuovo Utente'" [(visible)]="showDialog" [modal]="true" [style]="{width: '760px', maxWidth: '90vw'}" [contentStyle]="{ overflow: 'visible', overflowX: 'hidden' }" (onHide)="onDialogHide()">
      <form [formGroup]="userForm" (ngSubmit)="saveUser()">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 md:col-span-4">
            <label class="block text-900 font-medium mb-2">userCode *</label>
            <input type="text" pInputText formControlName="username" class="w-full" placeholder="es. mrossi">
          </div>
          <div class="col-span-12 md:col-span-4">
            <label class="block text-900 font-medium mb-2">User Name *</label>
            <input type="text" pInputText formControlName="userName" class="w-full" placeholder="Mario Rossi">
          </div>
          <div class="col-span-12 md:col-span-4"></div>

          <div class="col-span-12 md:col-span-4">
            <label class="block text-900 font-medium mb-2">Email *</label>
            <input type="email" pInputText formControlName="email" class="w-full" placeholder="email@example.com">
          </div>
          <div class="col-span-12 md:col-span-4">
            <label class="block text-900 font-medium mb-2">Ruolo *</label>
            <p-select formControlName="ruolo" [options]="ruoli" optionLabel="label" optionValue="value" placeholder="Seleziona" appendTo="body" [style]="{ width: '100%' }" [fluid]="true"></p-select>
          </div>
          <div class="col-span-12 md:col-span-4">
            <label class="block text-900 font-medium mb-2">Team Tecnico</label>
            <p-select formControlName="teamTecnico" [options]="teams" optionLabel="nome" optionValue="nome" placeholder="Seleziona" appendTo="body" [style]="{ width: '100%' }" [fluid]="true"></p-select>
          </div>

    <div class="col-span-12 md:col-span-3 flex items-center gap-2">
            <p-checkbox formControlName="isActive" binary="true"></p-checkbox>
            <label>Abilitato</label>
          </div>

          <div class="col-span-12 md:col-span-12" *ngIf="isEdit">
             <div class="flex items-center gap-2">
                <p-checkbox formControlName="changePassword" binary="true" inputId="cp"></p-checkbox>
                <label for="cp">Modifica Password</label>
             </div>
          </div>

          <ng-container *ngIf="!isEdit || userForm.get('changePassword')?.value">
            <div class="col-span-12 md:col-span-6">
                <label class="block text-900 font-medium mb-2">Password {{ !isEdit ? '*' : '' }}</label>
                <input type="password" pInputText formControlName="password" class="w-full" placeholder="Password">
            </div>
            <div class="col-span-12 md:col-span-6">
                <label class="block text-900 font-medium mb-2">Conferma Password {{ !isEdit ? '*' : '' }}</label>
                <input type="password" pInputText formControlName="confirmPassword" class="w-full" placeholder="Conferma Password">
            </div>
          </ng-container>
        </div>
      </form>
      <ng-template pTemplate="footer">
        <button type="button" class="p-button p-button-outlined" (click)="showDialog = false">Annulla</button>
        <button type="button" class="p-button p-button-primary" (click)="saveUser()" [disabled]="userForm.invalid || saving">{{ saving ? 'Salvataggio...' : 'Salva' }}</button>
      </ng-template>
    </p-dialog>

    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `
})
export class UsersComponent implements OnInit {
  users: UserDto[] = [];
  loading = false;
  saving = false;
  showDialog = false;
  isEdit = false;
  userForm!: FormGroup;
  globalFilter = '';
  teams: any[] = [];
  ruoli = [
    { label: 'Admin', value: 'Admin' },
    { label: 'PM', value: 'PM' },
    { label: 'Timesheet', value: 'Timesheet' }
  ];

  private userService: UserService | MockUserService;
  private lookupService: LookupService | MockLookupService;

  constructor(
    private serviceProvider: ServiceProviderService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.userService = this.serviceProvider.provideUserService();
    this.lookupService = this.serviceProvider.provideLookupService();
  }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      id: [],
      username: ['', Validators.required],
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      ruolo: [null, Validators.required],
      teamTecnico: [null],
      isActive: [true],
      changePassword: [false],
      password: [''],
      confirmPassword: ['']
    });
    this.loadTeams();
    this.loadUsers();
  }

  loadTeams() {
    this.lookupService.getTeamTecnici().subscribe({
      next: (res) => { this.teams = res; },
      error: () => { this.teams = []; }
    });
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (res) => { this.users = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onGlobalFilter(event: Event) {
    // p-table local filtering already uses [globalFilterFields]; input triggers change via ngModel
  }

  openDialog() {
    this.isEdit = false;
    this.userForm.reset({ isActive: true, changePassword: false });
    // For new user, password is required
    this.userForm.get('password')?.setValidators([Validators.required]);
    this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.showDialog = true;
  }

  editUser(u: UserDto) {
    this.isEdit = true;
    this.userForm.patchValue({ ...u, password: '', confirmPassword: '', changePassword: false });
    // For edit, password is optional unless checkbox is checked
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('confirmPassword')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();
    this.showDialog = true;
  }

  onDialogHide() {
    this.userForm.reset();
    this.isEdit = false;
    this.saving = false;
  }

  saveUser() {
    if (this.userForm.invalid) return;

    const formVal = this.userForm.value;

    // Password validation
    if (!this.isEdit || formVal.changePassword) {
      if (!formVal.password) {
        this.messageService.add({ severity: 'error', summary: 'Errore', detail: 'La password è obbligatoria' });
        return;
      }
      if (formVal.password !== formVal.confirmPassword) {
        this.messageService.add({ severity: 'error', summary: 'Errore', detail: 'Le password non coincidono' });
        return;
      }
    }

    const payload: UserDto = {
      id: formVal.id,
      userName: formVal.userName,
      email: formVal.email,
      ruolo: formVal.ruolo,
      teamTecnico: formVal.teamTecnico,
      isActive: formVal.isActive,
      // Only send password if it's a new user or changePassword is checked
      password: (!this.isEdit || formVal.changePassword) ? formVal.password : undefined
    };

    this.saving = true;
    const obs = this.isEdit ? this.userService.updateUser(payload) : this.userService.addUser(payload);
    obs.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Salvato', detail: 'Utente salvato correttamente' });
        this.saving = false;
        this.showDialog = false;
        this.loadUsers();
      },
      error: (e) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Errore', detail: e?.message || 'Errore salvataggio' });
      }
    });
  }

  confirmDelete(u: UserDto) {
    if (!u.id) return;
    this.confirmationService.confirm({
      message: `Confermi l'eliminazione dell'utente ${u.userName}?`,
      header: 'Conferma',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deleteUser(u.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Eliminato', detail: 'Utente eliminato' });
            this.loadUsers();
          },
          error: (e) => this.messageService.add({ severity: 'error', summary: 'Errore', detail: e?.message || 'Errore eliminazione' })
        });
      }
    });
  }
}



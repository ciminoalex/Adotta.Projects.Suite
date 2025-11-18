import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">ADOTTA ITALIA</div>
                            <span class="text-muted-color font-medium">Sign in to continue</span>
                        </div>

                        <div>
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <input pInputText id="email1" type="text" placeholder="Email address" class="w-full md:w-120 mb-8" [(ngModel)]="email" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <p-password id="password1" [(ngModel)]="password" placeholder="Password" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"></p-password>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <div class="flex items-center">
                                    <p-checkbox [(ngModel)]="checked" id="rememberme1" binary class="mr-2"></p-checkbox>
                                    <label for="rememberme1">Remember me</label>
                                </div>
                                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Forgot password?</span>
                            </div>
                            <p-button label="Sign In" styleClass="w-full mb-3" (click)="onLogin()" [loading]="loading"></p-button>
                            
                            <div class="flex items-center gap-4 mb-4">
                                <div class="flex-1 border-t border-surface-300"></div>
                                <span class="text-muted-color text-sm">oppure</span>
                                <div class="flex-1 border-t border-surface-300"></div>
                            </div>
                            
                            <p-button 
                                label="Accedi con Office365" 
                                icon="pi pi-microsoft" 
                                styleClass="w-full" 
                                severity="secondary"
                                (click)="onLoginOffice365()" 
                                [loading]="loadingOffice365">
                            </p-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login implements OnInit {
    email: string = 'admin';

    password: string = 'admin123';

    checked: boolean = false;

    loading: boolean = false;

    loadingOffice365: boolean = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        // If already authenticated, redirect to dashboard
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/']);
        }
    }

    onLogin() {
        if (!this.email || !this.password) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attenzione',
                detail: 'Inserisci username e password'
            });
            return;
        }

        this.loading = true;
        
        this.authService.login(this.email, this.password).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Login effettuato',
                    detail: 'Autenticazione riuscita'
                });
                
                // Navigate to dashboard after short delay
                setTimeout(() => {
                    this.loading = false;
                    this.router.navigate(['/']);
                }, 1000);
            },
            error: (error) => {
                this.loading = false;
                // Estrai il messaggio di errore in modo più affidabile
                const errorMessage = error?.message || error?.error?.message || 'Errore durante il login. Riprovare.';
                
                this.messageService.add({
                    severity: 'error',
                    summary: 'Errore di autenticazione',
                    detail: errorMessage,
                    life: 5000
                });
            }
        });
    }

    onLoginOffice365() {
        this.loadingOffice365 = true;
        
        this.authService.loginWithOffice365().subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Login effettuato',
                    detail: `Autenticato come ${response.email}`
                });
                
                // Navigate to dashboard after short delay
                setTimeout(() => {
                    this.loadingOffice365 = false;
                    this.router.navigate(['/']);
                }, 1000);
            },
            error: (error) => {
                this.loadingOffice365 = false;
                const errorMessage = error?.message || 'Errore durante il login Office365. Riprovare.';
                
                this.messageService.add({
                    severity: 'error',
                    summary: 'Errore di autenticazione',
                    detail: errorMessage,
                    life: 5000
                });
            }
        });
    }
}

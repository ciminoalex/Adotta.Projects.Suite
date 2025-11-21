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
        
        <div class="flex min-h-screen min-w-screen overflow-hidden bg-surface-0 dark:bg-surface-900">
            <!-- Left Side: Branding & Background (Visible on Large Screens) -->
            <div class="hidden lg:flex w-6/12 flex-col items-center justify-center relative z-10 bg-primary-600 overflow-hidden">
                <!-- Abstract Background Shapes -->
                <div class="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                    <div class="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
                    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full border border-white/20"></div>
                    <div class="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-black/20 to-transparent"></div>
                </div>

                <div class="z-20 text-white text-center px-12">
                    <h1 class="text-5xl font-bold mb-4 tracking-tight" style="color: #ffffff !important;">ADOTTA ITALIA</h1>
                    <p class="text-xl text-primary-100 max-w-md mx-auto leading-relaxed" style="color: rgba(255,255,255,0.9);">
                        Gestione progetti e risorse aziendali in un'unica suite integrata.
                    </p>
                </div>
            </div>

            <!-- Right Side: Login Form -->
            <div class="w-full lg:w-6/12 flex items-center justify-center p-8 sm:p-12 md:p-24">
                <div class="w-full max-w-md">
                    <!-- Mobile Logo -->
                    <div class="lg:hidden text-center mb-12">
                        <div class="text-primary-600 text-3xl font-bold">ADOTTA ITALIA</div>
                    </div>

                    <div class="mb-10">
                        <h2 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-3">Bentornato</h2>
                        <p class="text-muted-color text-lg">Accedi al tuo account per continuare</p>
                    </div>

                    <div class="flex flex-col gap-6">
                        <div>
                            <label for="email" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Email</label>
                            <input pInputText id="email" type="text" placeholder="nome@esempio.com" class="w-full p-3" [(ngModel)]="email" />
                        </div>

                        <div>
                            <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Password</label>
                            <p-password id="password" [(ngModel)]="password" placeholder="••••••••" [toggleMask]="true" styleClass="w-full" [inputStyle]="{'width':'100%', 'padding':'0.75rem'}" [feedback]="false"></p-password>
                        </div>

                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <p-checkbox [(ngModel)]="checked" id="rememberme" binary="true"></p-checkbox>
                                <label for="rememberme" class="text-surface-900 dark:text-surface-0">Ricordami</label>
                            </div>
                            <a class="text-primary font-medium cursor-pointer hover:underline">Password dimenticata?</a>
                        </div>

                        <p-button label="Accedi" styleClass="w-full p-3 text-lg" (click)="onLogin()" [loading]="loading"></p-button>

                        <div class="flex items-center gap-4 my-2">
                            <div class="flex-1 border-t border-surface-300 dark:border-surface-700"></div>
                            <span class="text-muted-color text-sm">oppure</span>
                            <div class="flex-1 border-t border-surface-300 dark:border-surface-700"></div>
                        </div>

                        <p-button 
                            styleClass="w-full p-3 flex items-center justify-center gap-3" 
                            severity="secondary" 
                            outlined="true"
                            (click)="onLoginOffice365()" 
                            [loading]="loadingOffice365">
                            <ng-template pTemplate="content">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21" class="mr-2">
                                    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                                    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                                    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                                </svg>
                                <span class="font-bold">Accedi con Office365</span>
                            </ng-template>
                        </p-button>
                    </div>
                    
                    <div class="mt-12 text-center text-sm text-muted-color">
                        &copy; 2025 Adotta Italia. Tutti i diritti riservati.
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
    ) { }

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

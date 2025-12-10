import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MenuItem, MenuItemCommandEvent } from 'primeng/api';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { Menu } from 'primeng/menu';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../services/auth.service';
import { TranslationService, SupportedLanguage } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { filter } from 'rxjs/operators';

type LanguageMenuItem = MenuItem & { flag: 'us' | 'it'; lang: SupportedLanguage; selected?: boolean };

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AvatarModule, MenuModule, TranslatePipe],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">

                <span>{{ 'auth.branding' | translate }}</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="languageMenu.toggle($event)" #languageMenuButton>
                    <img
                        [src]="flagPlaceholderSrc"
                        [class]="'flag flag-' + getFlagCode(currentLanguage)"
                        alt="Flag"
                        style="width: 24px"
                    />
                </button>
                <p-menu #languageMenu [model]="languageMenuItems" [popup]="true">
                    <ng-template let-item pTemplate="item">
                        <a class="p-menuitem-link flex align-items-center gap-2 px-3 py-2" (click)="onLanguageItemClick($event, item)">
                            <span class="p-menuitem-icon">
                                <img
                                    [src]="flagPlaceholderSrc"
                                    [class]="'flag flag-' + item.flag"
                                    alt="Flag"
                                    style="width: 20px"
                                />
                            </span>
                            <span class="p-menuitem-text flex-1">{{ item.label }}</span>
                            <i *ngIf="item.selected" class="pi pi-check text-primary"></i>
                        </a>
                    </ng-template>
                </p-menu>
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                <!--iv class="relative">
                    <button
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div-->
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <!--div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-inbox"></i>
                        <span>Messages</span>
                    </button>
                </div>
            </div-->

            <div class="flex align-items-center gap-2">
                <button
                    type="button"
                    class="layout-topbar-action layout-topbar-action-highlight"
                    (click)="menu.toggle($event)"
                    #menuButton
                >
                    <span class="user-avatar bg-primary border-circle w-2rem h-2rem flex align-items-center justify-content-center font-bold" style="color: white; display: flex !important;">
                        {{ userInitials }}
                    </span>
                </button>
                <p-menu #menu [model]="userMenuItems" [popup]="true"></p-menu>
            </div>
        </div>
    </div>`
})
export class AppTopbar implements OnInit {
    @ViewChild('languageMenu') languageMenu?: Menu;
    items!: MenuItem[];
    userMenuItems: MenuItem[] = [];
    languageMenuItems: LanguageMenuItem[] = [];
    userInitials: string = '';
    currentLanguage: SupportedLanguage = 'en';
    flagPlaceholderSrc = 'https://primefaces.org/cdn/primeng/images/demo/flag/flag_placeholder.png';

    constructor(
        public layoutService: LayoutService,
        public authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private translationService: TranslationService
    ) {
        // Listen to navigation events to update user info
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                this.updateUserInfo();
            });
    }

    ngOnInit() {
        this.updateUserInfo();
        this.currentLanguage = this.translationService.getCurrentLanguage();
        this.initLanguageMenu();
        
        // Subscribe to language changes
        this.translationService.language$.subscribe(lang => {
            this.currentLanguage = lang;
            this.initLanguageMenu();
            this.initUserMenu();
        });
    }

    initLanguageMenu() {
        this.languageMenuItems = [
            {
                label: 'English',
                flag: 'us',
                lang: 'en',
                selected: this.currentLanguage === 'en',
                command: () => this.setLanguage('en')
            },
            {
                label: 'Italiano',
                flag: 'it',
                lang: 'it',
                selected: this.currentLanguage === 'it',
                command: () => this.setLanguage('it')
            }
        ];
    }

    setLanguage(lang: SupportedLanguage) {
        this.translationService.setLanguage(lang).subscribe({
            next: () => {
                this.currentLanguage = lang;
                this.initLanguageMenu();
                this.initUserMenu();
                // Forza il change detection per aggiornare tutti i componenti
                this.cdr.markForCheck();
            },
            error: (error) => {
                console.error('Error changing language:', error);
            }
        });
    }

    getFlagCode(lang: SupportedLanguage): 'us' | 'it' {
        return lang === 'it' ? 'it' : 'us';
    }

    onLanguageItemClick(event: Event, item: LanguageMenuItem) {
        event.preventDefault();

        if (item.command) {
            const commandEvent: MenuItemCommandEvent = { originalEvent: event, item };
            item.command(commandEvent);
        }

        this.languageMenu?.hide();
    }

    updateUserInfo() {
        this.userInitials = this.authService.getUserInitials();
        this.initUserMenu();
        this.cdr.markForCheck();
    }

    initUserMenu() {
        const user = this.authService.getCurrentUser();
        if (user) {
            this.userMenuItems = [
                {
                    label: this.authService.getFullName(),
                    icon: 'pi pi-user',
                    disabled: true
                },
                {
                    separator: true
                },
                {
                    label: this.translationService.translate('common.logout') || 'Logout',
                    icon: 'pi pi-sign-out',
                    command: () => this.logout()
                }
            ];
        }
    }


    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    logout() {
        this.authService.logout().subscribe({
            next: () => {
                // Logout successful, redirect is handled by authService.clearSession()
            },
            error: (error) => {
                // Even if there's an error, session is cleared
                console.error('Logout error:', error);
            }
        });
    }
}

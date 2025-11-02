import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AvatarModule, MenuModule],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">

                <span>ADOTTA ITALIA</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                <!--div class="relative">
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
    items!: MenuItem[];
    userMenuItems: MenuItem[] = [];
    userInitials: string = '';

    constructor(
        public layoutService: LayoutService,
        public authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
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
    }

    updateUserInfo() {
        this.userInitials = this.authService.getUserInitials();
        this.initUserMenu();
        this.cdr.detectChanges();
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
                    label: 'Logout',
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

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { DbInitStateService } from '../../services/db-init-state.service';
import { TranslationService } from '../../services/translation.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit, OnDestroy {
    model: MenuItem[] = [];
    private dbInitSubscription?: Subscription;
    private translationSubscription?: Subscription;
    private isDbInitialized = true; // Default: assume inizializzato

    constructor(
        private dbInitState: DbInitStateService,
        private translationService: TranslationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        // Sottoscrivi ai cambiamenti dello stato di inizializzazione
        this.dbInitSubscription = this.dbInitState.initialized$.subscribe(initialized => {
            this.isDbInitialized = initialized;
            this.updateMenuModel();
        });

        // Sottoscrivi ai cambiamenti di lingua
        this.translationSubscription = this.translationService.language$.subscribe(() => {
            this.updateMenuModel();
            this.cdr.markForCheck();
        });

        // Inizializza il menu
        this.updateMenuModel();
    }

    ngOnDestroy() {
        if (this.dbInitSubscription) {
            this.dbInitSubscription.unsubscribe();
        }
        if (this.translationSubscription) {
            this.translationSubscription.unsubscribe();
        }
    }

    private updateMenuModel() {
        const t = (key: string) => this.translationService.translate(key);
        
        const baseModel: MenuItem[] = [

            {
                label: t('menu.projectManagement'),
                items: [
                    { label: t('menu.projectList'), icon: 'pi pi-fw pi-list', routerLink: ['/projects'] },
                    { label: t('menu.newProject'), icon: 'pi pi-fw pi-plus', routerLink: ['/projects/new'] },
                    { label: t('menu.ganttView'), icon: 'pi pi-fw pi-chart-bar', routerLink: ['/projects/gantt'] }
                ]
            },
            {
                label: t('menu.timesheet'),
                items: [
                    { label: t('menu.overview'), icon: 'pi pi-fw pi-clock', routerLink: ['/timesheet'] },
                    { label: t('menu.newTimesheet'), icon: 'pi pi-fw pi-plus-circle', routerLink: ['/timesheet/new'] }
                ]
            },
            {
                label: t('menu.lookups'),
                items: [
                    { label: t('menu.customers'), icon: 'pi pi-fw pi-users', routerLink: ['/lookup/clienti'] },
                    { label: t('menu.technicalTeams'), icon: 'pi pi-fw pi-wrench', routerLink: ['/lookup/team-tecnici'] },
                    { label: t('menu.aplTeams'), icon: 'pi pi-fw pi-cog', routerLink: ['/lookup/team-apl'] },
                    { label: t('menu.sales'), icon: 'pi pi-fw pi-briefcase', routerLink: ['/lookup/sales'] },
                    { label: t('menu.projectManagers'), icon: 'pi pi-fw pi-user', routerLink: ['/lookup/project-managers'] },
                    { label: t('menu.installationTeams'), icon: 'pi pi-fw pi-truck', routerLink: ['/lookup/squadre-installazione'] },
                    { label: t('menu.masterProducts'), icon: 'pi pi-fw pi-box', routerLink: ['/lookup/prodotti-master'] }
                ]
            },
            {
                label: t('menu.system'),
                items: [
                    { label: t('menu.users'), icon: 'pi pi-fw pi-user', routerLink: ['/system/users'] },
                    { label: t('menu.dbInit'), icon: 'pi pi-fw pi-database', routerLink: ['/system/init'] }
                ]
            }
        ];

        // Se il DB non è inizializzato, disabilita tutti i menu tranne "Inizializzazione DB"
        if (!this.isDbInitialized) {
            const dbInitLabel = t('menu.dbInit');
            this.model = baseModel.map(section => {
                if (section.label === t('menu.system')) {
                    // Mantieni solo "Inizializzazione DB" abilitato
                    return {
                        ...section,
                        items: section.items?.map(item => {
                            if (item.label === dbInitLabel) {
                                return item; // Mantieni abilitato
                            }
                            return { ...item, disabled: true };
                        })
                    };
                } else {
                    // Disabilita tutti gli altri menu
                    return {
                        ...section,
                        disabled: true,
                        items: section.items?.map(item => ({ ...item, disabled: true }))
                    };
                }
            });
        } else {
            // Se il DB è inizializzato, mostra tutti i menu normalmente
            this.model = baseModel;
        }
    }
}

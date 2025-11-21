import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { DbInitStateService } from '../../services/db-init-state.service';
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
    private isDbInitialized = true; // Default: assume inizializzato

    constructor(private dbInitState: DbInitStateService) {}

    ngOnInit() {
        // Sottoscrivi ai cambiamenti dello stato di inizializzazione
        this.dbInitSubscription = this.dbInitState.initialized$.subscribe(initialized => {
            this.isDbInitialized = initialized;
            this.updateMenuModel();
        });

        // Inizializza il menu
        this.updateMenuModel();
    }

    ngOnDestroy() {
        if (this.dbInitSubscription) {
            this.dbInitSubscription.unsubscribe();
        }
    }

    private updateMenuModel() {
        const baseModel: MenuItem[] = [

            {
                label: 'Gestione Progetti',
                items: [
                    { label: 'Lista Progetti', icon: 'pi pi-fw pi-list', routerLink: ['/projects'] },
                    { label: 'Nuovo Progetto', icon: 'pi pi-fw pi-plus', routerLink: ['/projects/new'] },
                    { label: 'Gantt View', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/projects/gantt'] }
                ]
            },
            {
                label: 'Timesheet',
                items: [
                    { label: 'Overview', icon: 'pi pi-fw pi-clock', routerLink: ['/timesheet'] },
                    { label: 'Nuova Rendicontazione', icon: 'pi pi-fw pi-plus-circle', routerLink: ['/timesheet/new'] }
                ]
            },
            {
                label: 'Anagrafiche',
                items: [
                    { label: 'Clienti', icon: 'pi pi-fw pi-users', routerLink: ['/lookup/clienti'] },
                    { label: 'Team Tecnici', icon: 'pi pi-fw pi-wrench', routerLink: ['/lookup/team-tecnici'] },
                    { label: 'Team APL', icon: 'pi pi-fw pi-cog', routerLink: ['/lookup/team-apl'] },
                    { label: 'Sales', icon: 'pi pi-fw pi-briefcase', routerLink: ['/lookup/sales'] },
                    { label: 'Project Managers', icon: 'pi pi-fw pi-user', routerLink: ['/lookup/project-managers'] },
                    { label: 'Squadre Installazione', icon: 'pi pi-fw pi-truck', routerLink: ['/lookup/squadre-installazione'] },
                    { label: 'Prodotti Master', icon: 'pi pi-fw pi-box', routerLink: ['/lookup/prodotti-master'] }
                ]
            },
            {
                label: 'Sistema',
                items: [
                    { label: 'Utenti', icon: 'pi pi-fw pi-user', routerLink: ['/system/users'] },
                    { label: 'Inizializzazione DB', icon: 'pi pi-fw pi-database', routerLink: ['/system/init'] }
                ]
            }
        ];

        // Se il DB non è inizializzato, disabilita tutti i menu tranne "Inizializzazione DB"
        if (!this.isDbInitialized) {
            this.model = baseModel.map(section => {
                if (section.label === 'Sistema') {
                    // Mantieni solo "Inizializzazione DB" abilitato
                    return {
                        ...section,
                        items: section.items?.map(item => {
                            if (item.label === 'Inizializzazione DB') {
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

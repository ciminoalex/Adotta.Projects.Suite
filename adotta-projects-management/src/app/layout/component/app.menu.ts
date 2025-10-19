import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

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
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Dashboard',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'Gestione Progetti',
                items: [
                    { label: 'Lista Progetti', icon: 'pi pi-fw pi-list', routerLink: ['/projects'] },
                    { label: 'Nuovo Progetto', icon: 'pi pi-fw pi-plus', routerLink: ['/projects/new'] }
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
            }/*,
            {
                label: 'Reportistica',
                items: [
                    { label: 'Report Progetti', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/reports/projects'] },
                    { label: 'Analisi Finanziaria', icon: 'pi pi-fw pi-dollar', routerLink: ['/reports/financial'] },
                    { label: 'Performance Team', icon: 'pi pi-fw pi-chart-line', routerLink: ['/reports/team-performance'] },
                    { label: 'Export Dati', icon: 'pi pi-fw pi-download', routerLink: ['/reports/export'] }
                ]
            },
            {
                label: 'Sistema',
                items: [
                    { label: 'Storico Modifiche WIC', icon: 'pi pi-fw pi-history', routerLink: ['/system/wic-history'] },
                    { label: 'Integrazione SAP', icon: 'pi pi-fw pi-link', routerLink: ['/system/sap-integration'] },
                    { label: 'Backup e Restore', icon: 'pi pi-fw pi-database', routerLink: ['/system/backup'] },
                    { label: 'Configurazione', icon: 'pi pi-fw pi-cog', routerLink: ['/system/config'] }
                ]
            },
            {
                label: 'Documentazione',
                items: [
                    { label: 'Guida Utente', icon: 'pi pi-fw pi-book', routerLink: ['/documentation'] },
                    { label: 'API Reference', icon: 'pi pi-fw pi-code', routerLink: ['/documentation/api'] },
                    { label: 'Changelog', icon: 'pi pi-fw pi-file', routerLink: ['/documentation/changelog'] }
                ]
            }*/
        ];
    }
}

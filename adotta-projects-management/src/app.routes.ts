import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { authGuard } from './app/services/auth.guard';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'projects', pathMatch: 'full' },
            { path: 'projects', loadChildren: () => import('./app/pages/projects/projects.routes') },
            { path: 'lookup', loadChildren: () => import('./app/pages/lookup/lookup.routes') },
            { path: 'timesheet', loadChildren: () => import('./app/pages/timesheet/timesheet.routes') },
            { path: 'reports', loadChildren: () => import('./app/pages/reports/reports.routes') },
            { path: 'system', loadChildren: () => import('./app/pages/system/system.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];

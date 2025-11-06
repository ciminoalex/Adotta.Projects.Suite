import { Routes } from '@angular/router';
import { Dashboard } from '../dashboard/dashboard';
import { UsersComponent } from './users';

export default [
    { path: 'users', component: UsersComponent },
    { path: 'wic-history', component: Dashboard }, // TODO: Implementare WICHistory
    { path: 'sap-integration', component: Dashboard }, // TODO: Implementare SAPIntegration
    { path: 'backup', component: Dashboard }, // TODO: Implementare Backup
    { path: 'config', component: Dashboard }, // TODO: Implementare Config
    { path: '**', redirectTo: 'users' }
] as Routes;

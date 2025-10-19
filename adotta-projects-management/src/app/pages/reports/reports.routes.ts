import { Routes } from '@angular/router';
import { Dashboard } from '../dashboard/dashboard';

export default [
    { path: 'projects', component: Dashboard }, // TODO: Implementare ProjectReports
    { path: 'financial', component: Dashboard }, // TODO: Implementare FinancialReports
    { path: 'team-performance', component: Dashboard }, // TODO: Implementare TeamPerformanceReports
    { path: 'export', component: Dashboard }, // TODO: Implementare ExportReports
    { path: '**', redirectTo: 'projects' }
] as Routes;

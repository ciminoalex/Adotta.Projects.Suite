import { Routes } from '@angular/router';
import { TimesheetOverviewComponent } from './timesheet-overview';
import { TimesheetFormComponent } from './timesheet-form';

export default [
    { path: '', component: TimesheetOverviewComponent },
    { path: 'new', component: TimesheetFormComponent },
    { path: ':id/edit', component: TimesheetFormComponent },
    { path: 'project/:numeroProgetto', component: TimesheetOverviewComponent },
    { path: '**', redirectTo: '' }
] as Routes;


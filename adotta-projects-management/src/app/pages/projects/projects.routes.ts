import { Routes } from '@angular/router';
import { ProjectList } from './project-list';
import { ProjectForm } from './project-form';
import { ProjectDetail } from './project-detail';
import { GanttView } from './gantt-view';

export default [
    { path: '', component: ProjectList },
    { path: 'new', component: ProjectForm },
    { path: 'gantt', component: GanttView },
    { path: 'calendar', component: ProjectList }, // TODO: Implementare calendario
    { path: ':id', component: ProjectDetail },
    { path: ':id/edit', component: ProjectForm },
    { path: '**', redirectTo: '' }
] as Routes;

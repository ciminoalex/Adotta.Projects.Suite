import { Routes } from '@angular/router';
import { ProjectList } from './project-list';
import { ProjectForm } from './project-form';
import { ProjectDetail } from './project-detail';

export default [
    { path: '', component: ProjectList },
    { path: 'new', component: ProjectForm },
    { path: ':id', component: ProjectDetail },
    { path: ':id/edit', component: ProjectForm },
    { path: 'calendar', component: ProjectList }, // TODO: Implementare calendario
    { path: '**', redirectTo: '' }
] as Routes;

import { Routes } from '@angular/router';
import { Clienti } from './clienti';
import { TeamTecnici } from './team-tecnici';
import { TeamAPLComponent } from './team-apl';
import { SalesComponent } from './sales';
import { ProjectManagers } from './project-managers';
import { SquadreInstallazione } from './squadre-installazione';
import { ProdottiMaster } from './prodotti-master';

export default [
    { path: 'clienti', component: Clienti },
    { path: 'team-tecnici', component: TeamTecnici },
    { path: 'team-apl', component: TeamAPLComponent },
    { path: 'sales', component: SalesComponent },
    { path: 'project-managers', component: ProjectManagers },
    { path: 'squadre-installazione', component: SquadreInstallazione },
    { path: 'prodotti-master', component: ProdottiMaster },
    { path: '**', redirectTo: 'clienti' }
] as Routes;

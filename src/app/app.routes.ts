import { Routes } from '@angular/router';
import { ClientComponent } from './client/client.component';
import { MatchCreateComponent } from './match-create/match-create.component';

const routes: Routes = [
  {
    path: '',
    component: MatchCreateComponent,
    title: 'Valorant Veto Helper',
  },
  {
    path: 'client',
    component: ClientComponent,
    title: 'Valorant Veto Helper - Client Page',
  },
];
export default routes;

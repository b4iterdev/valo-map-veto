import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { ClientComponent } from './client/client.component';

const routes: Routes = [
    {
      path: 'admin',
      component: AdminComponent,
      title: 'Admin Page',
    },
    {
      path: 'client',
      component: ClientComponent,
      title: 'Client Page',
    },
  ];
export default routes;
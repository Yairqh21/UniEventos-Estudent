import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: 'details/:id',
    loadChildren: () => import('./details-event/details-event.module').then(m => m.DetailsEventPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule { }

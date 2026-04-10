import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DermosPage } from './dermos.page';

const routes: Routes = [
  {
    path: '',
    component: DermosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DermosPageRoutingModule {}

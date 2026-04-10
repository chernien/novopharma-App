import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarquePage } from './marque.page';

const routes: Routes = [
  {
    path: '',
    component: MarquePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarquePageRoutingModule {}

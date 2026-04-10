import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecommandePage } from './recommande.page';

const routes: Routes = [
  {
    path: '',
    component: RecommandePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecommandePageRoutingModule {}

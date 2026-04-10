import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommandePharmaciePage } from './commande-pharmacie.page';

const routes: Routes = [
  {
    path: '',
    component: CommandePharmaciePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommandePharmaciePageRoutingModule {}

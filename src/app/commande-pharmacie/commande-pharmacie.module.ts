import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CommandePharmaciePageRoutingModule } from './commande-pharmacie-routing.module';

import { CommandePharmaciePage } from './commande-pharmacie.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommandePharmaciePageRoutingModule
  ],
  declarations: [CommandePharmaciePage]
})
export class CommandePharmaciePageModule {}

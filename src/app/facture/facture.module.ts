import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FacturePageRoutingModule } from './facture-routing.module';

import { FacturePage } from './facture.page';
import { FactComponent } from '../components/fact/fact.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FacturePageRoutingModule
  ],
  declarations: [FacturePage,FactComponent]
})
export class FacturePageModule {}

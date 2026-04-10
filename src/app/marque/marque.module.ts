import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarquePageRoutingModule } from './marque-routing.module';

import { MarquePage } from './marque.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MarquePageRoutingModule
  ],
  declarations: [MarquePage]
})
export class MarquePageModule {}

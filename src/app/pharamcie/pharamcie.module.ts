import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PharamciePageRoutingModule } from './pharamcie-routing.module';

import { PharamciePage } from './pharamcie.page';
import { ClientPipe } from '../pipes/client.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PharamciePageRoutingModule
  ],
  declarations: [PharamciePage,ClientPipe]
})
export class PharamciePageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DermosPageRoutingModule } from './dermos-routing.module';
import { DermosPage } from './dermos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DermosPageRoutingModule
  ],
  declarations: [DermosPage] // ✅ tu dois déclarer ton composant ici
})
export class DermosPageModule {}

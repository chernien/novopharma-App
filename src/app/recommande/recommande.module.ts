import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecommandePageRoutingModule } from './recommande-routing.module';

import { RecommandePage } from './recommande.page';
import { RecommandePipe } from '../pipes/recommande.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecommandePageRoutingModule
  ],
  declarations: [RecommandePage, RecommandePipe]
})
export class RecommandePageModule { }

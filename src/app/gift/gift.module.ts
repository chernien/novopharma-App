import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GiftPageRoutingModule } from './gift-routing.module';

import { GiftPage } from './gift.page';
import { ArticlePipe } from '../pipes/article.pipe';
import { GiftPipe } from '../pipes/gift.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GiftPageRoutingModule
  ],
  declarations: [GiftPage, GiftPipe]
})
export class GiftPageModule { }

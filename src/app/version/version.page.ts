import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-version',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './version.page.html',
  styleUrls: ['./version.page.scss'],
})
export class VersionPage {}

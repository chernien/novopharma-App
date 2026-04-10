import { Component, OnInit } from '@angular/core';
import { ClientService } from '../services/client.service';
import { LoadingController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-dermos',
  templateUrl: './dermos.page.html',
  styleUrls: ['./dermos.page.scss'],
  standalone: false
})
export class DermosPage implements OnInit {
  dermos: any[] = [];
  searchText: string = '';

  constructor(
    private clientService: ClientService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ message: 'Chargement...' });
    await loading.present();

    this.clientService.GetDermos().subscribe({
      next: (res) => {
        this.dermos = res;
        loading.dismiss();
      },
      error: async (err) => {
        console.error('Erreur API dermos:', err);
        loading.dismiss();
        const alert = await this.alertCtrl.create({
          header: 'Erreur',
          message: 'Impossible de charger la liste des dermos.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  /** 🔎 Filtrer la liste */
  get filteredDermos() {
    if (!this.searchText) return this.dermos;
    return this.dermos.filter(d =>
      d.username?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      d.intitule?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientService } from '../services/client.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Filesystem, FilesystemDirectory } from '@capacitor/filesystem';
import { catchError, finalize, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-commande-pharmacie',
  templateUrl: './commande-pharmacie.page.html',
  styleUrls: ['./commande-pharmacie.page.scss'],
  standalone: false

})
export class CommandePharmaciePage implements OnInit {
  cartItems: any[] = [];
  selectedPharmacyJSON: any;
  selectedPharmacyId: string = "";
  selectedImage: string = "";
  newQuantities: number[] = [];
  PrixVente: number[] = [];
  showLoader: boolean = true;
  userConnect: any;
  selectedDate: string = '';


  constructor(
    private readonly route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private readonly clientService: ClientService,
    private readonly alertController: AlertController
  ) { }

  ngOnInit(): void {
      this.setDefaultDate();

    this.loadUserData();
  }

 // Initialise la date au format ISO pour ion-datetime
private setDefaultDate() {
  const now = new Date();
  this.selectedDate = now.toISOString().substring(0, 10); // "YYYY-MM-DD"
}

async onDateChange() {
  if (!this.selectedDate) return;

  // Convertit format ISO → dd/MM/yyyy
  const dateObj = new Date(this.selectedDate);
  const d = String(dateObj.getDate()).padStart(2, '0');
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const y = dateObj.getFullYear();

  this.selectedDate = `${d}/${m}/${y}`;

  console.log("Date sélectionnée :", this.selectedDate);

  // 🔹 Charge automatiquement les commandes pour la date choisie
  await this.loadCommandesWithLoader();
}


  async ionViewWillEnter(): Promise<void> {
    this.loadUserData();
    await this.loadCommandesWithLoader(); // Nouvelle méthode
  }
  /** 🔹 Charge les données utilisateur et pharmacie */
  private loadUserData(): void {
    this.selectedPharmacyJSON = JSON.parse(localStorage.getItem('Pharmacie') || '{}');
    this.userConnect = JSON.parse(localStorage.getItem('Commercial') || '{}');
  }
   async loadCommandesWithLoader(): Promise<void> {
      this.showLoader = true; // ← démarre le spinner

    const loading = await this.loadingCtrl.create({
      message: 'Chargement des commandes...',
      spinner: 'dots',
      backdropDismiss: false
    });
    await loading.present();

    try {
      await this.getAllCommandeP();
    } catch (err) {
      console.error('Erreur lors du chargement :', err);
    } finally {
          this.showLoader = false; // ← stoppe le spinner

      await loading.dismiss();
    }
  }

  /** 🔹 Récupère toutes les commandes pour l'utilisateur et la pharmacie sélectionnée */
 private async getAllCommandeP(): Promise<void> {
  const pharmacyName = this.selectedPharmacyJSON?.ctIntitule?.trim();
  const username = this.userConnect?.username;

  if (!pharmacyName) {
    throw new Error('Pharmacie non définie');
  }

  // 🔹 Génère la date du jour au format dd/MM/yyyy
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
const formattedDate = this.selectedDate;

  console.log('Date envoyée:', formattedDate);
  console.log('Pharmacie sélectionnée:', pharmacyName);

  // 🔹 Appel API avec paramètres
  const res: any = await firstValueFrom(
    this.clientService.getCommandeAll(this.selectedDate, username, pharmacyName)
  );

  console.log('Réponse API brute:', res);

  // 🔹 Filtrage correct côté front
  this.cartItems = (res || []).filter((c: any) =>
    c.pharmacy?.ctIntitule?.trim().toLowerCase() === pharmacyName.toLowerCase()
  );

  if (this.cartItems.length === 0) {
    console.log('📭 Aucune commande pour la pharmacie sélectionnée aujourd’hui.');
  }

  this.showLoader = false;
}








  /** 🔹 Renvoie le début et la fin de la journée en ISO */
  private getStartAndEndOfDay(): { startOfDay: string; endOfDay: string } {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();
    return { startOfDay, endOfDay };
  }

  /** 🔹 Affiche une alerte avec un message personnalisé */
  private async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Ok']
    });
    await alert.present();
  }

  /** 🔹 Alerte en cas d'erreur générique */
  async errorAlert(): Promise<void> {
    await this.showAlert('Erreur', "Une erreur s'est produite !");
  }

  /** 🔹 Alerte en cas de quantité invalide */
  async errorAlertQte(): Promise<void> {
    await this.showAlert('Erreur', "Quantité ajoutée supérieure à SOH");
  }

  /** 🔹 Alerte en cas de succès */
  async successAlert(): Promise<void> {
    await this.showAlert('Succès', "Quantité modifiée avec succès");
  }
}
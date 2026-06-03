import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PhotoService } from '../services/photo.service';
import { AlertController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-facture',
  templateUrl: './facture.page.html',
  styleUrls: ['./facture.page.scss'],
  standalone:false
})
export class FacturePage {

 

  factureForm: FormGroup;
  capturedImageBlob: Blob | null = null;
  capturedImage: string | undefined;
  dateArrivee: any
  dateSortie: any
  userconnect = JSON.parse(localStorage.getItem("Commercial")!)
  selectedPharmacyJSON = JSON.parse(localStorage.getItem('Pharmacie')!);

  constructor(
    private fb: FormBuilder,
    private factureService: PhotoService,
    private alertController: AlertController) {


    this.factureForm = this.fb.group({
      nom: [''],
      codePharmacie: [''],
      nomPharmacie: [''],
      nomDermo: [''],
      dateFacture: [''],
      dateArrivee: ['', Validators.required],
      dateSortie: ['', Validators.required],
    });
  }
  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera, // Utilisation de la caméra
      });

      // Convertir l'image capturée en un Blob
      const base64Response = await fetch(image.dataUrl!);
      this.capturedImageBlob = await base64Response.blob();
      this.capturedImage = image.dataUrl
    } catch (error) {
      await this.presentAlert('Erreur', 'Une erreur s\'est produite lors de la capture de l\'image.');
    }
  }

  async submitForm() {
    if (this.capturedImageBlob) {
      const formData = new FormData();
      formData.append('Nom', this.factureForm.get('nom')?.value);
      formData.append('CodePharmacie', this.selectedPharmacyJSON?.ctNum);
      formData.append('NomPharmacie', this.selectedPharmacyJSON?.ctIntitule);
      formData.append('NomDermo', this.userconnect?.username);
      const now = new Date();
// Convertir en ISO complet avec heure
const dateFacture = now.toISOString(); // Exemple: "2025-11-18T09:45:32.123Z"
console.log("🕒 DateFacture complète :", dateFacture);
formData.append('DateFacture', dateFacture);


      formData.append('DateArrivee', this.dateArrivee);
      formData.append('DateSortie', this.dateSortie);

      // Ajout de l'image capturée
      formData.append('File', this.capturedImageBlob!, 'facture.jpg');

      this.factureService.Facture(formData).subscribe(
        async (response: any) => {
          await this.presentAlert('✅ Succès', 'La facture a été ajoutée avec succès.');
          console.log('✅ Facture envoyée :', response);
          this.factureForm.reset();
          this.capturedImage = undefined;
          this.capturedImageBlob = null;
        },
        async (error: any) => {
          console.error('❌ Erreur envoi facture :', error);
          await this.handleFactureError(error);
        }
      );
    } else {
      await this.presentAlert('Formulaire invalide', 'Veuillez remplir tous les champs et capturer une image.');
    }
  }

  // ─── Gestion centralisée des erreurs facture ─────────────────────────────

  private async handleFactureError(error: any): Promise<void> {

    // ── Pas de réponse du serveur (IIS arrêté, réseau coupé) ────────────────
    if (!(error instanceof HttpErrorResponse)) {
      await this.presentAlert(
        '📶 Connexion instable',
        'Impossible de joindre le serveur. Vérifiez votre connexion Wi-Fi et réessayez.'
      );
      return;
    }

    // ── Aucune réponse HTTP (status 0) ───────────────────────────────────────
    if (error.status === 0) {
      await this.presentAlert(
        '📶 Connexion instable',
        'Le serveur ne répond pas. Vérifiez votre connexion réseau et réessayez.'
      );
      return;
    }

    // ── Erreur serveur (500) → lire l'errorType retourné par l'API ───────────
    if (error.status >= 500) {
      const errorType = error.error?.errorType ?? 'SERVER_ERROR';

      if (errorType === 'DATABASE_CONNECTION_ERROR') {
        await this.presentAlert(
          '❌ Base de données inaccessible',
          'Le serveur de base de données est arrêté ou inaccessible. Contactez l\'administrateur.'
        );
      } else if (errorType === 'DATABASE_SAVE_ERROR') {
        await this.presentAlert(
          '❌ Erreur d\'enregistrement',
          'La facture a atteint le serveur mais n\'a pas pu être sauvegardée. Contactez l\'administrateur.'
        );
      } else {
        await this.presentAlert(
          '❌ Erreur serveur',
          'Une erreur interne s\'est produite côté serveur. Contactez l\'administrateur.'
        );
      }
      return;
    }

    // ── Données invalides (400) ───────────────────────────────────────────────
    if (error.status >= 400 && error.status < 500) {
      const serverMessage = error.error?.message ?? 'Les données envoyées sont invalides.';
      await this.presentAlert('⚠️ Données invalides', serverMessage);
      return;
    }

    // ── Cas générique inattendu ───────────────────────────────────────────────
    await this.presentAlert(
      'Erreur',
      'Une erreur inattendue s\'est produite. Veuillez réessayer.'
    );
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }

}
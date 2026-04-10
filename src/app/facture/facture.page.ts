import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PhotoService } from '../services/photo.service';
import { AlertController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-facture',
  templateUrl: './facture.page.html',
  styleUrls: ['./facture.page.scss'],
  standalone:false
})
export class FacturePage implements OnInit {

 

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
  ngOnInit(): void {
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
        async (response) => {
          await this.presentAlert('Succès', 'La facture a été ajoutée avec succès.');
          console.log(response)
        },
        async (error) => {
          console.log(this.factureForm.value)
          await this.presentAlert(
            'Erreur',
            'Une erreur s\'est produite lors de l\'ajout de la facture. Veuillez réessayer.'
          );
        }
      );
    } else {
      await this.presentAlert('Formulaire invalide', 'Veuillez remplir tous les champs et capturer une image.');
    }
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
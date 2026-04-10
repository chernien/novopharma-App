import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource, PermissionStatus } from '@capacitor/camera';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { PhotoService } from 'src/app/services/photo.service';

@Component({
  selector: 'app-fact',
  templateUrl: './fact.component.html',
  styleUrls: ['./fact.component.scss'],
  standalone: false
})
export class FactComponent implements OnInit {

  capturedImage: string | undefined;
  capturedImageBlob: Blob | undefined;
  selectedPharmacyJSON = JSON.parse(localStorage.getItem('Pharmacie')!);
  userconnect = JSON.parse(localStorage.getItem('Commercial')!);
  dateArrivee: string | undefined;
  dateSortie: string | undefined;
  dateFacture: string | undefined;  // ✅ Déclaration obligatoire

  commentaire: string = '';
  isNative: boolean = Capacitor.isNativePlatform(); // 📱 Vérifie si l'app tourne en natif (Android/iOS)
  minDate!: string;
  maxDate!: string;


  constructor(
    private factureService: PhotoService,
    private alertController: AlertController,
    private loadingController: LoadingController,
  ) { }

  ngOnInit(): void {
    const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 2);

  // ✅ Convertir en ISO (format accepté par ion-datetime)
  this.maxDate = today.toISOString().split('T')[0]; // ex: "2025-11-07"
  this.minDate = yesterday.toISOString().split('T')[0]; // ex: "2025-11-06"
   }

  async chooseImageSource() {
    const alert = await this.alertController.create({
      header: 'Ajouter une image',
      message: 'Comment souhaitez-vous ajouter votre image ?',
      buttons: [
        { text: '📸 Caméra', handler: () => this.captureOrUploadImage(CameraSource.Camera) },
        { text: '🖼️ Galerie', handler: () => this.captureOrUploadImage(CameraSource.Photos) },
        { text: '❌ Annuler', role: 'cancel' },
      ],
    });


    
    await alert.present();
  }



  /**
   * 📸 Capture une photo ou sélectionne une image
   */
  async captureOrUploadImage(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,  // ✅ Evite Base64, renvoie URI
        source: source,
      });

      if (!image || !image.webPath) {
        throw new Error("Aucune image sélectionnée.");
      }

      // 🛠️ Gestion de la compatibilité Android
      let blob: Blob;
      if (image.webPath.startsWith("file://") || image.webPath.startsWith("capacitor://")) {
        const response = await fetch(image.webPath);
        blob = await response.blob();
      } else {
        blob = await fetch(image.webPath).then(res => res.blob());
      }

      // ✅ Stocke le Blob et affiche l'image sélectionnée
      this.capturedImageBlob = blob;
      this.capturedImage = image.webPath;
      console.log("✅ Image convertie en Blob :", blob.size, "octets");

    } catch (error) {
      console.error("❌ Erreur lors de la capture d'image :", error);
    }
  }

  /**
   * 📤 Envoi du formulaire avec l'image et les données
   */
 validateForm(): boolean {
  if (!this.selectedPharmacyJSON || !this.selectedPharmacyJSON.ctIntitule) {
    this.presentAlert("Erreur", "❌ Veuillez sélectionner une pharmacie avant d'ajouter une facture.");
    return false;
  }

  if (!this.dateArrivee || !this.dateSortie) {
    this.presentAlert("Erreur", "❌ Veuillez sélectionner une heure d'arrivée et une heure de sortie.");
    return false;
  }

  if (this.dateArrivee >= this.dateSortie) {
    this.presentAlert("Erreur", "❌ L'heure d'arrivée doit être inférieure à l'heure de départ.");
    return false;
  }

  if (!this.dateFacture) {
    this.presentAlert("Erreur", "❌ Veuillez sélectionner la date de la facture.");
    return false;
  }

  if (!this.capturedImage) {
    this.presentAlert("Erreur", "❌ Veuillez prendre une photo de la facture avant validation.");
    return false;
  }

  return true;
}

  async submitForm() {
    if (!this.dateArrivee || !this.dateSortie) {
      this.presentAlert('Erreur', 'Veuillez renseigner les heures d\'arrivée et de départ.');
      return;
    }

    const formData = new FormData();
    formData.append('nom', `Facture-${this.selectedPharmacyJSON?.ctNum}-${this.userconnect?.username}`);
    formData.append('codePharmacie', this.selectedPharmacyJSON?.ctNum);
    formData.append('nomPharmacie', this.selectedPharmacyJSON?.ctIntitule);
    formData.append('nomDermo', this.userconnect?.username);
if (!this.dateFacture) {
  this.presentAlert("Erreur", "❌ Veuillez sélectionner la date de la facture.");
  return;
}

formData.append('dateFacture', this.dateFacture);

    formData.append('dateArrivee', this.dateArrivee);
    formData.append('dateSortie', this.dateSortie);

    if (this.commentaire && this.commentaire.trim() !== '') {
      formData.append('commentaire', this.commentaire);
    }

    if (this.capturedImageBlob) {
      const fileName = `Facture-${this.selectedPharmacyJSON?.ctNum}-${this.userconnect?.username}.jpg`;
      const file = new File([this.capturedImageBlob], fileName, { type: 'image/jpeg' });

      console.log("📤 Fichier ajouté à FormData :", file.name, "Taille :", file.size);
      formData.append('file', file);
    } else {
      console.warn("⚠️ Aucun fichier image à envoyer !");
    }

    // ✅ Vérification du FormData avant envoi
    console.log("✅ Contenu du FormData avant envoi :");
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });


    // ✅ LOG complet du FormData pour debug
  console.log("📦 Contenu du FormData avant envoi :");
for (const [key, value] of (formData as any).entries()) {
  if (value instanceof File) {
    console.log(`${key}: File => nom="${value.name}", type=${value.type}, taille=${value.size} octets`);
  } else {
    console.log(`${key}:`, value);
  }
}


    try {
      const response = await fetch("https://novopharma.tn/api/Facture", {
        method: "POST",
        body: formData, // ✅ Envoi correct du `FormData`
        headers: {
          "Accept": "application/json",
          // NE PAS ajouter "Content-Type": "multipart/form-data", Fetch le gère automatiquement !
        },
      });

      const result = await response.json();
      console.log("✅ Réponse API :", result);
      // ✅ **Réinitialiser les champs du formulaire après envoi**
      this.dateArrivee = '';
      this.dateSortie = '';
      this.commentaire = '';
      this.capturedImageBlob = null!;
      this.capturedImage = ''; // Pour réinitialiser l'affichage de l'image

      console.log("🧹 Formulaire réinitialisé !");
      if (response.ok) {
        this.presentAlert("Succès", "✅ Facture envoyée avec succès !");
        localStorage.setItem('cart', JSON.stringify([]));
        localStorage.removeItem('Pharmacie');
        window.location.reload()

      } else {
        this.presentAlert("Erreur", "❌ Impossible d'envoyer la facture.");
      }
    } catch (error) {
      console.error("❌ Erreur API :", error);
      this.presentAlert("Erreur", "❌ Impossible d'envoyer la facture.");
    }
  }


  /**
   * 📢 Gestion des erreurs API
   */
  async handleError(error: any) {
    console.error('❌ Erreur API :', error);

    let message = "Une erreur s'est produite. Veuillez réessayer.";

    if (error.status === 400) {
      message = "Données invalides. Vérifiez les informations saisies.";
    } else if (error.status === 500) {
      message = "Erreur serveur. Veuillez réessayer plus tard.";
    } else if (error.error && error.error.message) {
      message = error.error.message;  // Afficher l’erreur envoyée par l’API
    }

    await this.presentAlert('Erreur', " ❌ " + message);
  }
  /**
   * 🛑 Affiche une alerte utilisateur
   */
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
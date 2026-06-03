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
        body: formData,
        headers: { "Accept": "application/json" },
      });

      // ── Parser JSON proprement (peut échouer si le serveur retourne du texte brut) ──
      let result: any = null;
      try {
        result = await response.json();
      } catch {
        result = null;
      }

      console.log(`📡 Réponse API [${response.status}] :`, result);

      // ── Succès ───────────────────────────────────────────────────────────────
      if (response.ok) {
        this.dateArrivee   = '';
        this.dateSortie    = '';
        this.commentaire   = '';
        this.capturedImageBlob = null!;
        this.capturedImage = '';
        console.log("🧹 Formulaire réinitialisé !");
        this.presentAlert("✅ Succès", "La facture a été envoyée avec succès !");
        localStorage.setItem('cart', JSON.stringify([]));
        localStorage.removeItem('Pharmacie');
        window.location.reload();
        return;
      }

      // ── Erreur serveur (500) → lire l'errorType retourné par l'API ───────────
      if (response.status >= 500) {
        const errorType = result?.errorType ?? 'SERVER_ERROR';

        if (errorType === 'DATABASE_CONNECTION_ERROR') {
          this.presentAlert(
            '❌ Base de données inaccessible',
            'Le serveur de base de données est arrêté ou inaccessible. Contactez l\'administrateur.'
          );
        } else if (errorType === 'DATABASE_SAVE_ERROR') {
          this.presentAlert(
            '❌ Erreur d\'enregistrement',
            'La facture a atteint le serveur mais n\'a pas pu être sauvegardée. Contactez l\'administrateur.'
          );
        } else {
          this.presentAlert(
            '❌ Erreur serveur',
            'Une erreur interne s\'est produite côté serveur. Contactez l\'administrateur.'
          );
        }
        return;
      }

      // ── Données invalides (400) → afficher le message exact du serveur ────────
      if (response.status >= 400 && response.status < 500) {
        const serverMessage = result?.message ?? 'Les données envoyées sont invalides.';
        this.presentAlert('⚠️ Données invalides', serverMessage);
        return;
      }

      // ── Cas inattendu ─────────────────────────────────────────────────────────
      this.presentAlert('Erreur', 'Une erreur inattendue s\'est produite. Veuillez réessayer.');

    } catch (error) {
      // ── fetch() throw → serveur totalement inaccessible (IIS arrêté, réseau coupé) ──
      console.error("❌ Erreur réseau :", error);
      this.presentAlert(
        '📶 Connexion instable',
        'Impossible de joindre le serveur. Vérifiez votre connexion Wi-Fi et réessayez.'
      );
    }
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
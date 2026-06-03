import { Component, OnDestroy, OnInit } from '@angular/core';
import { ArticlesService } from '../services/articles.service';
import { Router } from '@angular/router';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-marque',
  templateUrl: './marque.page.html',
  styleUrls: ['./marque.page.scss'],
  standalone: false,
})
export class MarquePage implements OnInit, OnDestroy {
  marques: any[] = [];
  barcodeInput: string = '';
  backButtonSub!: Subscription;
  private codeReader = new BrowserMultiFormatReader();
  private tesseractModule: typeof import('tesseract.js') | null = null;

  constructor(
    private articleService: ArticlesService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private platform: Platform,
    private http: HttpClient,
    
  ) {}

  ngOnInit() {
    this.getMarques();

    // 🔹 Intercepter le bouton retour Android
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(10, () => {
      this.goToPharmacie();
    });
  }

  ngOnDestroy() {
    if (this.backButtonSub) {
      this.backButtonSub.unsubscribe();
    }
  }

  private async getTesseract() {
    if (!this.tesseractModule) {
      this.tesseractModule = await import('tesseract.js');
    }
    return this.tesseractModule;
  }

  openVersionPage() {
    this.router.navigate(['/version']);
  }

  goToPharmacie() {
    this.router.navigateByUrl('/tabs/pharmacie');
  }

  getMarques() {
    this.articleService.getMarque().subscribe((result: any) => {
      this.marques = result.filter((marque: any) => marque !== 'INDERMA');
      console.log('[MarquePage] Marques après filtrage :', this.marques);
    });
  }

  async goToArticles(marque: string) {
  const loading = await this.loadingCtrl.create({
    message: 'Chargement des articles...',
    spinner: null, // 🔹 pas de spinner
    backdropDismiss: false, // empêche la fermeture en tapant dehors
  });

  await loading.present();

  this.router
    .navigateByUrl(`/tabs/articles/${marque}`)
    .then(() => loading.dismiss())
    .catch(() => loading.dismiss());
}

  // 🔄 Rafraîchissement manuel
  async refreshPage() {
    const loading = await this.loadingCtrl.create({
      message: 'Rafraîchissement...',
      spinner: 'crescent',
      duration: 2000,
    });

    await loading.present();
    this.getMarques();
    await loading.dismiss();
  }


  // ✅ 1. Scanner avec la caméra
  async openCamera() {
    try {
      const photo = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (photo?.dataUrl) {
        await this.decodeBarcodeFromImage(photo.dataUrl);
      }
    } catch (err) {
      console.error('[Camera] Erreur capture :', err);
    }
  }

   // ✅ 2. Choisir une image depuis la galerie
  


   private async decodeBarcodeFromImage(dataUrl: string) {
  const loading = await this.loadingCtrl.create({ message: 'Analyse du code...' });
  await loading.present();

  try {
    let decodedText: string | null = null;

    // 1️⃣ Essai avec ZXing
    try {
      const result = await this.codeReader.decodeFromImageUrl(dataUrl);
      if (result) {
        decodedText = result.getText();
        console.log('[ZXing] Code détecté :', decodedText);
      }
    } catch {
      console.warn('[ZXing] Aucun code-barre trouvé, essai OCR...');
    }

    // 2️⃣ Si ZXing échoue → OCR
    if (!decodedText) {
      const tesseract = await this.getTesseract();
      const ocrResult = await tesseract.recognize(dataUrl, 'eng', {
        logger: (m) => console.log(m),
      });

      const text = ocrResult.data.text;
      const match = text.match(/\d{8,14}/); // 8 à 14 chiffres

      if (match) {
        decodedText = match[0];
        console.log('[OCR] Code détecté :', decodedText);
      }
    }

    // 3️⃣ Résultat final : un seul point de décision
    if (decodedText) {
      this.barcodeInput = decodedText.trim();
      await this.onBarcodeChange({ target: { value: decodedText } });
    } else {
      this.showToast('Aucun code-barre détecté dans l’image', 'warning');
    }

  } catch (err) {
    console.error('[Analyse] Erreur décodage:', err);
    this.showToast('Erreur pendant l’analyse', 'danger');
  } finally {
    loading.dismiss();
  }
}


  // 🔍 Recherche d’article par code-barre
async onBarcodeChange(event: any) {
    const code = event.target.value?.trim();
    if (!code) return;

    try {
      const article: any = await this.articleService.getArticleByBarcode(code);

      if (article) {
        const toast = await this.toastCtrl.create({
          message: `✅ ${article.arDesign} trouvé`,
          color: 'success',
          position: 'top',
          buttons: [
            {
              text: 'Voir',
              handler: () => {
                this.router.navigate(['/tabs/articles', article.marque], {
                  state: { article, fromBarcode: true },
                });
              },
            },
          ],
        });
        await toast.present();
      } else {
        this.showToast(`❌ Aucun article trouvé pour le code ${code}`, 'warning');
      }
    } catch (error) {
      console.error('[ERREUR] Erreur lors de la recherche de l’article :', error);
      this.showToast('Erreur serveur, réessayez plus tard.', 'danger');
    }

    this.barcodeInput = '';
  }


  private async showToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2500,
      color,
      position: 'top',
    });
    await toast.present();
  }

}

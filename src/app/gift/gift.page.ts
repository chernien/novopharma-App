import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ArticlesService } from '../services/articles.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-gift',
  templateUrl: './gift.page.html',
  styleUrls: ['./gift.page.scss'],
  standalone: false,


})
export class GiftPage implements OnInit {

  articles: any = [];
  searchText = "";
  selectedPharmacyJSON: any;
  cartQuantity: number = 0;
  visibleFields: { [key: number]: number } = {};
  isLoading: boolean = true; // Indicateur de chargement
  gifts: any[] = []; // 🔹 Liste des gifts du dermo connecté
  errorMessage: string = "";
  dermoId: number | null = null;
  minDate: string = '';
  maxDate: string = '';
  loading: HTMLIonLoadingElement | null = null;   // ⬅️ AJOUTE-LA ICI


  constructor(
    private articleService: ArticlesService,
    private toastController: ToastController,
    private cartService: CartService,
    private router: Router,
    private loadingCtrl: LoadingController ,// Ajout de LoadingController
    private cdr: ChangeDetectorRef // <-- Ajout

  ) { }

  ngOnInit(): void {
    this.loadArticles();
    this.updateCartQuantity();
    this.loadGiftsForDermo();
    this.setDateLimits();


  }
   goToPharmacie() {
  this.router.navigateByUrl('/tabs/pharmacie');
}

 setDateLimits() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 2);

    // Format ISO sans milliseconds pour ion-datetime
    this.minDate = yesterday.toISOString().split('T')[0];
this.maxDate = today.toISOString().split('T')[0];

  }


  // Nouvelle fonction pour gérer le rafraîchissement
 async refreshPage() {
  console.log("Refresh clicked");

  // ⚡ relance la méthode de chargement
  await this.loadGiftsForDermo();
}



  openVersionPage() {
  this.router.navigate(['/version']);
}

 async loadGiftsForDermo() {
  this.dermoId = JSON.parse(localStorage.getItem('Commercial')!)?.id;

  console.log("🔍 Dermo connecté :", this.dermoId);

  if (!this.dermoId) {
    this.errorMessage = "❌ Aucun dermo connecté.";
    console.warn("⚠️ Aucun dermo trouvé dans le localStorage");
    return;
  }

  try {
    console.log("📡 Appel API : getGiftsByDermo");
    
    this.gifts = await this.articleService.getGiftsByDermo(this.dermoId);

    console.log("📥 Gifts bruts reçus depuis l’API :");
    console.table(this.gifts);

    this.gifts.forEach((g, index) => {
      if (g.soldQuantity == null) {
        g.soldQuantity = null;
      }

      console.log(
        `🎁 [${index}] GiftRef=${g.giftRef} | Nom=${g.giftName} | Qté=${g.quantiteAttribuee} | Date=${g.dateAttribution} | Source=${g.source}`
      );
    });

    // 🔎 Filtrage quantités > 0
    this.gifts = this.gifts.filter(g => g.quantiteAttribuee > 0);

    console.log("✅ Gifts après filtrage (quantiteAttribuee > 0) :");
    console.table(this.gifts);

    console.log("📊 Nombre total de gifts affichés :", this.gifts.length);

    if (this.gifts.length === 0) {
      console.warn("⚠️ Aucun gift après filtrage");

      const toast = await this.toastController.create({
        message: "⚠️ Aucun gift assigné pour vous.",
        duration: 2000,
        color: "warning"
      });
      toast.present();
    }

  } catch (err) {
    console.error("❌ Erreur lors du chargement des gifts :", err);
    this.errorMessage = "❌ Erreur chargement gifts.";
  }
}



onDateChange(article: any, event: any) {
  article.dateCommande = event.detail.value;
}




  /** 🔹 Filtrer la liste des gifts */
  filterGifts() {
    const searchLower = this.searchText.trim().toLowerCase();
    return this.gifts.filter(gift =>
      gift.giftName?.toLowerCase().includes(searchLower) ||
      gift.marque?.toLowerCase().includes(searchLower)
    );
  }
  async placeGiftOrder(article: any) {
  if (!article.soldQuantity || article.soldQuantity <= 0) {
    this.showToast("❌ Veuillez saisir une quantité valide.", "danger");
    return;
  }

  if (!article.dateCommande) {
    this.showToast("❌ Veuillez sélectionner la date du gift.", "danger");
    return;
  }

  if (article.soldQuantity > article.quantiteAttribuee) {
    this.showToast(`❌ Stock insuffisant ! Disponible : ${article.quantiteAttribuee}`, "danger");
    return;
  }

  const dermoId = JSON.parse(localStorage.getItem('Commercial')!)?.id;
  const selectedPharmacy = JSON.parse(localStorage.getItem('Pharmacie')!);

  if (!dermoId || !selectedPharmacy) {
    this.showToast("❌ Erreur : Dermo ou pharmacie non sélectionné(e).", "danger");
    return;
  }

  const requestData = {
    giftRef: article.giftRef,
    dermoId,
    quantiteCommande: article.soldQuantity,
    codePharmacie: selectedPharmacy.ctNum,
    nomPharmacie: selectedPharmacy.ctIntitule,
    dateCommande:
      article.dateCommande instanceof Date
        ? article.dateCommande.toISOString()
        : article.dateCommande
  };

  // 🔄 Optimistic update
  const prevQty = article.quantiteAttribuee;
  article.quantiteAttribuee = prevQty - article.soldQuantity;

  const wasRemoved = article.quantiteAttribuee <= 0;
  if (wasRemoved) {
    this.gifts = this.gifts.filter(g => g.giftRef !== article.giftRef);
  }
  this.cdr.detectChanges();

  try {
    const response = await this.articleService.orderGift(requestData);

    // ⭐ Affiche message retourné par API
    const apiMsg = response?.message || "Commande enregistrée avec succès.";
    this.showToast(`✅ ${apiMsg}`, "success");

    article.soldQuantity = null;

    await this.loadGiftsForDermo();
    await this.loadArticles();

  } catch (error) {
    console.error("❌ Erreur lors de la commande :", error);

    // ⛔ Récupération du vrai message d'erreur API
    let apiErrorMsg = "Échec de la commande.";

    if (error instanceof HttpErrorResponse) {
      apiErrorMsg =
        error?.error?.error ||   // { error: "xxxx" }
        error?.error?.message || // fallback
        error.message ||         // message brut
        "Échec de la commande.";
    }

    // rollback UI
    article.quantiteAttribuee = prevQty;
    if (wasRemoved) this.gifts.push(article);
    this.cdr.detectChanges();

    this.showToast(`❌ ${apiErrorMsg}`, "danger");
  }
}

async showToast(message: string, color: string = "primary") {
  const toast = await this.toastController.create({
    message,
    duration: 2500,
    color,
    position: "top"
  });
  toast.present();
}


  async placeGiftOrderMed(article: any) {
  if (!article.soldQuantity || article.soldQuantity <= 0) {
    this.showToast("❌ Veuillez saisir une quantité valide.", "danger");
    return;
  }

  if (!article.dateCommande) {
    this.showToast("❌ Veuillez sélectionner la date du gift.", "danger");
    return;
  }

  if (article.soldQuantity > article.quantiteAttribuee) {
    this.showToast(`❌ Stock insuffisant ! Disponible : ${article.quantiteAttribuee}`, "danger");
    return;
  }

  const dermoId = JSON.parse(localStorage.getItem('Commercial')!)?.id;
  const selectedPharmacy = JSON.parse(localStorage.getItem('Pharmacie')!);

  if (!dermoId || !selectedPharmacy) {
    this.showToast("❌ Erreur : Dermo ou pharmacie non sélectionné(e).", "danger");
    return;
  }

  const requestData = {
    giftRef: article.giftRef,
    dermoId,
    quantiteCommande: article.soldQuantity,
    codePharmacie: selectedPharmacy.ctNum,
    nomPharmacie: selectedPharmacy.ctIntitule,
    dateCommande:
      article.dateCommande instanceof Date
        ? article.dateCommande.toISOString()
        : article.dateCommande
  };

  // 🔄 Optimistic update
  const prevQty = article.quantiteAttribuee;
  article.quantiteAttribuee = prevQty - article.soldQuantity;

  const wasRemoved = article.quantiteAttribuee <= 0;
  if (wasRemoved) {
    this.gifts = this.gifts.filter(g => g.giftRef !== article.giftRef);
  }
  this.cdr.detectChanges();

  try {
    const response = await this.articleService.orderGiftMed(requestData);

    // ⭐ Affiche message API réel
    const apiMsg = response?.message || "Commande enregistrée avec succès.";
    this.showToast(`✅ ${apiMsg}`, "success");

    article.soldQuantity = null;

    await this.loadGiftsForDermo();
    await this.loadArticles();

  } catch (error) {
    console.error("❌ Erreur lors de la commande (Med):", error);

    // ⛔ Message d'erreur API réel
    let apiErrorMsg = "Échec de la commande.";

    if (error instanceof HttpErrorResponse) {
      apiErrorMsg =
        error?.error?.error ||     // { error: "..."}
        error?.error?.message ||   // { message: "..." }
        error.message ||
        "Échec de la commande.";
    }

    // rollback UI
    article.quantiteAttribuee = prevQty;
    if (wasRemoved) this.gifts.push(article);
    this.cdr.detectChanges();

    this.showToast(`❌ ${apiErrorMsg}`, "danger");
  }
}


  async loadArticles() {
    this.selectedPharmacyJSON = JSON.parse(localStorage.getItem('Pharmacie')!);

    // Vérifiez si les articles sont déjà en cache

    // Simulez un chargement des articles depuis le service
    try {
      this.isLoading = true;
      this.articles = await this.articleService.getArticlesToPromiseGift()!;
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
      this.router.navigateByUrl('/loading');
    } finally {
      this.isLoading = false;
      this.initializeVisibleFields();
    }

  }

  initializeVisibleFields() {
    this.articles.forEach((_: any, index: number) => {
      this.visibleFields[index] = 0; // Initialisez pour chaque article
    });
  }

  updateCartQuantity() {
    this.cartQuantity = this.cartService.getCartItemCount();
  }

  async ionViewWillEnter() {
  this.selectedPharmacyJSON = JSON.parse(localStorage.getItem('Pharmacie')!);

  this.loading = await this.loadingCtrl.create({
    message: 'Chargement des gifts...',
    spinner: 'crescent',
  });

  await this.loading.present();

  await this.loadGiftsForDermo();

  if (this.loading) {
    this.loading.dismiss();
  }
}


  showNextSet(index: number): void {
    //console.log('Button clicked for index:', index);
    if (this.visibleFields[index] < 2) {
      this.visibleFields[index]++;
    }
  }

  async addToCart(
    article: any,
    quantity: number,
    qteVendue: number,
    datePeremtion?: Date,
    numSerie?: string,
    datePeremtion1?: Date,
    numSerie1?: string,
    datePeremtion2?: Date,
    numSerie2?: string,
    qte1?: number,
    qte2?: number,
    qte3?: number
  ) {
    if (this.selectedPharmacyJSON) {
      this.cartService.addToCart(
        this.selectedPharmacyJSON, // Pharmacie sélectionnée
        article,                    // L'article
        quantity,                   // Quantité
        qteVendue,                  // Quantité vendue
        datePeremtion,              // Date de péremption
        numSerie,                   // Numéro de série
        datePeremtion1,             // Date de péremption 1
        numSerie1,                  // Numéro de série 1
        datePeremtion2,             // Date de péremption 2
        numSerie2,                  // Numéro de série 2
        qte1,                       // Quantité 1
        qte2,                       // Quantité 2
        qte3                        // Quantité 3
      );
      this.updateCartQuantity();
      // Clear the values after adding to the cart
      article.stockQuantity = null;
      article.soldQuantity = null;
      article.datePeremtion = null;
      article.numSerie = null;
      article.datePeremtion1 = null;
      article.numSerie1 = null;
      article.datePeremtion2 = null;
      article.numSerie2 = null;
      article.qte1 = null;
      article.qte2 = null;
      article.qte3 = null;

      // Reset visible fields for additional quantities
      this.visibleFields[article.index] = 0;
      //console.log('Article ajouté au panier:', article);
    } else {
      const toast = await this.toastController.create({
        message: 'Aucune pharmacie sélectionnée.',
        duration: 2000, // Durée d'affichage (en millisecondes)
        color: 'danger', // Couleur du toast (danger pour l'erreur)
        position: 'top'  // Position du toast (top, bottom, etc.)
      });
      toast.present();
    }
  }
  // checkStockQuantity(article: any) {
  //   if (article.stockQuantity > article?.aS_QteSto) {
  //     // Affiche un message d'erreur si la quantité stockée dépasse la quantité disponible
  //     article.stockQuantity = article?.aS_QteSto;  // Réinitialiser la quantité à la quantité disponible
  //   }
  // }

  checkSoldQuantity(article: any) {
    if (article.soldQuantity > article.stockQuantity) {
      // Affiche un message d'erreur si la quantité vendue dépasse la quantité en stock
      article.soldQuantity = article.stockQuantity;  // Réinitialiser la quantité vendue à la quantité en stock
    }
  }
  DPQteControl(article: any) {
    if (((article.qte1 ?? 0) + (article.qte2 ?? 0) + (article.qte3 ?? 0)) > article.stockQuantity) {
      article.qte1 = 0;
      article.qte2 = 0;
      article.qte3 = 0;

    }
  }
  logout() {
    localStorage.clear();
    this.router.navigateByUrl('/');
  }
}
import { Component, OnInit } from '@angular/core';
import { ArticlesService } from '../services/articles.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recommande',
  templateUrl: './recommande.page.html',
  styleUrls: ['./recommande.page.scss'],
  standalone: false

})
export class RecommandePage implements OnInit {


  articles: any;
  searchText = "";
  selectedPharmacyJSON = JSON.parse(localStorage.getItem('Pharmacie')!);
  cartQuantity: number = 0;
  visibleFields: { [key: number]: number } = {};

  constructor(
    private articleService: ArticlesService,
    private toastController: ToastController,
    private cartService: CartService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {

  }

  ngOnInit() {
    this.updateCartQuantity();
    if (!this.articles) {
      this.getAllArticles();
    }
  }
  goToPharmacie() {
  this.router.navigateByUrl('/tabs/pharmacie');
}
  updateCartQuantity() {
    this.cartQuantity = this.cartService.getCartItemCount();
  }

  // Nouvelle fonction pour gérer le rafraîchissement
  async refreshPage() {
    const loading = await this.loadingCtrl.create({
      message: 'Rafraîchissement...',
      spinner: 'crescent',
      duration: 2000 // Durée maximale du loading (2 secondes)
    });

    await loading.present();

    // Recharger les données
    this.getAllArticles();

    

    await loading.dismiss(); // Fermer le loading
  }
  ionViewWillEnter() {
    this.selectedPharmacyJSON = JSON.parse(localStorage.getItem('Pharmacie')!);
  }

  async getAllArticles() {
    this.articleService.getAllArticles().subscribe(
      (res: any) => {
        this.articles = res.filter((article: any) => article.recommande === "Oui");
        //console.log(this.articles);

        // Initialize visibleFields for each article
        this.articles.forEach((_: any, index: any) => (this.visibleFields[index] = 0));
      },
      (error) => {
        console.error('Erreur lors du chargement des articles:', error);
      }
    );
  }

  showNextSet(index: number): void {
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
  checkStockQuantity(article: any) {
    if (article.stockQuantity > article?.aS_QteSto) {
      // Affiche un message d'erreur si la quantité stockée dépasse la quantité disponible
      article.stockQuantity = article?.aS_QteSto;  // Réinitialiser la quantité à la quantité disponible
    }
  }

  checkSoldQuantity(article: any) {
    if (article.soldQuantity > article.stockQuantity) {
      // Affiche un message d'erreur si la quantité vendue dépasse la quantité en stock
      article.soldQuantity = article.stockQuantity;  // Réinitialiser la quantité vendue à la quantité en stock
    }
  }
  // Méthode appelée lorsque la date change
  updateDate(article: any): any {
    if (article.datePeremtion) {
      // Formate la date en "DD/MM/YYYY"
      const formattedDate = this.formatDate(article.datePeremtion);
      console.log('Date formatée (DD/MM/YYYY) :', formattedDate);

      // Formate la date en "Février 2026"
      const frenchDate = this.formatDateToFrench(article.datePeremtion);
      console.log('Date en français :', frenchDate);

      // Vous pouvez retourner la date formatée si nécessaire
      return formattedDate;
    }
  }

  // Méthode pour formater la date en "DD/MM/YYYY"
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); // Jour
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois (ajoute 1 car les mois commencent à 0)
    const year = date.getFullYear(); // Année
    return `${day}/${month}/${year}`; // Format DD/MM/YYYY
  }

  // Méthode pour formater la date en "Février 2026"
  private formatDateToFrench(dateString: string): string {
    const date = new Date(dateString);
    const month = date.toLocaleString('fr-FR', { month: 'long' }); // Mois en français
    const year = date.getFullYear(); // Année
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`; // Format "Février 2026"
  }
  logout() {
    localStorage.clear();
    this.router.navigateByUrl('/');
  }
}

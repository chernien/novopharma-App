import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cart: {
    pharmacy: any;
    article: any;
    quantity: number;
    quantityVendue: number;
    datePeremtion?: Date;
    numSerie?: string;
    datePeremtion1?: Date;
    numSerie1?: string;
    datePeremtion2?: Date;
    numSerie2?: string;
    qte1?: number;
    qte2?: number;
    qte3?: number;

  }[] = [];
  private cartSubject = new BehaviorSubject<any[]>(this.cart);
  constructor() {

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
      this.cartSubject.next(this.cart); // ✅ mise à jour du BehaviorSubject
    }
  }

  // Ajouter un article au panier
  addToCart(
    pharmacy: any,
    article: any,
    quantity: number,
    quantityVendue: number,
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
    const existingItemIndex = this.cart.findIndex(
      (item) =>
        item.pharmacy.ctNum === pharmacy.ctNum &&
        item.article?.arRef === article?.arRef
    );

    if (existingItemIndex !== -1) {
      // Si l'article existe déjà, mettre à jour les quantités et informations supplémentaires
      this.cart[existingItemIndex].quantity += quantity;
      this.cart[existingItemIndex].quantityVendue = quantityVendue;
      this.cart[existingItemIndex].datePeremtion = datePeremtion;
      this.cart[existingItemIndex].numSerie = numSerie;
      this.cart[existingItemIndex].datePeremtion1 = datePeremtion1;
      this.cart[existingItemIndex].numSerie1 = numSerie1;
      this.cart[existingItemIndex].datePeremtion2 = datePeremtion2;
      this.cart[existingItemIndex].numSerie2 = numSerie2;
      this.cart[existingItemIndex].qte1 = qte1;
      this.cart[existingItemIndex].qte2 = qte2;
      this.cart[existingItemIndex].qte3 = qte3;
    } else {
      // Sinon, ajouter un nouvel article avec toutes les informations
      this.cart.push({
        pharmacy,
        article,
        quantity,
        quantityVendue,
        datePeremtion,
        numSerie,
        datePeremtion1,
        numSerie1,
        datePeremtion2,
        numSerie2,
        qte1,
        qte2,
        qte3,
      });
    }

    // Sauvegarder le panier dans localStorage
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateLocalStorage();

  }

  // Mettre à jour un article dans le panier
  updateCartItem(
    pharmacyId: string,
    articleId: string,
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
    const itemIndex = this.cart.findIndex(
      (item) =>
        item.pharmacy.ctNum === pharmacyId && item.article?.arRef === articleId
    );

    if (itemIndex !== -1) {
      // Mettre à jour l'article dans le panier
      this.cart[itemIndex].quantityVendue = qteVendue;
      this.cart[itemIndex].datePeremtion = datePeremtion;
      this.cart[itemIndex].numSerie = numSerie;
      this.cart[itemIndex].datePeremtion1 = datePeremtion1;
      this.cart[itemIndex].numSerie1 = numSerie1;
      this.cart[itemIndex].datePeremtion2 = datePeremtion2;
      this.cart[itemIndex].numSerie2 = numSerie2;
      this.cart[itemIndex].qte1 = qte1;
      this.cart[itemIndex].qte2 = qte2;
      this.cart[itemIndex].qte3 = qte3;

      // Sauvegarder le panier dans localStorage
      localStorage.setItem('cart', JSON.stringify(this.cart));
      this.updateLocalStorage();

    }
  }


  // Récupérer les articles du panier pour une pharmacie donnée
  getCartItemsForPharmacy(pharmacyId: string) {
    return this.cart.filter((item) => item.pharmacy?.ctNum === pharmacyId);
  }
  getCartItemCount(): number {
    return this.cart.length;
  }
  // Supprimer un article du panier
  removeFromCart(pharmacyId: string, articleId: string) {
    const itemIndex = this.cart.findIndex(
      (item) =>
        item.pharmacy.ctNum === pharmacyId && item.article?.arRef === articleId
    );

    if (itemIndex !== -1) {
      // Supprimer l'article du panier
      this.cart.splice(itemIndex, 1);
      // Sauvegarder le panier dans localStorage
      localStorage.setItem('cart', JSON.stringify(this.cart));
    }
    this.getCartQuantity()
    this.updateLocalStorage();

  }

  // Récupérer tous les articles du panier
  getCart() {
    return this.cartSubject.asObservable();
  }
  private updateLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.cartSubject.next(this.cart); // 🔥 Notifier les composants abonnés
  }

  // Effacer le panier
  clearCart() {
    this.cart = [];
    localStorage.setItem('cart', JSON.stringify(this.cart));
    location.reload(); // Reloads the current page
  }
  clearCart2() {
    this.cart = [];
    this.updateLocalStorage();
  }

  // Calculer et retourner la quantité totale d'articles dans le panier
  getCartQuantity(): number {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }
}
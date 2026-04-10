import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ArticlesService } from '../services/articles.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { CartService } from '../services/cart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, debounceTime, distinctUntilChanged, timeout } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.page.html',
  styleUrls: ['./articles.page.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush // Evite re-rendus inutiles
})
export class ArticlesPage implements OnInit {
  articles$ = new BehaviorSubject<any[]>([]);
  isLoading$ = new BehaviorSubject<boolean>(true);
  selectedPharmacyJSON: any;
  filteredArticles$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  searchText = "";
  cartQuantity = 0;
  visibleFields: { [key: number]: number } = {};
  isLoading: boolean = true;
  articles: any[] = [];
  searchTimeout: any;
  searchText$ = new BehaviorSubject<string>('');
  private articlesIndex = new Map<string, any[]>();
  MAX_CART_ITEMS = 40;
  cartFull = false;
  userconnect: any;
  


  constructor(
    private route: ActivatedRoute,
    private articleService: ArticlesService,
    private toastController: ToastController,
    private cartService: CartService,
    private router: Router,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private cdr: ChangeDetectorRef,
    
  ) { }

  ngOnInit(): void {
    const state = history.state as any;
    const marque = this.route.snapshot.paramMap.get('marque');
    

    if (state?.fromBarcode && state?.article) {
      const article = state.article;
      const mappedArticle = {
        arRef: article.arRef || article.AR_Ref,
        arDesign: article.arDesign || article.AR_Design,
        marque: article.marque || article.Marque || '',
        aS_QteSto: article.aS_QteSto || article.AS_QteSto || 0,
        recommande: article.recommande ,
        ar_photo: article.ar_photo?.replace(/^\.\\/, '') || '',
        source: article.source
      };

      this.articles = [mappedArticle];
      this.filteredArticles$.next([mappedArticle]);
      this.isLoading$.next(false);

      if (!this.selectedPharmacyJSON) {
        this.selectedPharmacyJSON = this.getLocalStorageItem('Pharmacie') || { id: 'dummy', name: 'Pharmacie par défaut' };
      }
      this.cdr.detectChanges();
    } else if (marque) {
      this.loadPharmacyAndArticles(marque);
    } else {
      this.filteredArticles$.next([]);
      this.isLoading$.next(false);
    }

    this.updateCartQuantity();

    this.searchText$
      .pipe(distinctUntilChanged(), debounceTime(300))
      .subscribe((searchTerm) => {
        if (!searchTerm.trim()) {
          this.filteredArticles$.next([...this.articles]);
        } else {
          this.applyFilter(searchTerm);
        }
      });
  }

  ionViewWillEnter() {
    this.updateCartQuantity();
  }
  private buildIndex() {
  this.articlesIndex.clear();
  this.articles.forEach(article => {
    const keys = [
      this.normalizeText(article.arDesign),
      this.normalizeText(article.arRef),
    ];
    keys.forEach(key => {
      if (!this.articlesIndex.has(key)) {
        this.articlesIndex.set(key, []);
      }
      this.articlesIndex.get(key)!.push(article);
    });
  });
}


  onSearchInput(event: any) {
    const search = event.target.value || '';
    this.applyFilter(search);
  }

  async refreshPage() {
    const loading = await this.loadingCtrl.create({
      message: 'Rafraîchissement...',
      spinner: 'crescent',
      duration: 2000
    });
    await loading.present();

    const marque = this.route.snapshot.paramMap.get('marque')!;
    this.loadPharmacyAndArticles(marque);

    await loading.dismiss();
  }

  trackByFn(index: number, item: any) {
    return item.arRef;
  }

  private applyFilter(search: string) {
    if (!search.trim()) {
      this.filteredArticles$.next([...this.articles]);
      return;
    }

    const lowerSearch = search.toLowerCase();

    const filtered = this.articles.filter(article =>
      article.arDesign?.toLowerCase().includes(lowerSearch) ||
      article.marque?.toLowerCase().includes(lowerSearch)
    );

    this.filteredArticles$.next(filtered);
  }

  private loadPharmacyAndArticles(marque?: string) {
    this.selectedPharmacyJSON = this.getLocalStorageItem('Pharmacie');

    if (!this.selectedPharmacyJSON) {
      this.isLoading$.next(false);
      this.filteredArticles$.next([]);
      console.log('Aucune pharmacie sélectionnée.');
      return;
    }

    const cachedArticles = this.getLocalStorageItem('articles');

    if (cachedArticles) {
      let filtered = cachedArticles;

      if (marque === 'Med Source') {
        filtered = filtered.filter((article: any) => !article.marque || article.marque.trim() === '');
      } else if (marque) {
        filtered = filtered.filter((article: any) => article.marque === marque);
      }

      this.articles = filtered.filter((article: any) => article.arRef && article.arDesign);

      console.log('Articles valides chargés :', this.articles);

      this.buildIndex();
      this.filteredArticles$.next(this.articles);
      this.initializeVisibility(this.articles.length);
      this.isLoading$.next(false);

    } else {
      this.fetchArticlesFromServermarque(marque);
    }
  }

  private fetchArticlesFromServermarque(marque?: string) {
  this.isLoading$.next(true);

  let apiUrl = 'https://novopharma.tn/api/MBAArticle/all-marques';
  if (marque) {
    apiUrl += `?marque=${encodeURIComponent(marque)}`;
  }

  this.http.get<any[]>(apiUrl).subscribe(
    (data: any[]) => {
      console.log('✅ Articles reçus:', data.length);

      this.articles = data;

      // 🔥 étape 1 : afficher immédiatement (rapide)
      const firstRender = this.articles.slice(0, 30);
      this.filteredArticles$.next(firstRender);
      this.initializeVisibility(firstRender.length);

      // 🔥 STOP spinner après premier rendu réel
      this.isLoading$.next(false);
      this.cdr.detectChanges();

      // 🔥 étape 2 : injecter le reste sans bloquer UI
      this.lazyRenderRemaining(30);
    },
    (error) => {
      console.error('❌ API Error:', error);
      this.isLoading$.next(false);
    }
  );
}


private lazyRenderRemaining(startIndex: number) {
  let index = startIndex;
  const chunkSize = 50; // nombre d'articles par batch

  const interval = setInterval(() => {
    if (index >= this.articles.length) {
      clearInterval(interval);
      return;
    }

    const nextChunk = this.articles.slice(0, index + chunkSize);
    this.filteredArticles$.next(nextChunk);

    this.initializeVisibility(nextChunk.length);

    index += chunkSize;

    this.cdr.detectChanges();
  }, 50); // 50ms = fluide
}

  private initializeVisibility(length: number) {
    for (let i = 0; i < length; i++) {
      this.visibleFields[i] = 0;
    }
  }

  filterArticles() {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      if (!this.searchText.trim()) {
        this.filteredArticles$.next(this.articles);
        return;
      }

      const search = this.normalizeText(this.searchText);
      const filtered = this.articles.filter(article =>
        this.normalizeText(article.arDesign).includes(search) ||
        this.normalizeText(article.arRef).includes(search)
      );

      this.filteredArticles$.next(filtered);
    }, 150);
  }

  private normalizeText(text: string): string {
    return text
      ?.trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  private getLocalStorageItem(key: string): any {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  private setLocalStorageItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  updateCartQuantity() {
    this.cartQuantity = this.cartService.getCartItemCount();
    this.cartFull = this.cartQuantity >= this.MAX_CART_ITEMS;
  }

  initializeVisibleFields() {
    const articles = this.articles$.getValue();

    articles.forEach((_, index) => {
      this.visibleFields[index] = 0;
    });
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
    // ================================
  // 👤 LOG UTILISATEUR CONNECTÉ
  // ================================
  this.userconnect = JSON.parse(localStorage.getItem("Commercial")!);
  console.log("%c👤 USER CONNECTÉ", "color: green; font-weight: bold;",this.userconnect.id );


  if (this.cartFull) {
    const toast = await this.toastController.create({
      message: `❌ Panier plein (max ${this.MAX_CART_ITEMS} articles).`,
      duration: 2000,
      color: 'warning',
      position: 'top'
    });
    toast.present();
    return;
  }

  if (this.selectedPharmacyJSON) {

    // 🔥🔥 LOG COMPLET DES DONNÉES ENVOYÉES 🔥🔥
    console.log("🛒 addToCart() → Données envoyées au cartService :", {
      pharmacie: this.selectedPharmacyJSON,
      article: article,
      quantity: quantity,
      qteVendue: qteVendue,
      datePeremtion: datePeremtion,
      numSerie: numSerie,
      datePeremtion1: datePeremtion1,
      numSerie1: numSerie1,
      datePeremtion2: datePeremtion2,
      numSerie2: numSerie2,
      qte1: qte1,
      qte2: qte2,
      qte3: qte3,
      
    });

    this.cartService.addToCart(
      this.selectedPharmacyJSON,
      article,
      quantity,
      qteVendue,
      datePeremtion,
      numSerie,
      datePeremtion1,
      numSerie1,
      datePeremtion2,
      numSerie2,
      qte1,
      qte2,
      qte3
    );

    this.updateCartQuantity();

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

    this.visibleFields[article.index] = 0;

  } else {
    const toast = await this.toastController.create({
      message: 'Aucune pharmacie sélectionnée.',
      duration: 2000,
      color: 'danger',
      position: 'top'
    });
    toast.present();
  }
}


  checkStockQuantity(article: any) {
    if (article.stockQuantity < 0) {
      article.stockQuantity = 0;
    }
  }

  checkSoldQuantity(article: any) {
    if (article.soldQuantity > article.stockQuantity) {
      article.soldQuantity = article.stockQuantity;
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

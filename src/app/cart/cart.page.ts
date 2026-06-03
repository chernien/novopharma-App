import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { ClientService } from '../services/client.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NetworkService } from '../services/network.service';
import { CommandeQueueService, ChunkItem, QueueSession } from '../services/commande-queue.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: false
})
export class CartPage implements OnInit {

  cartItems: any = [];
  searchText = "";
  userconnect: any;
  selectedPharmacyJSON = JSON.parse(localStorage.getItem('Pharmacie')!);
  progress = 0;

  selectedDate!: string;
  minDate!: string;
  maxDate!: string;

  constructor(
    private cartService: CartService,
    private clientService: ClientService,
    private alertController: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router,
    private toastController: ToastController,
    private networkService: NetworkService,
    private commandeQueueService: CommandeQueueService
  ) { }

  ngOnInit() {
    this.userconnect = JSON.parse(localStorage.getItem("Commercial")!);
    this.loadCart();

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 2);
    this.maxDate = today.toISOString().split('T')[0];
    this.minDate = yesterday.toISOString().split('T')[0];

    this.checkForIncompleteSession();
  }

  // ─── Reprise de session interrompue ────────────────────────────────────────

  private async checkForIncompleteSession() {
    if (!this.commandeQueueService.hasIncompleteSession()) return;

    const session = this.commandeQueueService.getSession()!;
    const pendingCount = this.commandeQueueService
      .getPendingChunks(session)
      .reduce((acc, c) => acc + c.data.length, 0);

    const alert = await this.alertController.create({
      header: 'Session interrompue',
      message: `Un envoi précédent n'a pas pu se terminer. Il reste ${pendingCount} article(s) à envoyer. Voulez-vous reprendre ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => this.commandeQueueService.clearSession()
        },
        {
          text: 'Reprendre',
          handler: () => this.resumeSession(session)
        }
      ]
    });
    await alert.present();
  }

  private async resumeSession(session: QueueSession) {
    const loading = await this.loadingCtrl.create({
      message: 'Reprise de l\'envoi...',
      spinner: 'circles',
    });
    await loading.present();

    try {
      const pendingChunks = this.commandeQueueService.getPendingChunks(session);
      let sentCount = this.commandeQueueService.getSentCount(session);
      const totalItems = session.totalItems;

      for (const chunk of pendingChunks) {
        await this.retryChunk(chunk.data, session.username, chunk.source, loading);
        this.commandeQueueService.markChunkSent(session.sessionId, chunk.id);
        sentCount += chunk.data.length;
        this.progress = Math.min(Math.round((sentCount / totalItems) * 100), 100);
        loading.message = `Envoi... ${sentCount} / ${totalItems} (${this.progress}%)`;
      }

      await loading.dismiss();
      this.commandeQueueService.clearSession();
      this.showAlert('Succès', `✅ Session reprise : toutes les commandes ont été envoyées.`);
      this.cartService.clearCart();
      this.loadCart();
      this.progress = 0;

    } catch (error: any) {
      console.error('❌ Erreur lors de la reprise de session :', error);
      await loading.dismiss();

      const code = error?.message;

      if (code === 'DATABASE_CONNECTION_ERROR') {
        this.showAlert(
          '❌ Base de données inaccessible',
          'SQL Server est arrêté ou inaccessible. Contactez l\'administrateur.'
        );
      } else if (code === 'DATABASE_SAVE_ERROR') {
        this.showAlert(
          '❌ Erreur d\'enregistrement',
          'Les données ont atteint le serveur mais n\'ont pas pu être sauvegardées. Contactez l\'administrateur.'
        );
      } else if (code === 'SERVER_ERROR') {
        this.showAlert(
          '❌ Erreur serveur',
          'Une erreur interne s\'est produite côté serveur lors de la reprise. Contactez l\'administrateur.'
        );
      } else if (code === 'NETWORK_UNSTABLE') {
        this.showAlert(
          '📶 Connexion instable',
          'La connexion réseau est instable. La reprise a été arrêtée. Vérifiez votre Wi-Fi et relancez l\'application.'
        );
      } else {
        this.showAlert('Erreur', 'Reprise interrompue. Relancez l\'application pour réessayer.');
      }
    }
  }

  // ─── Chargement du panier ──────────────────────────────────────────────────

  loadCart() {
    this.cartService.getCart().subscribe((cart) => {
      console.log('[loadCart] Panier reçu :', cart);
      this.cartItems = cart;
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'danger',
      position: 'top',
    });
    toast.present();
  }

  removeItemCart(PId: string, AId: any) {
    this.cartService.removeFromCart(PId, AId);
    this.loadCart();
  }

  async showAlert(header: string, message: string, buttons: string[] = ['OK']) {
    const alert = await this.alertController.create({ header, message, buttons });
    await alert.present();
  }

  AddCommande(item: any) {
    if (!item) return;
    if (!this.selectedDate) {
      this.showAlert('Erreur', 'Veuillez sélectionner une date pour la commande.');
      return;
    }
    const commandePayload = { ...item, datecreated: this.selectedDate };
    this.clientService.AddCommande(
      commandePayload,
      this.userconnect?.username,
      item?.article?.source,
    ).subscribe(
      (res: any) => {
        this.showAlert('Succès', res?.message || 'Commande ajoutée avec succès');
        this.removeItemCart(item?.pharmacy?.ctNum, item?.article?.arRef);
      },
      (error) => {
        const message =
          error?.error?.message ||
          error?.message ||
          "Erreur lors de la passation de la commande";
        this.showAlert("Erreur", message);
      }
    );
  }

  checkStockQuantity(article: any) {
    article.stockQuantity = Math.min(article.stockQuantity, article?.aS_QteSto || 0);
  }

  checkSoldQuantity(article: any) {
    article.soldQuantity = Math.min(article.soldQuantity, article.stockQuantity || 0);
  }

  // ─── Retry intelligent avec distinction serveur / réseau ─────────────────

  async retryChunk(
    chunk: any[],
    username: string,
    source: string,
    loading?: any,
    maxNetworkRetries = 3
  ): Promise<void> {
    let attempt = 0;
    let delay = 3000; // 3s → 6s → max 9s

    while (attempt < maxNetworkRetries) {

      // Si hors ligne → pause propre, sans compter comme retry
      if (!this.networkService.isOnline) {
        console.warn('[retryChunk] Hors ligne — attente de reconnexion...');
        if (loading) loading.message = '📶 En attente de connexion réseau...';
        await this.networkService.waitForOnline();
        if (loading) loading.message = '🔄 Connexion rétablie, reprise de l\'envoi...';
        await new Promise(res => setTimeout(res, 1000));
      }

      try {
        console.log(`🚀 Tentative #${attempt + 1} d'envoi du chunk (${chunk.length} articles)...`);

        const response: any = await firstValueFrom(
          this.clientService.AddCommandes(chunk, username, source).pipe(
            timeout(60000) // 60s max — laisse le serveur retourner son 500 avant d'abandonner
          )
        );

        if (Array.isArray(response)) {
          response.forEach((resItem: any, idx: number) => {
            if (resItem.status === 'already') {
              this.showToast(`❌ Article déjà commandé : ${resItem.articleId}`, 'warning');
              chunk.splice(idx, 1);
            } else if (resItem.status === 'quantityFalse') {
              this.showToast(`⚠ Quantité différente pour l'article ${resItem.articleId}`, 'warning');
            } else if (resItem.status === 'quantityVendueFalse') {
              this.showToast(`⚠ Quantité vendue différente pour l'article ${resItem.articleId}`, 'warning');
            } else if (resItem.status === 'mismatch') {
              this.showToast(`⚠ Quantity et QuantityVendue différentes pour l'article ${resItem.articleId}`, 'warning');
            }
          });
        }

        console.log(`✅ Chunk envoyé avec succès après ${attempt + 1} tentative(s).`);
        return;

      } catch (err: any) {

        // ── Erreur HTTP (réponse du serveur reçue) ──────────────────────────
        if (err instanceof HttpErrorResponse) {
          console.error(`❌ Erreur HTTP ${err.status} reçue du serveur`, err);

          if (err.status >= 500) {
            // Lire l'errorType retourné par l'API pour afficher le bon message
            const errorType = err.error?.errorType ?? 'SERVER_ERROR';
            throw new Error(errorType);
          }

          if (err.status >= 400 && err.status < 500) {
            throw new Error('BAD_REQUEST');
          }
        }

        // ── Timeout ou erreur réseau → on retente ───────────────────────────
        attempt++;
        const isTimeout = err instanceof TimeoutError;
        console.warn(
          `⏳ ${isTimeout ? 'Timeout' : 'Erreur réseau'} — tentative ${attempt}/${maxNetworkRetries}`,
          err
        );

        if (attempt >= maxNetworkRetries) {
          throw new Error('NETWORK_UNSTABLE');
        }

        if (loading) loading.message = `📶 Connexion instable, tentative ${attempt + 1}/${maxNetworkRetries}...`;
        await new Promise(res => setTimeout(res, delay));
        delay = Math.min(delay + 3000, 9000);
      }
    }
  }

  showToast(message: string, color: string = 'dark') {
    this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'top'
    }).then(toast => toast.present());
  }

  openVersionPage() {
    this.router.navigate(['/version']);
  }

  // ─── Envoi principal avec persistance ────────────────────────────────────

  async sendCommandes() {
    if (!this.userconnect?.username) {
      this.showAlert('Erreur', 'Utilisateur non identifié.');
      return;
    }
    if (!Array.isArray(this.cartItems) || this.cartItems.length === 0) {
      this.showAlert('Erreur', 'Le panier est vide.');
      return;
    }
    if (!this.selectedDate) {
      this.showAlert('Erreur', 'Veuillez sélectionner une date pour la commande.');
      return;
    }

    const groupedBySource = this.cartItems.reduce((acc: any, item: any) => {
      const src = item.article?.source || "Novopharma";
      if (!acc[src]) acc[src] = [];
      acc[src].push(item);
      return acc;
    }, {});

    const chunkSize = 7; // Réduit de 11 → 7 pour connexions instables
    const totalItems = this.cartItems.length;
    this.progress = 0;

    // Construire tous les chunks AVANT d'envoyer pour persistance complète
    const allChunks: ChunkItem[] = [];
    for (const [source, items] of Object.entries(groupedBySource)) {
      const commandesPayload = (items as any[]).map((item: any) => ({
        pharmacy: item.pharmacy,
        article: item.article,
        quantity: item.quantity,
        quantityVendue: item.quantityVendue,
        Datecreated: new Date(this.selectedDate),
        datePeremtion: item.datePeremtion,
        numSerie: item.numSerie,
        datePeremtion1: item.datePeremtion1,
        numSerie1: item.numSerie1,
        datePeremtion2: item.datePeremtion2,
        numSerie2: item.numSerie2,
        qte1: item.qte1,
        qte2: item.qte2,
        qte3: item.qte3,
        source,
        dateCommande: this.selectedDate
      }));

      for (let i = 0; i < commandesPayload.length; i += chunkSize) {
        allChunks.push({
          id: `${source}_${i}`,
          source: source as string,
          data: commandesPayload.slice(i, i + chunkSize),
          sent: false
        });
      }
    }

    // ✅ Persister la session AVANT tout envoi réseau
    const session = this.commandeQueueService.createSession(
      allChunks,
      this.userconnect.username,
      this.selectedDate,
      totalItems
    );

    const loading = await this.loadingCtrl.create({
      message: 'Envoi des commandes...',
      spinner: 'circles',
    });
    await loading.present();

    try {
      let sentCount = 0;

      for (const chunk of allChunks) {
        console.log(`📦 Envoi chunk [${chunk.id}] — ${chunk.data.length} articles`);
        await this.retryChunk(chunk.data, session.username, chunk.source, loading);

        // Marquer comme envoyé immédiatement après succès
        this.commandeQueueService.markChunkSent(session.sessionId, chunk.id);
        sentCount += chunk.data.length;
        this.progress = Math.min(Math.round((sentCount / totalItems) * 100), 100);
        loading.message = `Envoi... ${sentCount} / ${totalItems} (${this.progress}%)`;
      }

      await loading.dismiss();
      this.commandeQueueService.clearSession();
      this.showAlert('Succès', `✅ Toutes les commandes (${sentCount}) ont été envoyées avec succès.`);
      this.cartService.clearCart();
      this.loadCart();
      this.progress = 0;

    } catch (error: any) {

      console.log('================ ERROR DEBUG ================');

  console.log('Erreur complète :');
  console.log(error);

  console.log('Status HTTP :');
  console.log(error?.status);

  console.log('Message :');
  console.log(error?.message);

  console.log('Nom erreur :');
  console.log(error?.name);

  console.log('Body retourné :');
  console.log(error?.error);

  console.log('errorType backend :');
  console.log(error?.error?.errorType);

  console.log('=============================================');

      console.error('❌ Erreur critique envoi commandes :', error);
      await loading.dismiss();

      const code = error?.message;

      if (code === 'DATABASE_CONNECTION_ERROR') {
        this.showAlert(
          '❌ Base de données inaccessible',
          'Le serveur de base de données est arrêté ou inaccessible. Contactez l\'administrateur pour redémarrer SQL Server.'
        );
      } else if (code === 'DATABASE_SAVE_ERROR') {
        this.showAlert(
          '❌ Erreur d\'enregistrement',
          'Les données ont bien atteint le serveur mais n\'ont pas pu être enregistrées (contrainte base de données). Contactez l\'administrateur.'
        );
      } else if (code === 'SERVER_ERROR') {
        this.showAlert(
          '❌ Erreur serveur',
          'Une erreur interne s\'est produite côté serveur. Vos données n\'ont pas été enregistrées. Contactez l\'administrateur.'
        );
      } else if (code === 'NETWORK_UNSTABLE') {
        this.showAlert(
          '📶 Connexion instable',
          'La connexion réseau est instable. L\'envoi a été arrêté après plusieurs tentatives. Vérifiez votre connexion Wi-Fi et réessayez.'
        );
      } else if (code === 'BAD_REQUEST') {
        this.showAlert(
          '📶 Connexion instable',
          'La connexion réseau est instable. L\'envoi a été arrêté après plusieurs tentatives. Vérifiez votre connexion Wi-Fi et réessayez.'
        );
      } else {
        this.showAlert(
          '📶 Connexion instable',
          'La connexion réseau est instable. L\'envoi a été arrêté après plusieurs tentatives. Vérifiez votre connexion Wi-Fi et réessayez.'
        );
      }
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { ClientService } from '../services/client.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { CartService } from '../services/cart.service';
import { finalize, firstValueFrom, take } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-pharamcie',
  templateUrl: './pharamcie.page.html',
  styleUrls: ['./pharamcie.page.scss'],
  standalone: false

})
export class PharamciePage implements OnInit {
  clients: any[] = [];
  searchText: string = '';
    isCheckedIn: boolean = false;
  userconnect: any;
  isYosra: boolean = false;



  constructor(
    private clientService: ClientService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private cartService: CartService,
    private alertCtrl: AlertController,
    private http: HttpClient


  ) { }

  ngOnInit() {
        this.userconnect = JSON.parse(localStorage.getItem("Commercial")!);
        console.log("👤 Utilisateur connecté :", this.userconnect);

    this.isCheckedIn = localStorage.getItem("checkIn") === "true";
if (this.userconnect?.username?.trim().toLowerCase() === 'yosra-novo' || 
    this.userconnect?.username?.trim().toLowerCase() === 'admin-novo') {
  this.isYosra = true;
} else {
  this.isYosra = false;
}


  this.checkIfSpecialUser();

    this.loadAllClients();
  }


  private checkIfSpecialUser() {
  const username = this.userconnect?.username?.trim().toLowerCase();
  this.isYosra = (username === 'yosra-novo' || username === 'admin-novo');
}

openVersionPage() {
  this.router.navigate(['/version']);
}

animateLogo(event: any) {
  const logo = event.target;
  logo.classList.add('logo-shadow');

  // Retirer la classe ET faire la redirection après la fin de l'animation (400ms)
  setTimeout(() => {
    logo.classList.remove('logo-shadow');
    this.openVersionPage(); // redirection après l'animation
  }, 400); // correspond à shadowPulse 0.4s
}




  goToDermos() {
  this.router.navigateByUrl('/dermos');
}

  async loadAllClients() {
    if (this.clients.length) return; // Évite les rechargements inutiles
  
    const loading = await this.loadingCtrl.create({
      message: 'Chargement...',
      spinner: 'circles',
    });
    await loading.present();
  
    this.clientService.GetPharmacie()
      .pipe(
        take(1), // Prend une seule réponse puis annule l'abonnement
        finalize(() => loading.dismiss()) // Ferme le loader dans tous les cas
      )
      .subscribe({
        next: (res: any) => {
          // Suppression des doublons basés sur ctNum
          const uniqueClients = res.filter((client: any, index: number, self: any[]) => 
            index === self.findIndex((c) => c.ctNum === client.ctNum)
          );
  
          // Trie les clients par ctIntitule
          this.clients = uniqueClients.sort((a: any, b: any) => a.ctIntitule.localeCompare(b.ctIntitule));
          
          console.log('Liste des clients sans doublons : ', this.clients);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des pharmacies:', error);
        }
      });
  }

  /** 🔥 Récupère adresse réelle via Nominatim */
  private async getAddressFromCoordinates(latitude: number, longitude: number): Promise<string | null> {
  try {

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=fr`;

    const response: any = await firstValueFrom(
      this.http.get(url, {
        headers: { 'User-Agent': 'PharmaApp/1.0' }
      })
    );

    console.log("[Geolocation] Réponse Nominatim:", response);

    return response?.display_name || "Adresse inconnue";

  } catch (error) {

    console.error("[Geolocation] Erreur API Nominatim:", error);
    return "Adresse inconnue";

  }
}

  /** 🔥 Détection position + conversion adresse */
private async getGeolocation(): Promise<string | null> {
  try {

    // ✅ Si on est sur le WEB
    if (Capacitor.getPlatform() === 'web') {

      if (!navigator.geolocation) {
        this.showAlert("Erreur", "La géolocalisation n'est pas supportée sur ce navigateur.");
        return null;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000
        });
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      return await this.getAddressFromCoordinates(latitude, longitude);
    }

    // ✅ Mobile (Android / iOS)
    // Vérification défensive : le plugin peut être absent en release si ProGuard
    // n'est pas configuré correctement (crash silencieux sans ce check)
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      console.error('[Geolocation] Plugin non disponible — vérifier proguard-rules.pro');
      this.showAlert("Erreur", "Plugin de géolocalisation non disponible sur cet appareil.");
      return null;
    }

    const perm = await Geolocation.requestPermissions();

    if (!perm || (perm.location !== 'granted' && perm.coarseLocation !== 'granted')) {
      this.showAlert("Permission refusée", "Merci d'activer la localisation dans les paramètres.");
      return null;
    }

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000
    });

    if (!position?.coords) {
      this.showAlert("GPS désactivé", "Activez la localisation sur votre appareil.");
      return null;
    }

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    return await this.getAddressFromCoordinates(latitude, longitude);

  } catch (err: any) {
    console.error("Erreur localisation:", err);
    // En release, certaines erreurs de permission ont un code spécifique
    if (err?.code === 1) {
      this.showAlert("Permission refusée", "Activez la localisation dans les paramètres Android.");
    } else if (err?.code === 2) {
      this.showAlert("GPS indisponible", "Impossible d'obtenir votre position. Réessayez.");
    } else if (err?.code === 3) {
      this.showAlert("Délai dépassé", "La récupération de position a pris trop de temps.");
    } else {
      this.showAlert("Erreur", "Impossible de récupérer votre position.");
    }
    return null;
  }
}
  getCurrentDatePlusOneHour(): string {
  const now = new Date();
  now.setHours(now.getHours() + 1); // ➕ ajoute 1 heure
  return now.toISOString();
}

  async onCheckIn() {

  const loading = await this.loadingCtrl.create({
    message: "Récupération position..."
  });

  await loading.present();

  try {

    const localisation = await this.getGeolocation();

    if (!localisation) {
      // showAlert géré dans getGeolocation(), on sort proprement
      return;
    }

    const payload = {
      username: this.userconnect?.username,
      localisationCheckIn: localisation,
      dateCheckIn: this.getCurrentDatePlusOneHour()
    };

    console.log("📍 Check-in payload:", payload);

    await firstValueFrom(this.clientService.checkIn(payload));

    localStorage.setItem("checkIn", "true");
    this.isCheckedIn = true;

    this.showAlert("Succès", "Check-in effectué avec succès ✅");

  } catch (err) {

    console.error("Erreur API check-in:", err);
    this.showAlert("Erreur", "Impossible d’enregistrer votre check-in.");

  } finally {

    await loading.dismiss();

  }
}

async onCheckOut() {

  const loading = await this.loadingCtrl.create({
    message: "Récupération position..."
  });

  await loading.present();

  try {

    const localisation = await this.getGeolocation();

    if (!localisation) {
      // showAlert géré dans getGeolocation(), on sort proprement
      return;
    }

    const payload = {
      username: this.userconnect?.username,
      localisationCheckOut: localisation,
      dateCheckOut: this.getCurrentDatePlusOneHour()
    };

    console.log("📍 Check-out payload:", payload);

    await firstValueFrom(this.clientService.checkOut(payload));

    localStorage.setItem("checkIn", "false");
    this.isCheckedIn = false;

    this.showAlert("Succès", "Check-out effectué avec succès 🚪");

  } catch (err) {

    console.error("Erreur API check-out:", err);
    this.showAlert("Erreur", "Impossible d’enregistrer votre check-out.");

  } finally {

    await loading.dismiss();

  }
}


  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }

  

  logout() {
  this.clearSession();
  this.userconnect = null;   // 🔥 réinitialiser l'utilisateur
  this.isYosra = false;      // 🔥 réinitialiser le flag
  this.isCheckedIn = false;  // 🔥 réinitialiser checkin (optionnel)
  this.router.navigateByUrl('/');
}

  clearCart() {
    this.cartService.clearCart2();
  }

  selectPharmacy(pharmacy: any) {
  if (!pharmacy) return;

  // 🔥 Stocker l'objet complet
  localStorage.setItem('Pharmacie', JSON.stringify(pharmacy));

  // 🔥 Stocker seulement l'ID pour un accès plus rapide
  localStorage.setItem('PharmacieId', pharmacy.ctNum);

  this.clearCart();

  console.log("🏥 Pharmacie sélectionnée :", pharmacy);
  console.log("📌 ID stocké :", pharmacy.ctNum);
}


  private saveToLocalStorage(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Erreur lors de l'enregistrement dans localStorage: ${error}`);
    }
  }

  private clearSession() {
    localStorage.clear();
  }
}
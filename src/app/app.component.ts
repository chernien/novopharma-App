import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { NetworkService } from './services/network.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {

  isOffline = false;
  showReconnectedBanner = false;

  private networkSub!: Subscription;
  private reconnectedTimer: any;
  private wasOffline = false;

  constructor(
    private platform: Platform,
    private networkService: NetworkService
  ) {
    this.platform.ready().then(() => this.setStatusBar());
  }

  ngOnInit() {
    this.networkSub = this.networkService.isOnline$.subscribe(isOnline => {
      this.isOffline = !isOnline;

      if (isOnline && this.wasOffline) {
        // Connexion rétablie → afficher la bannière verte 3s
        this.showReconnectedBanner = true;
        clearTimeout(this.reconnectedTimer);
        this.reconnectedTimer = setTimeout(() => {
          this.showReconnectedBanner = false;
        }, 3000);
      }

      this.wasOffline = !isOnline;
    });
  }

  ngOnDestroy() {
    this.networkSub?.unsubscribe();
    clearTimeout(this.reconnectedTimer);
  }

  async setStatusBar() {
    if (Capacitor.getPlatform() !== 'web') {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#ffffff' });
      } catch (error) {
        console.error('Erreur StatusBar:', error);
      }
    }
  }
}

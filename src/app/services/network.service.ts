import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NetworkService implements OnDestroy {

  private _isOnline = new BehaviorSubject<boolean>(navigator.onLine);
  readonly isOnline$ = this._isOnline.asObservable();

  private onlineHandler = () => this.ngZone.run(() => this._isOnline.next(true));
  private offlineHandler = () => this.ngZone.run(() => this._isOnline.next(false));

  constructor(private ngZone: NgZone) {
    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
  }

  get isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Résout immédiatement si en ligne, sinon attend l'événement 'online'.
   * Ne consomme pas de retry — c'est une pause propre.
   */
  waitForOnline(): Promise<void> {
    return new Promise(resolve => {
      if (navigator.onLine) {
        resolve();
        return;
      }
      const handler = () => {
        window.removeEventListener('online', handler);
        resolve();
      };
      window.addEventListener('online', handler);
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
  }
}

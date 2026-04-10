import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ClientService } from '../services/client.service';
import { catchError, finalize, firstValueFrom } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  isLoggingIn = false;
  showPassword = false;

  constructor(
    private readonly authService: ClientService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly alertController: AlertController,
    private readonly loadingController: LoadingController,
    private readonly http: HttpClient
  ) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.initializeForm();
  }

  private checkLoginStatus(): void {
    if (Boolean(localStorage.getItem('loggedIn'))) {
      this.router.navigateByUrl('/tabs/pharmacie');
    }
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    }, { nonNullable: true });
  }

  private async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  private async showLoading(message: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message,
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }

  

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      this.showAlert('Erreur', 'Veuillez remplir correctement tous les champs !');
      return;
    }

    this.isLoggingIn = true;
    const loading = await this.showLoading('Connexion en cours...');

    try {
     // const location = await this.getGeolocation();
      const loginData = {
        ...this.loginForm.value,
       // localisation: location ? `${location.latitude},${location.longitude}` : null
      };

      console.log('[Login] Payload envoyé au back-end (login) :', loginData);

      const res = await firstValueFrom(
        this.authService.Login(loginData).pipe(
          catchError((err) => {
            console.error('[Login] Erreur lors de l’appel au service Login:', err);
            this.showAlert('Erreur', 'Impossible de se connecter. Vérifiez vos informations !');
            throw err;
          })
        )
      );

      if (res) {
        console.log('[Login] Connexion réussie, réponse du back-end :', res);
        localStorage.setItem('Commercial', JSON.stringify(res));
        localStorage.setItem('loggedIn', 'true');
        // if (location?.address) {
        //   localStorage.setItem('UserAddress', location.address);
        // }

        // Mettre à jour la localisation avec display_name
        // if (location?.address) {
        //   try {
        //     const localisationPayload = {
        //       username: loginData.username,
        //       localisation: location.address
        //     };
        //     console.log('[Login] Envoi à l’API update-localisation :', localisationPayload);
        //     const updateResponse = await firstValueFrom(
        //       this.authService.updateLocalisation(localisationPayload).pipe(
        //         catchError((err: any) => {
        //           console.error('[Login] Erreur lors de la mise à jour de la localisation:', err);
        //           console.log('[Login] Réponse brute du serveur :', err?.error?.text || err?.error);
        //           this.showAlert('Erreur', `Impossible de mettre à jour la localisation : ${err.message}`);
        //           throw err;
        //         })
        //       )
        //     );
        //     console.log('[Login] Localisation mise à jour avec succès pour', loginData.username, updateResponse);
        //   } catch (error) {
        //     console.error('[Login] Erreur lors de l’appel à l’API de localisation:', error);
        //     // Ne pas bloquer la connexion si la mise à jour échoue
        //   }
        // }

        this.router.navigateByUrl('/loading');
      } else {
        console.warn('[Login] Connexion échouée : réponse vide ou incorrecte.');
        this.showAlert('Erreur', 'Nom d’utilisateur ou mot de passe incorrect !');
      }
    } catch (error) {
      console.error('[Login] Erreur générale lors de la connexion:', error);
    } finally {
      this.isLoggingIn = false;
      loading.dismiss();
    }
  }

  onLogout(): void {
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
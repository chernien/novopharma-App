import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ArticlesService } from 'src/app/services/articles.service';
import { ClientService } from 'src/app/services/client.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.page.html',
  styleUrls: ['./loading.page.scss'],
  standalone: false
})
export class LoadingPage implements OnInit {
  progress = 0; // Progression de la barre de chargement
  progressText = 'Chargement des données...'; // Texte affiché sous la barre
  isError = false; // Indicateur d'erreur

  constructor(
    private router: Router,
    private articleService: ArticlesService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  /** 🔹 Charge les articles avec une animation fluide */
  async loadData() {
    try {
      this.animateProgress(30, 'Connexion au serveur...');
      const articles = await this.articleService.getAllArticlesToPromise();

      // ✅ Vérification si la réponse est un tableau
      if (Array.isArray(articles) && articles.length > 0) {
        this.animateProgress(80, 'Traitement des données...');
        localStorage.setItem('articles', JSON.stringify(articles));
        this.animateProgress(100, 'Articles chargés avec succès !');
        this.router.navigateByUrl('/tabs/pharmacie');
      } else {
        throw new Error('Données invalides reçues');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données :', error);
      this.showError();
    }
  }

  /** 🔹 Anime la progression */
  animateProgress(target: number, text: string) {
    let interval = setInterval(() => {
      if (this.progress >= target) {
        clearInterval(interval);
      } else {
        this.progress += 2; // Augmentation progressive
      }
    }, 30);
    this.progressText = text;
  }

  /** 🔹 Gestion des erreurs */
  showError() {
    this.isError = true;
    this.progress = 0;
    this.progressText = '❌ Erreur lors du chargement. Vérifiez votre connexion et réessayez.';
  }

  /** 🔹 Relancer le chargement après une erreur */
  retry() {
    this.isError = false;
    this.progress = 0;
    this.progressText = 'Rechargement...';
    this.loadData();
  }
}
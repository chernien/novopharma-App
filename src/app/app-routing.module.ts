import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: '',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'pharamcie',
    loadChildren: () => import('./pharamcie/pharamcie.module').then( m => m.PharamciePageModule)
  },
  {
    path: 'articles/:marque',
    loadChildren: () => import('./articles/articles.module').then( m => m.ArticlesPageModule)
  },
  {
    path: 'gift',
    loadChildren: () => import('./gift/gift.module').then( m => m.GiftPageModule)
  },
  {
    path: 'cart',
    loadChildren: () => import('./cart/cart.module').then( m => m.CartPageModule)
  },
  {
    path: 'commande-pharmacie',
    loadChildren: () => import('./commande-pharmacie/commande-pharmacie.module').then( m => m.CommandePharmaciePageModule)
  },
 
  {
    path: 'recommande',
    loadChildren: () => import('./recommande/recommande.module').then( m => m.RecommandePageModule)
  },
  {
    path: 'facture',
    loadChildren: () => import('./facture/facture.module').then( m => m.FacturePageModule)
  },
  {
    path: 'loading',
    loadChildren: () => import('./pages/loading/loading.module').then( m => m.LoadingPageModule)
  },
  {
    path: 'test',
    loadChildren: () => import('./test/test.module').then( m => m.TestPageModule)
  },
  {
    path: 'marque',
    loadChildren: () => import('./marque/marque.module').then( m => m.MarquePageModule)
  },
  {
    path: 'dermos',
    loadChildren: () => import('./dermos/dermos.module').then( m => m.DermosPageModule)
  },
  {
    path: 'version',
  loadComponent: () => import('./version/version.page').then(m => m.VersionPage)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

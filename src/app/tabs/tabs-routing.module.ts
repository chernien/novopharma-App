import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../auth.guard';

const routes: Routes = [
  {
    path: '',
    component: TabsPage, canActivate: [AuthGuard],
    children: [
      {
        path: 'pharmacie',
        loadChildren: () =>
          import('./../pharamcie/pharamcie.module').then(
            (m) => m.PharamciePageModule
          ),
      },
      {
        path: 'marque',
        loadChildren: () => import('./../marque/marque.module').then( m => m.MarquePageModule)
      },
      {
        path: 'articles/:marque',
        loadChildren: () => import('./../articles/articles.module').then( m => m.ArticlesPageModule)
      },
       // ✅ Ajoute cette route pour les appels sans paramètre
      {
        path: 'articles',
        loadChildren: () =>
          import('./../articles/articles.module').then(
            (m) => m.ArticlesPageModule
          ),
      },
      {
        path: 'gift',
        loadChildren: () =>
          import('./../gift/gift.module').then((m) => m.GiftPageModule),
      },
      {
        path: 'cart',
        loadChildren: () =>
          import('./../cart/cart.module').then((m) => m.CartPageModule),
      },
      {
        path: 'commande-pharmacie',
        loadChildren: () =>
          import('./../commande-pharmacie/commande-pharmacie.module').then(
            (m) => m.CommandePharmaciePageModule
          ),
      },
      {
        path: 'recommande',
        loadChildren: () =>
          import('./../recommande/recommande.module').then(
            (m) => m.RecommandePageModule
          ),
      },
      {
        path: 'facture',
        loadChildren: () => import('./../facture/facture.module').then(m => m.FacturePageModule)
      },
      {
        path: 'tab1',
        loadChildren: () =>
          import('../tab1/tab1.module').then((m) => m.Tab1PageModule),
      },
      {
        path: 'tab2',
        loadChildren: () =>
          import('../tab2/tab2.module').then((m) => m.Tab2PageModule),
      },
      {
        path: 'tab3',
        loadChildren: () =>
          import('../tab3/tab3.module').then((m) => m.Tab3PageModule),
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/pharmacie', // Updated typo here
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule], // Added exports
})
export class TabsPageRoutingModule { }
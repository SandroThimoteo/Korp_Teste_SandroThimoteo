import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'produtos', pathMatch: 'full' },
  {
    path: 'produtos',
    loadComponent: () =>
      import('./produtos/produtos.component').then(m => m.ProdutosComponent)
  },
  {
    path: 'notas-fiscais',
    loadComponent: () =>
      import('./notas-fiscais/notas-fiscais.component').then(m => m.NotasFiscaisComponent)
  },
  { path: '**', redirectTo: 'produtos' }
];
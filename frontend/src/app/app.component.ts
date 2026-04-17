import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">

      <header class="navbar">
        <div class="navbar__brand">
          <span class="brand-korp">KORP</span>
          <span class="brand-erp">ERP</span>
          <span class="brand-divider"></span>
          <span class="brand-module">Notas Fiscais</span>
        </div>

        <nav class="navbar__links">
          <a class="nav-link" routerLink="/produtos" routerLinkActive="active">
            Produtos
          </a>
          <a class="nav-link" routerLink="/notas-fiscais" routerLinkActive="active">
            Notas Fiscais
          </a>
        </nav>
      </header>

      <main class="main">
        <router-outlet />
      </main>

    </div>
  `
})
export class AppComponent {}
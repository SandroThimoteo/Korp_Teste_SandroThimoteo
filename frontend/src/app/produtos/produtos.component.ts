import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProdutoService } from './produto.service';
import { Produto } from '../shared/models';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Produtos</h1>
    </div>

    <div *ngIf="mensagemErro" class="alert alert-error">{{ mensagemErro }}</div>
    <div *ngIf="mensagemSucesso" class="alert alert-success">{{ mensagemSucesso }}</div>

    <div class="card">
      <p class="card__title">Novo Produto</p>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Código *</label>
          <input class="form-input" [(ngModel)]="form.codigo" placeholder="ex: PROD-001">
        </div>
        <div class="form-group">
          <label class="form-label">Descrição *</label>
          <input class="form-input" [(ngModel)]="form.descricao" placeholder="Nome do produto">
        </div>
        <div class="form-group">
          <label class="form-label">Saldo inicial *</label>
          <input class="form-input" type="number" [(ngModel)]="form.saldo" min="0">
        </div>
      </div>
      <br>
      <button class="btn btn-primary" (click)="cadastrar()" [disabled]="salvando">
        <span *ngIf="salvando" class="spinner"></span>
        <span *ngIf="!salvando">+ Cadastrar</span>
      </button>
    </div>

    <div class="card">
      <p class="card__title">Produtos cadastrados</p>

      <div *ngIf="carregando" class="empty">
        <div class="spinner"></div>
      </div>

      <div *ngIf="!carregando && produtos.length === 0" class="empty">
        <div class="empty__icon">📦</div>
        Nenhum produto cadastrado ainda.
      </div>

      <div *ngIf="!carregando && produtos.length > 0" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Código</th>
              <th>Descrição</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of produtos">
              <td style="color: var(--text-dim)">{{ p.id }}</td>
              <td style="font-family: var(--mono)">{{ p.codigo }}</td>
              <td>{{ p.descricao }}</td>
              <td>
                <span [style.color]="p.saldo > 0 ? 'var(--success)' : 'var(--danger)'">
                  {{ p.saldo }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ProdutosComponent implements OnInit {

  produtos: Produto[] = [];
  carregando = false;
  salvando = false;
  mensagemErro = '';
  mensagemSucesso = '';

  form = { codigo: '', descricao: '', saldo: 0 };

  constructor(private produtoService: ProdutoService) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.carregando = true;

    this.produtoService.listar().subscribe({
      next: (dados) => {
        this.produtos = dados;
        this.carregando = false;
      },
      error: () => {
        this.mensagemErro = 'Não foi possível carregar os produtos. O serviço de Estoque está disponível?';
        this.carregando = false;
      }
    });
  }

  cadastrar(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (!this.form.codigo.trim() || !this.form.descricao.trim()) {
      this.mensagemErro = 'Código e descrição são obrigatórios.';
      return;
    }

    this.salvando = true;

    this.produtoService.criar(this.form).subscribe({
      next: (novo) => {
        this.produtos = [novo, ...this.produtos];
        this.form = { codigo: '', descricao: '', saldo: 0 };
        this.mensagemSucesso = `Produto "${novo.descricao}" cadastrado com sucesso!`;
        this.salvando = false;
        setTimeout(() => (this.mensagemSucesso = ''), 3000);
      },
      error: (err) => {
        this.mensagemErro = err.error?.mensagem ?? 'Erro ao cadastrar produto.';
        this.salvando = false;
      }
    });
  }
}
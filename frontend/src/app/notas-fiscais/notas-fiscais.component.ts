import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotaFiscalService } from './nota-fiscal.service';
import { ProdutoService } from '../produtos/produto.service';
import { NotaFiscal, Produto } from '../shared/models';

interface ItemForm {
  produtoId: number;
  produtoDescricao: string;
  quantidade: number;
}

@Component({
  selector: 'app-notas-fiscais',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Notas Fiscais</h1>
    </div>

    <div *ngIf="mensagemErro" class="alert alert-error">{{ mensagemErro }}</div>
    <div *ngIf="mensagemSucesso" class="alert alert-success">{{ mensagemSucesso }}</div>
    <div *ngIf="mensagemInfo" class="alert alert-info">{{ mensagemInfo }}</div>

    <div class="card">
      <p class="card__title">Nova Nota Fiscal</p>

      <div *ngFor="let item of itensForm; let i = index" class="item-row">
        <div class="form-group">
          <label class="form-label">Produto</label>
          <select class="form-input" [(ngModel)]="item.produtoId" (change)="onProdutoSelecionado(item)">
            <option [value]="0" disabled>Selecione...</option>
            <option *ngFor="let p of produtos" [value]="p.id">
              {{ p.codigo }} — {{ p.descricao }} (saldo: {{ p.saldo }})
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Quantidade</label>
          <input class="form-input" type="number" [(ngModel)]="item.quantidade" min="1">
        </div>
        <div class="form-group" style="justify-content: flex-end">
          <button class="btn btn-ghost btn-sm" (click)="removerItem(i)" style="margin-top: 20px">✕</button>
        </div>
      </div>

      <div style="display:flex; gap: 10px; margin-top: 8px;">
        <button class="btn btn-ghost btn-sm" (click)="adicionarItem()">+ Adicionar item</button>
        <button class="btn btn-primary" (click)="criarNota()" [disabled]="salvando">
          <span *ngIf="salvando" class="spinner"></span>
          <span *ngIf="!salvando">Criar Nota</span>
        </button>
      </div>
    </div>

    <div class="card">
      <p class="card__title">Notas emitidas</p>

      <div *ngIf="carregando" class="empty">
        <div class="spinner"></div>
      </div>

      <div *ngIf="!carregando && notas.length === 0" class="empty">
        <div class="empty__icon">📄</div>
        Nenhuma nota fiscal emitida.
      </div>

      <div *ngIf="!carregando && notas.length > 0" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nº</th>
              <th>Status</th>
              <th>Itens</th>
              <th>Emitida em</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let nota of notas">
              <td style="font-family: var(--mono); color: var(--accent)">#{{ nota.numero }}</td>
              <td>
                <span class="badge" [ngClass]="nota.status === 'Aberta' ? 'badge-open' : 'badge-closed'">
                  {{ nota.status }}
                </span>
              </td>
              <td style="color: var(--text-dim)">{{ nota.itens.length }} produto(s)</td>
              <td style="color: var(--text-dim); font-family: var(--mono); font-size: 12px">
                {{ nota.criadaEm | date:'dd/MM/yyyy HH:mm' }}
              </td>
              <td>
                <button
                  class="btn btn-sm"
                  [ngClass]="nota.status === 'Aberta' ? 'btn-success' : 'btn-ghost'"
                  [disabled]="nota.status !== 'Aberta' || imprimindoId === nota.id"
                  (click)="imprimir(nota)">
                  <span *ngIf="imprimindoId === nota.id" class="spinner"></span>
                  <span *ngIf="imprimindoId !== nota.id">
                    {{ nota.status === 'Aberta' ? '🖨️ Imprimir' : '✓ Fechada' }}
                  </span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class NotasFiscaisComponent implements OnInit {

  notas: NotaFiscal[] = [];
  produtos: Produto[] = [];
  itensForm: ItemForm[] = [{ produtoId: 0, produtoDescricao: '', quantidade: 1 }];

  carregando = false;
  salvando = false;
  imprimindoId: number | null = null;

  mensagemErro = '';
  mensagemSucesso = '';
  mensagemInfo = '';

  constructor(
    private notaService: NotaFiscalService,
    private produtoService: ProdutoService
  ) {}

  ngOnInit(): void {
    this.carregarNotas();
    this.carregarProdutos();
  }

  carregarNotas(): void {
    this.carregando = true;
    this.notaService.listar().subscribe({
      next: (dados) => {
        this.notas = dados;
        this.carregando = false;
      },
      error: () => {
        this.mensagemErro = 'Não foi possível carregar as notas. O serviço de Faturamento está disponível?';
        this.carregando = false;
      }
    });
  }

  carregarProdutos(): void {
    this.produtoService.listar().subscribe({
      next: (dados) => (this.produtos = dados),
      error: () => {
        this.mensagemInfo = 'Aviso: serviço de Estoque indisponível. Produtos não carregados.';
      }
    });
  }

  adicionarItem(): void {
    this.itensForm.push({ produtoId: 0, produtoDescricao: '', quantidade: 1 });
  }

  removerItem(index: number): void {
    this.itensForm.splice(index, 1);
  }

  onProdutoSelecionado(item: ItemForm): void {
    const produto = this.produtos.find(p => p.id === Number(item.produtoId));
    if (produto) item.produtoDescricao = produto.descricao;
  }

  criarNota(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const itensValidos = this.itensForm.filter(i => i.produtoId > 0 && i.quantidade > 0);

    if (itensValidos.length === 0) {
      this.mensagemErro = 'Adicione ao menos um produto com quantidade válida.';
      return;
    }

    this.salvando = true;

    this.notaService.criar({ itens: itensValidos }).subscribe({
      next: (nota) => {
        this.notas = [nota, ...this.notas];
        this.itensForm = [{ produtoId: 0, produtoDescricao: '', quantidade: 1 }];
        this.mensagemSucesso = `Nota Fiscal #${nota.numero} criada com sucesso!`;
        this.salvando = false;
        setTimeout(() => (this.mensagemSucesso = ''), 3000);
      },
      error: (err) => {
        this.mensagemErro = err.error?.mensagem ?? 'Erro ao criar nota fiscal.';
        this.salvando = false;
      }
    });
  }

  imprimir(nota: NotaFiscal): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.imprimindoId = nota.id;

    this.notaService.imprimir(nota.id).subscribe({
      next: (notaAtualizada) => {
        const index = this.notas.findIndex(n => n.id === nota.id);
        if (index !== -1) this.notas[index] = notaAtualizada;
        this.mensagemSucesso = `Nota Fiscal #${nota.numero} impressa! Saldos atualizados.`;
        this.imprimindoId = null;
        setTimeout(() => (this.mensagemSucesso = ''), 4000);
      },
      error: (err) => {
        this.mensagemErro = err.error?.mensagem ?? 'Erro ao imprimir. Verifique o serviço de Estoque.';
        this.imprimindoId = null;
      }
    });
  }
}
export interface Produto {
  id: number;
  codigo: string;
  descricao: string;
  saldo: number;
}

export interface ItemNota {
  id: number;
  produtoId: number;
  produtoDescricao: string;
  quantidade: number;
}

export interface NotaFiscal {
  id: number;
  numero: number;
  status: 'Aberta' | 'Fechada';
  criadaEm: string;
  itens: ItemNota[];
}
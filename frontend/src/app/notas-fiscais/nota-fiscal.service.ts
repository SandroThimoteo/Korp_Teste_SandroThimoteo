import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotaFiscal } from '../shared/models';
import { environment } from '../../environments/environment';

export interface CriarNotaRequest {
  itens: { produtoId: number; produtoDescricao: string; quantidade: number }[];
}

@Injectable({ providedIn: 'root' })
export class NotaFiscalService {

  private readonly apiUrl = 'http://localhost:5002/api/notasfiscais';

  constructor(private http: HttpClient) { }

  listar(): Observable<NotaFiscal[]> {
    return this.http.get<NotaFiscal[]>(this.apiUrl);
  }

  criar(request: CriarNotaRequest): Observable<NotaFiscal> {
    return this.http.post<NotaFiscal>(this.apiUrl, request);
  }

  imprimir(id: number): Observable<NotaFiscal> {
    return this.http.post<NotaFiscal>(`${this.apiUrl}/${id}/imprimir`, {});
  }

  sugerirQuantidade(produtoDescricao: string, historicoNotas: NotaFiscal[]): Observable<number> {
    const quantidades = historicoNotas
      .flatMap(n => n.itens)
      .filter(i => i.produtoDescricao === produtoDescricao)
      .map(i => i.quantidade);

    const historico = quantidades.length > 0
      ? `Histórico de quantidades usadas: ${quantidades.join(', ')}`
      : 'Nenhum histórico disponível ainda.';

    const prompt = `Você é um assistente de gestão de estoque.
O produto "${produtoDescricao}" foi usado nas seguintes quantidades em notas fiscais anteriores:
${historico}

Com base nisso, sugira UMA quantidade numérica inteira para a próxima nota fiscal.
Responda APENAS com o número, sem texto adicional.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${environment.geminiKey}`;

    return new Observable(observer => {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      })
        .then(res => res.json())
        .then(data => {
          const texto = data.candidates[0].content.parts[0].text.trim();
          const numero = parseInt(texto);
          observer.next(isNaN(numero) ? 1 : numero);
          observer.complete();
        })
        .catch(() => {
          observer.next(1);
          observer.complete();
        });
    });
  }
}
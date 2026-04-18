# Korp_Teste_SandroThimoteo

Sistema de emissão de Notas Fiscais desenvolvido como teste técnico para a **Korp ERP (Viasoft)**.

---

## Como executar

### Pré-requisito
- [Docker Desktop](https://www.docker.com/) instalado e rodando

### Subir tudo com um comando

```bash
docker-compose up --build
```

### Acessar

| Serviço | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Estoque API | http://localhost:5001/api/produtos |
| Faturamento API | http://localhost:5002/api/notasfiscais |

### Parar

```bash
docker-compose down
```

---

## Arquitetura

O sistema é composto por dois microsserviços independentes que se comunicam via HTTP:

```
Angular (4200)
    │
    ├── GET/POST ──► Estoque.API (5001) ──► estoque.db
    │
    └── GET/POST ──► Faturamento.API (5002) ──► faturamento.db
                          │
                          └── POST /baixar-saldo ──► Estoque.API
```

- **Estoque.API** — controla produtos e saldos
- **Faturamento.API** — gerencia notas fiscais; na impressão chama o Estoque.API para debitar os saldos

---

## Detalhamento Técnico

### Tecnologias

| Camada | Tecnologia |
|---|---|
| Backend | C# .NET 8 — ASP.NET Core Web API |
| Banco de dados | SQLite com Entity Framework Core |
| Frontend | Angular 17 (Standalone Components) |
| Infraestrutura | Docker + Docker Compose |

### Ciclos de vida do Angular utilizados

`ngOnInit` — utilizado em `ProdutosComponent` e `NotasFiscaisComponent` para carregar os dados da API assim que os componentes são montados na tela.

### Uso do RxJS

Sim. O `HttpClient` do Angular retorna **Observables** do RxJS em todas as chamadas HTTP. O padrão `.subscribe({ next, error })` foi utilizado para consumir os dados e capturar erros:

```typescript
this.produtoService.listar().subscribe({
  next: (dados) => { this.produtos = dados; },
  error: () => { this.mensagemErro = 'Serviço indisponível'; }
});
```

### Outras bibliotecas utilizadas

| Biblioteca | Finalidade |
|---|---|
| `@angular/router` | Navegação entre páginas sem recarregar |
| `@angular/forms` | Two-way binding com ngModel |
| `@angular/common` | Diretivas ngIf, ngFor e pipe date |

### Componentes visuais

Nenhuma biblioteca de componentes de terceiros. Layout construído com CSS puro (variáveis CSS, grid, flexbox) e fonte IBM Plex Sans/Mono via Google Fonts, seguindo a identidade visual da Korp.

### Framework utilizado no C#

**ASP.NET Core Web API (.NET 8)** nos dois microsserviços.

### Tratamento de erros e exceções no backend

- Validações retornam `400 BadRequest` com mensagem JSON
- Recursos não encontrados retornam `404 Not Found`
- Códigos duplicados retornam `409 Conflict`
- Falhas de comunicação entre microsserviços são capturadas com `try/catch` em `EstoqueClient.cs`
- O `NotasFiscaisController` envolve a impressão em `try/catch` e retorna `400` com a mensagem da exceção

### Uso de LINQ

Sim, utilizado em `NotaFiscalService.cs`:

```csharp
// Numeração sequencial
var proximoNumero = await _context.NotasFiscais.AnyAsync()
    ? await _context.NotasFiscais.MaxAsync(n => n.Numero) + 1
    : 1;

// Projeção de lista
Itens = request.Itens.Select(i => new ItemNota { ... }).ToList()

// Busca com relacionamento
.Include(n => n.Itens).FirstOrDefaultAsync(n => n.Id == id)
```

---

## Tratamento de falhas

Se o **Estoque.API** ficar indisponível durante uma impressão:

1. `EstoqueClient` lança exceção com mensagem clara
2. `NotasFiscaisController` captura e retorna `400`
3. Angular exibe o erro na tela
4. A nota **permanece Aberta** — nenhum efeito colateral

Para simular:

```bash
docker stop estoque-api
# Tente imprimir uma nota — o erro aparece na tela
```

---

## Requisitos opcionais implementados

### Tratamento de Concorrência
Transação com lock pessimista em `ProdutoService.cs` — garante que dois usuários não consigam baixar o mesmo saldo simultaneamente.

### Idempotência
Campo `EmProcessamento` em `NotaFiscal` — impede que a mesma nota seja processada duas vezes ao mesmo tempo.

### Inteligência Artificial
Botão ✨ na criação de notas fiscais — ao clicar, o Claude Haiku analisa o histórico de quantidades usadas para aquele produto e sugere a quantidade ideal para a próxima nota.

## Estrutura de pastas

```
Korp_Teste_SandroThimoteo/
├── Estoque.API/
│   ├── Controllers/
│   ├── Data/
│   ├── Models/
│   ├── Services/
│   └── Dockerfile
├── Faturamento.API/
│   ├── Controllers/
│   ├── Data/
│   ├── Models/
│   ├── Services/
│   └── Dockerfile
├── frontend/
│   ├── src/app/
│   │   ├── produtos/
│   │   ├── notas-fiscais/
│   │   └── shared/
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

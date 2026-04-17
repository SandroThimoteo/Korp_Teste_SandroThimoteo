using Microsoft.EntityFrameworkCore;
using Faturamento.API.Data;
using Faturamento.API.Models;

namespace Faturamento.API.Services;

public class NotaFiscalService
{
    private readonly FaturamentoDbContext _context;
    private readonly EstoqueClient _estoqueClient;

    public NotaFiscalService(FaturamentoDbContext context, EstoqueClient estoqueClient)
    {
        _context = context;
        _estoqueClient = estoqueClient;
    }

    public async Task<List<NotaFiscal>> ListarTodasAsync()
    {
        return await _context.NotasFiscais
            .Include(n => n.Itens)
            .OrderByDescending(n => n.Numero)
            .ToListAsync();
    }

    public async Task<NotaFiscal> CriarAsync(CriarNotaRequest request)
    {
        // Gera o próximo número sequencial
        var proximoNumero = await _context.NotasFiscais.AnyAsync()
            ? await _context.NotasFiscais.MaxAsync(n => n.Numero) + 1
            : 1;

        var nota = new NotaFiscal
        {
            Numero = proximoNumero,
            Status = "Aberta",
            Itens = request.Itens.Select(i => new ItemNota
            {
                ProdutoId = i.ProdutoId,
                ProdutoDescricao = i.ProdutoDescricao,
                Quantidade = i.Quantidade
            }).ToList()
        };

        _context.NotasFiscais.Add(nota);
        await _context.SaveChangesAsync();
        return nota;
    }

    public async Task<NotaFiscal> ImprimirAsync(int id)
    {
        var nota = await _context.NotasFiscais
            .Include(n => n.Itens)
            .FirstOrDefaultAsync(n => n.Id == id);

        if (nota == null)
            throw new Exception("Nota fiscal não encontrada.");

        if (nota.Status != "Aberta")
            throw new Exception("Somente notas com status 'Aberta' podem ser impressas.");

        // Baixa o saldo de cada produto no Estoque.API
        foreach (var item in nota.Itens)
        {
            var sucesso = await _estoqueClient.BaixarSaldoAsync(item.ProdutoId, item.Quantidade);

            if (!sucesso)
                throw new Exception($"Saldo insuficiente para o produto {item.ProdutoDescricao}.");
        }

        nota.Status = "Fechada";
        await _context.SaveChangesAsync();
        return nota;
    }
}

public class CriarNotaRequest
{
    public List<ItemNotaRequest> Itens { get; set; } = new();
}

public class ItemNotaRequest
{
    public int ProdutoId { get; set; }
    public string ProdutoDescricao { get; set; } = string.Empty;
    public int Quantidade { get; set; }
}
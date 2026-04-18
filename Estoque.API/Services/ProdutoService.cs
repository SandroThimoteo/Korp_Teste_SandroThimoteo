using Microsoft.EntityFrameworkCore;
using Estoque.API.Data;
using Estoque.API.Models;

namespace Estoque.API.Services;

public class ProdutoService
{
    private readonly EstoqueDbContext _context;

    public ProdutoService(EstoqueDbContext context)
    {
        _context = context;
    }

    public async Task<List<Produto>> ListarTodosAsync()
    {
        return await _context.Produtos.ToListAsync();
    }

    public async Task<Produto?> BuscarPorIdAsync(int id)
    {
        return await _context.Produtos.FindAsync(id);
    }

    public async Task<Produto> CriarAsync(Produto produto)
    {
        _context.Produtos.Add(produto);
        await _context.SaveChangesAsync();
        return produto;
    }

   public async Task<bool> AtualizarSaldoAsync(int id, int quantidade)
{
    // Inicia uma transação — garante que só uma operação acontece por vez
    using var transaction = await _context.Database.BeginTransactionAsync();

    try
    {
        var produto = await _context.Produtos
            .FromSqlRaw("SELECT * FROM Produtos WHERE Id = {0}", id)
            .FirstOrDefaultAsync();

        if (produto == null)
        {
            await transaction.RollbackAsync();
            return false;
        }

        if (produto.Saldo < quantidade)
        {
            await transaction.RollbackAsync();
            return false;
        }

        produto.Saldo -= quantidade;
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        return true;
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}

    public async Task<bool> CodigoJaExisteAsync(string codigo)
    {
        return await _context.Produtos.AnyAsync(p => p.Codigo == codigo);
    }
}
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
        var produto = await _context.Produtos.FindAsync(id);

        if (produto == null)
            return false;

        if (produto.Saldo < quantidade)
            return false;

        produto.Saldo -= quantidade;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CodigoJaExisteAsync(string codigo)
    {
        return await _context.Produtos.AnyAsync(p => p.Codigo == codigo);
    }
}
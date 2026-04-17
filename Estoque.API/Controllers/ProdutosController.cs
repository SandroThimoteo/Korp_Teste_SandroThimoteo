using Microsoft.AspNetCore.Mvc;
using Estoque.API.Models;
using Estoque.API.Services;

namespace Estoque.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProdutosController : ControllerBase
{
    private readonly ProdutoService _service;

    public ProdutosController(ProdutoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> ListarTodos()
    {
        var produtos = await _service.ListarTodosAsync();
        return Ok(produtos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var produto = await _service.BuscarPorIdAsync(id);

        if (produto == null)
            return NotFound(new { mensagem = "Produto não encontrado." });

        return Ok(produto);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] Produto produto)
    {
        if (string.IsNullOrWhiteSpace(produto.Codigo) || string.IsNullOrWhiteSpace(produto.Descricao))
            return BadRequest(new { mensagem = "Código e descrição são obrigatórios." });

        if (produto.Saldo < 0)
            return BadRequest(new { mensagem = "Saldo não pode ser negativo." });

        var codigoExiste = await _service.CodigoJaExisteAsync(produto.Codigo);
        if (codigoExiste)
            return Conflict(new { mensagem = "Já existe um produto com esse código." });

        var criado = await _service.CriarAsync(produto);
        return CreatedAtAction(nameof(BuscarPorId), new { id = criado.Id }, criado);
    }

    [HttpPost("{id}/baixar-saldo")]
    public async Task<IActionResult> BaixarSaldo(int id, [FromBody] BaixarSaldoRequest request)
    {
        if (request.Quantidade <= 0)
            return BadRequest(new { mensagem = "Quantidade deve ser maior que zero." });

        var sucesso = await _service.AtualizarSaldoAsync(id, request.Quantidade);

        if (!sucesso)
            return BadRequest(new { mensagem = "Saldo insuficiente ou produto não encontrado." });

        return Ok(new { mensagem = "Saldo atualizado com sucesso." });
    }
}

public record BaixarSaldoRequest(int Quantidade);
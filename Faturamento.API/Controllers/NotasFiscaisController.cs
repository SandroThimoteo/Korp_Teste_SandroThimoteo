using Microsoft.AspNetCore.Mvc;
using Faturamento.API.Services;

namespace Faturamento.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotasFiscaisController : ControllerBase
{
    private readonly NotaFiscalService _service;

    public NotasFiscaisController(NotaFiscalService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> ListarTodas()
    {
        var notas = await _service.ListarTodasAsync();
        return Ok(notas);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var nota = await _service.BuscarPorIdAsync(id);

        if (nota == null)
            return NotFound(new { mensagem = "Nota fiscal não encontrada." });

        return Ok(nota);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarNotaRequest request)
    {
        if (request.Itens == null || request.Itens.Count == 0)
            return BadRequest(new { mensagem = "A nota deve ter ao menos um produto." });

        var itemInvalido = request.Itens.FirstOrDefault(i => i.Quantidade <= 0);
        if (itemInvalido != null)
            return BadRequest(new { mensagem = "Todos os itens devem ter quantidade maior que zero." });

        var nota = await _service.CriarAsync(request);
        return CreatedAtAction(nameof(BuscarPorId), new { id = nota.Id }, nota);
    }

    [HttpPost("{id}/imprimir")]
    public async Task<IActionResult> Imprimir(int id)
    {
        try
        {
            var nota = await _service.ImprimirAsync(id);
            return Ok(nota);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }
}
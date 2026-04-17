namespace Faturamento.API.Services;

public class EstoqueClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<EstoqueClient> _logger;

    public EstoqueClient(HttpClient httpClient, ILogger<EstoqueClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<bool> BaixarSaldoAsync(int produtoId, int quantidade)
    {
        try
        {
            var body = new { Quantidade = quantidade };
            var response = await _httpClient.PostAsJsonAsync($"api/produtos/{produtoId}/baixar-saldo", body);

            if (!response.IsSuccessStatusCode)
            {
                var erro = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Estoque retornou erro: {Erro}", erro);
                return false;
            }

            return true;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Falha ao conectar com o serviço de Estoque.");
            throw new Exception("Serviço de Estoque indisponível. Tente novamente em instantes.");
        }
    }
}
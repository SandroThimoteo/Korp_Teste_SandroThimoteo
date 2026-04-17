using Microsoft.EntityFrameworkCore;
using Faturamento.API.Data;
using Faturamento.API.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = 
        System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

builder.Services.AddDbContext<FaturamentoDbContext>(options =>
    options.UseSqlite("Data Source=faturamento.db"));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// EstoqueClient usa HttpClient para chamar o Estoque.API
builder.Services.AddHttpClient<EstoqueClient>(client =>
{
    var url = builder.Configuration["EstoqueServiceUrl"] ?? "http://localhost:5001";
    client.BaseAddress = new Uri(url);
});

builder.Services.AddScoped<NotaFiscalService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FaturamentoDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors();
app.MapControllers();
app.Run();
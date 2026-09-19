using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using ValleSondondo.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Controllers & JSON Options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddHttpClient();

// 2. Database Connection (MySQL Pomelo)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

var serverVersion = new MySqlServerVersion(new Version(8, 0, 36));

builder.Services.AddDbContext<ValleSondondoDbContext>(options =>
{
    options.UseMySql(
        connectionString,
        serverVersion,
        mySqlOptions =>
        {
            mySqlOptions.EnableRetryOnFailure(
                maxRetryCount: 10,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorNumbersToAdd: null);
        });
});

// 3. CORS configuration (allowing Angular dev server & production)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 4. Swagger / OpenAPI documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Valle del Sondondo Expeditions API",
        Version = "v1",
        Description = "API RESTful oficial para la plataforma turística de Valle del Sondondo Expeditions (Ayacucho, Perú)."
    });
});

// 5. Health Checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Valle del Sondondo Expeditions API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseRouting();
app.UseAuthorization();

// Health check endpoint
app.MapHealthChecks("/health");

// Agency info endpoint for quick frontend bootstrapping
app.MapGet("/api/agency", (IConfiguration config) =>
{
    var section = config.GetSection("AgencySettings");
    return Results.Ok(new
    {
        name = section["Name"] ?? "Valle del Sondondo Expeditions",
        whatsappNumber = section["WhatsAppNumber"] ?? "51966380590",
        phoneNumber = section["PhoneNumber"] ?? "+51 966 380 590",
        email = section["Email"] ?? "miskichaskaperu@hotmail.com",
        address = section["Address"] ?? "Av. Apu Chauccalla 402, Aucará, Lucanas, Ayacucho, Perú",
        safeTravelsCertified = true,
        facebookUrl = section["FacebookUrl"] ?? "https://www.facebook.com/valledelsondondoexpeditions",
        instagramUrl = section["InstagramUrl"] ?? "https://www.instagram.com/valledelsondondoexpeditions"
    });
});

app.MapControllers();

// Auto-migrate and seed database with resilient retry on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    
    // In Docker, MySQL might take a few seconds to become ready
    int maxRetries = 10;
    for (int retry = 1; retry <= maxRetries; retry++)
    {
        try
        {
            logger.LogInformation("Intentando conectar a la base de datos y aplicar migraciones (Intento {Retry}/{Max})...", retry, maxRetries);
            var context = services.GetRequiredService<ValleSondondoDbContext>();
            await DbInitializer.InitializeAsync(context);
            logger.LogInformation("Base de datos de Valle del Sondondo inicializada y poblada con éxito.");
            break;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "No se pudo conectar a la base de datos todavía. Reintentando en 3 segundos...");
            if (retry == maxRetries)
            {
                logger.LogError(ex, "Fallo crítico al conectar a la base de datos tras múltiples intentos.");
            }
            else
            {
                await Task.Delay(3000);
            }
        }
    }
}

app.Run();

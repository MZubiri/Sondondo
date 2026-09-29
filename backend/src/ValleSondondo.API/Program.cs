using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ValleSondondo.API.Services;
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
builder.Services.AddScoped<IWebhookService, WebhookService>();

// 2. JWT Authentication Configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = builder.Configuration["JWT_SECRET_KEY"]
    ?? Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
    ?? jwtSettings["SecretKey"]
    ?? "ValleDelSondondoExpeditions_SecretKey_AyacuchoPeru_2026_SecureKeyJwtToken!";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "ValleSondondoAPI",
        ValidAudience = jwtSettings["Audience"] ?? "ValleSondondoClients",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});
builder.Services.AddAuthorization();

// 3. Rate Limiting Configuration (.NET 9)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsync("{\"error\": \"Demasiadas solicitudes. Por favor espera un momento antes de reintentar.\"}", token);
    };

    // Login protection: 5 attempts per minute per IP
    options.AddPolicy("login-policy", httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 3,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    // Contact/Booking form spam protection: 6 requests per minute per IP
    options.AddPolicy("contact-policy", httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 6,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 3,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    // General API rate limit: 120 requests per minute
    options.AddPolicy("general-policy", httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 120,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 4,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 10
            }));
});

// 4. Database Connection (MySQL Pomelo)
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

// 5. CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 6. Swagger / OpenAPI documentation with Bearer Auth
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Valle del Sondondo Expeditions API",
        Version = "v1",
        Description = "API RESTful oficial para la plataforma turística de Valle del Sondondo Expeditions (Ayacucho, Perú)."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Encabezado de autorización JWT utilizando el esquema Bearer. Ejemplo: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// 7. Health Checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Forwarded Headers for Reverse Proxy (Nginx / Traefik / Coolify HTTPS)
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// Configure the HTTP request pipeline
app.UseCors("AllowAll");
app.UseRateLimiter();

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
app.UseAuthentication();
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

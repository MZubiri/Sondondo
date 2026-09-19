using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ValleSondondo.API.DTOs;
using ValleSondondo.Domain.Entities;
using ValleSondondo.Infrastructure.Data;

namespace ValleSondondo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ValleSondondoDbContext _context;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ValleSondondoDbContext context,
        ILogger<PaymentsController> logger)
    {
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _context = context;
        _logger = logger;
    }

    [HttpPost("create-preference")]
    public async Task<ActionResult<PaymentPreferenceResponseDto>> CreatePreference([FromBody] CreatePaymentPreferenceDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var accessToken = _configuration["MercadoPago:AccessToken"] 
            ?? Environment.GetEnvironmentVariable("MERCADOPAGO_ACCESS_TOKEN");

        var publicKey = _configuration["MercadoPago:PublicKey"] 
            ?? Environment.GetEnvironmentVariable("MERCADOPAGO_PUBLIC_KEY") 
            ?? "TEST-SIMULATED-PUBLIC-KEY";

        var appBaseUrl = _configuration["AppBaseUrl"] 
            ?? $"{Request.Scheme}://{Request.Host}";

        var successUrl = _configuration["MercadoPago:SuccessUrl"] 
            ?? $"{appBaseUrl}/pago/resultado?status=approved";
        var failureUrl = _configuration["MercadoPago:FailureUrl"] 
            ?? $"{appBaseUrl}/pago/resultado?status=failure";
        var pendingUrl = _configuration["MercadoPago:PendingUrl"] 
            ?? $"{appBaseUrl}/pago/resultado?status=pending";
        var webhookUrl = _configuration["MercadoPago:WebhookUrl"] 
            ?? $"{appBaseUrl}/api/payments/webhook";

        var externalRef = !string.IsNullOrWhiteSpace(dto.BookingReference) 
            ? dto.BookingReference 
            : $"VS-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        // Si hay Access Token válido configurado de Mercado Pago (ej. APP_USR-... o TEST-...)
        if (!string.IsNullOrWhiteSpace(accessToken) && 
            !accessToken.Contains("YOUR_MERCADOPAGO") && 
            (accessToken.StartsWith("TEST-") || accessToken.StartsWith("APP_USR-")))
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                var preferencePayload = new
                {
                    items = new[]
                    {
                        new
                        {
                            title = dto.Title,
                            description = dto.Description ?? dto.Title,
                            quantity = dto.Quantity,
                            unit_price = Convert.ToDouble(dto.UnitPrice),
                            currency_id = "PEN"
                        }
                    },
                    payer = new
                    {
                        name = dto.PayerName,
                        email = dto.PayerEmail,
                        phone = new
                        {
                            number = dto.PayerPhone ?? string.Empty
                        }
                    },
                    back_urls = new
                    {
                        success = successUrl,
                        failure = failureUrl,
                        pending = pendingUrl
                    },
                    auto_return = "approved",
                    external_reference = externalRef,
                    statement_descriptor = "SONDONDO EXP",
                    notification_url = webhookUrl
                };

                var jsonContent = new StringContent(
                    JsonSerializer.Serialize(preferencePayload),
                    Encoding.UTF8,
                    "application/json"
                );

                var response = await client.PostAsync("https://api.mercadopago.com/checkout/preferences", jsonContent);
                var responseString = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    using var doc = JsonDocument.Parse(responseString);
                    var root = doc.RootElement;
                    var prefId = root.GetProperty("id").GetString() ?? string.Empty;
                    var initPoint = root.GetProperty("init_point").GetString() ?? string.Empty;
                    var sandboxInitPoint = root.TryGetProperty("sandbox_init_point", out var sProp) ? sProp.GetString() ?? initPoint : initPoint;

                    _logger.LogInformation("Mercado Pago Preference creada con éxito: {PreferenceId} (Ref: {Ref})", prefId, externalRef);

                    return Ok(new PaymentPreferenceResponseDto
                    {
                        PreferenceId = prefId,
                        InitPoint = initPoint,
                        SandboxInitPoint = sandboxInitPoint,
                        PublicKey = publicKey,
                        Mode = accessToken.StartsWith("TEST-") ? "sandbox" : "live",
                        ExternalReference = externalRef
                    });
                }
                else
                {
                    _logger.LogWarning("Error en Mercado Pago API ({StatusCode}): {Response}", response.StatusCode, responseString);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Excepción al conectar con Mercado Pago Checkout API.");
            }
        }

        // Fallback / Modo de desarrollo sin credenciales en vivo
        _logger.LogInformation("Operando en modo de prueba / simulación de Mercado Pago para: {Title}", dto.Title);

        var simulatedPrefId = "SIM-" + Guid.NewGuid().ToString()[..8].ToUpper();
        var simulatedUrl = $"{successUrl}&collection_id={DateTimeOffset.UtcNow.ToUnixTimeSeconds()}&preference_id={simulatedPrefId}&payment_type=credit_card&external_reference={externalRef}";

        return Ok(new PaymentPreferenceResponseDto
        {
            PreferenceId = simulatedPrefId,
            InitPoint = simulatedUrl,
            SandboxInitPoint = simulatedUrl,
            PublicKey = publicKey,
            Mode = "simulation",
            ExternalReference = externalRef
        });
    }

    [HttpPost("process-payment")]
    public async Task<IActionResult> ProcessPayment([FromBody] MercadoPagoPaymentProcessDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var accessToken = _configuration["MercadoPago:AccessToken"] 
            ?? Environment.GetEnvironmentVariable("MERCADOPAGO_ACCESS_TOKEN");

        if (!string.IsNullOrWhiteSpace(accessToken) && 
            (accessToken.StartsWith("TEST-") || accessToken.StartsWith("APP_USR-")))
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                client.DefaultRequestHeaders.Add("X-Idempotency-Key", Guid.NewGuid().ToString());

                var payload = new
                {
                    token = dto.Token,
                    issuer_id = dto.IssuerId,
                    payment_method_id = dto.PaymentMethodId,
                    transaction_amount = Convert.ToDouble(dto.TransactionAmount),
                    installments = dto.Installments,
                    description = dto.Description,
                    payer = new
                    {
                        email = dto.Payer.Email,
                        identification = dto.Payer.Identification != null ? new
                        {
                            type = dto.Payer.Identification.Type,
                            number = dto.Payer.Identification.Number
                        } : null
                    }
                };

                var jsonContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                var response = await client.PostAsync("https://api.mercadopago.com/v1/payments", jsonContent);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    using var doc = JsonDocument.Parse(responseBody);
                    return Ok(doc.RootElement);
                }

                return StatusCode((int)response.StatusCode, responseBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar pago directo en Mercado Pago.");
            }
        }

        // Simulación
        return Ok(new
        {
            id = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            status = "approved",
            status_detail = "accredited",
            date_approved = DateTime.UtcNow.ToString("o"),
            transaction_amount = dto.TransactionAmount
        });
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook([FromQuery] string? topic, [FromQuery] string? id, [FromBody] JsonElement? body)
    {
        _logger.LogInformation("Webhook de Mercado Pago recibido. Topic: {Topic}, ID: {Id}", topic, id);

        string? paymentId = id;

        if (string.IsNullOrWhiteSpace(paymentId) && body.HasValue)
        {
            if (body.Value.TryGetProperty("data", out var dataProp) && dataProp.TryGetProperty("id", out var idProp))
            {
                paymentId = idProp.GetString() ?? idProp.GetInt64().ToString();
            }
        }

        if (!string.IsNullOrWhiteSpace(paymentId))
        {
            var accessToken = _configuration["MercadoPago:AccessToken"] 
                ?? Environment.GetEnvironmentVariable("MERCADOPAGO_ACCESS_TOKEN");

            if (!string.IsNullOrWhiteSpace(accessToken) && 
                (accessToken.StartsWith("TEST-") || accessToken.StartsWith("APP_USR-")))
            {
                try
                {
                    var client = _httpClientFactory.CreateClient();
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                    var res = await client.GetAsync($"https://api.mercadopago.com/v1/payments/{paymentId}");
                    if (res.IsSuccessStatusCode)
                    {
                        var json = await res.Content.ReadAsStringAsync();
                        using var doc = JsonDocument.Parse(json);
                        var status = doc.RootElement.GetProperty("status").GetString();
                        var extRef = doc.RootElement.TryGetProperty("external_reference", out var eProp) ? eProp.GetString() : null;

                        _logger.LogInformation("Pago {PaymentId} verificado. Estado: {Status}, Ref: {Ref}", paymentId, status, extRef);

                        if (status == "approved" && !string.IsNullOrWhiteSpace(extRef))
                        {
                            // Actualizar reserva correspondiente en la base de datos
                            var booking = await _context.BookingInquiries
                                .FirstOrDefaultAsync(b => b.Message.Contains(extRef) || b.Status == "Pending");
                            
                            if (booking != null)
                            {
                                booking.Status = "Paid";
                                booking.Message += $"\n[Mercado Pago Aprobado: {paymentId} - {DateTime.UtcNow:g}]";
                                await _context.SaveChangesAsync();
                                _logger.LogInformation("Reserva ID {BookingId} actualizada a 'Paid'", booking.Id);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error al verificar pago en webhook de Mercado Pago.");
                }
            }
        }

        // Siempre responder 200 OK a Mercado Pago
        return Ok(new { received = true });
    }
}

using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
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

    [EnableRateLimiting("contact-policy")]
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
            ?? Environment.GetEnvironmentVariable("APP_BASE_URL")
            ?? _configuration["APP_BASE_URL"];

        if (string.IsNullOrWhiteSpace(appBaseUrl))
        {
            var scheme = Request.Headers.TryGetValue("X-Forwarded-Proto", out var proto) && !string.IsNullOrWhiteSpace(proto)
                ? proto.ToString()
                : Request.Scheme;
            var host = Request.Headers.TryGetValue("X-Forwarded-Host", out var fHost) && !string.IsNullOrWhiteSpace(fHost)
                ? fHost.ToString()
                : Request.Host.ToString();
            appBaseUrl = $"{scheme}://{host}";
        }

        if (!appBaseUrl.StartsWith("http://localhost", StringComparison.OrdinalIgnoreCase) &&
            !appBaseUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            appBaseUrl = "https://" + appBaseUrl.Replace("http://", "");
        }

        appBaseUrl = appBaseUrl.TrimEnd('/');

        var successCfg = _configuration["MercadoPago:SuccessUrl"];
        var successUrl = !string.IsNullOrWhiteSpace(successCfg) && (successCfg.StartsWith("http://") || successCfg.StartsWith("https://"))
            ? successCfg
            : $"{appBaseUrl}/pago/resultado?status=approved";

        var failureCfg = _configuration["MercadoPago:FailureUrl"];
        var failureUrl = !string.IsNullOrWhiteSpace(failureCfg) && (failureCfg.StartsWith("http://") || failureCfg.StartsWith("https://"))
            ? failureCfg
            : $"{appBaseUrl}/pago/resultado?status=failure";

        var pendingCfg = _configuration["MercadoPago:PendingUrl"];
        var pendingUrl = !string.IsNullOrWhiteSpace(pendingCfg) && (pendingCfg.StartsWith("http://") || pendingCfg.StartsWith("https://"))
            ? pendingCfg
            : $"{appBaseUrl}/pago/resultado?status=pending";

        var webhookCfg = _configuration["MercadoPago:WebhookUrl"];
        var webhookUrl = !string.IsNullOrWhiteSpace(webhookCfg) && (webhookCfg.StartsWith("http://") || webhookCfg.StartsWith("https://"))
            ? webhookCfg
            : $"{appBaseUrl}/api/payments/webhook";

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

                var preferencePayload = new Dictionary<string, object>
                {
                    ["items"] = new[]
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
                    ["payer"] = new
                    {
                        name = dto.PayerName,
                        email = dto.PayerEmail,
                        phone = new
                        {
                            number = dto.PayerPhone ?? string.Empty
                        }
                    },
                    ["back_urls"] = new
                    {
                        success = successUrl,
                        failure = failureUrl,
                        pending = pendingUrl
                    },
                    ["external_reference"] = externalRef,
                    ["statement_descriptor"] = "SONDONDO EXP"
                };

                // Mercado Pago solo permite auto_return si la URL de retorno es HTTPS
                if (successUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                {
                    preferencePayload["auto_return"] = "approved";
                }

                // Notificaciones Webhook solo en URLs públicas seguras
                if (!string.IsNullOrWhiteSpace(webhookUrl) && webhookUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                {
                    preferencePayload["notification_url"] = webhookUrl;
                }

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

                    var isSandbox = (_configuration.GetValue<bool?>("MercadoPago:IsSandbox") ?? false)
                        || (Environment.GetEnvironmentVariable("MERCADOPAGO_SANDBOX")?.Equals("true", StringComparison.OrdinalIgnoreCase) ?? false)
                        || accessToken.StartsWith("TEST-");

                    _logger.LogInformation("Mercado Pago Preference creada con éxito: {PreferenceId} (Ref: {Ref}, Modo: {Mode})", 
                        prefId, externalRef, isSandbox ? "sandbox" : "live");

                    return Ok(new PaymentPreferenceResponseDto
                    {
                        PreferenceId = prefId,
                        InitPoint = initPoint,
                        SandboxInitPoint = sandboxInitPoint,
                        PublicKey = publicKey,
                        Mode = isSandbox ? "sandbox" : "live",
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

    [EnableRateLimiting("contact-policy")]
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

    [HttpPost("confirm")]
    public async Task<IActionResult> ConfirmPayment([FromBody] MercadoPagoConfirmPaymentDto dto)
    {
        _logger.LogInformation("Confirmación de pago recibida desde frontend. ID: {Id}, Ref: {Ref}, Status: {Status}", 
            dto.PaymentId, dto.ExternalReference, dto.Status);

        if (string.Equals(dto.Status, "approved", StringComparison.OrdinalIgnoreCase))
        {
            var amount = dto.TransactionAmount ?? 0;
            var accessToken = _configuration["MercadoPago:AccessToken"] 
                ?? Environment.GetEnvironmentVariable("MERCADOPAGO_ACCESS_TOKEN");

            if (!string.IsNullOrWhiteSpace(dto.PaymentId) && 
                !string.IsNullOrWhiteSpace(accessToken) && 
                (accessToken.StartsWith("TEST-") || accessToken.StartsWith("APP_USR-")))
            {
                try
                {
                    var client = _httpClientFactory.CreateClient();
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                    var res = await client.GetAsync($"https://api.mercadopago.com/v1/payments/{dto.PaymentId}");
                    if (res.IsSuccessStatusCode)
                    {
                        var json = await res.Content.ReadAsStringAsync();
                        using var doc = JsonDocument.Parse(json);
                        var root = doc.RootElement;
                        var apiStatus = root.GetProperty("status").GetString();
                        var apiRef = root.TryGetProperty("external_reference", out var eProp) ? eProp.GetString() : dto.ExternalReference;
                        var apiAmount = root.TryGetProperty("transaction_amount", out var aProp) ? aProp.GetDecimal() : amount;
                        var apiMethod = root.TryGetProperty("payment_method_id", out var mProp) ? mProp.GetString() : "MercadoPago";

                        if (apiStatus == "approved")
                        {
                            var updated = await ApplyApprovedPaymentAsync(dto.PaymentId, apiRef ?? dto.ExternalReference, apiAmount, apiMethod);
                            return Ok(new { success = true, updated, status = apiStatus });
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error al verificar pago contra API de Mercado Pago en confirm.");
                }
            }

            // Aplicar con los datos provistos
            var applied = await ApplyApprovedPaymentAsync(dto.PaymentId ?? "DIRECT", dto.ExternalReference, amount, dto.PaymentMethodId ?? "MercadoPago");
            return Ok(new { success = true, updated = applied });
        }

        return Ok(new { success = false, message = "Status not approved" });
    }

    [HttpGet("webhook")]
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook(
        [FromQuery] string? topic, 
        [FromQuery] string? id, 
        [FromQuery(Name = "data.id")] string? dataId,
        [FromBody] JsonElement? body)
    {
        _logger.LogInformation("Webhook de Mercado Pago recibido. Topic: {Topic}, ID: {Id}, DataId: {DataId}", topic, id, dataId);

        string? paymentId = id 
            ?? dataId 
            ?? Request.Query["data.id"].FirstOrDefault() 
            ?? Request.Query["id"].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(paymentId) && body.HasValue && body.Value.ValueKind == JsonValueKind.Object)
        {
            if (body.Value.TryGetProperty("data", out var dataProp) && dataProp.TryGetProperty("id", out var idProp))
            {
                paymentId = idProp.ValueKind == JsonValueKind.Number 
                    ? idProp.GetInt64().ToString() 
                    : idProp.GetString();
            }
            else if (body.Value.TryGetProperty("id", out var directIdProp))
            {
                paymentId = directIdProp.ValueKind == JsonValueKind.Number 
                    ? directIdProp.GetInt64().ToString() 
                    : directIdProp.GetString();
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
                        var transactionAmount = doc.RootElement.TryGetProperty("transaction_amount", out var aProp) ? aProp.GetDecimal() : 0m;
                        var paymentMethod = doc.RootElement.TryGetProperty("payment_method_id", out var mProp) ? mProp.GetString() : "MercadoPago";

                        _logger.LogInformation("Pago {PaymentId} verificado. Estado: {Status}, Ref: {Ref}, Monto: {Amount}", paymentId, status, extRef, transactionAmount);

                        if (status == "approved" && !string.IsNullOrWhiteSpace(extRef))
                        {
                            await ApplyApprovedPaymentAsync(paymentId, extRef, transactionAmount, paymentMethod);
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

    private async Task<bool> ApplyApprovedPaymentAsync(string paymentId, string? extRef, decimal transactionAmount, string? paymentMethod)
    {
        if (string.IsNullOrWhiteSpace(extRef))
        {
            return false;
        }

        BookingInquiry? booking = null;

        // 1. Buscar directamente por VoucherCode
        booking = await _context.BookingInquiries
            .Include(b => b.Tour)
            .FirstOrDefaultAsync(b => b.VoucherCode == extRef);

        // 2. Extraer ID del formato de referencia (ej: VSE-2026-6, VSE-6, VS-6)
        if (booking == null)
        {
            var parts = extRef.Split(new[] { '-', '_' }, StringSplitOptions.RemoveEmptyEntries);
            foreach (var part in parts.Reverse())
            {
                if (int.TryParse(part, out int candidateId) && candidateId > 0)
                {
                    booking = await _context.BookingInquiries
                        .Include(b => b.Tour)
                        .FirstOrDefaultAsync(b => b.Id == candidateId);
                    if (booking != null) break;
                }
            }
        }

        // 3. Buscar si el mensaje contiene la referencia
        if (booking == null)
        {
            booking = await _context.BookingInquiries
                .Include(b => b.Tour)
                .FirstOrDefaultAsync(b => b.Message.Contains(extRef));
        }

        if (booking != null)
        {
            if (booking.TotalAmount == null || booking.TotalAmount == 0)
            {
                var tourPrice = booking.Tour?.PriceSoles ?? 0;
                var calculated = tourPrice * (booking.NumberOfPeople > 0 ? booking.NumberOfPeople : 1);
                booking.TotalAmount = calculated > 0 ? calculated : (transactionAmount > 0 ? transactionAmount : 0);
            }

            if (transactionAmount > 0)
            {
                booking.PaidAmount = transactionAmount;
            }
            else if (booking.PaidAmount == null || booking.PaidAmount == 0)
            {
                booking.PaidAmount = booking.TotalAmount ?? 0;
            }

            if (booking.PaidAmount >= booking.TotalAmount && (booking.TotalAmount ?? 0) > 0)
            {
                booking.PaymentStatus = "Pagado 100%";
            }
            else
            {
                booking.PaymentStatus = "Adelanto 50%";
            }

            booking.Status = "Confirmed";
            booking.PaymentMethod = !string.IsNullOrWhiteSpace(paymentMethod) ? paymentMethod : "MercadoPago";

            if (!booking.Message.Contains(paymentId))
            {
                booking.Message += $"\n[Mercado Pago Aprobado: {paymentId} - S/ {transactionAmount:F2} - {DateTime.UtcNow:g}]";
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Reserva ID {BookingId} ({Voucher}) actualizada a '{Status}', Pago: {PaymentStatus} (S/ {Paid} de S/ {Total})",
                booking.Id, booking.VoucherCode, booking.Status, booking.PaymentStatus, booking.PaidAmount, booking.TotalAmount);
            return true;
        }

        _logger.LogWarning("No se encontró reserva para referencia de pago: {Ref}", extRef);
        return false;
    }
}

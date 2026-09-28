using System.Text;
using System.Text.Json;

namespace ValleSondondo.API.Services;

public class WebhookService : IWebhookService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<WebhookService> _logger;

    public WebhookService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<WebhookService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task NotifyNewBookingAsync(object bookingData)
    {
        var webhookUrl = _configuration["WebhookSettings:BookingWebhookUrl"];
        if (string.IsNullOrWhiteSpace(webhookUrl))
        {
            _logger.LogInformation("Webhook de reserva omitido: No se configuró WebhookSettings:BookingWebhookUrl.");
            return;
        }

        await SendPayloadAsync(webhookUrl, new
        {
            @event = "booking.created",
            timestamp = DateTime.UtcNow,
            agency = "Valle del Sondondo Expeditions",
            data = bookingData
        });
    }

    public async Task NotifyNewContactMessageAsync(object messageData)
    {
        var webhookUrl = _configuration["WebhookSettings:ContactWebhookUrl"] 
            ?? _configuration["WebhookSettings:BookingWebhookUrl"];

        if (string.IsNullOrWhiteSpace(webhookUrl))
        {
            return;
        }

        await SendPayloadAsync(webhookUrl, new
        {
            @event = "contact.created",
            timestamp = DateTime.UtcNow,
            agency = "Valle del Sondondo Expeditions",
            data = messageData
        });
    }

    private async Task SendPayloadAsync(string url, object payload)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _logger.LogInformation("Disparando webhook hacia {Url}...", url);
            var response = await client.PostAsync(url, content);
            _logger.LogInformation("Webhook despachado con código HTTP {StatusCode}", response.StatusCode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al despachar webhook hacia {Url}", url);
        }
    }
}

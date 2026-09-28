namespace ValleSondondo.API.Services;

public interface IWebhookService
{
    Task NotifyNewBookingAsync(object bookingData);
    Task NotifyNewContactMessageAsync(object messageData);
}

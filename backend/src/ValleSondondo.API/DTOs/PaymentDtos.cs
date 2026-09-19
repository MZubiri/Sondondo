using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ValleSondondo.API.DTOs;

public class CreatePaymentPreferenceDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Range(1, 100000)]
    public decimal UnitPrice { get; set; }

    [Range(1, 100)]
    public int Quantity { get; set; } = 1;

    [Required]
    public string PayerName { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string PayerEmail { get; set; } = string.Empty;

    public string? PayerPhone { get; set; }

    public string? BookingReference { get; set; }

    public bool? IsDepositOnly { get; set; }

    public string? PaymentCategory { get; set; }

    public int? TourId { get; set; }

    public int? RoomId { get; set; }
}

public class PaymentPreferenceResponseDto
{
    public string PreferenceId { get; set; } = string.Empty;
    public string InitPoint { get; set; } = string.Empty;
    public string SandboxInitPoint { get; set; } = string.Empty;
    public string PublicKey { get; set; } = string.Empty;
    public string Mode { get; set; } = "live";
    public string? ExternalReference { get; set; }
}

public class MercadoPagoPaymentProcessDto
{
    [Required]
    public string Token { get; set; } = string.Empty;

    public string? IssuerId { get; set; }

    [Required]
    public string PaymentMethodId { get; set; } = string.Empty;

    [Range(0.1, 100000)]
    public decimal TransactionAmount { get; set; }

    [Range(1, 36)]
    public int Installments { get; set; } = 1;

    public string Description { get; set; } = string.Empty;

    public PayerDto Payer { get; set; } = new();
}

public class PayerDto
{
    public string Email { get; set; } = string.Empty;
    public IdentificationDto? Identification { get; set; }
}

public class IdentificationDto
{
    public string Type { get; set; } = "DNI";
    public string Number { get; set; } = string.Empty;
}

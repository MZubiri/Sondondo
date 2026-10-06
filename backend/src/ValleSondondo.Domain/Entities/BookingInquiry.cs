namespace ValleSondondo.Domain.Entities;

public class BookingInquiry
{
    public int Id { get; set; }
    public int? TourId { get; set; }
    public Tour? Tour { get; set; }
    
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int NumberOfPeople { get; set; } = 1;
    public DateTime? TravelDate { get; set; }
    public string Message { get; set; } = string.Empty;
    public string PreferredLanguage { get; set; } = "es";
    public string Status { get; set; } = "Pending"; // Pending, Contacted, Confirmed, Cancelled
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Payment & voucher information
    public string? VoucherCode { get; set; }
    public decimal? TotalAmount { get; set; }
    public decimal? PaidAmount { get; set; }
    public string? PaymentStatus { get; set; } = "Pendiente"; // Pendiente, Adelanto 50%, Pagado 100%, Reembolsado
    public string? PaymentMethod { get; set; } = "Pendiente"; // MercadoPago, Yape, Plin, Transferencia BCP, etc.
    public string? PaymentReceiptUrl { get; set; }
}

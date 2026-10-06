using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ValleSondondo.API.DTOs;
using ValleSondondo.Domain.Entities;
using ValleSondondo.Infrastructure.Data;

namespace ValleSondondo.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ValleSondondoDbContext _context;
    private readonly IConfiguration _configuration;

    public DashboardController(ValleSondondoDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetStats()
    {
        var totalBookings = await _context.BookingInquiries.CountAsync();
        var pendingBookings = await _context.BookingInquiries.CountAsync(b => b.Status == "Pending");
        var confirmedBookings = await _context.BookingInquiries.CountAsync(b => b.Status == "Confirmed");
        var totalRevenueSoles = await _context.BookingInquiries.SumAsync(b => b.PaidAmount ?? 0);

        var activeTours = await _context.Tours.CountAsync(t => t.IsActive);
        var totalTours = await _context.Tours.CountAsync();

        var unreadMessages = await _context.ContactMessages.CountAsync(m => !m.IsRead);

        var recentItems = await _context.BookingInquiries
            .Include(b => b.Tour)
            .OrderByDescending(b => b.CreatedAt)
            .Take(6)
            .ToListAsync();

        var whatsappNumber = _configuration["AgencySettings:WhatsAppNumber"] ?? "51966380590";

        var recentBookings = recentItems.Select(b => new BookingAdminDto
        {
            Id = b.Id,
            VoucherCode = !string.IsNullOrWhiteSpace(b.VoucherCode) ? b.VoucherCode : $"VSE-2026-{b.Id}",
            TourId = b.TourId,
            TourTitle = b.Tour?.Title ?? "Consulta General",
            TourPriceSoles = b.Tour?.PriceSoles ?? 0,
            FullName = b.FullName,
            Email = b.Email,
            Phone = b.Phone,
            NumberOfPeople = b.NumberOfPeople,
            TravelDate = b.TravelDate,
            Message = b.Message,
            Status = b.Status,
            CreatedAt = b.CreatedAt,
            WhatsAppDirectUrl = BuildWhatsAppReplyUrl(b, b.Tour?.Title, whatsappNumber),
            TotalAmount = b.TotalAmount.HasValue && b.TotalAmount.Value > 0
                ? b.TotalAmount.Value
                : ((b.Tour?.PriceSoles ?? 0) * (b.NumberOfPeople > 0 ? b.NumberOfPeople : 1)),
            PaidAmount = b.PaidAmount ?? 0,
            PaymentStatus = !string.IsNullOrWhiteSpace(b.PaymentStatus)
                ? b.PaymentStatus
                : (b.Status == "Paid" || (b.Status == "Confirmed" && (b.PaidAmount ?? 0) > 0) ? "Pagado 100%" : "Pendiente"),
            PaymentMethod = !string.IsNullOrWhiteSpace(b.PaymentMethod) ? b.PaymentMethod : "Pendiente",
            PaymentReceiptUrl = b.PaymentReceiptUrl
        }).ToList();

        return Ok(new DashboardStatsDto
        {
            TotalBookings = totalBookings,
            PendingBookings = pendingBookings,
            ConfirmedBookings = confirmedBookings,
            ActiveTours = activeTours,
            TotalTours = totalTours,
            UnreadMessages = unreadMessages,
            TotalRevenueSoles = totalRevenueSoles,
            RecentBookings = recentBookings
        });
    }

    private static string BuildWhatsAppReplyUrl(BookingInquiry inquiry, string? tourTitle, string agencyNumber)
    {
        var cleanPhone = new string(inquiry.Phone.Where(char.IsDigit).ToArray());
        if (cleanPhone.Length == 9 && !cleanPhone.StartsWith("51"))
        {
            cleanPhone = "51" + cleanPhone;
        }

        if (string.IsNullOrWhiteSpace(cleanPhone))
        {
            cleanPhone = agencyNumber;
        }

        var message = $"¡Hola {inquiry.FullName}! 👋 Te saluda el equipo de *Valle del Sondondo Expeditions*.\n" +
                      $"Recibimos tu solicitud para el tour *{tourTitle ?? "Valle del Sondondo"}* para {inquiry.NumberOfPeople} persona(s).\n" +
                      $"¿En qué fecha te gustaría realizar tu expedición? Con gusto te compartimos disponibilidad e itinerario detallado.";

        return $"https://wa.me/{cleanPhone}?text={WebUtility.UrlEncode(message)}";
    }
}

using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ValleSondondo.API.DTOs;
using ValleSondondo.Domain.Entities;
using ValleSondondo.Infrastructure.Data;

namespace ValleSondondo.API.Controllers;

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
            TourId = b.TourId,
            TourTitle = b.Tour?.Title ?? "Consulta General",
            FullName = b.FullName,
            Email = b.Email,
            Phone = b.Phone,
            NumberOfPeople = b.NumberOfPeople,
            TravelDate = b.TravelDate,
            Message = b.Message,
            Status = b.Status,
            CreatedAt = b.CreatedAt,
            WhatsAppDirectUrl = BuildWhatsAppReplyUrl(b, b.Tour?.Title, whatsappNumber)
        }).ToList();

        return Ok(new DashboardStatsDto
        {
            TotalBookings = totalBookings,
            PendingBookings = pendingBookings,
            ConfirmedBookings = confirmedBookings,
            ActiveTours = activeTours,
            TotalTours = totalTours,
            UnreadMessages = unreadMessages,
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

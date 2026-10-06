using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using ValleSondondo.API.DTOs;
using ValleSondondo.Domain.Entities;
using ValleSondondo.Infrastructure.Data;

namespace ValleSondondo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly ValleSondondoDbContext _context;
    private readonly IConfiguration _configuration;

    public BookingsController(ValleSondondoDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookingAdminDto>>> GetBookings(
        [FromQuery] string? status,
        [FromQuery] string? search)
    {
        var query = _context.BookingInquiries
            .Include(b => b.Tour)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(b => b.Status.ToLower() == status.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(b => b.FullName.ToLower().Contains(s) ||
                                     b.Email.ToLower().Contains(s) ||
                                     b.Phone.Contains(s) ||
                                     (b.Tour != null && b.Tour.Title.ToLower().Contains(s)));
        }

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        var whatsappNumber = _configuration["AgencySettings:WhatsAppNumber"] ?? "51966380590";

        var result = items.Select(b => new BookingAdminDto
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

        return Ok(result);
    }

    [EnableRateLimiting("contact-policy")]
    [HttpPost]
    public async Task<ActionResult<BookingInquiryResponseDto>> CreateInquiry([FromBody] CreateBookingInquiryDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        Tour? tour = null;
        if (dto.TourId.HasValue)
        {
            tour = await _context.Tours.FindAsync(dto.TourId.Value);
        }

        var totalAmount = dto.TotalAmount.HasValue && dto.TotalAmount.Value > 0
            ? dto.TotalAmount.Value
            : ((tour?.PriceSoles ?? 0) * (dto.NumberOfPeople > 0 ? dto.NumberOfPeople : 1));

        var inquiry = new BookingInquiry
        {
            TourId = dto.TourId,
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim().ToLower(),
            Phone = dto.Phone.Trim(),
            NumberOfPeople = dto.NumberOfPeople > 0 ? dto.NumberOfPeople : 1,
            TravelDate = dto.TravelDate,
            Message = dto.Message?.Trim() ?? string.Empty,
            PreferredLanguage = dto.PreferredLanguage ?? "es",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            TotalAmount = totalAmount,
            PaidAmount = dto.PaidAmount ?? 0,
            PaymentStatus = !string.IsNullOrWhiteSpace(dto.PaymentStatus) ? dto.PaymentStatus : "Pendiente",
            PaymentMethod = !string.IsNullOrWhiteSpace(dto.PaymentMethod) ? dto.PaymentMethod : "Pendiente",
            VoucherCode = !string.IsNullOrWhiteSpace(dto.VoucherCode) ? dto.VoucherCode : null
        };

        await _context.BookingInquiries.AddAsync(inquiry);
        await _context.SaveChangesAsync();

        if (string.IsNullOrWhiteSpace(inquiry.VoucherCode))
        {
            inquiry.VoucherCode = $"VSE-2026-{inquiry.Id}";
            await _context.SaveChangesAsync();
        }

        var whatsappNumber = _configuration["AgencySettings:WhatsAppNumber"] ?? "51966380590";
        var tourTitle = tour?.Title ?? "Tour en Valle del Sondondo";
        var dateFormatted = dto.TravelDate.HasValue ? dto.TravelDate.Value.ToString("dd/MM/yyyy") : "Por coordinar";

        var waText = $"¡Hola Valle del Sondondo Expeditions! 👋\n" +
                     $"Mi nombre es *{dto.FullName}* y deseo cotizar/reservar:\n" +
                     $"🏔️ *Tour:* {tourTitle}\n" +
                     $"👥 *Personas:* {inquiry.NumberOfPeople}\n" +
                     $"📅 *Fecha:* {dateFormatted}\n" +
                     $"📱 *Teléfono:* {dto.Phone}\n" +
                     (!string.IsNullOrWhiteSpace(dto.Message) ? $"💬 *Mensaje:* {dto.Message}\n" : "") +
                     $"Quedo atento a su respuesta para coordinar detalles.";

        var waUrl = $"https://wa.me/{whatsappNumber}?text={WebUtility.UrlEncode(waText)}";

        var response = new BookingInquiryResponseDto
        {
            Id = inquiry.Id,
            FullName = inquiry.FullName,
            TourTitle = tourTitle,
            Status = inquiry.Status,
            CreatedAt = inquiry.CreatedAt,
            WhatsAppDirectUrl = waUrl,
            VoucherCode = inquiry.VoucherCode,
            TotalAmount = inquiry.TotalAmount ?? totalAmount,
            PaidAmount = inquiry.PaidAmount ?? 0,
            PaymentStatus = inquiry.PaymentStatus ?? "Pendiente",
            PaymentMethod = inquiry.PaymentMethod ?? "Pendiente"
        };

        return CreatedAtAction(nameof(GetInquiryById), new { id = inquiry.Id }, response);
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<BookingInquiryResponseDto>> GetInquiryById(int id)
    {
        var inquiry = await _context.BookingInquiries
            .Include(b => b.Tour)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (inquiry == null)
        {
            return NotFound();
        }

        return Ok(new BookingInquiryResponseDto
        {
            Id = inquiry.Id,
            FullName = inquiry.FullName,
            TourTitle = inquiry.Tour?.Title ?? "Consulta general",
            Status = inquiry.Status,
            CreatedAt = inquiry.CreatedAt,
            WhatsAppDirectUrl = string.Empty,
            VoucherCode = inquiry.VoucherCode ?? $"VSE-2026-{inquiry.Id}",
            TotalAmount = inquiry.TotalAmount ?? ((inquiry.Tour?.PriceSoles ?? 0) * inquiry.NumberOfPeople),
            PaidAmount = inquiry.PaidAmount ?? 0,
            PaymentStatus = inquiry.PaymentStatus ?? "Pendiente",
            PaymentMethod = inquiry.PaymentMethod ?? "Pendiente"
        });
    }

    [Authorize]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] UpdateBookingStatusDto dto)
    {
        var inquiry = await _context.BookingInquiries.FindAsync(id);
        if (inquiry == null)
        {
            return NotFound(new { message = $"Reserva con ID {id} no encontrada." });
        }

        inquiry.Status = dto.Status.Trim();
        await _context.SaveChangesAsync();

        return Ok(new { success = true, id = inquiry.Id, status = inquiry.Status });
    }

    [Authorize]
    [HttpPatch("{id}/payment")]
    public async Task<IActionResult> UpdateBookingPayment(int id, [FromBody] UpdateBookingPaymentDto dto)
    {
        var inquiry = await _context.BookingInquiries.FindAsync(id);
        if (inquiry == null)
        {
            return NotFound(new { message = $"Reserva con ID {id} no encontrada." });
        }

        inquiry.PaymentMethod = dto.PaymentMethod ?? inquiry.PaymentMethod ?? "Pendiente";
        inquiry.PaidAmount = dto.PaidAmount;
        inquiry.TotalAmount = dto.TotalAmount;
        inquiry.PaymentStatus = dto.PaymentStatus ?? inquiry.PaymentStatus ?? "Pendiente";
        if (!string.IsNullOrWhiteSpace(dto.PaymentReceiptUrl))
        {
            inquiry.PaymentReceiptUrl = dto.PaymentReceiptUrl;
        }

        if (inquiry.PaymentStatus == "Pagado 100%" || (inquiry.PaidAmount >= inquiry.TotalAmount && inquiry.TotalAmount > 0))
        {
            inquiry.Status = "Confirmed";
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            id = inquiry.Id,
            paymentStatus = inquiry.PaymentStatus,
            paidAmount = inquiry.PaidAmount,
            totalAmount = inquiry.TotalAmount,
            status = inquiry.Status
        });
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBooking(int id)
    {
        var inquiry = await _context.BookingInquiries.FindAsync(id);
        if (inquiry == null)
        {
            return NotFound(new { message = $"Reserva con ID {id} no encontrada." });
        }

        _context.BookingInquiries.Remove(inquiry);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Reserva eliminada con éxito." });
    }

    private static string BuildWhatsAppReplyUrl(BookingInquiry inquiry, string? tourTitle, string agencyNumber)
    {
        // Clean customer phone: strip non-digits
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

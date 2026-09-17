using System.Net;
using Microsoft.AspNetCore.Mvc;
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

        return Ok(result);
    }

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

        var inquiry = new BookingInquiry
        {
            TourId = dto.TourId,
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim().ToLower(),
            Phone = dto.Phone.Trim(),
            NumberOfPeople = dto.NumberOfPeople,
            TravelDate = dto.TravelDate,
            Message = dto.Message?.Trim() ?? string.Empty,
            PreferredLanguage = dto.PreferredLanguage ?? "es",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        await _context.BookingInquiries.AddAsync(inquiry);
        await _context.SaveChangesAsync();

        var whatsappNumber = _configuration["AgencySettings:WhatsAppNumber"] ?? "51966380590";
        var tourTitle = tour?.Title ?? "Tour en Valle del Sondondo";
        var dateFormatted = dto.TravelDate.HasValue ? dto.TravelDate.Value.ToString("dd/MM/yyyy") : "Por coordinar";

        var waText = $"¡Hola Valle del Sondondo Expeditions! 👋\n" +
                     $"Mi nombre es *{dto.FullName}* y deseo cotizar/reservar:\n" +
                     $"🏔️ *Tour:* {tourTitle}\n" +
                     $"👥 *Personas:* {dto.NumberOfPeople}\n" +
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
            WhatsAppDirectUrl = waUrl
        };

        return CreatedAtAction(nameof(GetInquiryById), new { id = inquiry.Id }, response);
    }

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
            WhatsAppDirectUrl = string.Empty
        });
    }

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

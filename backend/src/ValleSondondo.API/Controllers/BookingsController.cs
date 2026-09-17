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

        // Build WhatsApp direct message link
        var whatsappNumber = _configuration["AgencySettings:WhatsAppNumber"] ?? "51966000000";
        var tourTitle = tour?.Title ?? "Tour en Valle del Sondondo";
        var dateFormatted = dto.TravelDate.HasValue ? dto.TravelDate.Value.ToString("dd/MM/yyyy") : "Por coordinar";

        var waText = $"¡Hola Valle del Sondondo Expeditions! 👋\n" +
                     $"Mi nombre es *{dto.FullName}* y deseo cotizar/reservar:\n" +
                     $"🏔️ *Tour:* {tourTitle}\n" +
                     $"👥 *Personas:* {dto.NumberOfPeople}\n" +
                     $"📅 *Fecha tentativa:* {dateFormatted}\n" +
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
}

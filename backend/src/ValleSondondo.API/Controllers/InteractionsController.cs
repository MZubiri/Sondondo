using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ValleSondondo.API.DTOs;
using ValleSondondo.Domain.Entities;
using ValleSondondo.Infrastructure.Data;

namespace ValleSondondo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly ValleSondondoDbContext _context;

    public ContactController(ValleSondondoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContactMessageAdminDto>>> GetMessages()
    {
        var messages = await _context.ContactMessages
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new ContactMessageAdminDto
            {
                Id = m.Id,
                Name = m.Name,
                Email = m.Email,
                Phone = m.Phone,
                Subject = m.Subject,
                Message = m.Message,
                CreatedAt = m.CreatedAt,
                IsRead = m.IsRead
            })
            .ToListAsync();

        return Ok(messages);
    }

    [HttpPost]
    public async Task<IActionResult> SendContactMessage([FromBody] CreateContactMessageDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var message = new ContactMessage
        {
            Name = dto.Name.Trim(),
            Email = dto.Email.Trim().ToLower(),
            Phone = dto.Phone?.Trim() ?? string.Empty,
            Subject = dto.Subject.Trim(),
            Message = dto.Message.Trim(),
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        await _context.ContactMessages.AddAsync(message);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Tu mensaje ha sido recibido con éxito. Nos comunicaremos contigo a la brevedad." });
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> ToggleRead(int id)
    {
        var message = await _context.ContactMessages.FindAsync(id);
        if (message == null)
        {
            return NotFound(new { message = $"Mensaje con ID {id} no encontrado." });
        }

        message.IsRead = !message.IsRead;
        await _context.SaveChangesAsync();

        return Ok(new { success = true, id = message.Id, isRead = message.IsRead });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMessage(int id)
    {
        var message = await _context.ContactMessages.FindAsync(id);
        if (message == null)
        {
            return NotFound(new { message = $"Mensaje con ID {id} no encontrado." });
        }

        _context.ContactMessages.Remove(message);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Mensaje eliminado con éxito." });
    }
}

[ApiController]
[Route("api/[controller]")]
public class TestimonialsController : ControllerBase
{
    private readonly ValleSondondoDbContext _context;

    public TestimonialsController(ValleSondondoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TestimonialDto>>> GetTestimonials()
    {
        var testimonials = await _context.Testimonials
            .Where(t => t.IsApproved)
            .OrderByDescending(t => t.Date)
            .Select(t => new TestimonialDto
            {
                Id = t.Id,
                AuthorName = t.AuthorName,
                Location = t.Location,
                Rating = t.Rating,
                Comment = t.Comment,
                TourName = t.TourName,
                AvatarUrl = t.AvatarUrl,
                Date = t.Date
            })
            .ToListAsync();

        return Ok(testimonials);
    }
}

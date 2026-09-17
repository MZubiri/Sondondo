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

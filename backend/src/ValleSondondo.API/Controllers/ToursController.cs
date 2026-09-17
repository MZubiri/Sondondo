using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ValleSondondo.API.DTOs;
using ValleSondondo.Domain.Entities;
using ValleSondondo.Infrastructure.Data;

namespace ValleSondondo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ToursController : ControllerBase
{
    private readonly ValleSondondoDbContext _context;

    public ToursController(ValleSondondoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TourSummaryDto>>> GetTours(
        [FromQuery] string? category,
        [FromQuery] bool? featured,
        [FromQuery] string? search,
        [FromQuery] bool includeInactive = false)
    {
        var query = _context.Tours
            .Include(t => t.Category)
            .AsQueryable();

        if (!includeInactive)
        {
            query = query.Where(t => t.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(t => t.Category != null && t.Category.Slug == category.ToLower());
        }

        if (featured.HasValue)
        {
            query = query.Where(t => t.Featured == featured.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(s) || 
                                     t.Subtitle.ToLower().Contains(s) || 
                                     t.Description.ToLower().Contains(s));
        }

        var tours = await query
            .OrderBy(t => t.DisplayOrder)
            .Select(t => new TourSummaryDto
            {
                Id = t.Id,
                Title = t.Title,
                Slug = t.Slug,
                Subtitle = t.Subtitle,
                CategoryId = t.CategoryId,
                CategoryName = t.Category != null ? t.Category.Name : string.Empty,
                CategorySlug = t.Category != null ? t.Category.Slug : string.Empty,
                Duration = t.Duration,
                DurationDays = t.DurationDays,
                PriceSoles = t.PriceSoles,
                PriceUsd = t.PriceUsd,
                Difficulty = t.Difficulty,
                AltitudeMax = t.AltitudeMax,
                StartingPoint = t.StartingPoint,
                Featured = t.Featured,
                MainImageUrl = t.MainImageUrl
            })
            .ToListAsync();

        return Ok(tours);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<TourDetailDto>> GetTourBySlug(string slug, [FromQuery] bool includeInactive = false)
    {
        var query = _context.Tours
            .Include(t => t.Category)
            .Include(t => t.Itineraries.OrderBy(i => i.DayNumber))
            .AsQueryable();

        if (!includeInactive)
        {
            query = query.Where(t => t.IsActive);
        }

        var tour = await query.FirstOrDefaultAsync(t => t.Slug == slug);

        if (tour == null)
        {
            return NotFound(new { message = $"El tour '{slug}' no fue encontrado." });
        }

        var detail = new TourDetailDto
        {
            Id = tour.Id,
            Title = tour.Title,
            Slug = tour.Slug,
            Subtitle = tour.Subtitle,
            Description = tour.Description,
            CategoryId = tour.CategoryId,
            CategoryName = tour.Category?.Name ?? string.Empty,
            CategorySlug = tour.Category?.Slug ?? string.Empty,
            Duration = tour.Duration,
            DurationDays = tour.DurationDays,
            PriceSoles = tour.PriceSoles,
            PriceUsd = tour.PriceUsd,
            Difficulty = tour.Difficulty,
            AltitudeMax = tour.AltitudeMax,
            StartingPoint = tour.StartingPoint,
            Featured = tour.Featured,
            MainImageUrl = tour.MainImageUrl,
            GalleryImages = DeserializeList(tour.GalleryImagesJson),
            Included = DeserializeList(tour.IncludedJson),
            NotIncluded = DeserializeList(tour.NotIncludedJson),
            Recommendations = DeserializeList(tour.RecommendationsJson),
            Itineraries = tour.Itineraries.Select(i => new ItineraryDayDto
            {
                Id = i.Id,
                DayNumber = i.DayNumber,
                Title = i.Title,
                Description = i.Description,
                Activities = i.Activities,
                Meals = i.Meals,
                Accommodation = i.Accommodation
            }).ToList()
        };

        return Ok(detail);
    }

    [HttpGet("featured")]
    public async Task<ActionResult<IEnumerable<TourSummaryDto>>> GetFeatured()
    {
        return await GetTours(null, true, null, false);
    }

    [HttpPost]
    public async Task<ActionResult<TourDetailDto>> CreateTour([FromBody] CreateTourDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var slug = string.IsNullOrWhiteSpace(dto.Slug)
            ? GenerateSlug(dto.Title)
            : GenerateSlug(dto.Slug);

        // Ensure unique slug
        int counter = 1;
        var originalSlug = slug;
        while (await _context.Tours.AnyAsync(t => t.Slug == slug))
        {
            slug = $"{originalSlug}-{counter++}";
        }

        var tour = new Tour
        {
            Title = dto.Title.Trim(),
            Slug = slug,
            Subtitle = dto.Subtitle?.Trim() ?? string.Empty,
            Description = dto.Description.Trim(),
            CategoryId = dto.CategoryId,
            Duration = dto.Duration.Trim(),
            DurationDays = dto.DurationDays > 0 ? dto.DurationDays : 1,
            PriceSoles = dto.PriceSoles,
            PriceUsd = dto.PriceUsd,
            Difficulty = dto.Difficulty ?? "Moderada",
            AltitudeMax = dto.AltitudeMax ?? "3,500 msnm",
            StartingPoint = dto.StartingPoint ?? "Aucará / Puquio",
            Featured = dto.Featured,
            IsActive = dto.IsActive,
            DisplayOrder = dto.DisplayOrder,
            MainImageUrl = string.IsNullOrWhiteSpace(dto.MainImageUrl) ? "/assets/images/hero_sondondo.jpg" : dto.MainImageUrl.Trim(),
            GalleryImagesJson = JsonSerializer.Serialize(dto.GalleryImages ?? new List<string>()),
            IncludedJson = JsonSerializer.Serialize(dto.Included ?? new List<string>()),
            NotIncludedJson = JsonSerializer.Serialize(dto.NotIncluded ?? new List<string>()),
            RecommendationsJson = JsonSerializer.Serialize(dto.Recommendations ?? new List<string>())
        };

        await _context.Tours.AddAsync(tour);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTourBySlug), new { slug = tour.Slug }, new { id = tour.Id, slug = tour.Slug, title = tour.Title });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTour(int id, [FromBody] UpdateTourDto dto)
    {
        var tour = await _context.Tours.FindAsync(id);
        if (tour == null)
        {
            return NotFound(new { message = $"Tour con ID {id} no encontrado." });
        }

        tour.Title = dto.Title.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Slug) && dto.Slug != tour.Slug)
        {
            tour.Slug = GenerateSlug(dto.Slug);
        }
        tour.Subtitle = dto.Subtitle?.Trim() ?? string.Empty;
        tour.Description = dto.Description.Trim();
        tour.CategoryId = dto.CategoryId;
        tour.Duration = dto.Duration.Trim();
        tour.DurationDays = dto.DurationDays;
        tour.PriceSoles = dto.PriceSoles;
        tour.PriceUsd = dto.PriceUsd;
        tour.Difficulty = dto.Difficulty;
        tour.AltitudeMax = dto.AltitudeMax;
        tour.StartingPoint = dto.StartingPoint;
        tour.Featured = dto.Featured;
        tour.IsActive = dto.IsActive;
        tour.DisplayOrder = dto.DisplayOrder;
        if (!string.IsNullOrWhiteSpace(dto.MainImageUrl))
        {
            tour.MainImageUrl = dto.MainImageUrl.Trim();
        }
        tour.GalleryImagesJson = JsonSerializer.Serialize(dto.GalleryImages ?? new List<string>());
        tour.IncludedJson = JsonSerializer.Serialize(dto.Included ?? new List<string>());
        tour.NotIncludedJson = JsonSerializer.Serialize(dto.NotIncluded ?? new List<string>());
        tour.RecommendationsJson = JsonSerializer.Serialize(dto.Recommendations ?? new List<string>());

        await _context.SaveChangesAsync();

        return Ok(new { success = true, id = tour.Id, title = tour.Title });
    }

    [HttpPatch("{id}/toggle-active")]
    public async Task<IActionResult> ToggleActive(int id)
    {
        var tour = await _context.Tours.FindAsync(id);
        if (tour == null)
        {
            return NotFound(new { message = $"Tour con ID {id} no encontrado." });
        }

        tour.IsActive = !tour.IsActive;
        await _context.SaveChangesAsync();

        return Ok(new { success = true, id = tour.Id, isActive = tour.IsActive });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTour(int id)
    {
        var tour = await _context.Tours.FindAsync(id);
        if (tour == null)
        {
            return NotFound(new { message = $"Tour con ID {id} no encontrado." });
        }

        _context.Tours.Remove(tour);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Tour eliminado con éxito." });
    }

    private static List<string> DeserializeList(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new List<string>();
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }

    private static string GenerateSlug(string text)
    {
        var str = text.ToLowerInvariant();
        str = Regex.Replace(str, @"\s+", "-");
        str = Regex.Replace(str, @"[^\w\-]+", "");
        str = Regex.Replace(str, @"\-\-+", "-");
        return str.Trim('-');
    }
}

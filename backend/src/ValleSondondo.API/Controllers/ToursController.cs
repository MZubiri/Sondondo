using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
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
            .Include(t => t.Category)
            .Include(t => t.Itineraries.OrderBy(i => i.DayNumber))
            .ToListAsync();

        var tourDtos = tours.Select(t => new TourSummaryDto
        {
            Id = t.Id,
            Title = t.Title,
            Slug = t.Slug,
            Subtitle = t.Subtitle,
            Description = t.Description,
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
            MainImageUrl = t.MainImageUrl,
            IsActive = t.IsActive,
            GalleryImages = DeserializeList(t.GalleryImagesJson),
            Itineraries = t.Itineraries.OrderBy(i => i.DayNumber).Select(i => new ItineraryDayDto
            {
                Id = i.Id,
                DayNumber = i.DayNumber,
                Title = i.Title,
                Description = i.Description,
                Activities = i.Activities,
                Meals = i.Meals,
                Accommodation = i.Accommodation
            }).ToList()
        }).ToList();

        return Ok(tourDtos);
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

    [Authorize]
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

        if (dto.Itineraries != null && dto.Itineraries.Count > 0)
        {
            foreach (var itDto in dto.Itineraries)
            {
                tour.Itineraries.Add(new ItineraryDay
                {
                    DayNumber = itDto.DayNumber > 0 ? itDto.DayNumber : 1,
                    Title = itDto.Title?.Trim() ?? string.Empty,
                    Description = itDto.Description?.Trim() ?? string.Empty,
                    Activities = itDto.Activities?.Trim() ?? string.Empty,
                    Meals = itDto.Meals?.Trim() ?? string.Empty,
                    Accommodation = itDto.Accommodation?.Trim() ?? string.Empty
                });
            }
        }

        await _context.Tours.AddAsync(tour);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTourBySlug), new { slug = tour.Slug }, new { id = tour.Id, slug = tour.Slug, title = tour.Title });
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTour(int id, [FromBody] UpdateTourDto dto)
    {
        var tour = await _context.Tours.FindAsync(id);
        if (tour == null)
        {
            return NotFound(new { message = $"Tour con ID {id} no encontrado." });
        }

        if (!string.IsNullOrWhiteSpace(dto.Title))
        {
            tour.Title = dto.Title.Trim();
        }
        if (!string.IsNullOrWhiteSpace(dto.Slug) && dto.Slug != tour.Slug)
        {
            tour.Slug = GenerateSlug(dto.Slug);
        }
        if (dto.Subtitle != null)
        {
            tour.Subtitle = dto.Subtitle.Trim();
        }
        if (!string.IsNullOrWhiteSpace(dto.Description))
        {
            tour.Description = dto.Description.Trim();
        }
        if (dto.CategoryId.HasValue && dto.CategoryId.Value > 0)
        {
            tour.CategoryId = dto.CategoryId.Value;
        }
        if (!string.IsNullOrWhiteSpace(dto.Duration))
        {
            tour.Duration = dto.Duration.Trim();
        }
        if (dto.DurationDays.HasValue && dto.DurationDays.Value > 0)
        {
            tour.DurationDays = dto.DurationDays.Value;
        }
        if (dto.PriceSoles.HasValue && dto.PriceSoles.Value >= 0)
        {
            tour.PriceSoles = dto.PriceSoles.Value;
        }
        if (dto.PriceUsd.HasValue && dto.PriceUsd.Value >= 0)
        {
            tour.PriceUsd = dto.PriceUsd.Value;
        }
        if (!string.IsNullOrWhiteSpace(dto.Difficulty))
        {
            tour.Difficulty = dto.Difficulty;
        }
        if (!string.IsNullOrWhiteSpace(dto.AltitudeMax))
        {
            tour.AltitudeMax = dto.AltitudeMax;
        }
        if (!string.IsNullOrWhiteSpace(dto.StartingPoint))
        {
            tour.StartingPoint = dto.StartingPoint;
        }
        if (dto.Featured.HasValue)
        {
            tour.Featured = dto.Featured.Value;
        }
        if (dto.IsActive.HasValue)
        {
            tour.IsActive = dto.IsActive.Value;
        }
        if (dto.DisplayOrder.HasValue)
        {
            tour.DisplayOrder = dto.DisplayOrder.Value;
        }
        if (!string.IsNullOrWhiteSpace(dto.MainImageUrl))
        {
            tour.MainImageUrl = dto.MainImageUrl.Trim();
        }
        if (dto.GalleryImages != null && dto.GalleryImages.Count > 0)
        {
            tour.GalleryImagesJson = JsonSerializer.Serialize(dto.GalleryImages);
        }
        if (dto.Included != null && dto.Included.Count > 0)
        {
            tour.IncludedJson = JsonSerializer.Serialize(dto.Included);
        }
        if (dto.NotIncluded != null && dto.NotIncluded.Count > 0)
        {
            tour.NotIncludedJson = JsonSerializer.Serialize(dto.NotIncluded);
        }
        if (dto.Recommendations != null && dto.Recommendations.Count > 0)
        {
            tour.RecommendationsJson = JsonSerializer.Serialize(dto.Recommendations);
        }

        if (dto.Itineraries != null)
        {
            await _context.Entry(tour).Collection(t => t.Itineraries).LoadAsync();
            _context.ItineraryDays.RemoveRange(tour.Itineraries);

            foreach (var itDto in dto.Itineraries)
            {
                tour.Itineraries.Add(new ItineraryDay
                {
                    TourId = tour.Id,
                    DayNumber = itDto.DayNumber > 0 ? itDto.DayNumber : 1,
                    Title = itDto.Title?.Trim() ?? string.Empty,
                    Description = itDto.Description?.Trim() ?? string.Empty,
                    Activities = itDto.Activities?.Trim() ?? string.Empty,
                    Meals = itDto.Meals?.Trim() ?? string.Empty,
                    Accommodation = itDto.Accommodation?.Trim() ?? string.Empty
                });
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new { success = true, id = tour.Id, title = tour.Title, priceSoles = tour.PriceSoles, priceUsd = tour.PriceUsd });
    }

    [Authorize]
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

    [Authorize]
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

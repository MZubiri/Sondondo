using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ValleSondondo.API.DTOs;
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
        [FromQuery] string? search)
    {
        var query = _context.Tours
            .Include(t => t.Category)
            .Where(t => t.IsActive);

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
    public async Task<ActionResult<TourDetailDto>> GetTourBySlug(string slug)
    {
        var tour = await _context.Tours
            .Include(t => t.Category)
            .Include(t => t.Itineraries.OrderBy(i => i.DayNumber))
            .FirstOrDefaultAsync(t => t.Slug == slug && t.IsActive);

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
        return await GetTours(null, true, null);
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
}
